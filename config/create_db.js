const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,  
  host: process.env.DB_HOST, 
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const createDatabase = async () => {
  try {
    await client.connect();

    await client.query(`
      DO
      $do$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM pg_catalog.pg_roles WHERE rolname = '${process.env.DB_USER}'
        ) THEN
          CREATE USER ${process.env.DB_USER} WITH PASSWORD '${process.env.DB_PASSWORD}';
        END IF;
      END
      $do$;
    `);

    await client.query(`CREATE DATABASE ${process.env.DB_NAME};`);

    console.log('Database setup complete.');
  } catch (err) {
    console.error('Error creating database or user:', err);
  } finally {
    await client.end();
  }
};

module.exports = createDatabase;
