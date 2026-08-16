const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { sql } = require('drizzle-orm');

async function testAll() {
  const url = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_BOJ1dnFN8CRE@ep-small-paper-azharwks-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  const client = neon(url);
  const db = drizzle(client);

  console.log('1. Testing games table...');
  const games = await db.execute(sql`SELECT * FROM "games"`);
  console.log('Games count:', games.rows.length);

  console.log('2. Testing users table...');
  const users = await db.execute(sql`SELECT id, username, balance, role, luck_mode FROM "users"`);
  console.log('Users count:', users.rows.length, users.rows);

  console.log('3. Testing owner table...');
  const owners = await db.execute(sql`SELECT id, username FROM "owner"`);
  console.log('Owner count:', owners.rows.length, owners.rows);

  console.log('4. Testing announcements table...');
  const ann = await db.execute(sql`SELECT * FROM "announcements"`);
  console.log('Announcements count:', ann.rows.length);

  console.log('5. Testing tournaments table...');
  const tour = await db.execute(sql`SELECT * FROM "tournaments"`);
  console.log('Tournaments count:', tour.rows.length);

  console.log('ALL NEON QUERIES SUCCEEDED 100%!');
}

testAll().catch(console.error);
