# Dokumen Kebutuhan Perangkat Lunak (SRS): SafeTana

## 1. Pendahuluan
### 1.1 Tujuan Penulisan Dokumen
Dokumen SKPL ini dibuat untuk merinci spesifikasi kebutuhan teknis dan fungsional dari aplikasi SafeTana. Dokumen ini digunakan oleh tim pengembang sebagai panduan implementasi, tim QA untuk pengujian, serta pemangku kepentingan untuk memvalidasi fitur yang dibangun.

### 1.2 Lingkup Masalah
SafeTana adalah platform mitigasi bencana terintegrasi berbasis AI dan layanan kesehatan mandiri yang dirancang untuk meningkatkan resiliensi masyarakat melalui monitoring bencana real-time (BMKG/GDACS) dan asisten cerdas untuk bantuan kesehatan darurat.

### 1.3 Definisi, Istilah dan Singkatan
*   **SafeTana:** Sistem Mitigasi Bencana Terintegrasi.
*   **Klinik AI:** Modul layanan kesehatan mandiri berbasis AI (Gemini & Null Claw).
*   **PWA (Progressive Web App):** Aplikasi web yang dapat diinstal dan berfungsi seperti aplikasi mobile dengan dukungan offline.
*   **Null Claw Agent:** Mesin AI lokal berbasis WebAssembly (Wasm) untuk pemrosesan data sensitif tanpa koneksi internet.
*   **N.O.M.A.D.:** Infrastruktur offline-first untuk distribusi pengetahuan bencana.
*   **GDACS:** Global Disaster Alert and Coordination System.
*   **BMKG:** Badan Meteorologi, Klimatologi, dan Geofisika.
*   **SATUSEHAT & BPJS:** Platform layanan kesehatan dan jaminan sosial nasional Indonesia.
*   **Fasyankes:** Fasilitas Pelayanan Kesehatan.
*   **PII Masking:** Teknik menyembunyikan informasi identitas pribadi (Nama, No HP) untuk keamanan data.
*   **Service Pattern:** Pola arsitektur yang memisahkan logika bisnis (AI, Geospasial) dari komponen UI.

### 1.4 Aturan Penomoran
*   **SKPL-F-XXX:** Untuk Kebutuhan Fungsional.
*   **SKPL-NF-XXX:** Untuk Kebutuhan Non-Fungsional.
*   **SKPL-D-XXX:** Untuk Kebutuhan Data.

### 1.5 Referensi
*   Dokumen Business Requirement Document (BRD) SafeTana.
*   Dokumentasi API Google Gemini & Groq AI.
*   Dokumentasi API DTO SATUSEHAT & VClaim BPJS Kesehatan.
*   Standar Penanggulangan Bencana UU No. 24 Tahun 2007.

### 1.6 Deskripsi Umum Dokumen (Ikhtisar)
Dokumen ini membahas landasan teknis SafeTana, spesifikasi platform, rincian kebutuhan antarmuka, hingga analisis proses bisnis dari kondisi saat ini menuju sistem yang diusulkan.

## 2. Deskripsi Umum Perangkat Lunak
### 2.1. Deskripsi Umum Sistem
SafeTana menghubungkan data bencana dari otoritas resmi (BMKG, GDACS) ke pengguna akhir melalui antarmuka peta interaktif. Selain informasi bencana, sistem menyediakan modul "Klinik AI" untuk bantuan kesehatan mandiri saat akses medis terbatas selama bencana, didukung dengan pencarian Fasyankes terdekat.

### 2.2. Platform Teknologi
**a. Spesifikasi Server:**
*   Hosting: Firebase Hosting & Vercel.
*   Backend: Firebase Cloud Functions (Node.js 20).
*   Database: Firestore (NoSQL) & Firebase Realtime DB untuk alerts.

**b. Spesifikasi Client:**
*   Engine: Modern Web Browser dengan dukungan PWA & WebAssembly (Wasm).
*   Storage: IndexedDB & Cache Storage untuk data offline N.O.M.A.D.

