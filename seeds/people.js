const { faker } = require("@faker-js/faker");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("People").del();
  await knex("People").insert(
    Array.from(Array(10)).map((_, i) => ({
      FirstName: faker.name.firstName(),
      LastName: faker.name.lastName(),
    }))
  );
};
