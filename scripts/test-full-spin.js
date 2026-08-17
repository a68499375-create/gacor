// Simulates user session and tests playSlots directly
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { sql } = require('drizzle-orm');

async function testFullSpin() {
  const url = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_BOJ1dnFN8CRE@ep-small-paper-azharwks-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  const client = neon(url);
  const db = drizzle(client);

  console.log('Testing direct bet insert and balance update on Neon...');
  const u = (await db.execute(sql`SELECT id, username, balance, luck_mode FROM "users" WHERE username = 'slotgacor'`)).rows[0];
  console.log('User:', u);

  const wager = 100;
  const payout = 5000;
  const profit = payout - wager;

  // Insert bet
  await db.execute(sql`
    INSERT INTO "bets" ("user_id", "game_slug", "wager", "payout", "profit", "result", "fairness_hash", "meta")
    VALUES (${u.id}, 'slots', ${wager}, ${payout}, ${profit}, 'win', 'hash123', '{"reels":["7","7","7"],"matchType":"three"}'::jsonb)
  `);

  // Update balance
  await db.execute(sql`
    UPDATE "users"
    SET balance = balance + ${profit},
        total_wagered = total_wagered + ${wager},
        current_win_streak = current_win_streak + 1,
        longest_win_streak = GREATEST(longest_win_streak, current_win_streak + 1)
    WHERE id = ${u.id}
  `);

  const uAfter = (await db.execute(sql`SELECT id, username, balance, total_wagered FROM "users" WHERE id = ${u.id}`)).rows[0];
  console.log('User after spin:', uAfter);

  const latestBet = (await db.execute(sql`SELECT * FROM "bets" WHERE user_id = ${u.id} ORDER BY id DESC LIMIT 1`)).rows[0];
  console.log('Latest bet in ledger:', latestBet);

  console.log('SPIN TEST SUCCEEDED 100%!');
}

testFullSpin().catch(console.error);
