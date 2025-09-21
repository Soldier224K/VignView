exports.up = function(knex) {
  return knex.schema.createTable('municipal_workers', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('employee_id').unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('phone').notNullable();
    table.string('department').notNullable();
    table.enum('role', ['worker', 'supervisor', 'manager', 'admin']).defaultTo('worker');
    table.json('assigned_areas').nullable(); // GeoJSON or area definitions
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Indexes
    table.index(['employee_id']);
    table.index(['email']);
    table.index(['department']);
    table.index(['role']);
  });

  return knex.schema.createTable('issue_status_history', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('issue_id').references('id').inTable('issues').onDelete('CASCADE');
    table.uuid('updated_by').references('id').inTable('municipal_workers').onDelete('SET NULL');
    table.enum('old_status', [
      'reported',
      'verified',
      'assigned',
      'in_progress',
      'resolved',
      'closed',
      'rejected'
    ]).nullable();
    table.enum('new_status', [
      'reported',
      'verified',
      'assigned',
      'in_progress',
      'resolved',
      'closed',
      'rejected'
    ]).notNullable();
    table.text('notes').nullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index(['issue_id']);
    table.index(['updated_by']);
    table.index(['created_at']);
  });

  return knex.schema.createTable('system_settings', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('key').unique().notNullable();
    table.json('value').notNullable();
    table.text('description').nullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('system_settings')
    .then(() => knex.schema.dropTable('issue_status_history'))
    .then(() => knex.schema.dropTable('municipal_workers'));
};