**c. Development Tools:**
*   Core: Vite, React 19.
*   Styling: Tailwind CSS 4.
*   AI Models: Google Gemini 1.5/2.0 Flash (Cloud), Null Claw Agent (Wasm/Local).
*   Maps: Leaflet.js dengan Tile Layer OpenStreetMap/Custom.
*   Security: Crypto-JS untuk enkripsi koordinat.

### 2.3. Karakteristik Pengguna
| No | Kategori Pengguna | Tugas |
|:---|:---|:---|
| 1 | Super User (Admin) | Mengelola data titik aman, memonitor log sistem, dan manajemen konten edukasi. |
| 2 | Masyarakat Umum | Memantau peta bencana, mencari titik evakuasi, mencari fasyankes terdekat, menggunakan Klinik AI. |
| 3 | Operator Lapangan | Melakukan update status titik aman/shelter secara real-time. |

### 2.4. Hak Akses Pengguna
| No | Pengguna | Kategori Pengguna | Hak Akses |
|:---|:---|:---|:---|
| 1 | Administrator | Super Administrator | Full akses (CRUD data bencana, user, dan konfigurasi sistem). |
| 2 | Petugas/Relawan | Administrator | Menambah dan mengubah data titik aman dan log kejadian. |
| 3 | Warga | User | Melihat data bencana, pencarian fasyankes, akses Klinik AI, dan melapor status SOS. |

### 2.5. Batasan
*   Aplikasi memerlukan akses internet untuk sinkronisasi data bencana terbaru dan integrasi layanan kesehatan nasional (kecuali modul offline N.O.M.A.D).
*   Akurasi lokasi bergantung pada sensor GPS perangkat pengguna.
*   Ketersediaan data bencana dan fasyankes bergantung pada uptime API pihak ketiga (BMKG, GDACS, BPJS, SATUSEHAT).

## 3. Deskripsi Umum Kebutuhan
### 3.1. Kebutuhan Antarmuka Eksternal
**3.1.1. Antarmuka Pemakai**
Antarmuka berbasis Web Responsif (PWA) dengan desain modern, mendukung Dark Mode (True Black), dan navigasi darurat.

**3.1.2. Antarmuka Perangkat Keras**
Smartphone atau PC yang memiliki koneksi internet dan sensor lokasi (GPS).

**3.1.3. Antarmuka Perangkat Lunak**
*   **Firebase SDK:** Autentikasi, Firestore, dan Messaging.
*   **Gemini API SDK:** Integrasi asisten kesehatan cerdas.
*   **Null Claw Bridge:** Penghubung JavaScript dan WebAssembly untuk AI lokal.
*   **Geolocation API:** Browser-native API untuk mendapatkan koordinat (WGS84).
*   **Security Utils:** Modul untuk encryptLocation (XOR-Base64/AES) dan maskPII.
*   **Health Proxy Service:** Modul khusus penanganan OAuth dan HMAC Signature untuk koneksi ke layanan BPJS dan SATUSEHAT.

**3.1.4. Antarmuka Komunikasi**
*   **HTTPS/TLS 1.3:** Protokol wajib untuk seluruh komunikasi client-server.
*   **WSS (Secure WebSocket):** Untuk update real-time peringatan dini.
*   **REST API Eksternal:** Integrasi endpoint BMKG (XML/JSON), GDACS, serta API DTO SATUSEHAT dan VClaim BPJS.

### 3.2. Kebutuhan Fungsional
**3.2.1. Spesifikasi Kebutuhan Umum**
| No | Kode SKPL | Parameter | Deskripsi |
|:---|:---|:---|:---|
| 1 | SKPL-F-001 | Real-time Sync | Aplikasi mampu menarik data bencana setiap 5 menit. |
| 2 | SKPL-F-002 | Geolocation | Aplikasi dapat menentukan lokasi pengguna untuk radius bahaya. |

