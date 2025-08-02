import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.helpers import WebScraperHelper
import re
from datetime import datetime

class UniversitasLuarNegeriScraper:
    def __init__(self):
        self.helper = WebScraperHelper()
        self.scholarships = []
    
    def scrape_mext_jepang(self):
        """Scrape MEXT Jepang"""
        print("Mengambil data MEXT Jepang...")
        
        try:
            url = "https://www.id.emb-japan.go.jp/mext.html"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'MEXT Scholarship Jepang',
                        'kategori': 'Perguruan Tinggi Luar Negeri',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Pemerintah Jepang untuk studi S1, S2, dan S3',
                        'persyaratan': 'Lulusan SMA/S1/S2, usia maksimal 24/35/35 tahun, kemampuan bahasa Jepang/Inggris',
                        'deadline': 'Biasanya April-Mei',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping MEXT Jepang: {str(e)}")
    
    def scrape_rotary_yoneyama(self):
        """Scrape Rotary Yoneyama"""
        print("Mengambil data Rotary Yoneyama...")
        
        try:
            url = "https://www.rotary.org/en/our-programs/scholarships"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'Rotary Yoneyama Memorial Foundation',
                        'kategori': 'Perguruan Tinggi Luar Negeri',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Rotary Foundation untuk studi di Jepang',
                        'persyaratan': 'Mahasiswa S2/S3 dengan kemampuan bahasa Jepang/Inggris',
                        'deadline': 'Biasanya September-Oktober',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping Rotary Yoneyama: {str(e)}")
    
    def scrape_hungaria_tempus(self):
        """Scrape Hungaria Tempus"""
        print("Mengambil data Hungaria Tempus...")
        
        try:
            url = "https://tka.hu/english"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'Hungaria Tempus Foundation',
                        'kategori': 'Perguruan Tinggi Luar Negeri',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Pemerintah Hungaria untuk studi di Hungaria',
                        'persyaratan': 'Mahasiswa S1/S2/S3 dengan kemampuan bahasa Inggris',
                        'deadline': 'Biasanya Januari-Februari',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping Hungaria Tempus: {str(e)}")
    
    def scrape_fulbright(self):
        """Scrape Fulbright"""
        print("Mengambil data Fulbright...")
        
        try:
            url = "https://www.aminef.or.id/"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'Fulbright Scholarship',
                        'kategori': 'Perguruan Tinggi Luar Negeri',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Pemerintah Amerika Serikat untuk studi di AS',
                        'persyaratan': 'Lulusan S1/S2 dengan IPK minimal 3.0, kemampuan bahasa Inggris',
                        'deadline': 'Biasanya Februari-April',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping Fulbright: {str(e)}")
    
    def scrape_chevening(self):
        """Scrape Chevening"""
        print("Mengambil data Chevening...")
        
        try:
            url = "https://www.chevening.org/indonesia/"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'Chevening Scholarship',
                        'kategori': 'Perguruan Tinggi Luar Negeri',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Pemerintah Inggris untuk studi S2 di Inggris',
                        'persyaratan': 'Lulusan S1 dengan pengalaman kerja minimal 2 tahun, kemampuan bahasa Inggris',
                        'deadline': 'Biasanya November',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping Chevening: {str(e)}")
    
    def scrape_erasmus(self):
        """Scrape Erasmus"""
        print("Mengambil data Erasmus...")
        
        try:
            url = "https://erasmus-plus.ec.europa.eu/"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'Erasmus+ Scholarship',
                        'kategori': 'Perguruan Tinggi Luar Negeri',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Uni Eropa untuk studi di negara-negara Eropa',
                        'persyaratan': 'Mahasiswa S1/S2/S3 dengan kemampuan bahasa Inggris',
                        'deadline': 'Tergantung program dan universitas',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping Erasmus: {str(e)}")
    
    def scrape_adb_jp(self):
        """Scrape ADB-JP"""
        print("Mengambil data ADB-JP...")
        
        try:
            url = "https://www.adb.org/site/careers/japan-scholarship-program"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'ADB-Japan Scholarship Program',
                        'kategori': 'Perguruan Tinggi Luar Negeri',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Asian Development Bank untuk studi di Jepang',
                        'persyaratan': 'Lulusan S1 dengan pengalaman kerja, kemampuan bahasa Inggris',
                        'deadline': 'Biasanya Juli-Agustus',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping ADB-JP: {str(e)}")
    
    def scrape_australia_awards(self):
        """Scrape Australia Awards"""
        print("Mengambil data Australia Awards...")
        
        try:
            url = "https://www.australiaawardsindonesia.org/"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'Australia Awards Indonesia',
                        'kategori': 'Perguruan Tinggi Luar Negeri',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Pemerintah Australia untuk studi di Australia',
                        'persyaratan': 'Lulusan S1 dengan pengalaman kerja, kemampuan bahasa Inggris',
                        'deadline': 'Biasanya Februari-April',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping Australia Awards: {str(e)}")
    
    def scrape_new_zealand_awards(self):
        """Scrape New Zealand Awards"""
        print("Mengambil data New Zealand Awards...")
        
        try:
            url = "https://www.mfat.govt.nz/en/aid-and-development/scholarships/"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'New Zealand Scholarships',
                        'kategori': 'Perguruan Tinggi Luar Negeri',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Pemerintah Selandia Baru',
                        'persyaratan': 'Lulusan S1 dengan pengalaman kerja, kemampuan bahasa Inggris',
                        'deadline': 'Biasanya Februari-Maret',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping New Zealand Awards: {str(e)}")
    
    def scrape_all(self):
        """Jalankan semua scraper perguruan tinggi luar negeri"""
        print("Memulai scraping beasiswa perguruan tinggi luar negeri...")
        
        self.scrape_mext_jepang()
        self.scrape_rotary_yoneyama()
        self.scrape_hungaria_tempus()
        self.scrape_fulbright()
        self.scrape_chevening()
        self.scrape_erasmus()
        self.scrape_adb_jp()
        self.scrape_australia_awards()
        self.scrape_new_zealand_awards()
        
        print(f"Berhasil mengambil {len(self.scholarships)} beasiswa perguruan tinggi luar negeri")
        return self.scholarships

if __name__ == "__main__":
    scraper = UniversitasLuarNegeriScraper()
    scholarships = scraper.scrape_all()
    
    # Simpan data
    if scholarships:
        scraper.helper.save_to_json(scholarships, 'beasiswa_pt_luar_negeri.json')
        scraper.helper.save_to_excel(scholarships, 'beasiswa_pt_luar_negeri.xlsx')
        scraper.helper.save_to_csv(scholarships, 'beasiswa_pt_luar_negeri.csv') 