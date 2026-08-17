const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { sql } = require('drizzle-orm');

async function fixSessionsTable() {
  const url = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_BOJ1dnFN8CRE@ep-small-paper-azharwks-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  const client = neon(url);
  const db = drizzle(client);

  console.log('Altering sessions table columns to be nullable...');
  try { await db.execute(sql`ALTER TABLE "sessions" ALTER COLUMN "ip" DROP NOT NULL`); } catch (e) { console.log('ip:', e.message); }
  try { await db.execute(sql`ALTER TABLE "sessions" ALTER COLUMN "user_agent" DROP NOT NULL`); } catch (e) { console.log('user_agent:', e.message); }
  try { await db.execute(sql`ALTER TABLE "sessions" ALTER COLUMN "fingerprint" DROP NOT NULL`); } catch (e) { console.log('fingerprint:', e.message); }

  console.log('Testing session insertion with null ip/userAgent...');
  const testToken = 'test_token_' + Date.now();
  await db.execute(sql`INSERT INTO "sessions" ("user_id", "token", "expires_at") VALUES (1, ${testToken}, NOW() + INTERVAL '7 days')`);
  console.log('Session insert with null IP SUCCESSFUL!');

  await db.execute(sql`DELETE FROM "sessions" WHERE "token" = ${testToken}`);
  console.log('Session delete SUCCESSFUL!');
  console.log('SESSIONS TABLE IS NOW 100% BULLETPROOF!');
}

fixSessionsTable().catch(console.error);
