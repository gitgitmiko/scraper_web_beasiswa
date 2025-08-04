# 🎓 Panduan Pengelolaan Scheduler Service

## 📍 Lokasi Service
Scheduler service berjalan di: **https://beasiswa-scheduler.onrender.com**

## 🚀 Cara Menjalankan dan Mengelola Service

### 1. **Menggunakan Management Tool (Recommended)**

Kami telah menyediakan tool management yang mudah digunakan:

```bash
# Cek status scheduler
npm run scheduler:manage status

# Cek health service
npm run scheduler:manage health

# Start scheduler
npm run scheduler:manage start

# Stop scheduler
npm run scheduler:manage stop

# Execute manual scraping
npm run scheduler:manage execute

# Reset state scheduler
npm run scheduler:manage reset

# Lihat logs
npm run scheduler:manage logs

# Monitoring kontinyu (30 detik interval)
npm run scheduler:manage monitor
```

### 2. **Menggunakan API Langsung**

#### **Health Check**
```bash
curl https://beasiswa-scheduler.onrender.com/health
```

#### **Status Scheduler**
```bash
curl https://beasiswa-scheduler.onrender.com/status
```

#### **Start Scheduler**
```bash
curl -X POST https://beasiswa-scheduler.onrender.com/start
```

#### **Stop Scheduler**
```bash
curl -X POST https://beasiswa-scheduler.onrender.com/stop
```

#### **Manual Execution**
```bash
curl -X POST https://beasiswa-scheduler.onrender.com/execute
```

#### **Reset State**
```bash
curl -X POST https://beasiswa-scheduler.onrender.com/reset
```

#### **Get Logs**
```bash
curl https://beasiswa-scheduler.onrender.com/logs
```

### 3. **Menggunakan Dashboard Render**

1. Buka [Dashboard Render](https://dashboard.render.com)
2. Pilih service `beasiswa-scheduler`
3. **Tab Logs**: Lihat log real-time
4. **Tab Environment**: Update environment variables
5. **Tab Settings**: Restart service jika diperlukan

## ⏰ Jadwal Otomatis

Scheduler berjalan otomatis setiap hari pada:
- **Waktu**: 00:00 WIB (17:00 UTC)
- **Frekuensi**: Setiap 24 jam
- **Status**: Aktif saat ini

## 📊 Status Monitoring

### Status Normal
```json
{
  "isRunning": true,
  "isEnabled": true,
  "lastUpdate": "2025-08-04T02:39:44.068Z",
  "nextUpdate": "2025-08-04T17:00:00.000Z",
  "isUpdating": false
}
```

### Penjelasan Status
- **isRunning**: Service berjalan
- **isEnabled**: Scheduler diaktifkan
- **lastUpdate**: Update terakhir
- **nextUpdate**: Update berikutnya
- **isUpdating**: Sedang dalam proses update

## 🔧 Troubleshooting

### 1. **Service Tidak Berjalan**
```bash
# Cek health
npm run scheduler:manage health

# Jika tidak sehat, restart via dashboard Render
```

### 2. **Scheduler Tidak Aktif**
```bash
# Start scheduler
npm run scheduler:manage start

# Cek status
npm run scheduler:manage status
```

### 3. **Manual Execution Gagal**
```bash
# Reset state
npm run scheduler:manage reset

# Coba execute lagi
npm run scheduler:manage execute
```

### 4. **Logs Kosong**
```bash
# Cek logs
npm run scheduler:manage logs

# Jika kosong, coba execute manual
npm run scheduler:manage execute
```

## 📱 Notifikasi Telegram

Service mengirim notifikasi ke Telegram untuk:
- ✅ Scraping berhasil
- ❌ Scraping gagal
- ⚠️ Error dalam proses

## 🔄 Environment Variables

Service menggunakan environment variables berikut:
- `DATABASE_URL`: Koneksi database Neon
- `TELEGRAM_BOT_TOKEN`: Token bot Telegram
- `TELEGRAM_CHAT_ID`: ID chat Telegram
- `SCHEDULER_PORT`: Port service (3001)
- `NODE_ENV`: Environment (production)

## 📈 Monitoring Web Interface

Akses monitoring melalui web interface:
**https://scrapingbeasiswaweb.vercel.app/monitoring**

Pastikan environment variable `SCHEDULER_SERVICE_URL` di Vercel sudah diset ke:
```
https://beasiswa-scheduler.onrender.com
```

## 🚨 Emergency Commands

### Restart Service
```bash
# Via dashboard Render: Settings > Restart Service
```

### Reset Complete State
```bash
npm run scheduler:manage reset
npm run scheduler:manage start
```

### Force Manual Execution
```bash
npm run scheduler:manage execute
```

## 📞 Support

Jika mengalami masalah:
1. Cek logs di dashboard Render
2. Gunakan management tool untuk troubleshooting
3. Restart service jika diperlukan
4. Hubungi tim development jika masalah berlanjut 