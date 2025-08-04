# 🔧 Panduan Mengubah Author dan Email di Git

## 🎯 Tujuan
Mengubah author dan email dari:
- **Author lama:** `digiproc.dp.cr.icon4 <sigit.jatmiko@iconpln.co.id>`
- **Author baru:** `gitgitmiko <sjatmiko30@gmail.com>`

## 🚀 Langkah-langkah

### **Step 1: Set Git Config Baru**
```bash
# Set config untuk commit baru
git config user.name "gitgitmiko"
git config user.email "sjatmiko30@gmail.com"

# Verifikasi config
git config user.name
git config user.email
```

### **Step 2: Backup Branch**
```bash
# Buat backup sebelum mengubah history
git branch backup-before-author-change
```

### **Step 3: Ubah Author untuk Commit Terbaru**
```bash
# Ubah author untuk commit terbaru saja
git commit --amend --author="gitgitmiko <sjatmiko30@gmail.com>" --no-edit
```

### **Step 4: Ubah Author untuk Semua Commit (Opsional)**
```bash
# Menggunakan git filter-branch (HATI-HATI!)
git filter-branch --env-filter '
export GIT_AUTHOR_NAME="gitgitmiko"
export GIT_AUTHOR_EMAIL="sjatmiko30@gmail.com"
export GIT_COMMITTER_NAME="gitgitmiko"
export GIT_COMMITTER_EMAIL="sjatmiko30@gmail.com"
' --tag-name-filter cat -- --branches --tags
```

### **Step 5: Push ke Remote**
```bash
# Force push (HATI-HATI!)
git push origin main --force
```

## ⚠️ PERINGATAN PENTING

### **Sebelum Force Push:**
1. ✅ Pastikan tidak ada orang lain yang bekerja di repository
2. ✅ Backup branch sudah dibuat
3. ✅ Test di local terlebih dahulu
4. ✅ Pastikan semua perubahan sudah commit

### **Risiko Force Push:**
- ❌ Menimpa history di remote
- ❌ Bisa menghapus commit orang lain
- ❌ Sulit untuk di-revert

## 🔄 Alternatif yang Lebih Aman

### **Opsi 1: Hanya Ubah Config untuk Commit Baru**
```bash
# Set config baru
git config user.name "gitgitmiko"
git config user.email "sjatmiko30@gmail.com"

# Commit baru akan menggunakan author baru
git add .
git commit -m "Update author config"
git push origin main
```

### **Opsi 2: Ubah Hanya Commit Terbaru**
```bash
# Ubah author commit terbaru
git commit --amend --author="gitgitmiko <sjatmiko30@gmail.com>" --no-edit
git push origin main --force
```

### **Opsi 3: Buat Repository Baru**
```bash
# Clone repository baru
git clone https://github.com/gitgitmiko/scraper_web_beasiswa.git scraper_web_beasiswa_new

# Set config baru
cd scraper_web_beasiswa_new
git config user.name "gitgitmiko"
git config user.email "sjatmiko30@gmail.com"

# Push ke repository baru
git remote set-url origin https://github.com/gitgitmiko/scraper_web_beasiswa_new.git
git push -u origin main
```

## 📋 Checklist

- [ ] Set Git config baru
- [ ] Buat backup branch
- [ ] Pilih opsi yang sesuai
- [ ] Test di local
- [ ] Push ke remote (jika perlu)

## 🎯 Rekomendasi

**Untuk kasus ini, saya rekomendasikan Opsi 1** (hanya ubah config untuk commit baru) karena:
- ✅ Aman dan tidak merusak history
- ✅ Commit baru akan menggunakan author yang benar
- ✅ Tidak perlu force push
- ✅ Tidak ada risiko kehilangan data

**Apakah Anda ingin melanjutkan dengan Opsi 1 atau memilih opsi lain?** 