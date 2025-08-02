require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 30000,
  query_timeout: 30000,
  statement_timeout: 30000
})

async function initDatabase() {
  const client = await pool.connect()
  
  try {
    console.log('🔧 Initializing database with logs table...')
    
    // Create beasiswa table
    await client.query(`
      CREATE TABLE IF NOT EXISTS beasiswa (
        id SERIAL PRIMARY KEY,
        judul VARCHAR(500) NOT NULL,
        deskripsi TEXT,
        deadline VARCHAR(100),
        link TEXT,
        kategori VARCHAR(100),
        sumber VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Beasiswa table created/verified')
    
    // Create scheduler_status table
    await client.query(`
      CREATE TABLE IF NOT EXISTS scheduler_status (
        id SERIAL PRIMARY KEY,
        is_enabled BOOLEAN DEFAULT false,
        last_update TIMESTAMP,
        next_update VARCHAR(100),
        is_updating BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Scheduler status table created/verified')
    
    // Create logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        level VARCHAR(20) NOT NULL DEFAULT 'INFO',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Logs table created/verified')
    
    // Initialize scheduler status if not exists
    const statusResult = await client.query('SELECT * FROM scheduler_status ORDER BY id DESC LIMIT 1')
    if (statusResult.rows.length === 0) {
      await client.query(`
        INSERT INTO scheduler_status (is_enabled, last_update, next_update, is_updating)
        VALUES (false, null, null, false)
      `)
      console.log('✅ Scheduler status initialized')
    }
    
    console.log('🎉 Database initialization completed successfully!')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

initDatabase().catch(console.error) 