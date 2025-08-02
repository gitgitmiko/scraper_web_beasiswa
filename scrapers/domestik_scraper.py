import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.helpers import WebScraperHelper
import re
from datetime import datetime

class DomestikScholarshipScraper:
    def __init__(self):
        self.helper = WebScraperHelper()
        self.scholarships = []
    
    def scrape_pip(self):
        """Scrape Program Indonesia Pintar (PIP)"""
        print("Mengambil data PIP...")
        
        # URL PIP (contoh - perlu disesuaikan dengan URL aktual)
        pip_urls = [
            "https://pip.kemdikbud.go.id/",
            "https://www.kemdikbud.go.id/program-indonesia-pintar"
        ]
        
        success = False
        for url in pip_urls:
            try:
                html = self.helper.get_page(url)
                if html:
                    soup = self.helper.parse_html(html)
                    if soup:
                        # Ekstrak informasi beasiswa (perlu disesuaikan dengan struktur HTML aktual)
                        title = self.helper.extract_text(soup.find('h1')) or "Program Indonesia Pintar"
                        
                        scholarship = {
                            'nama_beasiswa': title,
                            'kategori': 'SD-SMP-SMA Domestik',
                            'website_sumber': url,
                            'deskripsi': self.helper.extract_text(soup.find('p')) or "Program bantuan pendidikan untuk siswa SD, SMP, dan SMA",
                            'persyaratan': "Siswa dari keluarga kurang mampu",
                            'deadline': "Berjalan terus",
                            'link_pendaftaran': url,
                            'tanggal_update': self.helper.get_current_date()
                        }
                        self.scholarships.append(scholarship)
                        success = True
                        break
            except Exception as e:
                print(f"Error scraping PIP: {str(e)}")
        
        # Fallback data jika semua URL gagal
        if not success:
            scholarship = {
                'nama_beasiswa': 'Program Indonesia Pintar (PIP)',
                'kategori': 'SD-SMP-SMA Domestik',
                'website_sumber': 'https://pip.kemdikbud.go.id/',
                'deskripsi': 'Program bantuan pendidikan untuk siswa SD, SMP, dan SMA dari keluarga kurang mampu',
                'persyaratan': 'Siswa dari keluarga kurang mampu, memiliki KIP',
                'deadline': 'Berjalan terus',
                'link_pendaftaran': 'https://pip.kemdikbud.go.id/',
                'tanggal_update': self.helper.get_current_date()
            }
            self.scholarships.append(scholarship)
            print("Menggunakan data fallback untuk PIP")
    
    def scrape_grabscholar(self):
        """Scrape GrabScholar"""
        print("Mengambil data GrabScholar...")
        
        try:
            # URL GrabScholar (contoh)
            url = "https://grabscholar.com/"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'GrabScholar',
                        'kategori': 'SD-SMP-SMA Domestik',
                        'website_sumber': url,
                        'deskripsi': 'Platform beasiswa dari Grab untuk siswa Indonesia',
                        'persyaratan': 'Siswa aktif SD/SMP/SMA',
                        'deadline': 'Tergantung program',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
                    return
        except Exception as e:
            print(f"Error scraping GrabScholar: {str(e)}")
        
        # Fallback data jika scraping gagal
        scholarship = {
            'nama_beasiswa': 'GrabScholar',
            'kategori': 'SD-SMP-SMA Domestik',
            'website_sumber': 'https://grabscholar.com/',
            'deskripsi': 'Platform beasiswa dari Grab untuk siswa Indonesia',
            'persyaratan': 'Siswa aktif SD/SMP/SMA, berprestasi akademik',
            'deadline': 'Tergantung program',
            'link_pendaftaran': 'https://grabscholar.com/',
            'tanggal_update': self.helper.get_current_date()
        }
        self.scholarships.append(scholarship)
        print("Menggunakan data fallback untuk GrabScholar")
    
    def scrape_mentari_umy(self):
        """Scrape Mentari UMY"""
        print("Mengambil data Mentari UMY...")
        
        try:
            url = "https://umy.ac.id/mentari"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'Mentari UMY',
                        'kategori': 'SD-SMP-SMA Domestik',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Universitas Muhammadiyah Yogyakarta',
                        'persyaratan': 'Siswa berprestasi dari keluarga kurang mampu',
                        'deadline': 'Tergantung periode pendaftaran',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
                    return
        except Exception as e:
            print(f"Error scraping Mentari UMY: {str(e)}")
        
        # Fallback data jika scraping gagal
        scholarship = {
            'nama_beasiswa': 'Mentari UMY',
            'kategori': 'SD-SMP-SMA Domestik',
            'website_sumber': 'https://umy.ac.id/mentari',
            'deskripsi': 'Program beasiswa dari Universitas Muhammadiyah Yogyakarta untuk siswa berprestasi',
            'persyaratan': 'Siswa berprestasi dari keluarga kurang mampu, nilai rata-rata minimal 8.0',
            'deadline': 'Tergantung periode pendaftaran',
            'link_pendaftaran': 'https://umy.ac.id/mentari',
            'tanggal_update': self.helper.get_current_date()
        }
        self.scholarships.append(scholarship)
        print("Menggunakan data fallback untuk Mentari UMY")
    
    def scrape_cahaya_pln(self):
        """Scrape Cahaya PLN"""
        print("Mengambil data Cahaya PLN...")
        
        try:
            url = "https://www.pln.co.id/cahaya-pln"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'Cahaya PLN',
                        'kategori': 'SD-SMP-SMA Domestik',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari PT PLN untuk siswa berprestasi',
                        'persyaratan': 'Siswa berprestasi dari keluarga karyawan PLN',
                        'deadline': 'Tergantung periode pendaftaran',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping Cahaya PLN: {str(e)}")
    
    def scrape_jpd_jogja(self):
        """Scrape JPD Jogja"""
        print("Mengambil data JPD Jogja...")
        
        try:
            url = "https://jpd.jogjaprov.go.id/beasiswa"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'JPD Jogja',
                        'kategori': 'SD-SMP-SMA Domestik',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Jogja Priority Development',
                        'persyaratan': 'Siswa berprestasi di DIY',
                        'deadline': 'Tergantung periode pendaftaran',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping JPD Jogja: {str(e)}")
    
    def scrape_karawang_cerdas(self):
        """Scrape Karawang Cerdas"""
        print("Mengambil data Karawang Cerdas...")
        
        try:
            url = "https://karawangcerdas.karawangkab.go.id/"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'Karawang Cerdas',
                        'kategori': 'SD-SMP-SMA Domestik',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Pemkab Karawang',
                        'persyaratan': 'Siswa berprestasi di Kabupaten Karawang',
                        'deadline': 'Tergantung periode pendaftaran',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping Karawang Cerdas: {str(e)}")
    
    def scrape_kaltim_stimulan(self):
        """Scrape Kaltim Stimulan"""
        print("Mengambil data Kaltim Stimulan...")
        
        try:
            url = "https://kaltimprov.go.id/beasiswa"
            html = self.helper.get_page(url)
            
            if html:
                soup = self.helper.parse_html(html)
                if soup:
                    scholarship = {
                        'nama_beasiswa': 'Kaltim Stimulan',
                        'kategori': 'SD-SMP-SMA Domestik',
                        'website_sumber': url,
                        'deskripsi': 'Program beasiswa dari Pemprov Kalimantan Timur',
                        'persyaratan': 'Siswa berprestasi di Kaltim',
                        'deadline': 'Tergantung periode pendaftaran',
                        'link_pendaftaran': url,
                        'tanggal_update': self.helper.get_current_date()
                    }
                    self.scholarships.append(scholarship)
        except Exception as e:
            print(f"Error scraping Kaltim Stimulan: {str(e)}")
    
    def scrape_all(self):
        """Jalankan semua scraper domestik"""
        print("Memulai scraping beasiswa domestik...")
        
        self.scrape_pip()
        self.scrape_grabscholar()
        self.scrape_mentari_umy()
        self.scrape_cahaya_pln()
        self.scrape_jpd_jogja()
        self.scrape_karawang_cerdas()
        self.scrape_kaltim_stimulan()
        
        print(f"Berhasil mengambil {len(self.scholarships)} beasiswa domestik")
        return self.scholarships

if __name__ == "__main__":
    scraper = DomestikScholarshipScraper()
    scholarships = scraper.scrape_all()
    
    # Simpan data
    if scholarships:
        scraper.helper.save_to_json(scholarships, 'beasiswa_domestik.json')
        scraper.helper.save_to_excel(scholarships, 'beasiswa_domestik.xlsx')
        scraper.helper.save_to_csv(scholarships, 'beasiswa_domestik.csv') 