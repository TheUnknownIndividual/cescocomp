# Automated News Update System - Local Server Setup

This guide explains how to set up the automated news update system on a local server with cron scheduling.

## Prerequisites

- Node.js 18+ installed
- Git configured with push access to the repository
- Linux/macOS server (for systemd/cron)

## Quick Start

### Option 1: Using systemd (Recommended for Linux)

1. **Create systemd service file:**

```bash
sudo nano /etc/systemd/system/plugin-news-update.service
```

Add the following content (replace `/path/to/CECSO` with your actual path):

```ini
[Unit]
Description=Plugin.az Daily News Update
After=network.target

[Service]
Type=oneshot
User=YOUR_USERNAME
WorkingDirectory=/path/to/CECSO
ExecStart=/usr/bin/node /path/to/CECSO/automation/daily-news-update.js
StandardOutput=append:/path/to/CECSO/automation/logs/systemd.log
StandardError=append:/path/to/CECSO/automation/logs/systemd-error.log

[Install]
WantedBy=multi-user.target
```

2. **Create systemd timer:**

```bash
sudo nano /etc/systemd/system/plugin-news-update.timer
```

Add:

```ini
[Unit]
Description=Run Plugin.az News Update Daily
Requires=plugin-news-update.service

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

3. **Enable and start the timer:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable plugin-news-update.timer
sudo systemctl start plugin-news-update.timer
```

4. **Check timer status:**

```bash
sudo systemctl status plugin-news-update.timer
sudo systemctl list-timers --all
```

5. **Manual trigger (for testing):**

```bash
sudo systemctl start plugin-news-update.service
```

### Option 2: Using crontab (macOS/Linux)

1. **Open crontab editor:**

```bash
crontab -e
```

2. **Add the following line** (runs daily at 2:00 AM):

```bash
0 2 * * * cd /path/to/CECSO && /usr/bin/node automation/daily-news-update.js >> automation/logs/cron.log 2>&1
```

3. **Verify crontab:**

```bash
crontab -l
```

### Option 3: Using PM2 (Node.js Process Manager)

1. **Install PM2:**

```bash
npm install -g pm2
```

2. **Create PM2 ecosystem file:**

```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'plugin-news-update',
    script: './automation/daily-news-update.js',
    cron_restart: '0 2 * * *',
    autorestart: false,
    watch: false,
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF
```

3. **Start with PM2:**

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

4. **Monitor:**

```bash
pm2 logs plugin-news-update
pm2 status
```

## Configuration

### Environment Variables

Create `.env` file in the project root (optional):

```bash
# Git Configuration
GIT_USER_NAME="News Update Bot"
GIT_USER_EMAIL="bot@plugin.az"

# Notification (optional)
NOTIFICATION_EMAIL="admin@plugin.az"
```

### Customizing Schedule

**GitHub Actions** (`.github/workflows/daily-news-update.yml`):
```yaml
schedule:
  - cron: '0 2 * * *'  # Change time here (UTC)
```

**Systemd timer** (`/etc/systemd/system/plugin-news-update.timer`):
```ini
OnCalendar=02:00  # Change time here (local time)
```

**Crontab**:
```bash
0 2 * * *  # minute hour day month weekday
```

## Monitoring & Logs

### View Logs

```bash
# Latest log
tail -f automation/logs/update-$(date +%Y-%m-%d).log

# All logs
ls -lh automation/logs/

# Last 100 lines
tail -100 automation/logs/update-*.log
```

### Log Rotation

Add to crontab to clean old logs (keep last 30 days):

```bash
0 3 * * * find /path/to/CECSO/automation/logs -name "*.log" -mtime +30 -delete
```

## Troubleshooting

### Test Manual Run

```bash
cd /path/to/CECSO
node automation/daily-news-update.js
```

### Check Git Permissions

```bash
git config --list
ssh -T git@github.com  # Test GitHub access
```

### Verify Node.js Path

```bash
which node  # Use this path in cron/systemd
```

### Common Issues

1. **Permission denied**: Ensure the script is executable
   ```bash
   chmod +x automation/daily-news-update.js
   ```

2. **Git push fails**: Configure SSH keys or use HTTPS with credentials
   ```bash
   git config credential.helper store
   ```

3. **Translation API rate limit**: The script includes delays, but you can increase them in `translate-articles.js`

## Auto-Push Setup

The system automatically commits and pushes changes. Ensure:

1. **SSH key is configured** (for passwordless push):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   cat ~/.ssh/id_ed25519.pub  # Add to GitHub
   ```

2. **Or use GitHub Personal Access Token**:
   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/TheUnknownIndividual/cescocomp.git
   ```

## Deployment Verification

After automation runs:

1. Check GitHub for new commit
2. Verify Vercel deployment status
3. Visit https://plugin.az/renewable-news
4. Test multilingual URLs:
   - https://plugin.az/news/az/article-slug
   - https://plugin.az/news/en/article-slug
   - https://plugin.az/news/ru/article-slug

## Stopping the Automation

**Systemd:**
```bash
sudo systemctl stop plugin-news-update.timer
sudo systemctl disable plugin-news-update.timer
```

**Crontab:**
```bash
crontab -e  # Comment out or delete the line
```

**PM2:**
```bash
pm2 stop plugin-news-update
pm2 delete plugin-news-update
```

## Support

For issues, check:
1. Logs in `automation/logs/`
2. GitHub Actions tab (if using cloud)
3. Systemd journal: `journalctl -u plugin-news-update.service`