**3.2.2. Spesifikasi Kebutuhan Fungsional (Lanjutan)**
| No | Kode SKPL | Modul/Deskripsi |
|:---|:---|:---|
| **A** | **Modul Mitigasi & Peta** | |
| 1 | SKPL-F-101 | Menampilkan titik gempa bumi terbaru di peta (Mag, Kedalaman, Tsunami). |
| 2 | SKPL-F-102 | Visualisasi Heatmap area rawan bencana. |
| 3 | SKPL-F-103 | "Safe Zone Finder" untuk menghitung rute terdekat menggunakan algoritma Haversine. |
| **B** | **Modul Klinik AI** | |
| 4 | SKPL-F-201 | Chatbot Cloud: Gemini 1.5/2.0 Flash untuk analitik dan konseling mendalam. |
| 5 | SKPL-F-202 | Chatbot Local: Null Claw Wasm untuk triase darurat saat offline. |
| 6 | SKPL-F-203 | Analitik Kesehatan: Memberikan skor resiliensi dari jurnal harian. |
| **C** | **Modul Layanan Kesehatan Nasional (Baru)** | |
| 7 | SKPL-F-401 | Direktori Fasyankes: Pencarian fasilitas pelayanan kesehatan terdekat berdasarkan data SATUSEHAT/BPJS. |
| 8 | SKPL-F-402 | Integrasi API: Layanan proksi back-end (Node.js) untuk menghubungkan otentikasi BPJS Kesehatan secara aman. |
| **D** | **Keamanan & Privasi** | |
| 9 | SKPL-F-301 | Enkripsi lokasi pengguna sebelum disimpan (Database Encryption at Rest). |
| 10| SKPL-F-302 | Otomatisasi masking PII pada dashboard admin. |

### 3.3. Kebutuhan Non Fungsional
| No | Parameter | Deskripsi |
|:---|:---|:---|
| 1 | Keamanan | Enkripsi lokasi (AES/Base64), proteksi XSS, dan SSL/TLS 1.3. Perlindungan akses API kesehatan menggunakan OAuth/HMAC. |
| 2 | Kinerja | Respon AI < 2 detik dan loading peta awal < 3 detik. |
| 3 | Ketersediaan | Uptime 99.9% menggunakan infrastruktur multi-region Firebase/Vercel. |
| 4 | Skalabilitas | Menangani hingga 10,000+ request per menit saat bencana. |
| 5 | Privasi | PII Masking di level Dashboard Admin dan Log Sistem. |
| 6 | Portabilitas | PWA cross-platform (Android, iOS, Desktop). |

### 3.4. Kebutuhan Data
| No | Nama Data | Sumber/Tujuan | Deskripsi |
|:---|:---|:---|:---|
| 1 | Data Bencana | BMKG / GDACS | Gempa, banjir, peringatan cuaca. |
| 2 | Data Titik Aman | GeoJSON (Internal) | Koordinat 61+ titik evakuasi. |
| 3 | Data Fasyankes | BPJS/SATUSEHAT | Koordinat, nama rumah sakit/klinik, status ketersediaan (*Baru*). |
| 4 | Profil Pengguna | Firebase Auth | Nama (Masked), Email, Notifikasi. |
| 5 | Jurnal Kesehatan| Firestore | Catatan mood dan skrining medis (Encrypted). |
| 6 | Kamus Medis | kamusData.json | Dataset offline untuk Null Claw. |
| 7 | Log Aktivitas | Firestore | Riwayat laporan SOS. |

## 4. Proses Bisnis Overview
### 4.1. Proses Bisnis As-Is
Masyarakat mendapatkan informasi bencana secara pasif dan terpisah-pisah, tanpa panduan langkah pencarian layanan medis secara real-time.

### 4.2. Analisis Proses Bisnis
Pemisahan data bencana dan fasyankes meningkatkan risiko korban jiwa. Diperlukan integrasi data bencana, panduan titik aman, serta ketersediaan data rumah sakit nasional dalam satu ekosistem tanggap darurat yang dilengkapi AI cerdas.

### 4.3. Proses Bisnis To-Be
Data Bencana Masuk ➔ Analisis Lokasi User ➔ Notifikasi Bahaya ➔ Rute Evakuasi (Safe Zone) ➔ Cek Rumah Sakit Terdekat via Direktori Fasyankes ➔ Bantuan Medis Pertama via Klinik AI ➔ Status Keamanan User Terlapor.
