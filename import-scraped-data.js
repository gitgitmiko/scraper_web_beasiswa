require('dotenv').config()
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

async function importScrapedData() {
  console.log('🔍 Importing scraped data to database...')
  
  // Read scraped data
  const dataPath = path.join(__dirname, 'data', 'beasiswa_semua.json')
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ Scraped data file not found:', dataPath)
    console.log('💡 Please run the scraper first: python main_scraper.py')
    process.exit(1)
  }

  const scrapedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  console.log(`📊 Found ${scrapedData.length} records in scraped data`)

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  })

  try {
    console.log('🔄 Connecting to database...')
    const client = await pool.connect()
    console.log('✅ Database connected!')

    // Create tables if not exist
    console.log('📋 Ensuring tables exist...')
    
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

    // Clear existing data
    console.log('🗑️ Clearing existing data...')
    await client.query('DELETE FROM beasiswa')

    // Import scraped data
    console.log('📝 Importing scraped data...')
    
    let importedCount = 0
    for (const item of scrapedData) {
      try {
        await client.query(`
          INSERT INTO beasiswa (judul, kategori, deskripsi, deadline, link, sumber)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          item.nama_beasiswa,
          item.kategori,
          item.deskripsi || item.persyaratan || '',
          item.deadline,
          item.link_pendaftaran,
          item.website_sumber
        ])
        importedCount++
      } catch (error) {
        console.error(`❌ Failed to import: ${item.nama_beasiswa}`, error.message)
      }
    }

    // Initialize scheduler status
    await client.query('DELETE FROM scheduler_status')
    await client.query(`
      INSERT INTO scheduler_status (is_running, is_enabled, last_update, next_update, is_updating)
      VALUES (false, false, null, null, false)
    `)

    // Verify import
    const result = await client.query('SELECT COUNT(*) as count FROM beasiswa')
    console.log(`📊 Total records in database: ${result.rows[0].count}`)

    client.release()
    await pool.end()
    
    console.log(`✅ Successfully imported ${importedCount} records!`)
    console.log('🚀 Database is now ready with real scraped data')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Failed to import data:')
    console.error('Error:', error.message)
    console.error('Code:', error.code)
    
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      console.log('\n💡 Database connection timeout. Try:')
      console.log('1. npm run db:activate (to wake up Neon database)')
      console.log('2. Check your internet connection')
      console.log('3. Verify DATABASE_URL in .env file')
    }
    
    await pool.end()
    process.exit(1)
  }
}

importScrapedData() 