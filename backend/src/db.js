const { Pool } = require("pg");

const sslEnabled = process.env.DATABASE_SSL === "true";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslEnabled
    ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "true" }
    : undefined,
  allowExitOnIdle: true,
});

async function query(text, params = []) {
  if (!process.env.DATABASE_URL) {
    const error = new Error("DATABASE_URL no configurada en Netlify");
    error.status = 500;
    throw error;
  }

  return pool.query(text, params);
}

async function transaction(callback) {
  if (!process.env.DATABASE_URL) {
    const error = new Error("DATABASE_URL no configurada en Netlify");
    error.status = 500;
    throw error;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query,
  transaction,
};
