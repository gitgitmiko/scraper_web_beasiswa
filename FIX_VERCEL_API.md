# 🔧 Fix API Scheduler di Vercel

## 🚨 Masalah yang Ditemukan

- ❌ **API scheduler di Vercel error 500**
- ✅ **Scheduler service di Render berjalan normal**
- 🔍 **Masalah: Environment variable atau deployment**

## 🚀 Langkah-langkah Perbaikan

### **Step 1: Deploy Ulang Vercel**

**Otomatis (jika auto-deploy aktif):**
- Perubahan sudah di-push ke GitHub
- Vercel akan otomatis deploy dalam 1-2 menit

**Manual (jika perlu):**
1. Buka [Dashboard Vercel](https://vercel.com/dashboard)
2. Pilih project `scrapingbeasiswaweb`
3. Klik **"Redeploy"** atau tunggu auto-deploy

### **Step 2: Update Environment Variables di Vercel**

1. **Buka [Dashboard Vercel](https://vercel.com/dashboard)**
2. **Pilih project `scrapingbeasiswaweb`**
3. **Pergi ke Settings > Environment Variables**
4. **Update atau tambahkan:**
   ```
   Name: SCHEDULER_SERVICE_URL
   Value: https://beasiswa-scheduler.onrender.com
   Environment: Production (dan Preview)
   ```
5. **Redeploy setelah update**

### **Step 3: Test API**

Setelah deployment selesai, test dengan:
```bash
# Test API scheduler
npm run test:api

# Atau test manual
curl https://scrapingbeasiswaweb.vercel.app/api/scheduler?action=status
```

## 🔧 Perbaikan yang Telah Dilakukan

### **1. Update Default URL**
```typescript
// Sebelum
const SCHEDULER_SERVICE_URL = process.env.SCHEDULER_SERVICE_URL || 'http://localhost:3001'

// Sesudah
const SCHEDULER_SERVICE_URL = process.env.SCHEDULER_SERVICE_URL || 'https://beasiswa-scheduler.onrender.com'
```

### **2. Improved Error Handling**
- ✅ Better logging untuk debugging
- ✅ Fallback data jika service tidak tersedia
- ✅ Detailed error messages

### **3. Test Script**
- ✅ `test-scheduler-api.js` untuk test API
- ✅ Command: `npm run test:api`

## 📊 Expected Result

Setelah fix berhasil:
```json
{
  "isRunning": true,
  "isEnabled": true,
  "lastUpdate": null,
  "nextUpdate": "2025-08-04T17:00:00.000Z",
  "isUpdating": false
}
```

## 🐛 Troubleshooting

### **Jika Masih Error 500**
1. Cek environment variables di Vercel
2. Pastikan `SCHEDULER_SERVICE_URL` sudah benar
3. Redeploy aplikasi Vercel

### **Jika API Tidak Merespons**
1. Cek apakah Vercel deployment berhasil
2. Test scheduler service langsung: `npm run scheduler:manage status`
3. Pastikan tidak ada error di logs Vercel

### **Jika Environment Variable Tidak Terdeteksi**
1. Update environment variable di Vercel
2. Redeploy aplikasi
3. Pastikan variable diset untuk environment yang benar

## 📋 Checklist

- [ ] Deploy ulang Vercel
- [ ] Update environment variable `SCHEDULER_SERVICE_URL`
- [ ] Test API dengan `npm run test:api`
- [ ] Cek halaman monitoring di browser
- [ ] Test manual execution

## 🎯 Status Saat Ini

- ✅ **Scheduler service**: Berjalan di Render
- 🔄 **Vercel API**: Perlu deploy ulang
- ✅ **Database**: Terhubung dengan baik
- ✅ **Monitoring page**: Siap setelah API fix

**Setelah deploy ulang Vercel, API scheduler akan berfungsi normal!** 