const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { sql } = require('drizzle-orm');

async function test() {
  const url = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_BOJ1dnFN8CRE@ep-small-paper-azharwks-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  console.log('Testing Neon HTTP Client...');
  const client = neon(url);
  const db = drizzle(client);
  const result = await db.execute(sql`SELECT 1 as connected, NOW() as current_time`);
  console.log('Result:', result);
  console.log('NEON HTTP TEST PASSED 100%!');
}

test().catch(console.error);
