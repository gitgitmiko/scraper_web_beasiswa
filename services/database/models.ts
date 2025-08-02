import { db } from './connection'
import { logger } from '@/utils/logger'

export interface Beasiswa {
  id?: number
  judul: string
  deskripsi: string
  deadline: string
  link: string
  kategori: string
  sumber: string
  created_at?: Date
  updated_at?: Date
}

export interface SchedulerStatus {
  id?: number
  is_enabled: boolean
  last_update: Date | null
  next_update: string | null
  is_updating: boolean
  created_at?: Date
  updated_at?: Date
}

export interface Log {
  id?: number
  message: string
  level: 'INFO' | 'ERROR' | 'WARNING' | 'SUCCESS'
  timestamp: Date
  created_at?: Date
}

export class BeasiswaModel {
  static async createTable(): Promise<void> {
    try {
      await db.query(`
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
      logger.info('Beasiswa table created/verified')
    } catch (error) {
      logger.error('Error creating beasiswa table:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  static async insertMany(beasiswaList: Beasiswa[]): Promise<void> {
    if (beasiswaList.length === 0) return

    try {
      const values = beasiswaList.map((_, index) => {
        const offset = index * 6
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`
      }).join(', ')

      const params = beasiswaList.flatMap(item => [
        item.judul || 'Unknown',
        item.deskripsi || '',
        item.deadline || '',
        item.link || '',
        item.kategori || '',
        item.sumber || ''
      ])

      await db.query(`
        INSERT INTO beasiswa (judul, deskripsi, deadline, link, kategori, sumber)
        VALUES ${values}
      `, params)

      logger.info(`Inserted/updated ${beasiswaList.length} beasiswa records`)
    } catch (error) {
      logger.error('Error inserting beasiswa data:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  static async getAll(): Promise<Beasiswa[]> {
    try {
      const result = await db.query(`
        SELECT * FROM beasiswa 
        ORDER BY created_at DESC
      `)
      return result.rows
    } catch (error) {
      logger.error('Error fetching beasiswa data:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  static async getByCategory(kategori: string): Promise<Beasiswa[]> {
    try {
      const result = await db.query(`
        SELECT * FROM beasiswa 
        WHERE kategori = $1
        ORDER BY created_at DESC
      `, [kategori])
      return result.rows
    } catch (error) {
      logger.error('Error fetching beasiswa by category:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  static async deleteAll(): Promise<void> {
    try {
      await db.query('DELETE FROM beasiswa')
      logger.info('All beasiswa records deleted')
    } catch (error) {
      logger.error('Error deleting beasiswa data:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }
}

export class SchedulerStatusModel {
  static async createTable(): Promise<void> {
    try {
      await db.query(`
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
      logger.info('Scheduler status table created/verified')
    } catch (error) {
      logger.error('Error creating scheduler status table:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  static async getStatus(): Promise<SchedulerStatus | null> {
    try {
      const result = await db.query(`
        SELECT * FROM scheduler_status 
        ORDER BY id DESC 
        LIMIT 1
      `)
      return result.rows[0] || null
    } catch (error) {
      logger.error('Error fetching scheduler status:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  static async updateStatus(status: Partial<SchedulerStatus>): Promise<void> {
    try {
      const existing = await this.getStatus()
      
      if (existing) {
        await db.query(`
          UPDATE scheduler_status 
          SET 
            is_enabled = COALESCE($1, is_enabled),
            last_update = COALESCE($2, last_update),
            next_update = COALESCE($3, next_update),
            is_updating = COALESCE($4, is_updating),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
        `, [status.is_enabled, status.last_update, status.next_update, status.is_updating, existing.id])
      } else {
        await db.query(`
          INSERT INTO scheduler_status (is_enabled, last_update, next_update, is_updating)
          VALUES ($1, $2, $3, $4)
        `, [status.is_enabled || false, status.last_update, status.next_update, status.is_updating || false])
      }

      logger.info('Scheduler status updated:', status)
    } catch (error) {
      logger.error('Error updating scheduler status:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  static async initializeStatus(): Promise<void> {
    try {
      const existing = await this.getStatus()
      if (!existing) {
        await this.updateStatus({
          is_enabled: false,
          last_update: null,
          next_update: null,
          is_updating: false
        })
        logger.info('Scheduler status initialized')
      }
    } catch (error) {
      logger.error('Error initializing scheduler status:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }
} 

export class LogModel {
  static async createTable(): Promise<void> {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS logs (
          id SERIAL PRIMARY KEY,
          message TEXT NOT NULL,
          level VARCHAR(20) NOT NULL DEFAULT 'INFO',
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      logger.info('Logs table created/verified')
    } catch (error) {
      logger.error('Error creating logs table:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  static async insertMany(logs: Log[]): Promise<void> {
    if (logs.length === 0) return

    try {
      const values = logs.map((_, index) => {
        const offset = index * 3
        return `($${offset + 1}, $${offset + 2}, $${offset + 3})`
      }).join(', ')

      const params = logs.flatMap(item => [
        item.message,
        item.level,
        item.timestamp
      ])

      await db.query(`
        INSERT INTO logs (message, level, timestamp)
        VALUES ${values}
      `, params)

      logger.info(`Inserted ${logs.length} log records`)
    } catch (error) {
      logger.error('Error inserting log data:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  static async getAll(limit: number = 100): Promise<Log[]> {
    try {
      const result = await db.query(`
        SELECT * FROM logs 
        ORDER BY timestamp DESC
        LIMIT $1
      `, [limit])
      return result.rows
    } catch (error) {
      logger.error('Error fetching log data:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  static async deleteAll(): Promise<void> {
    try {
      await db.query('DELETE FROM logs')
      logger.info('All log records deleted')
    } catch (error) {
      logger.error('Error deleting all log records:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  static async getRecentLogs(limit: number = 50): Promise<Log[]> {
    try {
      const result = await db.query(`
        SELECT * FROM logs 
        ORDER BY timestamp DESC, id DESC
        LIMIT $1
      `, [limit])
      return result.rows
    } catch (error) {
      logger.error('Error fetching recent logs:', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }
} 