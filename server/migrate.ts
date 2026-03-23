import { Pool } from "pg";

export async function runMigrations() {
  if (!process.env.DATABASE_URL) return;

  const useSSL =
    process.env.NODE_ENV === "production" ||
    process.env.DATABASE_URL.includes("neon.tech");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: useSSL ? { rejectUnauthorized: false } : false,
  });

  try {
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE lead_status AS ENUM (
          'Neu', 'Erstkontakt', 'Setting', 'Closing', 'Wiedervorlage', 'Verlorener Lead'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE TYPE activity_type AS ENUM ('comment', 'system');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        role TEXT DEFAULT '',
        company TEXT DEFAULT '',
        status lead_status NOT NULL DEFAULT 'Neu',
        source TEXT NOT NULL DEFAULT 'Tool-Import',
        assigned_to VARCHAR REFERENCES users(id) ON DELETE SET NULL,
        last_contact TIMESTAMP,
        next_follow_up TIMESTAMP,
        phone TEXT DEFAULT '',
        email TEXT DEFAULT '',
        website TEXT DEFAULT '',
        address TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id VARCHAR NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
        type activity_type NOT NULL DEFAULT 'comment',
        text TEXT NOT NULL,
        author_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS email_configs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        imap_server TEXT NOT NULL,
        imap_port INTEGER NOT NULL DEFAULT 993,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT false,
        last_checked_uid TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'leads' AND column_name = 'source' AND udt_name = 'lead_source'
        ) THEN
          ALTER TABLE leads ALTER COLUMN source TYPE TEXT;
        END IF;
      END $$;
    `);

    await pool.query(`
      UPDATE leads SET source = 'Website Leads' WHERE source = 'Google Ads';
      UPDATE leads SET source = 'Video-Analyse' WHERE source IN ('Manuell', 'Organisch', 'E-Mail');
    `);

    console.log("[migrate] Datenbanktabellen erfolgreich erstellt/geprüft");
  } catch (error) {
    console.error("[migrate] Fehler bei der Migration:", error);
    throw error;
  } finally {
    await pool.end();
  }
}
