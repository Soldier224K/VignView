exports.up = function(knex) {
  return knex.schema.createTable('issues', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('reporter_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('title').notNullable();
    table.text('description').nullable();
    table.enum('category', [
      'pothole',
      'garbage',
      'sewage',
      'street_light',
      'traffic_signal',
      'road_damage',
      'water_leak',
      'illegal_dumping',
      'other'
    ]).notNullable();
    table.enum('priority', ['low', 'medium', 'high', 'critical']).defaultTo('medium');
    table.enum('status', [
      'reported',
      'verified',
      'assigned',
      'in_progress',
      'resolved',
      'closed',
      'rejected'
    ]).defaultTo('reported');
    table.decimal('latitude', 10, 8).notNullable();
    table.decimal('longitude', 11, 8).notNullable();
    table.string('address').nullable();
    table.string('city').nullable();
    table.string('state').nullable();
    table.string('pincode').nullable();
    table.json('media_urls').nullable(); // Array of image/video URLs
    table.json('ai_detection_results').nullable(); // AI analysis results
    table.integer('upvotes').defaultTo(0);
    table.integer('reports_count').defaultTo(0); // For duplicate reports
    table.boolean('is_anonymous').defaultTo(false);
    table.string('device_id').nullable(); // For anonymous reports
    table.uuid('assigned_to').nullable(); // Municipal worker ID
    table.timestamp('resolved_at').nullable();
    table.text('resolution_notes').nullable();
    table.json('resolution_media').nullable(); // Before/after photos
    table.timestamps(true, true);
    
    // Indexes
    table.index(['reporter_id']);
    table.index(['category']);
    table.index(['status']);
    table.index(['priority']);
    table.index(['latitude', 'longitude']);
    table.index(['created_at']);
    table.index(['assigned_to']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('issues');
};