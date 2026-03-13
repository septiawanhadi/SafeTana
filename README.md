# 🛡️ SafeTana AI & Klinik AI (SagaHealth)
> **"Cerdas Berbagi, Sigap Mitigasi, & Peduli Kesehatan"**
> *Sistem Mitigasi Bencana Terintegrasi Berbasis AI & Platform Layanan Kesehatan Mandiri.*

---

## 📌 Tentang SafeTana AI
SafeTana AI adalah platform progresif yang dirancang untuk memperkuat resiliensi masyarakat terhadap bencana alam dan krisis kesehatan. Dengan menggabungkan pemetaan data geospasial real-time, kecerdasan buatan (**Gemini AI**), dan modul layanan medis prediktif (**Klinik AI/SagaHealth**), platform ini memberikan perlindungan menyeluruh—baik dari ancaman alam maupun risiko kesehatan personal.

---

## ✨ Fitur Utama Mitigasi Bencana (SafeTana)

### 🤖 AI Early Detection Engine & Voice Assistant (TTS)
SafeTana mengintegrasikan **Gemini AI** untuk memahami risiko bencana di lokasi Anda secara spesifik. Chatbot cerdas kami dapat memandu evakuasi dan kini dilengkapi dengan fitur **Text-to-Speech (TTS)**—suara asisten virtual yang membacakan rute peringatan dengan lantang.

### 📍 Live User Tracking & SOS System
* **Anonymous Tracking**: Memantau lokasi dan status keamanan pengguna secara *real-time* menggunakan algoritma Haversine.
* **Status Updates & SOS**: Pengguna dapat dengan mudah memperbarui status (Aman / Butuh Evakuasi) hanya dengan satu klik.

### 🗺️ Peta Bencana Live & Titik Aman Terpadu
Visualisasi peta interaktif 24/7 menggunakan *Leaflet* yang menampilkan titik bencana dari sumber terpercaya (GDACS, BMKG) beserta **61 Titik Kumpul Evakuasi Terpadu** di wilayah Bandung, lengkap beserta panduan jarak spesifik ke setiap Fasilitas Kesehatan.

### 📡 Command Center & Location-Based Broadcasting
Dashboard komando bagi pihak berwenang untuk melacak dan mengirimkan notifikasi peringatan massal (dibacakan secara otomatis via Voice Assistant) kepada korban di zona bahaya secara spesifik.

---

## ⚕️ Fitur Utama Kesehatan (Klinik AI / SagaHealth)
*Terintegrasi penuh di bawah rute `/health` menggunakan Firebase Authentication Tersentralisasi.*

### 📋 Skrining Kesehatan Mandiri (Rule-Based Expert System)
Sistem Penilaian Cerdas (Client-Side) yang dapat mengevaluasi kondisi pasien secara instan berdasarkan parameter medis:
- **Kalkulasi IMT (BMI)** untuk risiko berat badan berlebih & obesitas.
- **Deteksi Pra-Hipertensi** melalui input tekanan Sistolik/Diastolik.
- Analisis indikasi gangguan pernapasan, riwayat penyakit keluarga, dan tingkat stres mental.
Sistem akan langsung memberikan **Kartu Hasil Skrining dengan saran medis deterministik**.

### 📊 Catatan Jurnal & Mood Tracker 30 Hari
Layanan log psikologis harian yang didukung dengan **Dashboard Analitik Personal**:
- Menghitung rentetan **Hari Aktif Jurnal (Streaks)**.
- Menentukan **Emosi/Mood Dominan** dalam sebulan terakhir.
- Memberikan skor rata-rata tingkat kebahagiaan untuk memantau fluktuasi _mental health_.

### 💬 Sagabot (Health AI Assistant)
Chatbot interaktif khusus untuk layanan kesehatan. Pengguna dapat menanyakan gejala medis umum, rekomendasi gaya hidup, atau akses darurat RS dengan antarmuka chatting yang intuitif.

---

## 🛠️ Tech Stack
- **Frontend**: [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [React Router](https://reactrouter.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database, Auth & Backend**: [Firebase Firestore](https://firebase.google.com/) & [Firebase Authentication](https://firebase.google.com/docs/auth)
- **AI Engine Utama**: [Google Gemini AI API](https://ai.google.dev/) (Untuk Chatbot Evaluasi Bencana)
- **Maps**: [Leaflet.js](https://leafletjs.com/) + React Leaflet

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
Buat file `.env` di root folder dengan variabel berikut untuk mengakses Firebase & Gemini:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. **Menjalankan Aplikasi**
```bash
npm run dev
```

---

## 📂 Struktur Proyek Terkini
- `src/App.jsx` - Main Routing, Navbar, Pelacakan Lokasi, dan Peta Pusat.
- `src/components/health/*` - **[NEW]** Komponen SagaHealth: `HealthDashboard`, `HealthAuth`, `HealthScreening`, `MoodTracker`, dan `HealthChatbot`.
- `src/AiChatbot.jsx` - Chatbot AI Bencana (Gemini AI).
- `src/CommandCenter.jsx` & `src/AdminLogin.jsx` - Dashboard Otoritas.
- `src/MapComponent.jsx` - Komponen pemetaan geospasial *real-time*.
- `src/EducationDashboard.jsx` & `src/NewsDashboard.jsx` - Portal edukasi dan integrasi berita.

## 🤝 Kontribusi
Kami menyambut baik inovasi maupun perbaikan _bug_ dari para kontributor. Silakan lakukan Fork pada proyek ini dan ajukan _Pull Request_.

## 🔗 Live Deployments
Anda dapat mecoba langsung aplikasi ini:
**https://safetana.vercel.app/**

<<<<<<< HEAD
*(Untuk mencoba fitur SagaHealth, silakan klik tombol `Klinik AI` di pojok kanan atas layar).*
=======
**https://safetana.vercel.app/**

**SafeTana AI - Menjaga Keselamatan Melalui Kecerdasan Data.**
>>>>>>> f1529c736a3fbb89bdec8be756c2ddd692cea90b
