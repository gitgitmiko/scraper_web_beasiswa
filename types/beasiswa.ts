export interface BeasiswaData {
  nama_beasiswa: string
  kategori: string
  website_sumber: string
  deskripsi: string
  persyaratan: string
  deadline: string
  link_pendaftaran: string
  tanggal_update: string
}

export interface ScrapingStatus {
  isRunning: boolean
  lastRun: string | null
  nextRun: string | null
  totalScraped: number
  errors: string[]
}

export interface DashboardStats {
  totalBeasiswa: number
  byCategory: Record<string, number>
  lastUpdate: string | null
  successRate: number
} 