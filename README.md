# 🎓 Beasiswa - Web Scraper & Dashboard

Aplikasi web untuk monitoring dan menampilkan data beasiswa secara real-time dengan fitur scraping otomatis dan notifikasi Telegram.

## 🚀 Fitur Utama

- **Web Scraping Otomatis**: Scraping data beasiswa dari berbagai sumber
- **Dashboard Real-time**: Monitoring status scraping dan data beasiswa
- **Notifikasi Telegram**: Notifikasi otomatis saat scraping selesai
- **Database PostgreSQL**: Penyimpanan data yang reliable
- **Auto Update**: Scraping otomatis setiap hari jam 00:00 WIB
- **Manual Update**: Trigger scraping manual dari dashboard

## 📋 Prerequisites

- **Node.js** 18+ 
- **Python** 3.8+
- **PostgreSQL** database (Neon.tech recommended)
- **Telegram Bot** (optional)

## ⚙️ Setup Environment

1. **Clone repository**
```bash
git clone <repository-url>
cd Scraping_Web
```

2. **Install dependencies**
```bash
npm install
pip install -r requirements.txt
```

3. **Setup environment variables**
```bash
cp env.example .env
```

Edit `.env` file:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Scheduler Service
SCHEDULER_PORT=3001

# Python Environment
PYTHON_PATH=python

# Telegram Bot (Optional)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

## 🗄️ Database Setup

1. **Initialize database**
```bash
npm run db:init
```

2. **Activate database (if using Neon.tech)**
```bash
npm run db:activate
```

3. **Import existing data (optional)**
```bash
npm run db:import
```

## 🚀 Running Application

### Development Mode
```bash
# Terminal 1: Web Application
npm run dev

# Terminal 2: Scheduler Service
npm run scheduler
```

### Production Mode
```bash
# Build application
npm run build

# Start production server
npm start

# Start scheduler service
npm run scheduler
```

## 📱 Telegram Bot Setup

1. **Create bot via @BotFather**
2. **Get chat ID**: Send `/start` to bot, then visit `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. **Add to .env file**
4. **Test connection**:
```bash
node -e "const { testBotConnection } = require('./utils/telegramService'); testBotConnection().then(result => console.log('Bot test:', result));"
```

## 🌐 API Endpoints

### Web Application (Port 3000)
- `GET /` - Dashboard utama
- `GET /beasiswa` - Data beasiswa
- `GET /monitoring` - Monitoring sistem
- `GET /analytics` - Analisis data
- `GET /websites` - Daftar website sumber

### Scheduler Service (Port 3001)
- `GET /health` - Health check
- `GET /status` - Status scheduler
- `POST /start` - Start scheduler
- `POST /stop` - Stop scheduler
- `POST /execute` - Manual scraping
- `POST /reset` - Reset state

## 📊 Monitoring

- **Dashboard**: `http://localhost:3000`
- **Monitoring**: `http://localhost:3000/monitoring`
- **Scheduler Health**: `http://localhost:3001/health`
- **Scheduler Status**: `http://localhost:3001/status`

## 🔧 Troubleshooting

### Common Issues
1. **Database Connection**: Pastikan `DATABASE_URL` benar
2. **Scheduler Not Running**: Cek port 3001 tidak terpakai
3. **Telegram Not Working**: Verifikasi token dan chat ID
4. **Python Scraper Error**: Cek dependencies Python

### Reset Scheduler
```bash
curl -X POST http://localhost:3001/reset
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Support

Untuk bantuan dan support, silakan buat issue di repository ini. 