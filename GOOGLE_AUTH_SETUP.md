# Google Authentication Setup

This project now uses **Google OAuth only** for authentication, supporting only **Organizers** and **Admins**.

## Authentication Flow

### 1. Registration/Login Endpoints

- **Organizer Registration/Login**: `GET /api/auth/google/organizer`
- **Admin Registration/Login**: `GET /api/auth/google/admin`
- **OAuth Callback**: `GET /api/auth/google/callback`

### 2. User Roles

- **Organizer**: Can create, edit, and manage their own events
- **Admin**: Has full system access including event approval and user management

### 3. How It Works

1. User clicks "Continue with Google" button for either Organizer or Admin
2. System redirects to Google OAuth with role specified in state parameter
3. User authenticates with Google
4. Google redirects back to `/api/auth/google/callback` with authorization code and state
5. System creates/updates user with the specified role
6. User is redirected to frontend with access token and role information

### 4. Frontend Integration

The callback redirects to: `${FRONTEND_URL}?token=${accessToken}&role=${userRole}`

### 5. Environment Variables Required

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

### 6. User Model Changes

- Password field is now optional (only for Google OAuth users)
- Role field is required and only accepts 'organizer' or 'admin'
- Google ID field is used to link Google accounts

### 7. Removed Features

- Password-based registration (`POST /api/auth/register`)
- Password-based login (`POST /api/auth/login`)
- Password reset functionality
- Email verification (handled by Google)

## Security Notes

- Only users with valid Google accounts can register
- Role is determined at registration time and cannot be changed via API
- All authentication is handled through Google's secure OAuth flow
- Refresh tokens are stored in HTTP-only cookies for security
