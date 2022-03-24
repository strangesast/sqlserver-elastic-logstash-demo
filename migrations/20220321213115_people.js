/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("People", function (table) {
    table.increments();
    table.string("FirstName").nullable();
    table.string("LastName").nullable();
    table.timestamp("CreatedAt").defaultTo(knex.fn.now());
    table.timestamp("UpdatedAt").defaultTo(knex.fn.now());
    table.boolean("Deleted").defaultTo(false);
  });
  await knex.raw(`
    create trigger People_update
    on People
    after update
    as
    begin
        update People
        set UpdatedAt = getdate()
        from inserted
        join People on inserted.id = People.id
    end
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("People");
};
