# Google Gemini AI Chatbot Setup Script
# Run this to configure your Gemini API key

Write-Host "=== Google Gemini AI Chatbot Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check current directory
$backendPath = "C:\Users\jaise\OneDrive\Desktop\Autism_detection\backend"
$envFile = Join-Path $backendPath ".env"

# Create .env if it doesn't exist
if (-not (Test-Path $envFile)) {
    Write-Host "Creating new .env file..." -ForegroundColor Yellow
    Copy-Item (Join-Path $backendPath ".env.example") $envFile
}

Write-Host "This chatbot uses Google Gemini API for intelligent responses." -ForegroundColor White
Write-Host ""
Write-Host "Benefits:" -ForegroundColor Green
Write-Host "  ✓ Free tier with 60 requests per minute"
Write-Host "  ✓ High-quality, context-aware responses"
Write-Host "  ✓ Specialized in autism support"
Write-Host ""
Write-Host "Get your free API key from:" -ForegroundColor Cyan
Write-Host "  https://makersuite.google.com/app/apikey" -ForegroundColor Yellow
Write-Host ""

$apiKey = Read-Host "Enter your Gemini API key (or press Enter to skip)"

if ($apiKey) {
    # Update .env file
    $envContent = Get-Content $envFile
    $envContent = $envContent -replace "^GEMINI_API_KEY=.*", "GEMINI_API_KEY=$apiKey"
    $envContent | Set-Content $envFile
    
    Write-Host "`n✓ Gemini API key configured successfully!" -ForegroundColor Green
} else {
    Write-Host "`nSkipped - You can add the API key to .env file later:" -ForegroundColor Yellow
    Write-Host "  GEMINI_API_KEY=your-api-key-here" -ForegroundColor Gray
}

Write-Host "`n=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your Flask backend server"
Write-Host "2. Test the chatbot in your browser"
Write-Host ""
Write-Host "Configuration saved to: $envFile" -ForegroundColor Gray
Write-Host ""
Write-Host "To change providers later, edit the .env file or run this script again." -ForegroundColor Gray
