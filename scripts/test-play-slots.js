const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { sql } = require('drizzle-orm');

async function testPlaySlots() {
  const url = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_BOJ1dnFN8CRE@ep-small-paper-azharwks-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  const client = neon(url);
  const db = drizzle(client);

  console.log('1. Checking user slotgacor balance before bet...');
  const uBefore = await db.execute(sql`SELECT id, username, balance FROM "users" WHERE username = 'slotgacor'`);
  console.log('User before:', uBefore.rows[0]);

  const userId = uBefore.rows[0].id;
  const wager = 100;
  const payout = 500;
  const profit = payout - wager;

  console.log('2. Inserting bet into bets table...');
  const betInsert = await db.execute(sql`
    INSERT INTO "bets" ("user_id", "game_slug", "wager", "payout", "profit", "result", "fairness_hash", "meta")
    VALUES (${userId}, 'slots', ${wager}, ${payout}, ${profit}, 'win', 'test_hash', '{"reels":["7","7","7"]}'::jsonb)
    RETURNING id
  `);
  console.log('Bet inserted with ID:', betInsert.rows[0]);

  console.log('3. Updating user balance...');
  await db.execute(sql`
    UPDATE "users"
    SET balance = balance + ${profit},
        total_wagered = total_wagered + ${wager},
        current_win_streak = current_win_streak + 1
    WHERE id = ${userId}
  `);

  console.log('4. Checking user balance after bet...');
  const uAfter = await db.execute(sql`SELECT id, username, balance, total_wagered FROM "users" WHERE id = ${userId}`);
  console.log('User after:', uAfter.rows[0]);

  console.log('SLOTS BET TRANSACTION SUCCEEDED 100%!');
}

testPlaySlots().catch(console.error);
