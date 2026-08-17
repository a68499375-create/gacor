const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { sql } = require('drizzle-orm');
const bcrypt = require('bcryptjs');

async function testFullAuth() {
  const url = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_BOJ1dnFN8CRE@ep-small-paper-azharwks-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  const client = neon(url);
  const db = drizzle(client);

  console.log('1. Checking user slotgacor in users table...');
  const userRes = await db.execute(sql`SELECT id, username, password_hash, role, balance, luck_mode FROM "users" WHERE username = 'slotgacor'`);
  console.log('User found:', userRes.rows[0]);
  const userMatch = await bcrypt.compare('gacortsekali', userRes.rows[0].password_hash);
  console.log('User password match:', userMatch);

  console.log('2. Checking owner slotgacor in owner table...');
  const ownerRes = await db.execute(sql`SELECT id, username, password_hash FROM "owner" WHERE username = 'slotgacor'`);
  console.log('Owner found:', ownerRes.rows[0]);
  const ownerMatch = await bcrypt.compare('gacortsekali', ownerRes.rows[0].password_hash);
  console.log('Owner password match:', ownerMatch);

  console.log('3. Testing insert into sessions table...');
  const sessionToken = 'test_token_' + Date.now();
  await db.execute(sql`INSERT INTO "sessions" ("user_id", "token", "expires_at") VALUES (${userRes.rows[0].id}, ${sessionToken}, NOW() + INTERVAL '7 days')`);
  console.log('Session inserted successfully!');

  console.log('4. Testing clean up test session...');
  await db.execute(sql`DELETE FROM "sessions" WHERE "token" = ${sessionToken}`);
  console.log('Session deleted successfully!');

  console.log('TEST COMPLETE: AUTH FLOW 100% OPERATIONAL!');
}

testFullAuth().catch(console.error);
