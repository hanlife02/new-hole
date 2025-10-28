import pool from '@/lib/db';

let initialized = false;
let initializePromise: Promise<void> | null = null;

async function runInitialization() {
  const client = await pool.connect();

  try {
    await client.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_holes_text_trgm ON holes USING gin (text gin_trgm_ops)',
    );
  } finally {
    client.release();
  }
}

export async function ensureSearchInfrastructure(): Promise<void> {
  if (initialized) {
    return;
  }

  if (!initializePromise) {
    initializePromise = runInitialization().catch((error) => {
      initializePromise = null;
      throw error;
    });
  }

  await initializePromise;
  initialized = true;
}
