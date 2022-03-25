const { faker } = require("@faker-js/faker");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("People").del();
  await knex.batchInsert(
    "People",
    Array.from(Array(100000)).map((_, i) => ({
      FirstName: faker.name.firstName(),
      LastName: faker.name.lastName(),
    })),
    1000
  );
};
