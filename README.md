# 🛡️ SafeTana AI & Klinik AI (SafeTana AI Health)
> **"Cerdas Berbagi, Sigap Mitigasi, & Peduli Kesehatan"**
> *Sistem Mitigasi Bencana Terintegrasi Berbasis AI & Platform Layanan Kesehatan Mandiri.*

---

## 📌 Tentang SafeTana AI
SafeTana AI adalah platform progresif yang dirancang untuk memperkuat resiliensi masyarakat terhadap bencana alam dan krisis kesehatan. Dengan menggabungkan pemetaan data geospasial real-time, kecerdasan buatan (**Google Gemini AI**), dan modul layanan medis prediktif (**Klinik AI/SafeTana AI Health**), platform ini memberikan perlindungan menyeluruh—baik dari ancaman alam maupun risiko kesehatan personal.

---

## ✨ Fitur Utama Mitigasi Bencana (SafeTana)

### 🤖 AI Early Detection Engine & Voice Assistant (TTS)
SafeTana mengintegrasikan **Gemini AI** untuk memahami risiko bencana di lokasi Anda secara spesifik. Chatbot cerdas kami dapat memandu evakuasi dan kini dilengkapi dengan fitur **Text-to-Speech (TTS)**—suara asisten virtual yang membacakan rute peringatan dengan lantang.

### 📍 Live User Tracking & SOS System
* **Anonymous Tracking**: Memantau lokasi dan status keamanan pengguna secara *real-time* menggunakan algoritma Haversine.
* **Security & Privacy**: Implementasi enkripsi koordinat dan *masking* PII (Personal Identifiable Information) untuk keamanan data pengguna.
* **Status Updates & SOS**: Pengguna dapat dengan mudah memperbarui status (Aman / Butuh Evakuasi) hanya dengan satu klik.

### 🗺️ Peta Bencana Live & Titik Aman Terpadu
Visualisasi peta interaktif 24/7 menggunakan *Leaflet* yang menampilkan titik bencana dari sumber terpercaya (GDACS, BMKG) beserta **61 Titik Kumpul Evakuasi Terpadu** di wilayah Bandung, lengkap beserta panduan jarak spesifik ke setiap Fasilitas Kesehatan.

---

## ⚕️ Fitur Utama Kesehatan (Klinik AI / SafeTana AI Health)

### 📋 Skrining Kesehatan Mandiri
Sistem Penilaian Cerdas yang dapat mengevaluasi kondisi pasien secara instan berdasarkan parameter medis:
- **Kalkulasi IMT (BMI)** untuk risiko berat badan berlebih & obesitas.
- **Deteksi Pra-Hipertensi** melalui input tekanan Sistolik/Diastolik.
- **Analisis Risiko**: Mengidentifikasi indikasi gangguan pernapasan dan tingkat stres mental.

### 📊 Catatan Jurnal & Mood Tracker 30 Hari
Layanan log psikologis harian yang didukung dengan **Dashboard Analitik Personal**:
- Menghitung rentetan **Hari Aktif Jurnal (Streaks)**.
- Menentukan **Emosi/Mood Dominan** dalam sebulan terakhir.

### 💬 SafeTanaBot (Health AI Assistant)
Chatbot interaktif khusus untuk layanan kesehatan. Pengguna dapat menanyakan gejala medis umum, rekomendasi gaya hidup, atau akses darurat RS dengan antarmuka chatting yang intuitif.

### 📚 Kamus Kesehatan
Akses cepat ke istilah medis dan informasi kesehatan yang akurat untuk meningkatkan literasi kesehatan pengguna.

---

## 🏗️ Technical Architecture & Refactoring

### 🔄 Service Pattern Architecture
Projek ini telah direfaktorisasi menggunakan **Service Pattern** untuk memisahkan logika bisnis dari komponen UI, sehingga meningkatkan keterbacaan, keamanan, dan skalabilitas kode:
- `aiService.js`: Mengelola interaksi dengan Google Gemini AI secara tersentralisasi.
- `dataService.js`: Mengelola operasi database Firestore dengan validasi yang lebih kuat.

### 🛡️ Layer Keamanan Tambahan
- **Location Encryption**: Koordinat lokasi pengguna dienkripsi sebelum diproses ke server.
- **PII Masking**: Nama dan nomor telepon pengguna disamarkan dalam tampilan publik/admin tertentu.
- **XSS & Input Sanitization**: Melindungi aplikasi dari serangan injeksi skrip berbahaya.

---

## 🛠️ Tech Stack
- **Frontend**: [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth**: [Firebase Firestore](https://firebase.google.com/) & [Authentication](https://firebase.google.com/docs/auth)
- **AI Engine**: [Google Gemini AI API](https://ai.google.dev/)
- **Maps**: [Leaflet.js](https://leafletjs.com/)

---

## 👥 Tim Developer
Inti dari platform tangguh ini dibangun oleh talenta yang berdedikasi:
- **Septiawan Hadi Prasetyo** – Lead Developer
- **Restu Utami** – Developer

---

## 🚀 Instalasi & Pengembangan

1. **Clone Repository**
```bash
git clone https://github.com/septiawanhadi/safetana.git
cd safetana
```

2. **Install Dependensi**
```bash
npm install
```

3. **Konfigurasi Environment**
Buat file `.env` di root folder dengan variabel Firebase & Gemini API.

4. **Menjalankan Aplikasi**
```bash
npm run dev
```

---

## 📂 Struktur Proyek Terkini
- `src/services/` - **[NEW]** Layer arsitektur servis (AI & Data).
- `src/components/health/` - Komponen fitur SafeTana AI Health.
- `src/securityUtils.js` - **[NEW]** Utilitas keamanan dan privasi.
- `src/MapComponent.jsx` - Pemetaan geospasial real-time.

---

## 🤝 Kontribusi
Kami menyambut baik inovasi maupun perbaikan _bug_ dari para kontributor. Silakan lakukan Fork pada proyek ini dan ajukan _Pull Request_.

## 🔗 Live Deployments
Anda dapat mencoba langsung aplikasi ini:
**[https://safetana.vercel.app/](https://safetana.vercel.app/)**
