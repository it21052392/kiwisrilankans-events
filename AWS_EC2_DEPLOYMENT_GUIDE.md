# Kiwi Sri Lankans Events - AWS EC2 Deployment Guide

This comprehensive guide will walk you through deploying your Kiwi Sri Lankans Events application to AWS EC2 using PM2 on the free tier.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS EC2 Setup](#aws-ec2-setup)
3. [Server Configuration](#server-configuration)
4. [Application Deployment](#application-deployment)
5. [Nginx Configuration](#nginx-configuration)
6. [Database Setup](#database-setup)
7. [Environment Configuration](#environment-configuration)
8. [Testing Your Deployment](#testing-your-deployment)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Troubleshooting](#troubleshooting)
11. [Future Domain Setup](#future-domain-setup)

## Prerequisites

- AWS Account (free tier eligible)
- Basic knowledge of Linux commands
- Your application code ready for deployment

## AWS EC2 Setup

### Step 1: Launch an EC2 Instance

1. **Log into AWS Console**
   - Go to [AWS Console](https://console.aws.amazon.com/)
   - Navigate to EC2 service

2. **Launch Instance**
   - Click "Launch Instance"
   - Choose "Ubuntu Server 22.04 LTS" (Free tier eligible)
   - Select "t2.micro" instance type (Free tier eligible)
   - Create or select a key pair for SSH access
   - Configure security group with the following rules:
     - SSH (22) - Your IP
     - HTTP (80) - 0.0.0.0/0
     - HTTPS (443) - 0.0.0.0/0
     - Custom TCP (3000) - 0.0.0.0/0 (for backend API)
     - Custom TCP (5000) - 0.0.0.0/0 (for frontend)

3. **Launch and Connect**
   - Launch the instance
   - Wait for it to be running
   - Note the public IP address
   - Connect via SSH using your key pair

### Step 2: Connect to Your EC2 Instance

```bash
# Replace with your key file and EC2 IP
ssh -i "your-key.pem" ubuntu@your-ec2-ip
```

## Server Configuration

### Step 1: Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install Node.js (LTS Version)

```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 3: Install PM2 Globally

```bash
sudo npm install -g pm2
```

### Step 4: Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 5: Install MongoDB (Optional - for local database)

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/gpg/0x20691EEC352160C2.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Note:** For production, consider using MongoDB Atlas (free tier available) instead of local MongoDB.

## Application Deployment

### Step 1: Clone Your Repository

```bash
# Navigate to home directory
cd /home/ubuntu

# Clone your repository (replace with your actual repository URL)
git clone https://github.com/your-username/kiwisrilankans-events.git
cd kiwisrilankans-events
```

### Step 2: Install Dependencies

```bash
# Install backend dependencies
npm install --production

# Install frontend dependencies
cd frontend
npm install --production
cd ..
```

### Step 3: Configure Environment Variables

```bash
# Copy environment template
cp env.production.example .env.production

# Edit the environment file
nano .env.production
```

Update the following key variables in `.env.production`:

```env
# Replace your-ec2-ip with your actual EC2 public IP
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
MONGODB_URI=mongodb://localhost:27017/kiwisrilankans-events
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=http://your-ec2-ip:5000,http://your-ec2-ip:3000
NEXT_PUBLIC_API_URL=http://your-ec2-ip:3000/api
NEXT_PUBLIC_APP_URL=http://your-ec2-ip:5000
```

### Step 4: Configure Frontend Environment

```bash
# Copy frontend environment template
cp frontend/env.production.example frontend/.env.production.local

# Edit the frontend environment file
nano frontend/.env.production.local
```

Update the frontend environment variables:

```env
NEXT_PUBLIC_API_URL=http://your-ec2-ip:3000/api
NEXT_PUBLIC_APP_URL=http://your-ec2-ip:5000
```

### Step 5: Build Frontend

```bash
cd frontend
npm run build
cd ..
```

### Step 6: Create Required Directories

```bash
# Create logs directory
mkdir -p logs

# Create uploads directory
mkdir -p uploads/event_image

# Set proper permissions
chmod 755 logs
chmod 755 uploads
chmod 755 uploads/event_image
```

### Step 7: Deploy with PM2

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

Or use the PowerShell script if you're on Windows:

```powershell
# Run PowerShell deployment script
.\deploy.ps1
```

### Step 8: Verify PM2 Status

```bash
pm2 status
pm2 logs
```

## Nginx Configuration

### Step 1: Configure Nginx

```bash
# Backup default nginx configuration
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Copy our nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/kiwisrilankans-events

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/kiwisrilankans-events /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Step 2: Update Nginx Configuration

Edit the nginx configuration to use your EC2 IP:

```bash
sudo nano /etc/nginx/sites-available/kiwisrilankans-events
```

Replace `your-ec2-ip-or-domain.com` with your actual EC2 public IP address.

## Database Setup

### Option 1: Local MongoDB (Not Recommended for Production)

If you installed MongoDB locally:

```bash
# MongoDB should already be running
sudo systemctl status mongod

# Create database and initial data (if you have seed scripts)
npm run seed  # If you have a seed script
```

### Option 2: MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account
   - Create a new cluster (free tier)

2. **Configure Database**
   - Create a database user
   - Whitelist your EC2 IP address
   - Get the connection string

3. **Update Environment Variables**

   ```bash
   nano .env.production
   ```

   Update the `MONGODB_URI`:

   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kiwisrilankans-events?retryWrites=true&w=majority
   ```

## Testing Your Deployment

### Step 1: Test Backend API

```bash
# Test health endpoint
curl http://your-ec2-ip/health

# Test API endpoint
curl http://your-ec2-ip/api
```

### Step 2: Test Frontend

Open your browser and navigate to:

- `http://your-ec2-ip` (should show your frontend)
- `http://your-ec2-ip/api` (should show API welcome message)

### Step 3: Test PM2 Processes

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs kiwisrilankans-backend
pm2 logs kiwisrilankans-frontend

# Monitor in real-time
pm2 monit
```

## Monitoring and Maintenance

### PM2 Commands

```bash
# View all processes
pm2 list

# Restart all processes
pm2 restart all

# Restart specific process
pm2 restart kiwisrilankans-backend
pm2 restart kiwisrilankans-frontend

# Stop all processes
pm2 stop all

# Delete all processes
pm2 delete all

# View logs
pm2 logs
pm2 logs --lines 100

# Monitor resources
pm2 monit

# Save current process list
pm2 save

# Resurrect saved processes
pm2 resurrect
```

### System Monitoring

```bash
# Check system resources
htop
df -h
free -h

# Check nginx status
sudo systemctl status nginx

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Check application logs
tail -f logs/backend-combined.log
tail -f logs/frontend-combined.log
```

### Automatic Startup

PM2 should automatically start your applications on server reboot. To ensure this:

```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Check what's using the port
   sudo netstat -tlnp | grep :3000
   sudo netstat -tlnp | grep :5000

   # Kill the process
   sudo kill -9 <PID>
   ```

2. **Permission Denied**

   ```bash
   # Fix file permissions
   sudo chown -R ubuntu:ubuntu /home/ubuntu/kiwisrilankans-events
   chmod +x deploy.sh
   ```

3. **Nginx Not Starting**

   ```bash
   # Check nginx configuration
   sudo nginx -t

   # Check nginx logs
   sudo tail -f /var/log/nginx/error.log
   ```

4. **PM2 Process Not Starting**

   ```bash
   # Check PM2 logs
   pm2 logs

   # Check if ports are available
   sudo netstat -tlnp | grep -E ':(3000|5000)'
   ```

5. **Database Connection Issues**

   ```bash
   # Check MongoDB status
   sudo systemctl status mongod

   # Check MongoDB logs
   sudo tail -f /var/log/mongodb/mongod.log
   ```

### Log Locations

- Application logs: `./logs/`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`
- PM2 logs: `~/.pm2/logs/`

## Future Domain Setup

When you're ready to add a domain name:

### Step 1: Point Domain to EC2

1. **Get Your EC2 Public IP**

   ```bash
   curl http://checkip.amazonaws.com
   ```

2. **Update DNS Records**
   - In your domain registrar's DNS settings
   - Create an A record pointing your domain to the EC2 IP

### Step 2: SSL Certificate Setup

1. **Install Certbot**

   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Get SSL Certificate**

   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

3. **Update Nginx Configuration**
   - Uncomment the SSL server block in nginx.conf
   - Update domain names
   - Restart nginx

### Step 3: Update Environment Variables

Update your environment variables to use the domain:

```env
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Security Considerations

1. **Firewall Configuration**

   ```bash
   # Install UFW
   sudo apt install ufw -y

   # Configure firewall
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

2. **Regular Updates**

   ```bash
   # Update system packages regularly
   sudo apt update && sudo apt upgrade -y

   # Update Node.js dependencies
   npm audit fix
   ```

3. **Backup Strategy**
   - Regular database backups
   - Code repository backups
   - Environment configuration backups

## Cost Optimization (Free Tier)

To stay within AWS free tier limits:

1. **Use t2.micro instance** (750 hours/month free)
2. **Monitor usage** in AWS Billing Dashboard
3. **Use MongoDB Atlas free tier** (512MB storage)
4. **Optimize application** for minimal resource usage
5. **Set up billing alerts**

## Support

If you encounter issues:

1. Check the logs first
2. Verify all environment variables
3. Ensure all ports are open
4. Check PM2 process status
5. Verify nginx configuration

For additional help, refer to:

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

---

**Congratulations!** Your Kiwi Sri Lankans Events application should now be running on AWS EC2 with PM2. You can access it at `http://your-ec2-ip` and the API at `http://your-ec2-ip/api`.
