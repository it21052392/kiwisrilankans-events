#!/bin/bash

# Kiwi Sri Lankans Events - Deployment Script
# This script deploys the application to AWS EC2 with PM2

set -e  # Exit on any error

echo "🚀 Starting deployment of Kiwi Sri Lankans Events..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Please install PM2 first:"
    echo "npm install -g pm2"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first"
    exit 1
fi

print_status "Installing/updating dependencies..."

# Install backend dependencies
print_status "Installing backend dependencies..."
npm install

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs

# Create uploads directory
print_status "Creating uploads directory..."
mkdir -p uploads/event_image

# Set proper permissions
print_status "Setting permissions..."
chmod 755 logs
chmod 755 uploads
chmod 755 uploads/event_image

# Build frontend
print_status "Building frontend..."
cd frontend
npm run build
cd ..

# Stop existing PM2 processes
print_status "Stopping existing PM2 processes..."
pm2 stop ecosystem.config.js 2>/dev/null || true
pm2 delete ecosystem.config.js 2>/dev/null || true

# Start applications with PM2
print_status "Starting applications with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Setup PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup

print_success "Deployment completed successfully!"
print_status "Your applications are now running:"
echo "  - Backend API: http://your-ec2-ip:3000"
echo "  - Frontend: http://your-ec2-ip:5000"
echo ""
print_status "PM2 Status:"
pm2 status
echo ""
print_status "To view logs:"
echo "  pm2 logs kiwisrilankans-backend"
echo "  pm2 logs kiwisrilankans-frontend"
echo "  pm2 logs --lines 100"
echo ""
print_status "To restart applications:"
echo "  pm2 restart all"
echo "  pm2 restart kiwisrilankans-backend"
echo "  pm2 restart kiwisrilankans-frontend"
echo ""
print_status "To stop applications:"
echo "  pm2 stop all"
echo "  pm2 stop kiwisrilankans-backend"
echo "  pm2 stop kiwisrilankans-frontend"
