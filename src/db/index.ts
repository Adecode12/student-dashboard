import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';
import 'dotenv/config';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();
export const db = drizzle(client, { schema });
