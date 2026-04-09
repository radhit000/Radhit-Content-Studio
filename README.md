# Studio AI Pro - Deployment Guide

Aplikasi ini siap untuk dirilis ke **Vercel**. Ikuti langkah-langkah di bawah ini untuk merilis aplikasi Anda secara publik.

## 1. Persiapan Repositori
- Hubungkan proyek ini ke repositori **GitHub**, **GitLab**, atau **Bitbucket**.
- Pastikan file `firebase-applet-config.json` ikut ter-upload jika Anda ingin menggunakan konfigurasi default.

## 2. Pengaturan di Vercel
Saat membuat proyek baru di Vercel:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Environment Variables
Anda **WAJIB** menambahkan variabel berikut di Vercel (Settings > Environment Variables):
- `GEMINI_API_KEY`: API Key dari Google AI Studio.

*(Opsional) Jika ingin menggunakan variabel untuk Firebase:*
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_DATABASE_ID`

## 3. Konfigurasi Firebase (PENTING)
Agar Login Google berfungsi, Anda harus mendaftarkan domain Vercel Anda:
1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Pilih proyek Anda.
3. Pergi ke **Authentication > Settings > Authorized Domains**.
4. Klik **Add Domain** dan masukkan domain Vercel Anda (contoh: `studio-ai-pro.vercel.app`).

## 4. Keamanan Database
Pastikan aturan keamanan Firestore sudah terpasang:
1. Buka **Firestore Database > Rules**.
2. Pastikan isinya sesuai dengan file `firestore.rules` di proyek ini.

---
**Dibuat oleh Bwork Digital Agency & Content Studio**
