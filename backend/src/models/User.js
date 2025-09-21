const { db } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.phone = data.phone;
    this.avatarUrl = data.avatar_url;
    this.isVerified = data.is_verified;
    this.isActive = data.is_active;
    this.isAnonymous = data.is_anonymous;
    this.deviceId = data.device_id;
    this.totalPoints = data.total_points;
    this.level = data.level;
    this.preferences = data.preferences;
    this.lastLogin = data.last_login;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async create(userData) {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      isAnonymous = false,
      deviceId = null
    } = userData;

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
    
    const [user] = await db('users')
      .insert({
        id: uuidv4(),
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        phone,
        is_anonymous: isAnonymous,
        device_id: deviceId,
        total_points: 0,
        level: 1
      })
      .returning('*');

    return new User(user);
  }

  static async findByEmail(email) {
    const user = await db('users').where({ email }).first();
    return user ? new User(user) : null;
  }

  static async findById(id) {
    const user = await db('users').where({ id }).first();
    return user ? new User(user) : null;
  }

  static async findByDeviceId(deviceId) {
    const user = await db('users').where({ device_id: deviceId }).first();
    return user ? new User(user) : null;
  }

  static async update(id, updateData) {
    const [user] = await db('users')
      .where({ id })
      .update({
        ...updateData,
        updated_at: new Date()
      })
      .returning('*');

    return user ? new User(user) : null;
  }

  static async updateLastLogin(id) {
    await db('users')
      .where({ id })
      .update({ last_login: new Date() });
  }

  static async addPoints(userId, points, type, description = null, issueId = null) {
    const trx = await db.transaction();
    
    try {
      // Add points transaction record
      await trx('points_transactions').insert({
        id: uuidv4(),
        user_id: userId,
        issue_id: issueId,
        points,
        type,
        description
      });

      // Update user's total points
      await trx('users')
        .where({ id: userId })
        .increment('total_points', points);

      // Get updated user data
      const [user] = await trx('users')
        .where({ id: userId })
        .returning('*');

      await trx.commit();
      return new User(user);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async getLeaderboard(limit = 50) {
    const users = await db('users')
      .select('id', 'first_name', 'last_name', 'avatar_url', 'total_points', 'level')
      .where({ is_active: true })
      .orderBy('total_points', 'desc')
      .limit(limit);

    return users.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      avatarUrl: user.avatar_url,
      totalPoints: user.total_points,
      level: user.level
    }));
  }

  static async getUserStats(userId) {
    const stats = await db('users')
      .leftJoin('issues', 'users.id', 'issues.reporter_id')
      .leftJoin('points_transactions', 'users.id', 'points_transactions.user_id')
      .where('users.id', userId)
      .select(
        'users.total_points',
        'users.level',
        db.raw('COUNT(DISTINCT issues.id) as issues_reported'),
        db.raw('COUNT(DISTINCT CASE WHEN issues.status = ? THEN issues.id END) as issues_resolved', ['resolved']),
        db.raw('SUM(CASE WHEN points_transactions.type = ? THEN points_transactions.points ELSE 0 END) as points_from_reports', ['issue_report']),
        db.raw('SUM(CASE WHEN points_transactions.type = ? THEN points_transactions.points ELSE 0 END) as points_from_upvotes', ['upvote_received'])
      )
      .groupBy('users.id', 'users.total_points', 'users.level')
      .first();

    return stats;
  }

  async validatePassword(password) {
    const user = await db('users').where({ id: this.id }).select('password_hash').first();
    return bcrypt.compare(password, user.password_hash);
  }

  async updatePassword(newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);
    await db('users')
      .where({ id: this.id })
      .update({ password_hash: hashedPassword });
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      avatarUrl: this.avatarUrl,
      isVerified: this.isVerified,
      isActive: this.isActive,
      isAnonymous: this.isAnonymous,
      totalPoints: this.totalPoints,
      level: this.level,
      preferences: this.preferences,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;