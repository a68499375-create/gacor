const { PGlite } = require('@electric-sql/pglite');
const { drizzle } = require('drizzle-orm/pglite');
const path = require('path');
const fs = require('fs');

async function test() {
  const dataDir = path.join(process.cwd(), '.pgdata');
  const client = new PGlite(dataDir);
  const db = drizzle(client);
  console.log('PGlite initialized successfully at', dataDir);
  await client.exec(`
    CREATE TABLE IF NOT EXISTS test (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);
  console.log('Table created!');
  await client.close();
}

test().catch(console.error);
