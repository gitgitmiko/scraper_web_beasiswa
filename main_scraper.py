#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Web Scraping Informasi Beasiswa
Main script untuk menjalankan semua scraper beasiswa
"""

import sys
import os
import time
import json
import requests
from datetime import datetime

# Import semua scraper
from scrapers.domestik_scraper import DomestikScholarshipScraper
from scrapers.internasional_scraper import InternasionalScholarshipScraper
from scrapers.universitas_dalam_negeri import UniversitasDalamNegeriScraper
from scrapers.universitas_luar_negeri import UniversitasLuarNegeriScraper
from utils.helpers import WebScraperHelper

def clear_database():
    """Clear semua data beasiswa dari database"""
    try:
        api_url = os.getenv('VERCEL_URL', 'https://scrapingbeasiswaweb.vercel.app')
        
        print("[INFO] Clearing database...")
        
        response = requests.delete(
            f'{api_url}/api/beasiswa?action=clear',
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("[SUCCESS] Database berhasil di-clear")
                return True
            else:
                print(f"[ERROR] Gagal clear database: {result.get('message', 'Unknown error')}")
                return False
        else:
            print(f"[ERROR] HTTP Error {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Network error saat clear database: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Error saat clear database: {e}")
        return False

def save_to_database(beasiswa_list):
    """Menyimpan data beasiswa ke database melalui API dengan pendekatan delete-insert"""
    try:
        api_url = os.getenv('VERCEL_URL', 'https://scrapingbeasiswaweb.vercel.app')
        
        print(f"[INFO] Memulai proses delete-insert untuk {len(beasiswa_list)} records")
        
        # Clear database terlebih dahulu
        clear_success = clear_database()
        if not clear_success:
            print("[WARNING] Gagal clear database, mencoba dengan flag clearFirst")
        
        # Kirim data dengan flag clearFirst=True untuk delete-insert
        response = requests.post(
            f'{api_url}/api/beasiswa',
            json={
                'beasiswaList': beasiswa_list,
                'clearFirst': True  # Clear database terlebih dahulu
            },
            headers={'Content-Type': 'application/json'},
            timeout=60  # Increase timeout for delete-insert operation
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"[SUCCESS] Data berhasil disimpan ke database: {len(beasiswa_list)} records")
                print(f"[INFO] Database telah di-clear dan di-insert ulang")
                return True
            else:
                print(f"[ERROR] Gagal menyimpan ke database: {result.get('message', 'Unknown error')}")
                return False
        else:
            print(f"[ERROR] HTTP Error {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Network error saat menyimpan ke database: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Error saat menyimpan ke database: {e}")
        return False

def main():
    print("MEMULAI WEB SCRAPING INFORMASI BEASISWA")
    print(f"Waktu mulai: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    all_scholarships = []
    helper = WebScraperHelper()
    
    try:
        # Jalankan scraper domestik
        print("\n=== SCRAPING BEASISWA DOMESTIK ===")
        domestik_scraper = DomestikScholarshipScraper()
        domestik_data = domestik_scraper.scrape_all()
        if domestik_data:
            all_scholarships.extend(domestik_data)
            print(f"[SUCCESS] Berhasil mengambil {len(domestik_data)} data domestik")
        else:
            print("[WARNING] Tidak ada data domestik yang berhasil diambil")
        
        time.sleep(2)
        
        # Jalankan scraper internasional
        print("\n=== SCRAPING BEASISWA INTERNASIONAL ===")
        internasional_scraper = InternasionalScholarshipScraper()
        internasional_data = internasional_scraper.scrape_all()
        if internasional_data:
            all_scholarships.extend(internasional_data)
            print(f"[SUCCESS] Berhasil mengambil {len(internasional_data)} data internasional")
        else:
            print("[WARNING] Tidak ada data internasional yang berhasil diambil")
        
        time.sleep(2)
        
        # Jalankan scraper PT dalam negeri
        print("\n=== SCRAPING BEASISWA PT DALAM NEGERI ===")
        pt_dalam_scraper = UniversitasDalamNegeriScraper()
        pt_dalam_data = pt_dalam_scraper.scrape_all()
        if pt_dalam_data:
            all_scholarships.extend(pt_dalam_data)
            print(f"[SUCCESS] Berhasil mengambil {len(pt_dalam_data)} data PT dalam negeri")
        else:
            print("[WARNING] Tidak ada data PT dalam negeri yang berhasil diambil")
        
        time.sleep(2)
        
        # Jalankan scraper PT luar negeri
        print("\n=== SCRAPING BEASISWA PT LUAR NEGERI ===")
        pt_luar_scraper = UniversitasLuarNegeriScraper()
        pt_luar_data = pt_luar_scraper.scrape_all()
        if pt_luar_data:
            all_scholarships.extend(pt_luar_data)
            print(f"[SUCCESS] Berhasil mengambil {len(pt_luar_data)} data PT luar negeri")
        else:
            print("[WARNING] Tidak ada data PT luar negeri yang berhasil diambil")
        
        # Simpan semua data
        if all_scholarships:
            print(f"\n=== MENYIMPAN {len(all_scholarships)} DATA BEASISWA ===")
            
            # Simpan ke database
            db_success = save_to_database(all_scholarships)
            
            # Simpan ke file sebagai backup
            helper.save_to_json(all_scholarships, 'beasiswa_semua.json')
            helper.save_to_excel(all_scholarships, 'beasiswa_semua.xlsx')
            helper.save_to_csv(all_scholarships, 'beasiswa_semua.csv')
            
            print("SCRAPING SELESAI!")
            print(f"Total data: {len(all_scholarships)} beasiswa")
            print(f"Database: {'[SUCCESS] Berhasil' if db_success else '[ERROR] Gagal'}")
            print(f"File backup: [SUCCESS] Tersimpan di folder 'data/'")
            
            # Output untuk scheduler service
            print(f"Processed {len(all_scholarships)} records")
            
            sys.exit(0)  # Exit dengan code 0 untuk success
        else:
            print("[ERROR] Tidak ada data beasiswa yang berhasil diambil")
            sys.exit(1)  # Exit dengan code 1 untuk error
            
    except KeyboardInterrupt:
        print("\n[WARNING] Scraping dihentikan oleh user")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Error tidak terduga: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 