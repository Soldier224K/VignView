exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('phone').nullable();
    table.string('avatar_url').nullable();
    table.boolean('is_verified').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_anonymous').defaultTo(false);
    table.string('device_id').nullable(); // For anonymous users
    table.integer('total_points').defaultTo(0);
    table.integer('level').defaultTo(1);
    table.json('preferences').nullable();
    table.timestamp('last_login').nullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index(['email']);
    table.index(['device_id']);
    table.index(['total_points']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};