import { default as knexSetup, Knex } from "knex";
import config from "config";
import { setTimeout } from "timers/promises";

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

  let i = 0;
  while (true) {
    console.log(i);
    try {
      await knex.raw(
        `
        if not exists (select * from sys.databases where name = '${databaseName}')
        begin
          create database [${databaseName}];
        end;
      `
      );
    } catch (err) {
      if (i++ < 10) {
        await setTimeout(i * 1000);
        continue;
      }
      throw err;
    }
    break;
  }
  knex.destroy();

  knex = knexSetup({
    client: "mssql",
    connection: dbConfig,
  });

  await knex.migrate.latest();

  await knex.seed.run();

  knex.destroy();
})();
