# 🛡️ SafeTana AI
> **"Cerdas Berbagi, Sigap Mitigasi"** > *Sistem Mitigasi Bencana Terintegrasi Berbasis AI & Real-Time Geospatial Data.*

---

## 📌 Tentang SafeTana AI
SafeTana AI adalah platform progresif yang dirancang untuk memperkuat resiliensi masyarakat terhadap bencana alam. Dengan menggabungkan data real-time dari **BMKG**, pelacakan lokasi pengguna secara anonim, dan mesin kecerdasan buatan (**Gemini AI**), SafeTana memberikan deteksi dini yang hiper-lokal dan strategi mitigasi yang personal.

## ✨ Fitur Unggulan

### 🤖 AI Early Detection Engine (Spatial Matrix)
SafeTana tidak hanya menampilkan berita, tapi **memahami risiko Anda**. Menggunakan algoritma *Haversine*, AI kami menghitung jarak antara koordinat Anda dengan titik bencana (Threat Matrix) untuk memberikan instruksi keselamatan yang instan dan akurat.

### 📍 Live User Tracking & SOS System
* **Anonymous ID**: Melacak status keamanan warga tanpa mewajibkan login yang rumit saat darurat.
* **Real-time SOS**: Satu sentuhan untuk memberi tahu Pusat Komando (BPBD) bahwa Anda membutuhkan evakuasi segera.

### 📡 Location-Based Broadcasting
Pusat Komando dapat mengirimkan instruksi darurat secara massal yang hanya akan muncul pada perangkat pengguna yang berada di dalam radius bahaya (Filter Spasial di sisi klien).

### 🗺️ Interactive Disaster Map
Visualisasi data gempa (BMKG) dan cuaca ekstrem secara real-time dengan pemetaan titik aman (Evacuation Zones) di sekitar wilayah Bandung dan sekitarnya.

## 🛠️ Tech Stack
- **Frontend**: [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/) (Fast Refresh & Optimized)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Modern & Responsive UI)
- **Database & Real-time**: [Firebase Firestore](https://firebase.google.com/)
- **Intelligence**: [Google Gemini AI API](https://ai.google.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Maps**: [Leaflet.js](https://leafletjs.com/)

## 🚀 Instalasi & Pengembangan

1. **Clone Repository**
```bash
   git clone [https://github.com/septiawanhadi/safetana.git](https://github.com/septiawanhadi/safetana.git)
   cd safetana
```
   
2. **Install Dependensi**
```bash
   npm install
```

3. **Konfigurasi Environment**
```bash
  VITE_FIREBASE_API_KEY=your_key
  VITE_GEMINI_API_KEY=your_key
```

4. **Menjalankan Aplikasi**
```bash
   npm run dev
```

---
📂 Struktur Proyek
- src/App.jsx - Main Dashboard & Haversine Logic.
- src/AiChatbot.jsx - Intelligence engine dengan Spatial Threat Matrix.
- src/CommandCenter.jsx - Panel otoritas untuk monitoring warga & broadcast.
- src/MapComponent.jsx - Layer visualisasi bencana dan lokasi user.

🤝 Kontribusi
Kami sangat terbuka untuk kontribusi dalam meningkatkan algoritma deteksi dini atau penambahan fitur evakuasi lainnya. Silakan lakukan Pull Request atau ajukan Issue.

SafeTana AI - Menjaga Keselamatan Melalui Kecerdasan Data. 