import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.helpers import WebScraperHelper
import re
from datetime import datetime

class InternasionalScholarshipScraper:
    def __init__(self):
        self.helper = WebScraperHelper()
        self.scholarships = []
    
    def scrape_sph_breakthrough(self):
        """Scrape SPH Breakthrough"""
        print("Mengambil data SPH Breakthrough...")
        
        try:
            url = "https://sph.edu/breakthrough-scholarship"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'SPH Breakthrough Scholarship',
                        'kategori': 'SMP-SMA Internasional/Pertukaran',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Sekolah Pelita Harapan untuk siswa berprestasi',
                        'persyaratan': 'Siswa SMP/SMA berprestasi dengan kemampuan bahasa Inggris yang baik',
                        'deadline': 'Tergantung periode pendaftaran',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping SPH Breakthrough: {str(e)}")
    
    def scrape_yes_program(self):
        """Scrape YES Program"""
        print("Mengambil data YES Program...")
        
        try:
            url = "https://yesprograms.org/"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'YES Program (Youth Exchange and Study)',
                        'kategori': 'SMP-SMA Internasional/Pertukaran',
                        'website_sumber': url,
                        'deskripsi': 'Program pertukaran pelajar ke Amerika Serikat untuk siswa SMA',
                        'persyaratan': 'Siswa SMA kelas 10-11, nilai minimal 8.0, kemampuan bahasa Inggris',
                        'deadline': 'Biasanya Oktober-November',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping YES Program: {str(e)}")
    
    def scrape_asean_scholarship_singapura(self):
        """Scrape ASEAN Scholarship Singapura"""
        print("Mengambil data ASEAN Scholarship Singapura...")
        
        try:
            url = "https://www.moe.gov.sg/financial-matters/awards-scholarships/asean-scholarships"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'ASEAN Scholarship Singapura',
                        'kategori': 'SMP-SMA Internasional/Pertukaran',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Pemerintah Singapura untuk siswa ASEAN',
                        'persyaratan': 'Siswa SMA kelas 10-11, nilai minimal 8.5, kemampuan bahasa Inggris',
                        'deadline': 'Biasanya Mei-Juni',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping ASEAN Scholarship Singapura: {str(e)}")
    
    def scrape_australian_awards(self):
        """Scrape Australian Awards"""
        print("Mengambil data Australian Awards...")
        
        try:
            url = "https://www.australiaawardsindonesia.org/"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'Australia Awards Indonesia',
                        'kategori': 'SMP-SMA Internasional/Pertukaran',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Pemerintah Australia untuk siswa Indonesia',
                        'persyaratan': 'Siswa berprestasi dengan kemampuan bahasa Inggris yang baik',
                        'deadline': 'Tergantung program',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping Australian Awards: {str(e)}")
    
    def scrape_japan_exchange(self):
        """Scrape Japan Exchange Programs"""
        print("Mengambil data Japan Exchange Programs...")
        
        try:
            url = "https://www.jasso.go.id/"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'JASSO Exchange Program',
                        'kategori': 'SMP-SMA Internasional/Pertukaran',
                        'website_sumber': url,
                        'deskripsi': 'Program pertukaran pelajar ke Jepang',
                        'persyaratan': 'Siswa SMA dengan kemampuan bahasa Jepang/Inggris',
                        'deadline': 'Tergantung program',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping Japan Exchange: {str(e)}")
    
    def scrape_all(self):
        """Jalankan semua scraper internasional"""
        print("Memulai scraping beasiswa internasional...")
        
        self.scrape_sph_breakthrough()
        self.scrape_yes_program()
        self.scrape_asean_scholarship_singapura()
        self.scrape_australian_awards()
        self.scrape_japan_exchange()
        
        print(f"Berhasil mengambil {len(self.scholarships)} beasiswa internasional")
        return self.scholarships

if __name__ == "__main__":
    scraper = InternasionalScholarshipScraper()
    scholarships = scraper.scrape_all()
    
    # Simpan data
    if scholarships:
        scraper.helper.save_to_json(scholarships, 'beasiswa_internasional.json')
        scraper.helper.save_to_excel(scholarships, 'beasiswa_internasional.xlsx')
        scraper.helper.save_to_csv(scholarships, 'beasiswa_internasional.csv') 