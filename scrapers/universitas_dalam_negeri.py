import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.helpers import WebScraperHelper
import re
from datetime import datetime

class UniversitasDalamNegeriScraper:
    def __init__(self):
        self.helper = WebScraperHelper()
        self.scholarships = []
    
    def scrape_lpdp(self):
        """Scrape LPDP"""
        print("Mengambil data LPDP...")
        
        try:
            url = "https://www.lpdp.kemenkeu.go.id/"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'LPDP (Lembaga Pengelola Dana Pendidikan)',
                        'kategori': 'Perguruan Tinggi Dalam Negeri',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Kementerian Keuangan untuk pendidikan S2/S3',
                        'persyaratan': 'Lulusan S1 dengan IPK minimal 3.0, usia maksimal 35 tahun',
                        'deadline': 'Tergantung periode pendaftaran',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping LPDP: {str(e)}")
    
    def scrape_kominfo(self):
        """Scrape KOMINFO"""
        print("Mengambil data KOMINFO...")
        
        try:
            url = "https://www.kominfo.go.id/beasiswa"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'Beasiswa KOMINFO',
                        'kategori': 'Perguruan Tinggi Dalam Negeri',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Kementerian Komunikasi dan Informatika',
                        'persyaratan': 'Mahasiswa bidang teknologi informasi dan komunikasi',
                        'deadline': 'Tergantung program',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping KOMINFO: {str(e)}")
    
    def scrape_mahaghora(self):
        """Scrape Mahaghora"""
        print("Mengambil data Mahaghora...")
        
        try:
            url = "https://mahaghora.com/"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'Mahaghora',
                        'kategori': 'Perguruan Tinggi Dalam Negeri',
                        'website_sumber': url,
                        'deskripsi': 'Platform informasi beasiswa untuk mahasiswa Indonesia',
                        'persyaratan': 'Mahasiswa aktif di perguruan tinggi Indonesia',
                        'deadline': 'Tergantung beasiswa yang ditawarkan',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping Mahaghora: {str(e)}")
    
    def scrape_bidikmisi(self):
        """Scrape Bidikmisi"""
        print("Mengambil data Bidikmisi...")
        
        try:
            url = "https://bidikmisi.belmawa.ristekdikti.go.id/"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'Bidikmisi',
                        'kategori': 'Perguruan Tinggi Dalam Negeri',
                        'website_sumber': url,
                        'deskripsi': 'Program bantuan biaya pendidikan untuk mahasiswa berprestasi dari keluarga kurang mampu',
                        'persyaratan': 'Lulusan SMA/SMK dari keluarga kurang mampu dengan prestasi akademik',
                        'deadline': 'Biasanya Januari-Maret',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping Bidikmisi: {str(e)}")
    
    def scrape_kartu_indonesia_pintar(self):
        """Scrape Kartu Indonesia Pintar"""
        print("Mengambil data Kartu Indonesia Pintar...")
        
        try:
            url = "https://pip.kemdikbud.go.id/"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'Kartu Indonesia Pintar (KIP) Kuliah',
                        'kategori': 'Perguruan Tinggi Dalam Negeri',
                        'website_sumber': url,
                        'deskripsi': 'Program bantuan biaya pendidikan untuk mahasiswa dari keluarga kurang mampu',
                        'persyaratan': 'Lulusan SMA/SMK dari keluarga kurang mampu',
                        'deadline': 'Biasanya Januari-Maret',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping KIP Kuliah: {str(e)}")
    
    def scrape_beasiswa_unggulan(self):
        """Scrape Beasiswa Unggulan"""
        print("Mengambil data Beasiswa Unggulan...")
        
        try:
            url = "https://beasiswaunggulan.kemdikbud.go.id/"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'Beasiswa Unggulan',
                        'kategori': 'Perguruan Tinggi Dalam Negeri',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa untuk mahasiswa berprestasi tinggi',
                        'persyaratan': 'Mahasiswa dengan IPK minimal 3.5 dan prestasi akademik/non-akademik',
                        'deadline': 'Tergantung periode pendaftaran',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping Beasiswa Unggulan: {str(e)}")
    
    def scrape_all(self):
        """Jalankan semua scraper perguruan tinggi dalam negeri"""
        print("Memulai scraping beasiswa perguruan tinggi dalam negeri...")
        
        self.scrape_lpdp()
        self.scrape_kominfo()
        self.scrape_mahaghora()
        self.scrape_bidikmisi()
        self.scrape_kartu_indonesia_pintar()
        self.scrape_beasiswa_unggulan()
        
        print(f"Berhasil mengambil {len(self.scholarships)} beasiswa perguruan tinggi dalam negeri")
        return self.scholarships

if __name__ == "__main__":
    scraper = UniversitasDalamNegeriScraper()
    scholarships = scraper.scrape_all()
    
    # Simpan data
    if scholarships:
        scraper.helper.save_to_json(scholarships, 'beasiswa_pt_dalam_negeri.json')
        scraper.helper.save_to_excel(scholarships, 'beasiswa_pt_dalam_negeri.xlsx')
        scraper.helper.save_to_csv(scholarships, 'beasiswa_pt_dalam_negeri.csv') 