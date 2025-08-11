import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema'; // ✅ ensure this imports all table definitions

// const pool = mysql.createPool({
//   host: process.env.DB_HOST!,
//   user: process.env.DB_USER!,
//   password: process.env.DB_PASS!,
//   database: process.env.DB_NAME!,
//   port: 3306,
// });
// Create a MySQL connection pool with hardcoded details
const pool = mysql.createPool({
  host: 'localhost',          // Database host (for localhost, it's 'localhost')
  user: 'root',               // MySQL username (replace with your username)
  password: '',       // MySQL password (replace with your password)
  database: 'u970484384_taskrabbit',    // Database name (replace with your database name)
  port: 3306,                 // Default MySQL port
});

export const db = drizzle(pool, { schema, mode: "default" });
