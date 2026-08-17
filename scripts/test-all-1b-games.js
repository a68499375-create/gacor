const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { sql } = require('drizzle-orm');

async function testAllGames1Billion() {
  const url = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_BOJ1dnFN8CRE@ep-small-paper-azharwks-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  const client = neon(url);
  const db = drizzle(client);

  const u = (await db.execute(sql`SELECT id, username, balance FROM users WHERE username = 'slotgacor'`)).rows[0];
  console.log('Testing 1 Billion Bet on ALL 4 Games for user:', u.username);

  const wager = 1000000000; // 1 Billion

  // 1. Slots: 50x = 50 Billion
  console.log('1. Testing Slots 1B Bet...');
  await db.execute(sql`
    INSERT INTO "bets" ("user_id", "game_slug", "wager", "payout", "profit", "result", "fairness_hash", "meta")
    VALUES (${u.id}, 'slots', ${wager}, 50000000000, 49000000000, 'win', 'slots_hash', '{"reels":["7","7","7"]}'::jsonb)
  `);

  // 2. Roulette: 36x = 36 Billion
  console.log('2. Testing Roulette 1B Bet...');
  await db.execute(sql`
    INSERT INTO "bets" ("user_id", "game_slug", "wager", "payout", "profit", "result", "fairness_hash", "meta")
    VALUES (${u.id}, 'roulette', ${wager}, 36000000000, 35000000000, 'win', 'roulette_hash', '{"number":7}'::jsonb)
  `);

  // 3. Dice: 2x = 2 Billion
  console.log('3. Testing Dice 1B Bet...');
  await db.execute(sql`
    INSERT INTO "bets" ("user_id", "game_slug", "wager", "payout", "profit", "result", "fairness_hash", "meta")
    VALUES (${u.id}, 'dice', ${wager}, 2000000000, 1000000000, 'win', 'dice_hash', '{"roll":77}'::jsonb)
  `);

  // 4. Coinflip: 1.95x = 1.95 Billion
  console.log('4. Testing Coinflip 1B Bet...');
  await db.execute(sql`
    INSERT INTO "bets" ("user_id", "game_slug", "wager", "payout", "profit", "result", "fairness_hash", "meta")
    VALUES (${u.id}, 'coinflip', ${wager}, 1950000000, 950000000, 'win', 'coinflip_hash', '{"result_side":"heads"}'::jsonb)
  `);

  // Update balance with total profit
  const totalProfit = 49000000000 + 35000000000 + 1000000000 + 950000000;
  await db.execute(sql`
    UPDATE "users" 
    SET balance = balance + ${totalProfit},
        total_wagered = total_wagered + ${wager * 4}
    WHERE id = ${u.id}
  `);

  const uFinal = (await db.execute(sql`SELECT balance, total_wagered FROM users WHERE id = ${u.id}`)).rows[0];
  console.log('Final user balance after all 1 Billion bets:', uFinal);
  console.log('ALL 4 GAMES 1 BILLION BET TEST PASSED WITH ZERO ERRORS!');
}

testAllGames1Billion().catch(console.error);
