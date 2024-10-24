const { Sequelize } = require('sequelize');
require('dotenv').config(); 

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT || 5432;

const sequelizeAdmin = new Sequelize('postgres', 'postgres', 'Wyd0718520', {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
});

async function createDatabaseAndUser() {
  try {
    await sequelizeAdmin.query(`DO
    $do$
    BEGIN
       IF NOT EXISTS (
          SELECT
          FROM   pg_catalog.pg_user
          WHERE  usename = '${dbUser}') THEN
          CREATE USER ${dbUser} WITH PASSWORD '${dbPassword}';
       END IF;
    END
    $do$;`);

    console.log(`User "${dbUser}" checked or created.`);

    await sequelizeAdmin.query(`DO
    $do$
    BEGIN
       IF NOT EXISTS (
          SELECT
          FROM   pg_database
          WHERE  datname = '${dbName}') THEN
          CREATE DATABASE ${dbName} OWNER ${dbUser};
       END IF;
    END
    $do$;`);

    console.log(`Database "${dbName}" checked or created.`);

  } catch (error) {
    console.error('Error while creating database or user:', error);
  }
}

async function initializeDatabase() {
  try {
    await createDatabaseAndUser();

    const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: 'postgres',
    });

    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    await sequelize.sync({ alter: true });
    console.log('Models synchronized.');

  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

module.exports = { initializeDatabase };
