import { default as knexSetup, Knex } from "knex";
import config from "config";

(async () => {
  const dbConfig = config.get("db") as any;

  let knex: Knex;
  knex = knexSetup({
    client: "mssql",
    connection: {
      ...dbConfig,
      database: "master",
    },
  });

  const databaseName = dbConfig.database;

  await knex.raw(
    `
    if not exists (select * from sys.databases where name = '${databaseName}')
    begin
      create database [${databaseName}];
    end;
  `
  );
  knex.destroy();

  knex = knexSetup({
    client: "mssql",
    connection: dbConfig,
  });

  await knex.migrate.latest();

  knex.destroy();
})();
