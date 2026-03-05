# 🛡️ SafeTana AI
> **"Cerdas Berbagi, Sigap Mitigasi"**
> *Sistem Mitigasi Bencana Terintegrasi Berbasis AI & Real-Time Geospatial Data.*

---

## 📌 Tentang SafeTana AI
SafeTana AI adalah platform progresif yang dirancang untuk memperkuat resiliensi masyarakat terhadap bencana alam. Dengan menggabungkan data real-time, pelacakan lokasi pengguna secara anonim, dan mesin kecerdasan buatan (**Gemini AI**), SafeTana memberikan deteksi dini yang hiper-lokal, strategi mitigasi yang personal, dan alat komando darurat bagi pihak berwenang.

## ✨ Fitur Utama

### 🤖 AI Early Detection Engine (Spatial Threat Matrix)
SafeTana mengintegrasikan **Gemini AI** untuk memahami risiko bencana di lokasi Anda. Chatbot kami tidak hanya sekadar menjawab pertanyaan, tetapi membaca koordinat Anda dan memberikan instruksi keselamatan serta mitigasi yang instan, akurat, dan sangat relevan dengan ancaman sekitar Anda.

### 📍 Live User Tracking & SOS System
* **Anonymous Tracking**: Memantau lokasi dan status keamanan pengguna secara *real-time* tanpa mewajibkan proses login yang rumit saat terjadi keadaan darurat.
* **Status Updates & SOS**: Pengguna dapat dengan mudah memperbarui status mereka (Aman / Butuh Evakuasi) hanya dengan satu klik.

### 📡 Location-Based Broadcasting
Dilengkapi dengan fitur **Command Center** untuk peran admin. Pihak berwenang dapat mengirimkan notifikasi darurat (broadcast) secara massal yang ditargetkan secara spesifik kepada pengguna yang berada di dalam zona bahaya (radius tertentu dari titik bencana).

### 🗺️ Interactive Disaster Map (Real-Time)
Memvisualisasikan lokasi pengguna yang sedang aktif beserta status keamanan mereka (termasuk peringatan SOS) pada antarmuka peta interaktif yang disajikan menggunakan *Leaflet*.

### 📚 Education & News Dashboard
Platform ini juga menyediakan portal edukasi panduan mitigasi komprehensif serta informasi berita bencana terkini, membangun kesadaran dan kesiapsiagaan masyarakat jangka panjang.

## 🛠️ Tech Stack
- **Frontend**: [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Backend Services**: [Firebase Firestore](https://firebase.google.com/) & Firebase Cloud Functions
- **AI Engine**: [Google Gemini AI API](https://ai.google.dev/)
- **Maps**: [Leaflet.js](https://leafletjs.com/) + React Leaflet

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
```bash
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
## 📂 Struktur Proyek
- `src/App.jsx` - Main Dashboard, sistem pelacakan lokasi (*Haversine*), dan pendeteksi status keamanan (*SOS/Safe*).
- `src/AiChatbot.jsx` - Chatbot AI cerdas dengan kemampuan *Spatial Threat Matrix* (Gemini AI).
- `src/CommandCenter.jsx` - Dashboard Admin untuk pelacakan warga dan pengiriman *broadcast* pelacakan spasial (Cloud Functions).
- `src/MapComponent.jsx` - Komponen pemetaan spasial dan visualisasi koordinat *real-time*.
- `src/EducationDashboard.jsx` & `src/NewsDashboard.jsx` - Portal edukasi mitigasi dan integrasi berita.
- `src/ReportForm.jsx` - Pengumpulan laporan/informasi situasi dari pengguna.
- `src/AdminLogin.jsx` - Portal masuk khusus otoritas komando.

## 🤝 Kontribusi
Kami sangat terbuka untuk kontribusi dalam meningkatkan algoritma deteksi dini, penambahan sumber data BMKG langsung, atau penyempurnaan alur evakuasi. Silakan lakukan *Pull Request* atau ajukan *Issue*.

## 🔗 Live Demo
Anda dapat mencoba langsung aplikasi SafeTana AI melalui tautan berikut:

**https://safetana-56tx4unuc-septiis-projects.vercel.app/**

**SafeTana AI - Menjaga Keselamatan Melalui Kecerdasan Data.**