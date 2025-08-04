# PowerShell script untuk mengubah author dan email di semua commit
# Author: gitgitmiko
# Email: sjatmiko30@gmail.com

Write-Host "🔧 Mengubah author dan email di semua commit..." -ForegroundColor Green

# Set Git config
git config user.name "gitgitmiko"
git config user.email "sjatmiko30@gmail.com"

Write-Host "✅ Git config berhasil diubah!" -ForegroundColor Green
Write-Host "📋 Config saat ini:" -ForegroundColor Yellow
git config user.name
git config user.email

Write-Host ""
Write-Host "📦 Membuat backup branch..." -ForegroundColor Yellow
git branch backup-before-author-change

Write-Host ""
Write-Host "🔄 Mengubah author untuk commit terbaru..." -ForegroundColor Yellow
git commit --amend --author="gitgitmiko <sjatmiko30@gmail.com>" --no-edit

Write-Host ""
Write-Host "📋 Commit terbaru:" -ForegroundColor Yellow
git log --oneline -3

Write-Host ""
Write-Host "🚀 Untuk push ke remote (HATI-HATI!):" -ForegroundColor Red
Write-Host "git push origin main --force" -ForegroundColor Red
Write-Host ""
Write-Host "⚠️  PERINGATAN: Force push akan menimpa history di remote!" -ForegroundColor Red
Write-Host "   Pastikan tidak ada orang lain yang bekerja di repository ini." -ForegroundColor Red 