import { Pool, PoolClient } from 'pg'
import { logger } from '@/utils/logger'

class DatabaseConnection {
  private pool: Pool | null = null
  private static instance: DatabaseConnection

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection()
    }
    return DatabaseConnection.instance
  }

  public async connect(): Promise<Pool> {
    if (this.pool) {
      return this.pool
    }

    try {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // Increased timeout
        query_timeout: 30000, // Query timeout
        statement_timeout: 30000, // Statement timeout
      })

      // Test connection
      const client = await this.pool.connect()
      await client.query('SELECT NOW()')
      client.release()

      logger.info('Database connected successfully')
      return this.pool
    } catch (error) {
      logger.error('Database connection failed:', error instanceof Error ? error : new Error(String(error)))
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  public async getClient(): Promise<PoolClient> {
    const pool = await this.connect()
    return pool.connect()
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient()
    try {
      const result = await client.query(text, params)
      return result
    } catch (error) {
      logger.error('Database query error:', error instanceof Error ? error : new Error(String(error)), { query: text, params })
      throw error
    } finally {
      client.release()
    }
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
      logger.info('Database connection closed')
    }
  }
}

export const db = DatabaseConnection.getInstance() 