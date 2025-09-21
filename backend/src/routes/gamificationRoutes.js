const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/authMiddleware');
const { db } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/gamification/leaderboard
// @desc    Get leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const timeframe = req.query.timeframe || 'all'; // all, week, month, year
    
    let leaderboard;
    
    if (timeframe === 'all') {
      leaderboard = await User.getLeaderboard(limit);
    } else {
      // Get leaderboard for specific timeframe
      const dateFilter = getDateFilter(timeframe);
      leaderboard = await getLeaderboardForTimeframe(limit, dateFilter);
    }

    res.json({
      success: true,
      data: {
        leaderboard,
        timeframe,
        limit
      }
    });
  } catch (error) {
    logger.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/gamification/points
// @desc    Get user points and stats
// @access  Private
router.get('/points', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user stats
    const stats = await User.getUserStats(userId);
    
    // Get recent points transactions
    const recentTransactions = await db('points_transactions')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(10)
      .select('*');

    // Get user achievements
    const achievements = await db('user_achievements')
      .join('achievements', 'user_achievements.achievement_id', 'achievements.id')
      .where('user_achievements.user_id', userId)
      .select('achievements.*', 'user_achievements.earned_at')
      .orderBy('user_achievements.earned_at', 'desc');

    // Calculate level and points to next level
    const levelInfo = calculateLevelInfo(stats.total_points);

    res.json({
      success: true,
      data: {
        points: stats.total_points,
        level: levelInfo.level,
        pointsToNextLevel: levelInfo.pointsToNext,
        stats: {
          issuesReported: stats.issues_reported || 0,
          issuesResolved: stats.issues_resolved || 0,
          pointsFromReports: stats.points_from_reports || 0,
          pointsFromUpvotes: stats.points_from_upvotes || 0
        },
        recentTransactions: recentTransactions.map(transaction => ({
          id: transaction.id,
          points: transaction.points,
          type: transaction.type,
          description: transaction.description,
          createdAt: transaction.created_at
        })),
        achievements: achievements.map(achievement => ({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          iconUrl: achievement.icon_url,
          pointsReward: achievement.points_reward,
          earnedAt: achievement.earned_at
        }))
      }
    });
  } catch (error) {
    logger.error('Get user points error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user points',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/gamification/achievements
// @desc    Get all available achievements
// @access  Public
router.get('/achievements', async (req, res) => {
  try {
    const achievements = await db('achievements')
      .where({ is_active: true })
      .select('*')
      .orderBy('points_reward', 'desc');

    res.json({
      success: true,
      data: {
        achievements: achievements.map(achievement => ({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          iconUrl: achievement.icon_url,
          pointsReward: achievement.points_reward,
          criteria: achievement.criteria
        }))
      }
    });
  } catch (error) {
    logger.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/gamification/achievements/user
// @desc    Get user's achievements
// @access  Private
router.get('/achievements/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's earned achievements
    const earnedAchievements = await db('user_achievements')
      .join('achievements', 'user_achievements.achievement_id', 'achievements.id')
      .where('user_achievements.user_id', userId)
      .select('achievements.*', 'user_achievements.earned_at')
      .orderBy('user_achievements.earned_at', 'desc');

    // Get all available achievements
    const allAchievements = await db('achievements')
      .where({ is_active: true })
      .select('*')
      .orderBy('points_reward', 'desc');

    // Mark which achievements are earned
    const earnedIds = new Set(earnedAchievements.map(a => a.id));
    const achievementsWithStatus = allAchievements.map(achievement => {
      const isEarned = earnedIds.has(achievement.id);
      const earnedAchievement = earnedAchievements.find(a => a.id === achievement.id);
      
      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        iconUrl: achievement.icon_url,
        pointsReward: achievement.points_reward,
        criteria: achievement.criteria,
        isEarned,
        earnedAt: earnedAchievement ? earnedAchievement.earned_at : null,
        progress: isEarned ? 100 : calculateAchievementProgress(userId, achievement.criteria)
      };
    });

    res.json({
      success: true,
      data: {
        achievements: achievementsWithStatus,
        earnedCount: earnedAchievements.length,
        totalCount: allAchievements.length
      }
    });
  } catch (error) {
    logger.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user achievements',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/gamification/check-achievements
// @desc    Check and award new achievements
// @access  Private
router.post('/check-achievements', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const newAchievements = await checkAndAwardAchievements(userId);

    res.json({
      success: true,
      message: newAchievements.length > 0 ? 'New achievements earned!' : 'No new achievements',
      data: {
        newAchievements
      }
    });
  } catch (error) {
    logger.error('Check achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check achievements',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper functions
function getDateFilter(timeframe) {
  const now = new Date();
  const filters = {
    week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  };
  
  return filters[timeframe] || null;
}

async function getLeaderboardForTimeframe(limit, dateFilter) {
  const users = await db('users')
    .join('points_transactions', 'users.id', 'points_transactions.user_id')
    .where('users.is_active', true)
    .where('points_transactions.created_at', '>=', dateFilter)
    .select(
      'users.id',
      'users.first_name',
      'users.last_name',
      'users.avatar_url',
      'users.level',
      db.raw('SUM(points_transactions.points) as total_points')
    )
    .groupBy('users.id', 'users.first_name', 'users.last_name', 'users.avatar_url', 'users.level')
    .orderBy('total_points', 'desc')
    .limit(limit);

  return users.map(user => ({
    id: user.id,
    name: `${user.first_name} ${user.last_name}`,
    avatarUrl: user.avatar_url,
    totalPoints: parseInt(user.total_points) || 0,
    level: user.level
  }));
}

function calculateLevelInfo(totalPoints) {
  // Level calculation: Level 1 = 0-99 points, Level 2 = 100-299 points, etc.
  const level = Math.floor(totalPoints / 100) + 1;
  const pointsInCurrentLevel = totalPoints % 100;
  const pointsToNext = 100 - pointsInCurrentLevel;
  
  return {
    level,
    pointsToNext,
    pointsInCurrentLevel
  };
}

async function calculateAchievementProgress(userId, criteria) {
  // This is a simplified version - in a real app, you'd implement
  // specific logic for each achievement type
  try {
    const stats = await User.getUserStats(userId);
    
    if (criteria.type === 'issues_reported') {
      return Math.min(100, (stats.issues_reported / criteria.target) * 100);
    }
    
    if (criteria.type === 'points_earned') {
      return Math.min(100, (stats.total_points / criteria.target) * 100);
    }
    
    return 0;
  } catch (error) {
    return 0;
  }
}

async function checkAndAwardAchievements(userId) {
  const newAchievements = [];
  
  try {
    // Get user stats
    const stats = await User.getUserStats(userId);
    
    // Get all active achievements
    const achievements = await db('achievements')
      .where({ is_active: true })
      .select('*');
    
    // Get user's existing achievements
    const existingAchievements = await db('user_achievements')
      .where({ user_id: userId })
      .select('achievement_id');
    
    const existingIds = new Set(existingAchievements.map(a => a.achievement_id));
    
    // Check each achievement
    for (const achievement of achievements) {
      if (existingIds.has(achievement.id)) continue;
      
      const criteria = achievement.criteria;
      let shouldAward = false;
      
      // Check achievement criteria
      switch (criteria.type) {
        case 'issues_reported':
          shouldAward = stats.issues_reported >= criteria.target;
          break;
        case 'points_earned':
          shouldAward = stats.total_points >= criteria.target;
          break;
        case 'issues_resolved':
          shouldAward = stats.issues_resolved >= criteria.target;
          break;
        // Add more criteria types as needed
      }
      
      if (shouldAward) {
        // Award achievement
        await db('user_achievements').insert({
          id: require('uuid').v4(),
          user_id: userId,
          achievement_id: achievement.id
        });
        
        // Award points
        if (achievement.points_reward > 0) {
          await User.addPoints(
            userId,
            achievement.points_reward,
            'achievement',
            `Achievement unlocked: ${achievement.name}`
          );
        }
        
        newAchievements.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          iconUrl: achievement.icon_url,
          pointsReward: achievement.points_reward
        });
      }
    }
  } catch (error) {
    logger.error('Error checking achievements:', error);
  }
  
  return newAchievements;
}

module.exports = router;