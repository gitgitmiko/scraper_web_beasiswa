#!/bin/bash

# Script untuk mengubah author dan email di semua commit
# Author: gitgitmiko
# Email: sjatmiko30@gmail.com

echo "🔧 Mengubah author dan email di semua commit..."

# Backup current branch
echo "📦 Membuat backup branch..."
git branch backup-before-author-change

# Change author and email for all commits
echo "🔄 Mengubah author dan email..."
git filter-branch --env-filter '
export GIT_AUTHOR_NAME="gitgitmiko"
export GIT_AUTHOR_EMAIL="sjatmiko30@gmail.com"
export GIT_COMMITTER_NAME="gitgitmiko"
export GIT_COMMITTER_EMAIL="sjatmiko30@gmail.com"
' --tag-name-filter cat -- --branches --tags

echo "✅ Author dan email berhasil diubah!"
echo "📋 Commit terbaru:"
git log --oneline -5

echo ""
echo "🚀 Untuk push ke remote (HATI-HATI!):"
echo "git push origin main --force"
echo ""
echo "⚠️  PERINGATAN: Force push akan menimpa history di remote!"
echo "   Pastikan tidak ada orang lain yang bekerja di repository ini." 