const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { sql } = require('drizzle-orm');

async function inspectColumns() {
  const url = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_BOJ1dnFN8CRE@ep-small-paper-azharwks-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  const client = neon(url);
  const db = drizzle(client);

  console.log('Inspecting column data types in Neon...');
  const res = await db.execute(sql`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('bets', 'users', 'top_ups', 'withdrawals', 'daily_claims', 'tournaments', 'games')
    ORDER BY table_name, column_name
  `);
  console.log(JSON.stringify(res.rows, null, 2));
}

inspectColumns().catch(console.error);
