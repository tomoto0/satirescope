# SatireScope Deployment Guide

## Overview

SatireScope is a full-stack web application that automatically fetches news, generates satirical content using AI, and posts to X (Twitter). This guide covers deployment procedures and environment configuration.

## Technology Stack

**Frontend:**
- React 19 + TypeScript
- Next.js (via Vite)
- Tailwind CSS 4
- shadcn/ui components

**Backend:**
- Node.js + Express
- TypeScript
- tRPC for type-safe APIs
- Drizzle ORM

**Database:**
- PostgreSQL / MySQL

**External Services:**
- Manus LLM API (content generation)
- Manus Image Generation API (satirical images)
- X (Twitter) API v2 (posting)

## Environment Variables

### Critical Secrets (Must be set before deployment)

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Encryption
ENCRYPTION_KEY=your-secure-encryption-key-min-32-chars

# Manus API
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-manus-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# OAuth / Authentication
JWT_SECRET=your-jwt-secret-key
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
VITE_APP_ID=your-app-id

# Application
VITE_APP_TITLE=SatireScope
VITE_APP_LOGO=https://your-domain.com/logo.png

# Owner Information
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-open-id
```

### Optional Environment Variables

```env
# Analytics (if using Manus analytics)
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# Scheduler (cron timing)
SCHEDULER_ENABLED=true
SCHEDULER_INTERVAL_HOURS=1
```

## Pre-Deployment Checklist

### 1. Database Setup

```bash
# Create database
createdb satirescope

# Run migrations
pnpm db:push
```

### 2. Dependencies Installation

```bash
# Install all dependencies
pnpm install

# Verify installations
pnpm list twitter-api-v2 node-cron bcrypt
```

### 3. Build Process

```bash
# Build frontend
pnpm build:client

# Build backend
pnpm build:server

# Or build everything
pnpm build
```

### 4. Environment Configuration

1. Create `.env.production` file with all required variables
2. Ensure `ENCRYPTION_KEY` is a strong, random string (minimum 32 characters)
3. Verify all API keys are valid and have correct permissions:
   - **Manus API Key**: Must have access to LLM, image generation, and storage
   - **X API Credentials**: Must have read/write permissions for tweets and media

### 5. Security Verification

```bash
# Verify no secrets are committed
git log -p | grep -i "api_key\|secret\|token"

# Check .env files are in .gitignore
cat .gitignore | grep "\.env"
```

## Deployment Steps

### Step 1: Prepare Server

```bash
# SSH into your server
ssh user@your-server.com

# Clone repository
git clone https://github.com/your-org/satirescope.git
cd satirescope

# Install Node.js (if not already installed)
# Recommended: Node.js 18+ with npm or pnpm
```

### Step 2: Install Dependencies

```bash
# Install pnpm globally
npm install -g pnpm

# Install project dependencies
pnpm install --prod
```

### Step 3: Configure Environment

```bash
# Create production environment file
nano .env.production

# Add all required environment variables (see Environment Variables section)
# Save and exit (Ctrl+X, Y, Enter in nano)

# Verify environment is loaded
source .env.production
echo $DATABASE_URL
```

### Step 4: Database Migration

```bash
# Run database migrations
pnpm db:push

# Verify database connection
pnpm db:verify
```

### Step 5: Build Application

```bash
# Build frontend and backend
pnpm build

# Verify build output
ls -la dist/
```

### Step 6: Start Application

```bash
# Option A: Using PM2 (recommended for production)
npm install -g pm2
pm2 start "pnpm start" --name satirescope
pm2 save
pm2 startup

# Option B: Using systemd service
sudo nano /etc/systemd/system/satirescope.service
# Add service configuration (see below)
sudo systemctl daemon-reload
sudo systemctl enable satirescope
sudo systemctl start satirescope

# Option C: Using Docker
docker build -t satirescope .
docker run -d --env-file .env.production -p 3000:3000 satirescope
```

### Step 7: Verify Deployment

```bash
# Check if server is running
curl http://localhost:3000

# Check logs
pm2 logs satirescope
# or
journalctl -u satirescope -f
```

## Systemd Service Configuration

Create `/etc/systemd/system/satirescope.service`:

```ini
[Unit]
Description=SatireScope - AI Satirical News Caster
After=network.target

[Service]
Type=simple
User=satirescope
WorkingDirectory=/home/satirescope/app
EnvironmentFile=/home/satirescope/app/.env.production
ExecStart=/usr/local/bin/pnpm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

