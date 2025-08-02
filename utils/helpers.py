import requests
import time
import random
from fake_useragent import UserAgent
from bs4 import BeautifulSoup
import pandas as pd
import json
from datetime import datetime
import os

class WebScraperHelper:
    def __init__(self):
        self.ua = UserAgent()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
    
    def get_page(self, url, delay=True):
        """Mengambil halaman web dengan delay random untuk menghindari blocking"""
        try:
            if delay:
                time.sleep(random.uniform(1, 3))
            
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error mengambil halaman {url}: {str(e)}")
            return None
    
    def parse_html(self, html_content):
        """Parse HTML content dengan BeautifulSoup"""
        if html_content:
            return BeautifulSoup(html_content, 'html.parser')
        return None
    
    def extract_text(self, element):
        """Ekstrak teks dari elemen HTML dengan pembersihan"""
        if element:
            text = element.get_text(strip=True)
            return ' '.join(text.split()) if text else ""
        return ""
    
    def save_to_json(self, data, filename):
        """Simpan data ke file JSON"""
        os.makedirs('data', exist_ok=True)
        filepath = os.path.join('data', filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Data disimpan ke {filepath}")
    
    def save_to_excel(self, data, filename):
        """Simpan data ke file Excel"""
        os.makedirs('data', exist_ok=True)
        filepath = os.path.join('data', filename)
        df = pd.DataFrame(data)
        df.to_excel(filepath, index=False)
        print(f"Data disimpan ke {filepath}")
    
    def save_to_csv(self, data, filename):
        """Simpan data ke file CSV"""
        os.makedirs('data', exist_ok=True)
        filepath = os.path.join('data', filename)
        df = pd.DataFrame(data)
        df.to_csv(filepath, index=False, encoding='utf-8')
        print(f"Data disimpan ke {filepath}")
    
    def get_current_date(self):
        """Dapatkan tanggal saat ini dalam format string"""
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def clean_text(self, text):
        """Membersihkan teks dari karakter yang tidak diinginkan"""
        if not text:
            return ""
        # Hapus karakter khusus dan normalisasi whitespace
        import re
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        return text 