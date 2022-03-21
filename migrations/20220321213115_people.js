/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("People", function (table) {
    table.increments();
    table.string("FirstName").nullable();
    table.string("LastName").nullable();
    table.timestamp("CreatedAt").defaultTo(knex.fn.now());
    table.timestamp("UpdatedAt").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("People");
};
