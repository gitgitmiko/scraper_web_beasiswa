import { NextRequest, NextResponse } from 'next/server'
import { BeasiswaModel } from '@/services/database/models'

// Sample data sebagai fallback
const sampleData = [
  {
    id: 1,
    nama_beasiswa: 'Beasiswa KIP Kuliah 2024',
    kategori: 'Perguruan Tinggi Dalam Negeri',
    deskripsi: 'Beasiswa untuk mahasiswa berprestasi dari keluarga kurang mampu',
    deadline: '2024-12-31',
    link_pendaftaran: 'https://kip-kuliah.kemdikbud.go.id',
    website_sumber: 'https://kip-kuliah.kemdikbud.go.id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    nama_beasiswa: 'Beasiswa LPDP 2024',
    kategori: 'Perguruan Tinggi Luar Negeri',
    deskripsi: 'Beasiswa untuk melanjutkan studi S2/S3 di luar negeri',
    deadline: '2024-11-30',
    link_pendaftaran: 'https://www.lpdp.kemenkeu.go.id',
    website_sumber: 'https://www.lpdp.kemenkeu.go.id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    nama_beasiswa: 'Beasiswa Djarum Plus',
    kategori: 'Perguruan Tinggi Dalam Negeri',
    deskripsi: 'Beasiswa untuk mahasiswa berprestasi dari PTN/PTS',
    deadline: '2024-10-15',
    link_pendaftaran: 'https://djarumbeasiswaplus.org',
    website_sumber: 'https://djarumbeasiswaplus.org',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    nama_beasiswa: 'Beasiswa Chevening UK',
    kategori: 'Perguruan Tinggi Luar Negeri',
    deskripsi: 'Beasiswa pemerintah Inggris untuk studi di UK',
    deadline: '2024-11-02',
    link_pendaftaran: 'https://www.chevening.org/indonesia',
    website_sumber: 'https://www.chevening.org',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    nama_beasiswa: 'Beasiswa Pertukaran Pelajar AFS',
    kategori: 'SMP-SMA Internasional/Pertukaran',
    deskripsi: 'Program pertukaran pelajar ke berbagai negara',
    deadline: '2024-09-30',
    link_pendaftaran: 'https://afsindonesia.org',
    website_sumber: 'https://afsindonesia.org',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kategori = searchParams.get('kategori')
    
    let beasiswaData
    if (kategori) {
      beasiswaData = await BeasiswaModel.getByCategory(kategori)
      console.log(`Fetched beasiswa data for category: ${kategori}`, { count: beasiswaData.length })
    } else {
      beasiswaData = await BeasiswaModel.getAll()
      console.log('Fetched all beasiswa data', { count: beasiswaData.length })
    }

    // Transform data to match frontend expectations
    const transformedData = beasiswaData.map(item => ({
      id: item.id,
      nama_beasiswa: item.judul,
      kategori: item.kategori,
      deskripsi: item.deskripsi,
      deadline: item.deadline,
      link_pendaftaran: item.link,
      website_sumber: item.sumber,
      persyaratan: item.deskripsi, // Use deskripsi as persyaratan for compatibility
      tanggal_update: item.updated_at || item.created_at,
      created_at: item.created_at,
      updated_at: item.updated_at
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
      count: transformedData.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to fetch beasiswa data:', error instanceof Error ? error.message : String(error))
    
    // Return sample data as fallback when database is unavailable
    let fallbackData = sampleData
    const { searchParams } = new URL(request.url)
    const kategori = searchParams.get('kategori')
    
    if (kategori) {
      fallbackData = sampleData.filter(item => item.kategori === kategori)
    }
    
    return NextResponse.json({
      success: true,
      data: fallbackData,
      count: fallbackData.length,
      timestamp: new Date().toISOString(),
      message: 'Database temporarily unavailable, showing sample data'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { beasiswaList, clearFirst = false } = body

    if (!Array.isArray(beasiswaList)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid data format. Expected array of beasiswa objects.'
      }, { status: 400 })
    }

    // Transform data from scraper format to database format
    const transformedData = beasiswaList.map(item => ({
      judul: item.nama_beasiswa || item.judul || 'Unknown',
      deskripsi: item.deskripsi || item.persyaratan || '',
      deadline: item.deadline || '',
      link: item.link_pendaftaran || item.link || '',
      kategori: item.kategori || '',
      sumber: item.website_sumber || item.sumber || ''
    }))

    // Clear database first if requested
    if (clearFirst) {
      console.log('Clearing existing beasiswa data before insert')
      await BeasiswaModel.deleteAll()
    }

    await BeasiswaModel.insertMany(transformedData)
    
    console.log('Successfully inserted beasiswa data', { count: transformedData.length, clearFirst })

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${transformedData.length} beasiswa records${clearFirst ? ' (database cleared first)' : ''}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to insert beasiswa data:', error instanceof Error ? error.message : String(error))
    
    return NextResponse.json({
      success: false,
      error: 'Failed to insert beasiswa data',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'clear') {
      await BeasiswaModel.deleteAll()
      
      console.log('Successfully cleared all beasiswa data')

      return NextResponse.json({
        success: true,
        message: 'All beasiswa data cleared successfully',
        timestamp: new Date().toISOString()
      })
    } else {
      // Default DELETE behavior
      await BeasiswaModel.deleteAll()
      
      console.log('Successfully deleted all beasiswa data')

      return NextResponse.json({
        success: true,
        message: 'All beasiswa data deleted successfully',
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Failed to delete beasiswa data:', error instanceof Error ? error.message : String(error))
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete beasiswa data',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
} 