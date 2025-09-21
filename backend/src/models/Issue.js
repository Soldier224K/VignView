const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Issue {
  constructor(data) {
    this.id = data.id;
    this.reporterId = data.reporter_id;
    this.title = data.title;
    this.description = data.description;
    this.category = data.category;
    this.priority = data.priority;
    this.status = data.status;
    this.latitude = parseFloat(data.latitude);
    this.longitude = parseFloat(data.longitude);
    this.address = data.address;
    this.city = data.city;
    this.state = data.state;
    this.pincode = data.pincode;
    this.mediaUrls = data.media_urls;
    this.aiDetectionResults = data.ai_detection_results;
    this.upvotes = data.upvotes;
    this.reportsCount = data.reports_count;
    this.isAnonymous = data.is_anonymous;
    this.deviceId = data.device_id;
    this.assignedTo = data.assigned_to;
    this.resolvedAt = data.resolved_at;
    this.resolutionNotes = data.resolution_notes;
    this.resolutionMedia = data.resolution_media;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async create(issueData) {
    const {
      reporterId,
      title,
      description,
      category,
      priority = 'medium',
      latitude,
      longitude,
      address,
      city,
      state,
      pincode,
      mediaUrls = [],
      aiDetectionResults = null,
      isAnonymous = false,
      deviceId = null
    } = issueData;

    const [issue] = await db('issues')
      .insert({
        id: uuidv4(),
        reporter_id: reporterId,
        title,
        description,
        category,
        priority,
        latitude,
        longitude,
        address,
        city,
        state,
        pincode,
        media_urls: JSON.stringify(mediaUrls),
        ai_detection_results: aiDetectionResults ? JSON.stringify(aiDetectionResults) : null,
        is_anonymous: isAnonymous,
        device_id: deviceId,
        upvotes: 0,
        reports_count: 0
      })
      .returning('*');

    return new Issue(issue);
  }

  static async findById(id) {
    const issue = await db('issues').where({ id }).first();
    return issue ? new Issue(issue) : null;
  }

  static async findAll(filters = {}) {
    let query = db('issues')
      .leftJoin('users', 'issues.reporter_id', 'users.id')
      .select(
        'issues.*',
        'users.first_name as reporter_first_name',
        'users.last_name as reporter_last_name',
        'users.avatar_url as reporter_avatar_url'
      );

    // Apply filters
    if (filters.category) {
      query = query.where('issues.category', filters.category);
    }
    if (filters.status) {
      query = query.where('issues.status', filters.status);
    }
    if (filters.priority) {
      query = query.where('issues.priority', filters.priority);
    }
    if (filters.city) {
      query = query.where('issues.city', filters.city);
    }
    if (filters.reporterId) {
      query = query.where('issues.reporter_id', filters.reporterId);
    }
    if (filters.assignedTo) {
      query = query.where('issues.assigned_to', filters.assignedTo);
    }
    if (filters.dateFrom) {
      query = query.where('issues.created_at', '>=', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.where('issues.created_at', '<=', filters.dateTo);
    }
    if (filters.bounds) {
      const { north, south, east, west } = filters.bounds;
      query = query.whereBetween('issues.latitude', [south, north])
                   .whereBetween('issues.longitude', [west, east]);
    }

    // Sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.orderBy(`issues.${sortBy}`, sortOrder);

    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    const issues = await query;
    return issues.map(issue => new Issue(issue));
  }

  static async updateStatus(issueId, newStatus, updatedBy = null, notes = null) {
    const trx = await db.transaction();
    
    try {
      // Get current issue
      const currentIssue = await trx('issues').where({ id: issueId }).first();
      if (!currentIssue) {
        throw new Error('Issue not found');
      }

      // Update issue status
      const updateData = {
        status: newStatus,
        updated_at: new Date()
      };

      if (newStatus === 'resolved' || newStatus === 'closed') {
        updateData.resolved_at = new Date();
      }

      if (updatedBy) {
        updateData.assigned_to = updatedBy;
      }

      const [issue] = await trx('issues')
        .where({ id: issueId })
        .update(updateData)
        .returning('*');

      // Record status change in history
      await trx('issue_status_history').insert({
        id: uuidv4(),
        issue_id: issueId,
        updated_by: updatedBy,
        old_status: currentIssue.status,
        new_status: newStatus,
        notes
      });

      await trx.commit();
      return new Issue(issue);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async upvote(issueId, userId) {
    const trx = await db.transaction();
    
    try {
      // Check if user already upvoted (prevent duplicate upvotes)
      const existingUpvote = await trx('issue_upvotes')
        .where({ issue_id: issueId, user_id: userId })
        .first();

      if (existingUpvote) {
        throw new Error('User has already upvoted this issue');
      }

      // Add upvote record
      await trx('issue_upvotes').insert({
        id: uuidv4(),
        issue_id: issueId,
        user_id: userId
      });

      // Increment upvote count
      await trx('issues')
        .where({ id: issueId })
        .increment('upvotes', 1);

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async getStats(filters = {}) {
    let query = db('issues');

    if (filters.dateFrom) {
      query = query.where('created_at', '>=', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.where('created_at', '<=', filters.dateTo);
    }
    if (filters.city) {
      query = query.where('city', filters.city);
    }

    const stats = await query
      .select(
        db.raw('COUNT(*) as total_issues'),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as reported', ['reported']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as in_progress', ['in_progress']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as resolved', ['resolved']),
        db.raw('COUNT(CASE WHEN category = ? THEN 1 END) as potholes', ['pothole']),
        db.raw('COUNT(CASE WHEN category = ? THEN 1 END) as garbage', ['garbage']),
        db.raw('COUNT(CASE WHEN category = ? THEN 1 END) as sewage', ['sewage']),
        db.raw('AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_resolution_hours')
      )
      .first();

    return stats;
  }

  static async getNearbyIssues(latitude, longitude, radiusKm = 1) {
    // Using Haversine formula for distance calculation
    const issues = await db('issues')
      .select('*')
      .whereRaw(`
        6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(latitude))
        ) <= ?
      `, [latitude, longitude, latitude, radiusKm])
      .orderBy('created_at', 'desc');

    return issues.map(issue => new Issue(issue));
  }

  async update(updateData) {
    const [issue] = await db('issues')
      .where({ id: this.id })
      .update({
        ...updateData,
        updated_at: new Date()
      })
      .returning('*');

    if (issue) {
      Object.assign(this, new Issue(issue));
    }
    return issue;
  }

  toJSON() {
    return {
      id: this.id,
      reporterId: this.reporterId,
      title: this.title,
      description: this.description,
      category: this.category,
      priority: this.priority,
      status: this.status,
      location: {
        latitude: this.latitude,
        longitude: this.longitude,
        address: this.address,
        city: this.city,
        state: this.state,
        pincode: this.pincode
      },
      mediaUrls: this.mediaUrls,
      aiDetectionResults: this.aiDetectionResults,
      upvotes: this.upvotes,
      reportsCount: this.reportsCount,
      isAnonymous: this.isAnonymous,
      assignedTo: this.assignedTo,
      resolvedAt: this.resolvedAt,
      resolutionNotes: this.resolutionNotes,
      resolutionMedia: this.resolutionMedia,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Issue;