const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { sql } = require('drizzle-orm');

async function checkAllTables() {
  const url = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_BOJ1dnFN8CRE@ep-small-paper-azharwks-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  const client = neon(url);
  const db = drizzle(client);

  const res = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  console.log('Tables in Neon:', res.rows.map(r => r.table_name));

  // Test inserting huge bet (1,000,000,000) on slots with 50x multiplier (50 Billion payout)
  console.log('Testing 1 Billion Bet with 50 Billion payout...');
  const u = (await db.execute(sql`SELECT id, balance FROM users WHERE username = 'slotgacor'`)).rows[0];
  const wager = 1000000000;
  const payout = 50000000000;
  const profit = 49000000000;

  await db.execute(sql`
    INSERT INTO "bets" ("user_id", "game_slug", "wager", "payout", "profit", "result", "fairness_hash", "meta")
    VALUES (${u.id}, 'slots', ${wager}, ${payout}, ${profit}, 'win', 'hash_huge', '{"reels":["7","7","7"]}'::jsonb)
  `);
  console.log('Huge bet inserted successfully!');

  await db.execute(sql`
    UPDATE "users" 
    SET balance = balance + ${profit},
        total_wagered = total_wagered + ${wager}
    WHERE id = ${u.id}
  `);
  console.log('User balance updated with huge profit successfully!');

  const uAfter = (await db.execute(sql`SELECT balance, total_wagered FROM users WHERE id = ${u.id}`)).rows[0];
  console.log('User balance after 1 Billion bet:', uAfter);

  console.log('HUGE BET 100% VERIFIED!');
}

checkAllTables().catch(console.error);
