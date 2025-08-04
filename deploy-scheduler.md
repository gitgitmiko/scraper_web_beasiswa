# 🚀 Panduan Deployment Scheduler ke Render

## 📋 Langkah-langkah Deployment

### 1. **Commit Perubahan**
```bash
git add .
git commit -m "Fix Python dependencies and add environment testing"
git push origin main
```

### 2. **Deploy ke Render**
1. Buka [Dashboard Render](https://dashboard.render.com)
2. Pilih service `beasiswa-scheduler`
3. Klik **Manual Deploy** > **Deploy latest commit**

### 3. **Monitor Deployment**
- Cek tab **Logs** untuk melihat progress deployment
- Pastikan build berhasil dengan pesan "✅ Build completed successfully!"
- Tunggu sampai service status menjadi "Live"

### 4. **Test Deployment**
```bash
# Test health
npm run scheduler:manage health

# Test Python environment
npm run scheduler:manage execute
```

## 🔧 Konfigurasi yang Diperbaiki

### **render.yaml**
```yaml
services:
  - type: web
    name: beasiswa-scheduler
    env: python  # Changed from node to python
    plan: free
    buildCommand: chmod +x build.sh && ./build.sh
    startCommand: npm run scheduler
```

### **build.sh**
```bash
#!/bin/bash
echo "🔧 Starting build process..."
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt
echo "📦 Installing Node.js dependencies..."
npm install
echo "✅ Build completed successfully!"
```

### **test-python.py**
- Script untuk test Python environment
- Mengecek semua dependencies yang diperlukan
- Dijalankan sebelum main scraper

## 🐛 Troubleshooting

### **Jika Build Gagal**
1. Cek logs di dashboard Render
2. Pastikan `requirements.txt` ada dan lengkap
3. Pastikan `build.sh` executable

### **Jika Python Test Gagal**
1. Cek apakah dependencies terinstall
2. Pastikan Python version compatible
3. Cek environment variables

### **Jika Scraping Gagal**
1. Cek logs dengan `npm run scheduler:manage logs`
2. Test manual dengan `npm run scheduler:manage execute`
3. Reset state jika diperlukan

## 📊 Monitoring

Setelah deployment berhasil:
- Service akan berjalan di: https://beasiswa-scheduler.onrender.com
- Health check: https://beasiswa-scheduler.onrender.com/health
- Status: https://beasiswa-scheduler.onrender.com/status

## 🔄 Update Environment Variables

Pastikan environment variables di Render sudah benar:
- `DATABASE_URL`: Koneksi database Neon
- `TELEGRAM_BOT_TOKEN`: Token bot Telegram
- `TELEGRAM_CHAT_ID`: ID chat Telegram
- `NEXT_PUBLIC_APP_URL`: URL aplikasi Vercel 