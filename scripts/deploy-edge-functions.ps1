# Supabase Edge Functions Deployment Script (PowerShell)
# Bu script hesap silme edge function'ını deploy eder

Write-Host "🚀 Supabase Edge Functions Deploy Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if Supabase CLI is installed
$supabaseCommand = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCommand) {
    Write-Host "❌ Supabase CLI bulunamadı!" -ForegroundColor Red
    Write-Host "🔧 Kurmak için: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase CLI bulundu" -ForegroundColor Green

# Check if user is logged in
$statusResult = & supabase status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "🔐 Supabase'e giriş yapmanız gerekiyor..." -ForegroundColor Yellow
    & supabase login
}

Write-Host "📦 Edge Function deploy ediliyor..." -ForegroundColor Blue

# Deploy the delete-user-account function
& supabase functions deploy delete-user-account

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Edge Function başarıyla deploy edildi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔧 Şimdi Supabase Dashboard'da şunları yapın:" -ForegroundColor Yellow
    Write-Host "1. Project Settings > API > Service Role Key'i kopyalayın"
    Write-Host "2. Project Settings > Edge Functions > Environment Variables'a gidin"
    Write-Host "3. SUPABASE_SERVICE_ROLE_KEY değişkenini ekleyin"
    Write-Host ""
    Write-Host "🌐 Function URL:" -ForegroundColor Cyan
    Write-Host "https://YOUR_PROJECT_ID.supabase.co/functions/v1/delete-user-account"
    Write-Host ""
    Write-Host "🧪 Test için:" -ForegroundColor Magenta
    Write-Host "Invoke-RestMethod -Uri 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/delete-user-account' ``"
    Write-Host "  -Method POST ``"
    Write-Host "  -Headers @{'Authorization'='Bearer YOUR_USER_JWT_TOKEN'; 'apikey'='YOUR_ANON_KEY'}"
} else {
    Write-Host "❌ Deploy başarısız oldu!" -ForegroundColor Red
    exit 1
} 