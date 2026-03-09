import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    if (typeof window === 'undefined') {
        console.error("❌ DATABASE_URL is not set in environment variables!");
    }
}

const sql = neon(databaseUrl || "postgresql://missing_url_error@localhost/error");
export const db = drizzle(sql, { schema });

if (typeof window === 'undefined' && databaseUrl) {
    // Database connection check
}
