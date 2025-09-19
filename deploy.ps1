# Kiwi Sri Lankans Events - PowerShell Deployment Script
# This script deploys the application to AWS EC2 with PM2

param(
    [switch]$SkipBuild,
    [switch]$Force
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting deployment of Kiwi Sri Lankans Events..." -ForegroundColor Blue

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if PM2 is installed
try {
    $pm2Version = pm2 --version
    Write-Status "PM2 version: $pm2Version"
} catch {
    Write-Error "PM2 is not installed. Please install PM2 first:"
    Write-Host "npm install -g pm2"
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Status "Node.js version: $nodeVersion"
} catch {
    Write-Error "Node.js is not installed. Please install Node.js first"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Status "npm version: $npmVersion"
} catch {
    Write-Error "npm is not installed. Please install npm first"
    exit 1
}

Write-Status "Installing/updating dependencies..."

# Install backend dependencies
Write-Status "Installing backend dependencies..."
npm install --production

# Install frontend dependencies
Write-Status "Installing frontend dependencies..."
Set-Location frontend
npm install --production
Set-Location ..

# Create logs directory
Write-Status "Creating logs directory..."
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs"
}

# Create uploads directory
Write-Status "Creating uploads directory..."
if (!(Test-Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads"
}
if (!(Test-Path "uploads/event_image")) {
    New-Item -ItemType Directory -Path "uploads/event_image"
}

# Build frontend if not skipped
if (!$SkipBuild) {
    Write-Status "Building frontend..."
    Set-Location frontend
    npm run build
    Set-Location ..
}

# Stop existing PM2 processes
Write-Status "Stopping existing PM2 processes..."
try {
    pm2 stop ecosystem.config.js 2>$null
    pm2 delete ecosystem.config.js 2>$null
} catch {
    # Ignore errors if processes don't exist
}

# Start applications with PM2
Write-Status "Starting applications with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
Write-Status "Saving PM2 configuration..."
pm2 save

# Setup PM2 startup script
Write-Status "Setting up PM2 startup script..."
pm2 startup

Write-Success "Deployment completed successfully!"
Write-Status "Your applications are now running:"
Write-Host "  - Backend API: http://your-ec2-ip:3000" -ForegroundColor Cyan
Write-Host "  - Frontend: http://your-ec2-ip:5000" -ForegroundColor Cyan
Write-Host ""
Write-Status "PM2 Status:"
pm2 status
Write-Host ""
Write-Status "To view logs:"
Write-Host "  pm2 logs kiwisrilankans-backend" -ForegroundColor Cyan
Write-Host "  pm2 logs kiwisrilankans-frontend" -ForegroundColor Cyan
Write-Host "  pm2 logs --lines 100" -ForegroundColor Cyan
Write-Host ""
Write-Status "To restart applications:"
Write-Host "  pm2 restart all" -ForegroundColor Cyan
Write-Host "  pm2 restart kiwisrilankans-backend" -ForegroundColor Cyan
Write-Host "  pm2 restart kiwisrilankans-frontend" -ForegroundColor Cyan
Write-Host ""
Write-Status "To stop applications:"
Write-Host "  pm2 stop all" -ForegroundColor Cyan
Write-Host "  pm2 stop kiwisrilankans-backend" -ForegroundColor Cyan
Write-Host "  pm2 stop kiwisrilankans-frontend" -ForegroundColor Cyan
