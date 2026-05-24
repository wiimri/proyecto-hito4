const { neon, Pool } = require("@neondatabase/serverless");

let pool;
let sql;

function ensureDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    const error = new Error("DATABASE_URL no configurada en Render");
    error.status = 500;
    throw error;
  }
}

function getPool() {
  ensureDatabaseUrl();

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  return pool;
}

function getSql() {
  ensureDatabaseUrl();

  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }

  return sql;
}

async function query(text, params = []) {
  return getPool().query(text, params);
}

async function transaction(callback) {
  const client = await getPool().connect();
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

async function getDatabaseVersion() {
  const result = await getSql()`SELECT version()`;
  return result[0].version;
}

module.exports = {
  getPool,
  getSql,
  getDatabaseVersion,
  query,
  transaction,
};
