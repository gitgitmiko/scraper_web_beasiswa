require('dotenv').config()
const { Pool } = require('pg')

async function activateNeonDatabase() {
  console.log('🔍 Activating Neon database...')
  console.log('📋 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env file')
    console.log('💡 Please check your .env file and ensure DATABASE_URL is set correctly')
    process.exit(1)
  }

  // Show connection string (masked)
  const url = process.env.DATABASE_URL
  const maskedUrl = url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
  console.log('🔗 Connection string:', maskedUrl)

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000, // 30 seconds
    query_timeout: 30000,
    statement_timeout: 30000,
  })

  try {
    console.log('🔄 Attempting to connect to Neon database...')
    console.log('⏳ This might take a moment as Neon database might be sleeping...')
    
    const client = await pool.connect()
    console.log('✅ Database connected successfully!')
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time')
    console.log('⏰ Current database time:', result.rows[0].current_time)
    
    // Create tables
    console.log('📋 Creating tables...')
    
    // Create beasiswa table
    await client.query(`
      CREATE TABLE IF NOT EXISTS beasiswa (
        id SERIAL PRIMARY KEY,
        nama_beasiswa VARCHAR(500) NOT NULL,
        kategori VARCHAR(100) NOT NULL,
        deskripsi TEXT,
        deadline VARCHAR(100),
        link_pendaftaran TEXT,
        website_sumber TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Beasiswa table created')

    // Create scheduler_status table
    await client.query(`
      CREATE TABLE IF NOT EXISTS scheduler_status (
        id SERIAL PRIMARY KEY,
        is_running BOOLEAN DEFAULT FALSE,
        is_enabled BOOLEAN DEFAULT FALSE,
        last_update TIMESTAMP,
        next_update TIMESTAMP,
        is_updating BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Scheduler status table created')

    // Initialize scheduler status
    await client.query('DELETE FROM scheduler_status')
    await client.query(`
      INSERT INTO scheduler_status (is_running, is_enabled, last_update, next_update, is_updating)
      VALUES (false, false, null, null, false)
    `)
    console.log('✅ Scheduler status initialized')

    // Check if beasiswa table has data
    const countResult = await client.query('SELECT COUNT(*) as count FROM beasiswa')
    console.log(`📊 Current records in beasiswa table: ${countResult.rows[0].count}`)

    if (countResult.rows[0].count === 0) {
      console.log('📝 No data found, inserting sample data...')
      
      const sampleData = [
        {
          nama_beasiswa: 'Beasiswa KIP Kuliah 2024',
          kategori: 'Perguruan Tinggi Dalam Negeri',
          deskripsi: 'Beasiswa untuk mahasiswa berprestasi dari keluarga kurang mampu',
          deadline: '2024-12-31',
          link_pendaftaran: 'https://kip-kuliah.kemdikbud.go.id',
          website_sumber: 'https://kip-kuliah.kemdikbud.go.id'
        },
        {
          nama_beasiswa: 'Beasiswa LPDP 2024',
          kategori: 'Perguruan Tinggi Luar Negeri',
          deskripsi: 'Beasiswa untuk melanjutkan studi S2/S3 di luar negeri',
          deadline: '2024-11-30',
          link_pendaftaran: 'https://www.lpdp.kemenkeu.go.id',
          website_sumber: 'https://www.lpdp.kemenkeu.go.id'
        }
      ]

      for (const data of sampleData) {
        await client.query(`
          INSERT INTO beasiswa (nama_beasiswa, kategori, deskripsi, deadline, link_pendaftaran, website_sumber)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [data.nama_beasiswa, data.kategori, data.deskripsi, data.deadline, data.link_pendaftaran, data.website_sumber])
      }
      console.log(`✅ Inserted ${sampleData.length} sample records`)
    }

    client.release()
    await pool.end()
    
    console.log('✅ Neon database activated and ready!')
    console.log('🚀 You can now run the scraper to insert real data')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Failed to activate Neon database:')
    console.error('Error:', error.message)
    console.error('Code:', error.code)
    
    if (error.code === 'ECONNREFUSED' || error.message.includes('timeout')) {
      console.log('\n💡 Troubleshooting tips:')
      console.log('1. Check if your Neon database is active in the Neon console')
      console.log('2. Verify your DATABASE_URL is correct')
      console.log('3. Check your internet connection')
      console.log('4. Try accessing https://console.neon.tech to wake up the database')
    }
    
    await pool.end()
    process.exit(1)
  }
}

activateNeonDatabase() 