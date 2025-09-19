# SSL and Domain Setup Guide for Kiwi Sri Lankans Events

This guide will help you set up a custom domain with SSL certificate for your Kiwi Sri Lankans Events application running on AWS EC2.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Domain Configuration](#domain-configuration)
3. [SSL Certificate Setup](#ssl-certificate-setup)
4. [Nginx SSL Configuration](#nginx-ssl-configuration)
5. [Environment Updates](#environment-updates)
6. [Testing SSL Setup](#testing-ssl-setup)
7. [Security Hardening](#security-hardening)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- Your application running on AWS EC2
- A domain name registered with a DNS provider
- Access to your domain's DNS management panel
- Your EC2 instance's public IP address

## Domain Configuration

### Step 1: Get Your EC2 Public IP

```bash
# On your EC2 instance, get the public IP
curl http://checkip.amazonaws.com
```

### Step 2: Configure DNS Records

1. **Log into your domain registrar** (GoDaddy, Namecheap, Cloudflare, etc.)

2. **Create DNS Records:**
   - **A Record**: `@` → `your-ec2-ip`
   - **A Record**: `www` → `your-ec2-ip`
   - **CNAME Record** (optional): `api` → `your-domain.com`

3. **Wait for DNS Propagation** (usually 5-30 minutes)
   ```bash
   # Check DNS propagation
   nslookup your-domain.com
   dig your-domain.com
   ```

## SSL Certificate Setup

### Step 1: Install Certbot

```bash
# Update system packages
sudo apt update

# Install Certbot and Nginx plugin
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Configure Nginx for Domain

Before getting SSL certificate, configure Nginx to serve your domain:

```bash
# Edit nginx configuration
sudo nano /etc/nginx/sites-available/kiwisrilankans-events
```

Update the server block:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Replace with your actual domain

    # ... rest of your configuration
}
```

Test and reload Nginx:

```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 3: Obtain SSL Certificate

```bash
# Get SSL certificate for your domain
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts:
# - Enter email address for renewal notifications
# - Agree to terms of service
# - Choose whether to share email with EFF
# - Choose redirect option (recommended: redirect HTTP to HTTPS)
```

### Step 4: Verify Certificate Installation

```bash
# Check certificate status
sudo certbot certificates

# Test certificate renewal
sudo certbot renew --dry-run
```

## Nginx SSL Configuration

### Step 1: Update Nginx Configuration

After Certbot runs, it will automatically update your Nginx configuration. However, you may want to customize it further:

```bash
# Edit the updated nginx configuration
sudo nano /etc/nginx/sites-available/kiwisrilankans-events
```

Here's a complete SSL-enabled configuration:

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

# Upstream configuration for backend API
upstream backend {
    server 127.0.0.1:3000;
    keepalive 32;
}

# Upstream configuration for frontend
upstream frontend {
    server 127.0.0.1:5000;
    keepalive 32;
}

# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'self';" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Client max body size for file uploads
    client_max_body_size 10M;

    # Timeout settings
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # API routes - Backend
    location /api/ {
        limit_req zone=api burst=20 nodelay;

        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS headers for API
        add_header 'Access-Control-Allow-Origin' 'https://your-domain.com' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://your-domain.com';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # Health check endpoint
    location /health {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads directory (if serving files locally)
    location /uploads/ {
        alias /home/ubuntu/kiwisrilankans-events/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";

        # Security for uploads
        location ~* \.(php|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }

    # Frontend routes
    location / {
        limit_req zone=general burst=50 nodelay;

        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://frontend;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;

    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

### Step 2: Test and Reload Nginx

```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## Environment Updates

### Step 1: Update Backend Environment

```bash
# Edit backend environment file
nano .env.production
```

Update the following variables:

```env
# Update CORS and URLs to use HTTPS
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Update Google OAuth redirect URI
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
```

### Step 2: Update Frontend Environment

```bash
# Edit frontend environment file
nano frontend/.env.production.local
```

Update the following variables:

```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Step 3: Restart Applications

```bash
# Restart PM2 processes
pm2 restart all

# Or restart individually
pm2 restart kiwisrilankans-backend
pm2 restart kiwisrilankans-frontend
```

## Testing SSL Setup

### Step 1: Test HTTPS Access

```bash
# Test HTTPS endpoint
curl -I https://your-domain.com

# Test API endpoint
curl -I https://your-domain.com/api

# Test health endpoint
curl https://your-domain.com/health
```

### Step 2: Test in Browser

1. **Open your browser** and navigate to:
   - `https://your-domain.com` (should show your frontend)
   - `https://your-domain.com/api` (should show API welcome message)

2. **Check SSL Certificate:**
   - Click the lock icon in the address bar
   - Verify certificate details
   - Ensure it shows "Secure" status

### Step 3: Test HTTP to HTTPS Redirect

```bash
# Test HTTP redirect
curl -I http://your-domain.com
# Should return 301 redirect to HTTPS
```

## Security Hardening

### Step 1: Configure Automatic Certificate Renewal

```bash
# Test renewal process
sudo certbot renew --dry-run

# Add renewal to crontab (runs twice daily)
sudo crontab -e

# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Step 2: Configure Firewall

```bash
# Install UFW if not already installed
sudo apt install ufw -y

# Configure firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp
sudo ufw enable

# Check firewall status
sudo ufw status
```

### Step 3: Update Security Headers

The nginx configuration above includes security headers, but you can enhance them further:

```bash
# Install additional security tools
sudo apt install fail2ban -y

# Configure fail2ban for nginx
sudo nano /etc/fail2ban/jail.local
```

Add this configuration:

```ini
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
```

### Step 4: Monitor SSL Certificate

```bash
# Check certificate expiration
sudo certbot certificates

# Set up monitoring script
sudo nano /usr/local/bin/ssl-check.sh
```

Add this script:

```bash
#!/bin/bash
DOMAIN="your-domain.com"
DAYS_BEFORE_EXPIRY=30

# Check certificate expiration
expiry_date=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
expiry_epoch=$(date -d "$expiry_date" +%s)
current_epoch=$(date +%s)
days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))

if [ $days_until_expiry -lt $DAYS_BEFORE_EXPIRY ]; then
    echo "WARNING: SSL certificate for $DOMAIN expires in $days_until_expiry days"
    # Add email notification here if needed
fi
```

Make it executable:

```bash
sudo chmod +x /usr/local/bin/ssl-check.sh
```

## Troubleshooting

### Common Issues

1. **Certificate Not Working**

   ```bash
   # Check certificate status
   sudo certbot certificates

   # Check nginx configuration
   sudo nginx -t

   # Check nginx logs
   sudo tail -f /var/log/nginx/error.log
   ```

2. **DNS Not Propagated**

   ```bash
   # Check DNS resolution
   nslookup your-domain.com
   dig your-domain.com

   # Check from different location
   curl -I https://your-domain.com
   ```

3. **Mixed Content Issues**
   - Ensure all resources use HTTPS
   - Check browser console for mixed content warnings
   - Update all hardcoded HTTP URLs to HTTPS

4. **CORS Issues**

   ```bash
   # Check CORS configuration in nginx
   sudo nano /etc/nginx/sites-available/kiwisrilankans-events

   # Update CORS headers to use HTTPS
   ```

5. **Google OAuth Issues**
   - Update Google OAuth redirect URIs in Google Console
   - Add both `https://your-domain.com/api/auth/google/callback` and `https://www.your-domain.com/api/auth/google/callback`

### Log Locations

- Nginx access logs: `/var/log/nginx/access.log`
- Nginx error logs: `/var/log/nginx/error.log`
- Certbot logs: `/var/log/letsencrypt/`
- Application logs: `./logs/`

### Useful Commands

```bash
# Check SSL certificate details
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Test SSL configuration
ssl-test.com/your-domain.com

# Check certificate chain
curl -I https://your-domain.com

# Monitor nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Maintenance

### Regular Tasks

1. **Monitor Certificate Expiration**

   ```bash
   # Check certificate status monthly
   sudo certbot certificates
   ```

2. **Update Certificates**

   ```bash
   # Manual renewal if needed
   sudo certbot renew
   ```

3. **Monitor Security**

   ```bash
   # Check fail2ban status
   sudo fail2ban-client status

   # Check firewall status
   sudo ufw status
   ```

4. **Backup Configuration**

   ```bash
   # Backup nginx configuration
   sudo cp /etc/nginx/sites-available/kiwisrilankans-events /home/ubuntu/backup/

   # Backup SSL certificates
   sudo cp -r /etc/letsencrypt /home/ubuntu/backup/
   ```

---

**Congratulations!** Your Kiwi Sri Lankans Events application now has a custom domain with SSL certificate. You can access it securely at `https://your-domain.com`.

## Next Steps

1. **Set up monitoring** for uptime and performance
2. **Configure backups** for your application and database
3. **Set up CDN** for better performance (Cloudflare, AWS CloudFront)
4. **Implement logging** and monitoring solutions
5. **Set up staging environment** for testing updates
