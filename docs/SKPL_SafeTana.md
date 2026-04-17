# SKPL - Spesifikasi Kebutuhan Perangkat Lunak
## Proyek: SafeTana - Solusi Digital Mitigasi & Monitoring Bencana Terpadu

---

| Identifikasi | Informasi |
| :--- | :--- |
| **Versi Dokumen** | 1.0.0 |
| **Tanggal** | 17 April 2026 |
| **Status** | Draft Final |
| **Penyusun** | Antigravity AI Engine (Google Deepmind) |

---

## DAFTAR ISI
1. [Pendahuluan](#1-pendahuluan)
2. [Deskripsi Umum](#2-deskripsi-umum)
3. [Kebutuhan Antarmuka Eksternal](#3-kebutuhan-antarmuka-eksternal)
4. [Kebutuhan Fungsional](#4-kebutuhan-fungsional)
5. [Kebutuhan Non-Fungsional](#5-kebutuhan-non-fungsional)

---

## 1. PENDAHULUAN

### 1.1 Tujuan
Dokumen ini bertujuan untuk merincikan spesifikasi kebutuhan aplikasi **SafeTana**, sebuah platform web progresif yang berfokus pada mitigasi bencana, edukasi keselamatan, dan dukungan kesehatan mental pasca bencana bagi masyarakat Indonesia.

### 1.2 Ruang Lingkup
SafeTana mencakup sistem monitoring gempa real-time (BMKG), pemantauan banjir lokal (Bandung via PetaBencana), sistem edukasi kesiap-siagaan, navigasi zona aman, serta klinik kesehatan berbasis AI (Null Claw & Gemini).

### 1.3 Definisi dan Istilah
- **FCM**: Firebase Cloud Messaging, layanan pengiriman notifikasi.
- **Null Claw**: Framework AI Agen lokal berbasis Zig/Wasm untuk privasi data kesehatan.
- **PetaBencana**: Sumber data laporan banjir berbasis komunitas.
- **SKPL**: Spesifikasi Kebutuhan Perangkat Lunak.

---

## 2. DESKRIPSI UMUM

### 2.1 Perspektif Produk
SafeTana adalah aplikasi *Independent Web App* yang mengintegrasikan berbagai API data pemerintah dan komunitas ke dalam satu antarmuka yang modern (Bento UI & Glassmorphism).

### 2.2 Fungsi Produk
1. Monitoring gempa bumi dan peringatan tsunami.
2. Monitoring titik banjir real-time di wilayah Bandung Raya.
3. Manajemen titik zona aman (Safe Zones).
4. Konseling kesehatan dan diagnosa awal via AI.
5. Tracker jurnal emosi (Mood Tracker) untuk pemulihan psikologis.

### 2.3 Karakteristik Pengguna
- **Masyarakat Umum (User)**: Akses monitoring, edukasi, dan layanan kesehatan.
- **Admin/Petugas**: Manajemen data zona aman dan monitoring pusat komando.

---

## 3. KEBUTUHAN ANTARMUKA EKSTERNAL

### 3.1 Antarmuka Pengguna (UI)
- Menggunakan pendekatan **True Black Dark Mode** untuk efisiensi daya pada perangkat OLED.
- Antarmuka responsif (Mobile-First) dengan navigasi bawah (Bottom Navigation).

### 3.2 Antarmuka Perangkat Lunak (API)
| Nama API | Fungsi |
| :--- | :--- |
| **BMKG API** | Data gempa bumi terkini dan M0-5. |
| **PetaBencana.id** | Data titik banjir wilayah Bandung. |
| **Firebase SDK** | Autentikasi, Firestore DB, dan Cloud Messaging. |
| **Google Gemini API** | Otak AI untuk chatbot kesehatan mode Cloud. |
| **Null Claw (Wasm)** | Engine AI lokal untuk privasi medis. |

---

## 4. KEBUTUHAN FUNGSIONAL

### 4.1 Dashboard Bencana (Monitoring)
- **F-01**: Sistem harus dapat menampilkan gempa terbaru beserta parameter kekuatan (M) dan kedalaman.
- **F-02**: Sistem harus memvisualisasikan titik banjir Bandung dengan indikator status (Kuning/Merah).

### 4.2 Klinik Kesehatan AI
- **F-03**: Chatbot harus mendukung mode **Private (Local)** menggunakan Null Claw Bridge.
- **F-04**: Sistem harus mampu menganalisis tren Mood Jurnal selama 30 hari terakhir.

### 4.3 Peta & Navigasi
- **F-05**: Sistem harus dapat menampilkan lokasi pengguna dan rute menuju Safe Zone terdekat.
- **F-06**: Tombol SOS untuk akses cepat ke nomor darurat.

---

## 5. KEBUTUHAN NON-FUNGSIONAL

### 5.1 Keamanan (Security)
- Semua kunci API harus disimpan dalam variabel lingkungan (`.env`).
- Data medis harus dapat diproses secara lokal (Edge AI) untuk meminimalisir kebocoran data.

### 5.2 Performa
- Kecepatan muat halaman utama kurang dari 3 detik pada koneksi 4G.
- Respons AI lokal (Null Claw) harus di bawah 200ms untuk triase awal.

### 5.3 Ketersediaan (Availability)
- Aplikasi harus tetap menyediakan fungsi dasar (seperti peta zona aman dan instruksi medis darurat) meskipun dalam keadaan offline (pWA).
