import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load dotenv from root folder (CWD)
dotenv.config();

// Load dotenv from backend folder (parent of database folder)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("WARNING: DATABASE_URL environment variable is not defined!");
}

const pool = new Pool({
  connectionString,
});

// Test connection and initialize tables
export const initDb = async () => {
  try {
    const client = await pool.connect();
    console.log("Successfully connected to the PostgreSQL database.");
    
    // Create personal_details table
    await client.query(`
      CREATE TABLE IF NOT EXISTS personal_details (
          person_id VARCHAR(20) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP
      );
    `);

    // Create travel_details table
    await client.query(`
      CREATE TABLE IF NOT EXISTS travel_details (
          travel_id SERIAL PRIMARY KEY,
          person_id VARCHAR(20) NOT NULL REFERENCES personal_details(person_id) ON DELETE CASCADE,
          source VARCHAR(100) NOT NULL,
          destination VARCHAR(100) NOT NULL,
          date_of_going DATE,
          date_of_returning DATE,
          activities TEXT,
          mode_of_transport VARCHAR(50),
          hotel_required BOOLEAN DEFAULT FALSE,
          hotel_name VARCHAR(200),
          car_rent BOOLEAN DEFAULT FALSE
      );
    `);

    // Create chat_history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_history (
          chat_id BIGSERIAL PRIMARY KEY,
          person_id VARCHAR(20) NOT NULL REFERENCES personal_details(person_id) ON DELETE CASCADE,
          session_id VARCHAR(100),
          role VARCHAR(20) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    client.release();
    console.log("Database tables initialized successfully.");
  } catch (error) {
    console.error("Failed to connect to the database or initialize tables:", error.message);
    throw error;
  }
};

export const query = (text, params) => pool.query(text, params);
export default pool;
