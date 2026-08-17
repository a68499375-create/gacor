const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { sql } = require('drizzle-orm');

async function checkGames() {
  const url = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_BOJ1dnFN8CRE@ep-small-paper-azharwks-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  const client = neon(url);
  const db = drizzle(client);

  const res = await db.execute(sql`SELECT slug, name, config, min_bet, max_bet, enabled FROM "games"`);
  console.log('Games:', JSON.stringify(res.rows, null, 2));
}

checkGames().catch(console.error);
