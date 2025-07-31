# Environment Variables Setup Guide

## 🚨 Current Issue
The AI question generation is falling back to mock data because the `GEMINI_API_KEY` is not properly configured.

## 🔧 Required Environment Variables

### For Vercel Deployment:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

```
GEMINI_API_KEY=your_google_ai_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### For Local Development:
Create a `.env.local` file in the project root:

```bash
# AI Configuration
GEMINI_API_KEY=your_google_ai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url

# Optional: Demo Mode
NEXT_PUBLIC_DEMO_MODE=false
```

## 🔍 How to Get Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to your environment variables

## 🧪 Testing the Fix

1. **Check Environment Variables**: Visit `/env-test` page to see if variables are loaded
2. **Test AI Generation**: Try generating questions in the question manager
3. **Check Console Logs**: Look for the debug logs we added

## 🐛 Debug Steps

If the issue persists:

1. **Clear Browser Data**: Clear localStorage and cookies
2. **Redeploy**: After adding environment variables, redeploy on Vercel
3. **Check Console**: Look for the debug logs showing environment variable status

## 📝 Expected Behavior

When properly configured:
- ✅ `GEMINI_API_KEY` should show "SET" in debug logs
- ✅ AI generation should use real Google AI instead of mock data
- ✅ Questions should be generated with actual AI content
- ✅ No more "demo" suggestions in the output

## 🔄 Alternative API Key Names

The system supports multiple API key names:
- `GEMINI_API_KEY` (preferred)
- `GOOGLE_GENAI_API_KEY` (alternative)
- `GOOGLE_AI_API_KEY` (alternative)

## 🚀 Quick Fix Commands

```bash
# For local development
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Restart development server
npm run dev
``` 