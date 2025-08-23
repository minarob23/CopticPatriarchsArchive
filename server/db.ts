import pkg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Enhanced connection configuration for both online and local PostgreSQL
const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  // Enhanced SSL configuration for online/offline compatibility
  ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1') 
    ? false 
    : process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : { rejectUnauthorized: false },
  allowExitOnIdle: true,
  // Additional configuration for connection stability
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

export const pool = new Pool(connectionConfig);

// Handle connection errors gracefully
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit process in development, log and continue
  if (process.env.NODE_ENV !== 'development') {
    process.exit(-1);
  }
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✓ Successfully connected to PostgreSQL database');
});

export const db = drizzle({ client: pool, schema });