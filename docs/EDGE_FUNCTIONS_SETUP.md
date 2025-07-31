# 🚀 Supabase Edge Functions Setup Guide

This guide explains how to set up the Supabase Edge Function required to run the **Delete My Account** button.

## 📋 Requirements

- Node.js (v16 or higher)
- Supabase account
- Supabase CLI

## 🔧 Setup Steps

### 1. Supabase CLI Installation

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Edge Function Deployment

#### Windows (PowerShell):
```powershell
.\deploy-edge-functions.ps1
```

#### Linux/macOS (Bash):
```bash
chmod +x deploy-edge-functions.sh
./deploy-edge-functions.sh
```

#### Manual Deployment:
```bash
supabase functions deploy delete-user-account
```

### 4. Environment Variables Setup

1. Go to **Supabase Dashboard**
2. Copy the **Service Role Key** from **Project Settings > API**
3. Navigate to **Project Settings > Edge Functions > Environment Variables**
4. Add new variable:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Your copied Service Role Key

## 🧪 Testing

### Frontend Testing:
Click the **Delete My Account** button in the application.

### Manual Testing (cURL):
```bash
curl -X POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/delete-user-account' \
  -H 'Authorization: Bearer YOUR_USER_JWT_TOKEN' \
  -H 'apikey: YOUR_ANON_KEY'
```

### PowerShell Testing:
```powershell
Invoke-RestMethod -Uri 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/delete-user-account' `
  -Method POST `
  -Headers @{'Authorization'='Bearer YOUR_USER_JWT_TOKEN'; 'apikey'='YOUR_ANON_KEY'}
```

## 📂 File Structure

```
supabase/
└── functions/
    └── delete-user-account/
        ├── index.ts              # Main Edge Function
        ├── deno.json            # Deno configuration
        └── import_map.json      # Import mapping
```

## 🔒 Security

The Edge Function performs the following:

1. **JWT Token Validation**: Verifies user identity
2. **Admin Privileges**: Performs admin operations with Service Role Key
3. **Data Deletion**: Securely deletes all user data:
   - AI chat history
   - Quiz results
   - Performance data
   - Flashcard progress
   - AI recommendations
   - Subjects and questions
   - Backup files
   - Auth user record

## ❗ Important Notes

- **Irreversible operation**: Account deletion cannot be undone
- **Admin privileges**: Edge Function operates with admin privileges
- **Secure deletion**: All data is securely removed
- **Session invalidation**: User session is automatically terminated

## 🐛 Troubleshooting

### Deployment Error:
```bash
# Retry deployment
supabase functions deploy delete-user-account --debug
```

### Environment Variable Error:
- Ensure Service Role Key is correctly copied
- Verify the variable is saved in Supabase Dashboard

### Permission Error:
- Ensure JWT token is valid
- Verify user is logged in

## 📖 API Reference

### Request:
- **Method**: POST
- **URL**: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/delete-user-account`
- **Headers**:
  - `Authorization: Bearer JWT_TOKEN`
  - `apikey: SUPABASE_ANON_KEY`

### Response (Success):
```json
{
  "success": true,
  "message": "Account deleted successfully",
  "deletedUserId": "user-id"
}
```

### Response (Error):
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🎯 Next Steps

1. ✅ Deploy Edge Function
2. ✅ Set up environment variables
3. ✅ Test on frontend
4. ✅ Validate in production

The **Delete My Account** button is now fully functional! 🎉 