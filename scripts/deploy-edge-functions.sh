#!/bin/bash

# Supabase Edge Functions Deployment Script
# Bu script hesap silme edge function'ını deploy eder

echo "🚀 Supabase Edge Functions Deploy Script"
echo "========================================"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI bulunamadı!"
    echo "🔧 Kurmak için: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI bulundu"

# Check if user is logged in
if ! supabase status &> /dev/null; then
    echo "🔐 Supabase'e giriş yapmanız gerekiyor..."
    supabase login
fi

echo "📦 Edge Function deploy ediliyor..."

# Deploy the delete-user-account function
supabase functions deploy delete-user-account

if [ $? -eq 0 ]; then
    echo "✅ Edge Function başarıyla deploy edildi!"
    echo ""
    echo "🔧 Şimdi Supabase Dashboard'da şunları yapın:"
    echo "1. Project Settings > API > Service Role Key'i kopyalayın"
    echo "2. Project Settings > Edge Functions > Environment Variables'a gidin"
    echo "3. SUPABASE_SERVICE_ROLE_KEY değişkenini ekleyin"
    echo ""
    echo "🌐 Function URL:"
    echo "https://YOUR_PROJECT_ID.supabase.co/functions/v1/delete-user-account"
    echo ""
    echo "🧪 Test için:"
    echo "curl -X POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/delete-user-account' \\"
    echo "  -H 'Authorization: Bearer YOUR_USER_JWT_TOKEN' \\"
    echo "  -H 'apikey: YOUR_ANON_KEY'"
else
    echo "❌ Deploy başarısız oldu!"
    exit 1
fi 