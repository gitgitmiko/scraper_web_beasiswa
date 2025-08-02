# 🚀 Quick Setup Telegram Bot (5 Menit)

## 📱 **Step 1: Buat Bot di Telegram**

1. **Buka Telegram** → Cari `@BotFather`
2. **Klik Start** → Kirim `/newbot`
3. **Isi nama:** `Beasiswa Bot`
4. **Isi username:** `beasiswa_scraper_bot`
5. **Copy token** yang diberikan

## 🔍 **Step 2: Dapatkan Chat ID**

1. **Cari bot** yang baru dibuat
2. **Klik Start** → Kirim `/start`
3. **Buka browser:** `https://api.telegram.org/bot<TOKEN>/getUpdates`
4. **Copy chat ID** dari response

## ⚙️ **Step 3: Setup Environment**

**Buat file `.env` di root project:**

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Scheduler Service
SCHEDULER_PORT=3001

# Python Environment
PYTHON_PATH=python

# Telegram Bot Configuration
TELEGRAM_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

## 🧪 **Step 4: Test Bot**

```bash
# Test koneksi bot
node -e "
const { testBotConnection } = require('./utils/telegramService');
testBotConnection().then(result => console.log('Bot test:', result));
"

# Test notifikasi
node -e "
const { sendSuccessNotification } = require('./utils/telegramService');
sendSuccessNotification({
  totalBeasiswa: 150,
  duration: '120 detik',
  retryAttempts: 1
}).then(result => console.log('Notification test:', result));
"
```

## 🎯 **Notifikasi yang Akan Dikirim:**

### ✅ **Scraping Berhasil:**
```
✅ Scraping Beasiswa Berhasil

📊 Hasil Scraping:
• Status: Berhasil
• Waktu Selesai: 02/08/2025 00:15:30
• Jumlah Data: 150 beasiswa
• Durasi: 120 detik
• Percobaan: 1x

🤖 Notifikasi otomatis dari sistem scraping beasiswa
```

### ❌ **Scraping Gagal:**
```
❌ Scraping Beasiswa Gagal

🚨 Detail Error:
• Status: Gagal
• Waktu Error: 02/08/2025 00:20:15
• Error Message: Connection timeout
• Retry Attempts: 1
• Durasi: N/A

🤖 Notifikasi otomatis dari sistem scraping beasiswa
```

## 🎉 **Selesai!**

Setelah setup selesai, bot akan otomatis mengirim notifikasi:
- **Setiap scraping selesai** (sukses/gagal)
- **Real-time** ke HP via Telegram
- **Gratis selamanya** tanpa limit

**Setup Telegram Bot sekarang dan dapatkan notifikasi gratis!** 🤖✨ 