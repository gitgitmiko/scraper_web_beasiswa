# 🚀 Deployment Guide

Panduan lengkap untuk deployment aplikasi Beasiswa Scraper ke production.

## 📋 Prerequisites

- **Docker** & **Docker Compose** terinstall
- **PostgreSQL** database (Neon.tech, Supabase, atau self-hosted)
- **Domain** dan **SSL certificate** (untuk production)
- **Telegram Bot** (optional)

## 🐳 Docker Deployment

### 1. Clone Repository
```bash
git clone <repository-url>
cd Scraping_Web
```

### 2. Setup Environment
```bash
cp env.example .env
```

Edit `.env` file dengan konfigurasi production:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Scheduler Service
SCHEDULER_PORT=3001

# Telegram Bot (Optional)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Logging
LOG_LEVEL=info
```

### 3. Build & Run dengan Docker
```bash
# Build image
docker-compose build

# Run application
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 4. Initialize Database
```bash
# Run database initialization
docker-compose exec beasiswa-app npm run db:init

# Activate database (if using Neon.tech)
docker-compose exec beasiswa-app npm run db:activate
```

## ☁️ Cloud Deployment

### Vercel + Railway

#### Frontend (Vercel)
1. **Connect repository** ke Vercel
2. **Set environment variables**:
   - `DATABASE_URL`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
3. **Deploy** otomatis dari main branch

#### Backend + Scheduler (Railway)
1. **Create new project** di Railway
2. **Connect repository**
3. **Set environment variables**
4. **Deploy** dengan command: `npm run scheduler`

### Heroku

#### Setup Heroku
```bash
# Install Heroku CLI
heroku create beasiswa-scraper-app

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set TELEGRAM_CHAT_ID=your_chat_id

# Deploy
git push heroku main
```

#### Procfile
```
web: npm start
scheduler: npm run scheduler
```

### DigitalOcean App Platform

1. **Create App** dari GitHub repository
2. **Set environment variables**
3. **Configure ports**: 3000 (web), 3001 (scheduler)
4. **Deploy**

## 🔧 Production Configuration

### Environment Variables
```env
# Required
DATABASE_URL=postgresql://...
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
LOG_LEVEL=info
```

### Database Setup
1. **Create PostgreSQL database**
2. **Run initialization**:
   ```bash
   npm run db:init
   ```
3. **Verify tables** created:
   - `beasiswa`
   - `scheduler_status`
   - `logs`

### SSL & Domain
1. **Configure domain** di hosting provider
2. **Setup SSL certificate** (Let's Encrypt)
3. **Update environment variables** dengan domain baru

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- **Web App**: `https://yourdomain.com/api/beasiswa`
- **Scheduler**: `https://yourdomain.com:3001/health`

### Monitoring Tools
- **Uptime Robot**: Monitor endpoints
- **Logs**: Check application logs
- **Database**: Monitor connection dan performance

### Log Management
```bash
# View logs
docker-compose logs -f beasiswa-app

# Check scheduler logs
docker-compose exec beasiswa-app tail -f logs/scheduler.log
```

## 🔄 Auto Scaling

### Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml beasiswa
```

### Kubernetes
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: beasiswa-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: beasiswa
  template:
    metadata:
      labels:
        app: beasiswa
    spec:
      containers:
      - name: beasiswa
        image: beasiswa-app:latest
        ports:
        - containerPort: 3000
        - containerPort: 3001
```

## 🛡️ Security

### Environment Security
- **Never commit** `.env` files
- **Use secrets management** (Docker secrets, Kubernetes secrets)
- **Rotate credentials** regularly

### Network Security
- **Firewall rules**: Only expose necessary ports
- **HTTPS only**: Redirect HTTP to HTTPS
- **Rate limiting**: Implement API rate limiting

### Database Security
- **Connection pooling**: Configure proper pool settings
- **SSL connections**: Enable SSL for database
- **Backup strategy**: Regular database backups

## 📈 Performance Optimization

### Caching
- **Redis**: Cache frequently accessed data
- **CDN**: Static assets delivery
- **Database**: Query optimization

### Resource Limits
```yaml
# docker-compose.yml
services:
  beasiswa-app:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

## 🔍 Troubleshooting

### Common Issues
1. **Database Connection**: Check `DATABASE_URL` format
2. **Port Conflicts**: Ensure ports 3000, 3001 available
3. **Memory Issues**: Increase container memory limits
4. **Python Dependencies**: Verify all packages installed

### Debug Commands
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs beasiswa-app

# Access container shell
docker-compose exec beasiswa-app sh

# Test database connection
docker-compose exec beasiswa-app npm run db:activate
```

## 📞 Support

Untuk bantuan deployment, silakan:
1. **Check logs** untuk error messages
2. **Verify environment variables**
3. **Test endpoints** manually
4. **Create issue** di repository

---

**🎯 Production Ready!** Aplikasi siap untuk deployment ke production dengan fitur monitoring, security, dan scalability yang lengkap. 