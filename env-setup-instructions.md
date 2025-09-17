# Environment Setup Instructions

## Issue Fixed: Image Upload 500 Error

The image upload was failing because AWS S3 credentials were not configured. I've implemented a fallback solution that uses local file storage for development.

## Quick Fix Applied

1. **Modified upload service** to fallback to local storage when AWS credentials are missing
2. **Added static file serving** for local uploads in development mode
3. **Improved error messages** to be more descriptive

## To Complete the Setup

### Option 1: Use Local Storage (Current - Works Immediately)

The system now works with local file storage. Images will be saved to `uploads/` directory and served at `/uploads/` URL.

### Option 2: Configure AWS S3 (Recommended for Production)

Create a `.env` file in the root directory with the following content:

```env
# Environment Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/kiwisrilankans-events

# JWT
JWT_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=ap-southeast-2
S3_BUCKET_NAME=your-s3-bucket-name

# CORS
CORS_ORIGIN=http://localhost:5000

# Logging
LOG_LEVEL=info
```

### AWS S3 Setup Steps

1. **Create AWS Account** (if you don't have one)
2. **Create S3 Bucket**:
   - Go to AWS S3 Console
   - Create a new bucket
   - Choose a unique name (e.g., `kiwisrilankans-events-images`)
   - Select region (e.g., `ap-southeast-2` for Australia)
3. **Create IAM User**:
   - Go to IAM Console
   - Create new user with programmatic access
   - Attach policy: `AmazonS3FullAccess` (or create custom policy)
   - Save Access Key ID and Secret Access Key
4. **Update .env file** with your AWS credentials

## Testing the Fix

1. **Restart your backend server**:

   ```bash
   npm run dev
   ```

2. **Try uploading an image** at `http://localhost:5000/organizer/events/create`

3. **Check the uploads directory** - you should see files being created in `uploads/event_image/[userId]/`

## Current Status

✅ **Image upload now works** with local storage fallback
✅ **Error messages are descriptive**
✅ **Static file serving configured** for development
✅ **AWS S3 integration ready** when credentials are provided

The system will automatically use AWS S3 when credentials are configured, or fall back to local storage for development.
