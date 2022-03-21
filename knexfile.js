const config = require('config');
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'mssql',
    connection: config.get('db'),
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  production: {
    client: 'mssql',
    connection: config.get('db'),
    migrations: {
      tableName: 'knex_migrations'
    }
  },
};
