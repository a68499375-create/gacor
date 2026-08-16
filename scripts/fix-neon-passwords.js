const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { sql } = require('drizzle-orm');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  const url = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_BOJ1dnFN8CRE@ep-small-paper-azharwks-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  const client = neon(url);
  const db = drizzle(client);

  console.log('Generating pure bcrypt hashes...');
  const slotgacorHash = await bcrypt.hash('gacortsekali', 10);
  const devHash = await bcrypt.hash('dev12345', 10);
  const player1Hash = await bcrypt.hash('player12345', 10);

  console.log('Updating owner table...');
  await db.execute(sql`UPDATE "owner" SET "password_hash" = ${slotgacorHash} WHERE "username" = 'slotgacor'`);
  await db.execute(sql`UPDATE "owner" SET "password_hash" = ${slotgacorHash} WHERE "username" = 'boss'`);

  console.log('Updating users table for slotgacor, dev, and player1...');
  await db.execute(sql`UPDATE "users" SET "password_hash" = ${slotgacorHash}, "security_answer_hash" = ${slotgacorHash} WHERE "username" = 'slotgacor'`);
  await db.execute(sql`UPDATE "users" SET "password_hash" = ${devHash}, "security_answer_hash" = ${devHash} WHERE "username" = 'dev'`);
  await db.execute(sql`UPDATE "users" SET "password_hash" = ${player1Hash} WHERE "username" = 'player1'`);

  console.log('Verifying login test with bcrypt.compare...');
  const owners = await db.execute(sql`SELECT username, password_hash FROM "owner" WHERE username = 'slotgacor'`);
  const match = await bcrypt.compare('gacortsekali', owners.rows[0].password_hash);
  console.log('Owner slotgacor password match:', match);

  const users = await db.execute(sql`SELECT username, password_hash FROM "users" WHERE username = 'slotgacor'`);
  const userMatch = await bcrypt.compare('gacortsekali', users.rows[0].password_hash);
  console.log('User slotgacor password match:', userMatch);

  console.log('ALL NEON PASSWORDS SUCCESSFULLY UPDATED TO BCRYPT!');
}

fixPasswords().catch(console.error);
