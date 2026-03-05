SafeTana AI - Cerdas Berbagi, Sigap Mitigasi
SafeTana AI adalah platform mitigasi bencana cerdas berbasis web yang dirancang untuk meningkatkan resiliensi masyarakat terhadap potensi bencana alam. Dengan mengintegrasikan data real-time dari otoritas resmi dan analisis kecerdasan buatan, aplikasi ini memberikan peringatan dini yang akurat, personal, dan berbasis lokasi.

🌟 Fitur Utama
1. Dashboard Monitoring Real-Time
Update Bencana Terkini: Integrasi otomatis dengan API BMKG untuk data gempa bumi dan Open-Meteo untuk kondisi cuaca ekstrem.

Peta Interaktif: Visualisasi titik bencana, lokasi aman (safe zones), dan posisi pengguna menggunakan react-leaflet.

Tracking Lokasi Aktif: Pemantauan lokasi pengguna secara anonim untuk memetakan sebaran warga di area terdampak.

2. AI Early Detection Engine (Gemini AI)
Spatial Threat Matrix: Analisis risiko otomatis menggunakan algoritma Haversine untuk menghitung jarak antara lokasi pengguna dengan titik bencana terdekat.

Asisten Mitigasi Pintar: Chatbot interaktif berbasis Google Gemini AI yang memberikan panduan keselamatan spesifik berdasarkan matriks ancaman di sekitar pengguna.

3. Sistem Peringatan & SOS
Location-Based Broadcasting: Sistem siaran pesan darurat dari pusat komando yang hanya akan muncul jika pengguna berada dalam radius bahaya tertentu.

Tombol SOS: Fitur darurat satu-klik untuk mengirimkan sinyal "Butuh Evakuasi" ke pusat komando secara real-time melalui Firebase.

4. Pusat Komando (Admin)
Monitoring Warga: Dashboard khusus otoritas untuk melihat sebaran pengguna dan status keamanan mereka (Aman/Butuh Evakuasi).

Kendali Informasi: Fitur untuk menyebarkan instruksi evakuasi langsung ke perangkat warga yang terdampak.

🛠️ Teknologi yang Digunakan
Core: React.js 19 & Vite (Rolldown).

Styling: Tailwind CSS 4 & Lucide React Icons.

Database & Real-time: Firebase (Firestore & Cloud Messaging).

Mapping: Leaflet & React-Leaflet.

AI: Google Generative AI (Gemini SDK).

Data Sources: BMKG API & Open-Meteo API.

🚀 Cara Menjalankan Project
Clone Repository

Bash
git clone https://github.com/septiawanhadi/safetana.git
cd safetana
Install Dependensi

Bash
npm install
Konfigurasi Environment
Buat file .env di root direktori dan masukkan API Key yang diperlukan (Firebase & Gemini AI).

Menjalankan Aplikasi

Bash
npm run dev
SafeTana AI dikembangkan untuk mendukung upaya BPBD dalam digitalisasi manajemen bencana di wilayah Jawa Barat.