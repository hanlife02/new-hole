import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: parseInt(process.env.DB_MAX_CLIENTS || '10'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '120000'),
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '120000'),
});

export default pool;
