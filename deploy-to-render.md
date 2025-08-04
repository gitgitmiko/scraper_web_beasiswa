# 🚀 Panduan Deploy Ulang ke Render

## 📋 Langkah-langkah Deploy Ulang

### **Step 1: Buka Dashboard Render**
1. Buka [Dashboard Render](https://dashboard.render.com)
2. Login ke akun Anda
3. Pilih service `beasiswa-scheduler`

### **Step 2: Deploy Ulang**
1. Di halaman service, klik tombol **"Manual Deploy"**
2. Pilih **"Deploy latest commit"**
3. Klik **"Deploy"**

### **Step 3: Monitor Deployment**
1. **Tab Logs** - Lihat progress deployment
2. Tunggu sampai muncul pesan:
   ```
   🔧 Starting build process...
   📦 Installing Python dependencies...
   📦 Installing Node.js dependencies...
   ✅ Build completed successfully!
   ```
3. Tunggu sampai status menjadi **"Live"**

### **Step 4: Test Deployment**
Setelah deployment selesai, test dengan command:
```bash
# Test health
npm run scheduler:manage health

# Test Python environment
npm run scheduler:manage execute
```

## 🔧 Konfigurasi yang Akan Di-Deploy

### **render.yaml**
```yaml
services:
  - type: web
    name: beasiswa-scheduler
    env: python  # ✅ Changed from node to python
    plan: free
    buildCommand: chmod +x build.sh && ./build.sh  # ✅ Install Python deps
    startCommand: npm run scheduler
```

### **build.sh**
```bash
#!/bin/bash
echo "🔧 Starting build process..."
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt  # ✅ Install Python packages
echo "📦 Installing Node.js dependencies..."
npm install
echo "✅ Build completed successfully!"
```

### **test-python.py**
- ✅ Test script untuk validasi Python environment
- ✅ Mengecek semua dependencies (requests, bs4, pandas, lxml)

## 🐛 Troubleshooting

### **Jika Build Gagal**
1. Cek logs di dashboard Render
2. Pastikan semua file ada:
   - `render.yaml`
   - `build.sh`
   - `requirements.txt`
   - `test-python.py`

### **Jika Python Test Masih Gagal**
1. Cek logs dengan `npm run scheduler:manage logs`
2. Pastikan deployment sudah selesai
3. Restart service jika diperlukan

### **Jika Service Tidak Live**
1. Cek environment variables di Render
2. Pastikan semua variables sudah benar
3. Restart service manual

## 📊 Expected Result

Setelah deployment berhasil:
```json
{
  "isRunning": true,
  "isEnabled": true,
  "lastUpdate": "2025-08-04T02:XX:XX.XXXZ",
  "nextUpdate": "2025-08-04T17:00:00.000Z",
  "isUpdating": false
}
```

## 🚨 Emergency Commands

Jika ada masalah setelah deployment:
```bash
# Reset state
npm run scheduler:manage reset

# Start ulang
npm run scheduler:manage start

# Test manual
npm run scheduler:manage execute
```

## 📞 Support

Jika masih ada masalah:
1. Cek logs di dashboard Render
2. Pastikan semua environment variables benar
3. Restart service jika diperlukan 