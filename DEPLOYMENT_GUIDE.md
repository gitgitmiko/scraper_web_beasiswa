# 🚀 Deployment Guide - Beasiswa Scraper

## Platform Options (Ranked by Cost)

### 1. 🆓 Fly.io (GRATIS - Recommended)
- **Free Tier:** 3 shared-cpu-1x 256mb VMs
- **No Credit Card Required:** ✅
- **Setup:** Easy
- **URL:** https://fly.io

#### Setup Steps:
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy
fly launch
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set TELEGRAM_BOT_TOKEN="..."
fly secrets set TELEGRAM_CHAT_ID="..."
fly deploy
```

### 2. 🆓 Render.com (GRATIS - But needs CC)
- **Free Tier:** 750 hours/month
- **Credit Card Required:** ❌ (for verification)
- **Setup:** Easy
- **URL:** https://render.com

### 3. 💰 Railway (PAID)
- **Free Tier:** 1 month
- **After Free:** $5/month
- **Setup:** Easy
- **URL:** https://railway.app

### 4. 💰 VPS Murah (PAID - Most Reliable)
- **Cost:** $2-5/month
- **Providers:** DigitalOcean, Vultr, Linode
- **Setup:** Manual
- **Most Reliable:** ✅

#### VPS Setup:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone https://github.com/gitgitmiko/scraper_web_beasiswa.git
cd scraper_web_beasiswa

# Install dependencies
npm install

# Set environment variables
nano .env

# Run scheduler
npm run scheduler

# Setup PM2 for auto-restart
npm install -g pm2
pm2 start scheduler-server-working.js --name "beasiswa-scheduler"
pm2 startup
pm2 save
```

## Environment Variables

```env
# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_mYUyq89fVhBN@ep-winter-sea-a1ps0yuo-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://scrapingbeasiswa-ifo7w0pvo-gitgitmikos-projects.vercel.app

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=8256294267:AAHJMAAh4nwcFC86b1ylugg6nIKeuyroJtw
TELEGRAM_CHAT_ID=939600706

# Scheduler Configuration
SCHEDULER_PORT=3001
LOG_LEVEL=info
```

## Testing Deployment

```bash
# Test health check
curl https://your-app-url.com/health

# Test scheduler status
curl https://your-app-url.com/status

# Test manual trigger
curl -X POST https://your-app-url.com/start
```

## Update Vercel Environment Variables

After getting scheduler URL, update Vercel:
```env
SCHEDULER_SERVICE_URL=https://your-scheduler-url.com
``` 