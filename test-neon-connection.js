require('dotenv').config()
const { Pool } = require('pg')

async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('🔗 Testing Neon.tech database connection...')
    
    const client = await pool.connect()
    console.log('✅ Connected to Neon.tech database successfully!')
    
    // Test query
    const result = await client.query('SELECT NOW()')
    console.log('📅 Database time:', result.rows[0].now)
    
    client.release()
    await pool.end()
    
    console.log('✅ Database connection test completed!')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

testConnection() 