## Scheduler Configuration

The application uses `node-cron` to run automated posting every hour. The scheduler:

1. **Fetches active Twitter configurations** from the database
2. **Retrieves latest news** from configured sources
3. **Generates AI content** (tweets, comments, images)
4. **Posts to X (Twitter)** for each active configuration

### Verify Scheduler is Running

```bash
# Check scheduler logs
pm2 logs satirescope | grep "Scheduler"

# Expected output:
# [Scheduler] Scheduler started - runs every hour
# [Scheduler] Running automated posting cycle...
```

### Manual Trigger (for testing)

```bash
# Create a test endpoint to trigger manually
curl -X POST http://localhost:3000/api/scheduler/trigger \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Monitoring and Maintenance

### Health Checks

```bash
# Check application health
curl http://localhost:3000/api/health

# Check database connection
curl http://localhost:3000/api/db/status

# Check scheduler status
curl http://localhost:3000/api/scheduler/status
```

### Log Monitoring

```bash
# Real-time logs
pm2 logs satirescope

# Filter for errors
pm2 logs satirescope | grep ERROR

# Filter for scheduler events
pm2 logs satirescope | grep Scheduler
```

### Database Maintenance

```bash
# Backup database
mysqldump -u user -p satirescope > backup_$(date +%Y%m%d).sql

# Verify database integrity
pnpm db:verify

# Clean old posted tweets (optional)
# DELETE FROM posted_tweets WHERE posted_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

## Troubleshooting

### Issue: Scheduler not running

**Solution:**
1. Check if `node-cron` is installed: `pnpm list node-cron`
2. Verify scheduler is initialized in server startup
3. Check logs for errors: `pm2 logs satirescope | grep Scheduler`

### Issue: Twitter API errors

**Solution:**
1. Verify API credentials are correctly encrypted and stored
2. Test credentials with: `curl -X POST /api/twitter/validate-credentials`
3. Check X API rate limits
4. Ensure API keys have correct permissions

### Issue: Image generation failing

**Solution:**
1. Verify Manus API key is valid
2. Check image generation quota
3. Verify prompt is valid English text
4. Check logs for specific error messages

### Issue: Database connection errors

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check database server is running
3. Verify firewall allows connection
4. Test connection: `pnpm db:verify`

## Rollback Procedure

If deployment fails:

```bash
# Using PM2
pm2 restart satirescope

# Using systemd
sudo systemctl restart satirescope

# Revert to previous version
git revert HEAD
pnpm build
pm2 restart satirescope
```

## Performance Optimization

### Frontend Optimization

```bash
# Enable compression
gzip -9 dist/client/**/*.js

# Use CDN for static assets
# Configure in nginx/Apache
```

### Backend Optimization

```bash
# Enable connection pooling
# Set in DATABASE_URL: ?connectionLimit=10

# Cache frequently accessed data
# Implement Redis if needed
```

### Database Optimization

```bash
# Create indexes on frequently queried columns
CREATE INDEX idx_twitter_configs_user_id ON twitter_configs(user_id);
CREATE INDEX idx_posted_tweets_config_id ON posted_tweets(config_id);
CREATE INDEX idx_posted_tweets_posted_at ON posted_tweets(posted_at);

# Analyze query performance
EXPLAIN SELECT * FROM posted_tweets WHERE config_id = 1;
```

## Security Best Practices

1. **Secrets Management**
   - Never commit `.env` files to version control
   - Use environment variable management service (AWS Secrets Manager, HashiCorp Vault)
   - Rotate `ENCRYPTION_KEY` periodically

2. **API Security**
   - Enable HTTPS/TLS
   - Implement rate limiting
   - Use API key rotation

3. **Database Security**
   - Use strong passwords
   - Enable SSL for database connections
   - Regular backups
   - Restrict database access to application server only

4. **Application Security**
   - Keep dependencies updated: `pnpm update`
   - Regular security audits: `pnpm audit`
   - Monitor for vulnerabilities

## Support and Troubleshooting

For issues or questions:

1. Check application logs: `pm2 logs satirescope`
2. Review error messages in browser console
3. Check database connectivity
4. Verify all environment variables are set
5. Test API endpoints manually with curl

## Additional Resources

- [Manus API Documentation](https://docs.manus.im)
- [X API v2 Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-performance-best-practices/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
