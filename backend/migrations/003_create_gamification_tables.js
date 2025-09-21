exports.up = function(knex) {
  return knex.schema.createTable('points_transactions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('issue_id').references('id').inTable('issues').onDelete('SET NULL');
    table.integer('points').notNullable();
    table.enum('type', [
      'issue_report',
      'issue_resolution',
      'upvote_received',
      'streak_bonus',
      'level_up',
      'achievement',
      'admin_adjustment'
    ]).notNullable();
    table.string('description').nullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index(['user_id']);
    table.index(['issue_id']);
    table.index(['type']);
    table.index(['created_at']);
  });

  return knex.schema.createTable('achievements', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('description').nullable();
    table.string('icon_url').nullable();
    table.integer('points_reward').defaultTo(0);
    table.json('criteria').notNullable(); // JSON object defining achievement criteria
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  return knex.schema.createTable('user_achievements', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('achievement_id').references('id').inTable('achievements').onDelete('CASCADE');
    table.timestamp('earned_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);
    
    // Unique constraint to prevent duplicate achievements
    table.unique(['user_id', 'achievement_id']);
    
    // Indexes
    table.index(['user_id']);
    table.index(['achievement_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_achievements')
    .then(() => knex.schema.dropTable('achievements'))
    .then(() => knex.schema.dropTable('points_transactions'));
};