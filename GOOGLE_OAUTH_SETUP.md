# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the AURA application.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Steps to Set Up Google OAuth

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" at the top
3. Click "New Project"
4. Enter a project name (e.g., "AURA App")
5. Click "Create"

### 2. Enable Google Calendar API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the required fields:
   - App name: AURA
   - User support email: Your email
   - Developer contact information: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Add the following scopes:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/calendar.readonly`
8. Click "Update" then "Save and Continue"
9. Add test users (your email addresses) on the "Test users" page
10. Click "Save and Continue"

### 4. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Enter a name (e.g., "AURA Web Client")
5. Add Authorized JavaScript origins:
   - `http://localhost:3000`
   - (Add your production URL later)
6. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - (Add your production callback URL later)
7. Click "Create"
8. Copy the **Client ID** and **Client Secret**

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<generate-with-command-below>
   GOOGLE_CLIENT_ID=<your-client-id>
   GOOGLE_CLIENT_SECRET=<your-client-secret>
   ```

3. Generate a NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

### 6. Start the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and you should be redirected to the login page. Click "Continue with Google" to test the authentication flow.

## Permissions Requested

The app requests the following permissions from users:

1. **OpenID, Email, Profile**: To identify the user and display their name
2. **Google Calendar (read-only)**: To access calendar events for better scheduling recommendations

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console matches exactly: `http://localhost:3000/api/auth/callback/google`
- Check that your NEXTAUTH_URL is set correctly in `.env.local`

### "Access blocked: This app's request is invalid"
- Ensure you've enabled the Google Calendar API
- Check that all required scopes are added in the OAuth consent screen

### "Error: NEXTAUTH_SECRET is not set"
- Generate a secret using `openssl rand -base64 32` and add it to `.env.local`

## Production Deployment

When deploying to production:

1. Add your production domain to:
   - Authorized JavaScript origins
   - Authorized redirect URIs (e.g., `https://yourdomain.com/api/auth/callback/google`)
2. Update `NEXTAUTH_URL` in your production environment variables
3. Consider moving from "Testing" to "Published" status in OAuth consent screen (requires verification)
