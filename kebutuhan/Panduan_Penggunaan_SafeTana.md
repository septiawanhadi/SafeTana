# Panduan Penggunaan dan Ringkasan Sistem: SafeTana

## 1. Pendahuluan
### 1.1 Tujuan Penulisan Dokumen
Dokumen ini disusun sebagai panduan komprehensif terkait tata cara penggunaan aplikasi SafeTana, serta memberikan gambaran teknis dan ringkasan fungsionalitas sistem. Dokumen ini ditujukan untuk digunakan oleh Pengguna Akhir (Masyarakat), Administrator Sistem, dan Tim Dukungan Teknis (*Technical Support*).

### 1.2 Lingkup Masalah
SafeTana adalah aplikasi *Progressive Web App* (PWA) komprehensif yang mengintegrasikan informasi peringatan dini kebencanaan (BMKG) dengan layanan kesehatan digital secara *real-time*. Aplikasi ini mencakup pemantauan cuaca, skrining kesehatan mandiri, pemantau suasana hati (*Mood Tracker*), konsultasi medis menggunakan *Klinik AI*, serta terintegrasi langsung ke sistem nasional BPJS Kesehatan dan rekam medis elektronik SATUSEHAT.

### 1.3 Definisi, Istilah dan Singkatan
*   **PWA**: *Progressive Web App*, teknologi web modern yang memungkinkan aplikasi diinstal dan diakses layaknya aplikasi *native* pada gawai pintar.
*   **BMKG**: Badan Meteorologi, Klimatologi, dan Geofisika.
*   **BPJS**: Badan Penyelenggara Jaminan Sosial Kesehatan.
*   **SATUSEHAT**: Platform integrasi data kesehatan nasional yang dikembangkan oleh Kementerian Kesehatan RI.
*   **AI**: *Artificial Intelligence* / Kecerdasan Buatan. Merujuk pada asisten medis virtual Gemini dan *Null Claw* di dalam sistem.
*   **FHIR**: *Fast Healthcare Interoperability Resources*, standar internasional yang dipakai Kemenkes untuk format pertukaran data medis.

### 1.4 Aturan Penomoran
Dokumen ini menggunakan sistem penomoran hierarkis numerik standar (misalnya 1, 1.1, 1.1.1) untuk menunjukkan struktur, bab, dan sub-bagian di dalam dokumen.

### 1.5 Referensi
*   Dokumen Kebutuhan Perangkat Lunak (SKPL / SRS) Aplikasi SafeTana.
*   Dokumen Arsitektur Teknis (`docs/technical_documentation_safetana.md`).
*   Dokumentasi Resmi API Terbuka BMKG, API VClaim BPJS v2.0, dan API SATUSEHAT (HL7 FHIR R4).

### 1.6 Deskripsi Umum Dokumen (Ikhtisar)
Sistematika dokumen ini terbagi atas 3 bab utama. Bab 1 memuat pendahuluan, definisi, dan referensi. Bab 2 menjabarkan Ringkasan Sistem, yang mencakup arsitektur/konfigurasi, tingkat hak akses, serta batasan ekosistem HW/SW. Terakhir, Bab 3 mengulas Petunjuk Penggunaan Aplikasi secara mendetail, yang memuat struktur menu, fungsi fitur, tutorial interaktif, *troubleshooting* (pesan eror), dan FAQ.

---

## 2. Ringkasan Sistem

### 2.1. Gambaran Umum Sistem
SafeTana merupakan sistem informasi hibrida yang menjembatani mitigasi bencana alam dan tindakan darurat kesehatan preventif. Sistem ini bekerja dengan menarik data cuaca/gempa secara *real-time* dari server BMKG dan memberikan notifikasi evakuasi. Pada lapisan kesehatan, sistem berfungsi sebagai *proxy* aman untuk berinteraksi dengan API BPJS Kesehatan (pengecekan status peserta) serta mengirimkan hasil skrining diagnostik secara aman ke *database* terpusat SATUSEHAT milik Kemenkes.

### 2.2. Konfigurasi Sistem
*   **2.2.1 Konfigurasi Perangkat Keras**: Menggunakan *Serverless Architecture* / komputasi awan (Vercel Node.js). Tidak menggunakan server *on-premise* yang berat.
*   **2.2.2 Konfigurasi Jaringan**: Menggunakan koneksi *broadband* dengan protokol HTTPS (Port 443) wajib untuk pengamanan transmisi data asimetris *API*.
*   **2.2.3 Konfigurasi Basis Data**: Integrasi eksternal menuju *Database* Kemenkes, dengan dukungan penyimpanan *Cache Lokal* (IndexedDB / LocalStorage / Service Worker) pada *browser* klien untuk operasional PWA luring (*offline*).

### 2.3. Level Akses Pengguna

| Kategori Pengguna | Tugas / Peran | Hak Akses ke Aplikasi |
| :--- | :--- | :--- |
| **Guest / Publik** | Mengakses informasi cuaca, peringatan gempa bumi dini, dan info edukasi dasar kebencanaan. | Akses terbatas pada Dasbor BMKG (*Homepage*) dan fitur Peta Zona Aman tanpa perlu *login*. |
| **Masyarakat (Terdaftar)** | Melakukan skrining mandiri, cek status BPJS, rekam jejak *Mood Tracker*, dan Konsultasi Klinik AI. | Akses penuh ke seluruh menu fungsionalitas di modul Kesehatan (*Health Dashboard*) dan Profil Pengguna. |
| **Administrator** | Memantau statistik lalu-lintas data aplikasi, manajemen API Keys, operasional server *proxy*. | *Dashboard Admin*, Konfigurasi integrasi sistem (Manajemen Token/Secret Key SATUSEHAT dan BPJS). |

### 2.4. Batasan
Batasan dan ketergantungan *software/hardware* dari sistem SafeTana:
*   **Ketergantungan Eksternal (API):** Aplikasi sangat bergantung pada server eksternal milik Pemerintah. Jika *server* pusat BMKG, Kemenkes, atau BPJS sedang *down*, fitur terkait hanya dapat menyajikan *Mock Data* atau mengalami interupsi.
*   **Standar Format Data:** Modul Sinkronisasi Kesehatan harus patuh terhadap struktur *Payload* JSON standar HL7 FHIR R4 agar lolos validasi server pusat SATUSEHAT.
*   **Platform Penggunaan:** Harus dijalankan pada *browser* modern dan mendukung standar ES6+ serta teknologi PWA.

### 2.5. Perangkat Lunak
Perangkat lunak (*Software*) minimum yang dibutuhkan di sisi Pengguna untuk mengoperasikan aplikasi ini adalah:
a. Sistem Operasi: Windows 10/11, macOS, Distribusi Linux, Android 10+, atau iOS 14+.
b. Browser: Google Chrome (Direkomendasikan), Mozilla Firefox, Microsoft Edge, atau Safari (Versi terbaru).

### 2.6. Perangkat Keras
Perangkat keras (*Hardware*) minimum yang dibutuhkan di sisi Pengguna untuk mengoperasikan aplikasi ini adalah:
a. *Mouse* atau panel layar sentuh (*Touchscreen*).
b. *Keyboard* fisik atau *Keyboard Virtual*.
c. Perangkat gawai (Ponsel pintar / Tablet) disarankan untuk kapabilitas terbaik mobilitas evakuasi bencana.

---

## 3. Petunjuk Penggunaan Aplikasi 

### 3.1 Petunjuk Instalasi
Aplikasi SafeTana didesain dengan teknologi web yang fleksibel (*PWA*), sehingga instalasi menjadi instan tanpa mengunduh *installer* konvensional:
1. Buka peramban (*browser*) pada PC atau gawai pintar Anda.
2. Masukkan alamat domain aplikasi SafeTana.
3. Tunggu hingga halaman selesai memuat. Pada sisi kanan *Address Bar* (PC) atau *Menu Opsi* titik tiga (Mobile), cari tombol bertuliskan **"Install App"** / **"Tambahkan ke Layar Utama"** (*Add to Homescreen*).
4. Klik **Install**. SafeTana akan muncul di laci aplikasi (*App Drawer*) perangkat Anda layaknya aplikasi biasa dan dapat bekerja *offline*.

### 3.2 Struktur Menu
*   **Beranda (Dasbor BMKG)**
*   **Pusat Kesehatan**
    *   Skrining SATUSEHAT
    *   Cek Kepesertaan BPJS
    *   Pemantau Emosi (*Mood Tracker*)
*   **Direktori Fasyankes**
*   **Klinik AI Terpadu**
*   **Akun & Pengaturan**

### 3.3 Fitur-fitur pada Aplikasi

**3.3.1 Fitur Dasbor Kebencanaan (BMKG)**
Menyajikan matriks informasi cuaca terkini, peringatan curah hujan tinggi, deteksi gempa bumi, serta peta jalur evakuasi zona aman berbasis *Geolocation*.

**3.3.2 Fitur Pengecekan BPJS**
Memungkinkan pengguna cukup dengan mengetik Nomor Induk Kependudukan (NIK) atau Nomor Kartu BPJS untuk secara otomatis menarik status masa aktif jaminan kesehatan dari pangkalan data VClaim BPJS.

**3.3.3 Fitur Skrining & Sync SATUSEHAT**
Alat input pemeriksaan klinis harian. Parameter (seperti tekanan darah, berat badan, dsb) dapat disimpan agar terintegrasi menjadi jejak Rekam Medis Elektronik sah di bawah akun Kemenkes pengguna.

**3.3.4 Fitur Klinik AI Hibrida (Gemini & Null Claw)**
Asisten *chat* medis. Ketika pengguna terkoneksi internet lancar, AI di komputasi awan (*Gemini*) akan merespons detail analitis. Saat internet darurat terputus total, AI *Offline* lokal (*Null Claw*) akan mengambil alih untuk panduan krusial *First-Aid* (P3K).

### 3.4 Tutorial Penggunaan Aplikasi
**Cara Menggunakan Cek BPJS:**
1. Masuk (*login*) ke Aplikasi SafeTana.
2. Dari menu Navigasi, pilih **Pusat Kesehatan**.
3. Klik tombol / kartu menu **Cek Kepesertaan BPJS**.
4. Ketikkan 16 digit NIK Anda di kolom yang tersedia.
5. Klik **Periksa**. Layar akan menampilkan kartu digital BPJS beserta tulisan "AKTIF" atau "TIDAK AKTIF".

**Cara Berkonsultasi via Klinik AI:**
1. Dari menu Navigasi, pilih ikon **Klinik AI**.
2. Anda akan dihadapkan dengan antarmuka seperti aplikasi *Chat*.
3. Pada kotak teks di bawah, ketikkan keluhan, contoh: *"Cara menangani anak demam paska banjir"*.
4. Tekan ikon pesawat kertas (Kirim). AI akan langsung membalas langkah medis yang akurat dan ringkas.

### 3.5 Instructions for Errors (Daftar Kesalahan dan Penanganan)

| Pesan Eror di Layar | Indikasi Kesalahan | Cara Penanganan |
| :--- | :--- | :--- |
| **"Data Pasien Tidak Ditemukan"** | NIK yang diinput salah ketik, atau memang belum pernah terdaftar di server BPJS. | Pastikan 16 angka NIK sudah presisi. Hubungi kantor cabang BPJS jika yakin NIK benar tetapi tetap gagal. |
| **"Koneksi Timeout / Server BPJS Sedang Sibuk"** | Sistem API BPJS / Kemenkes sedang kelebihan beban lalu lintas (*Traffic*) atau pemeliharaan sistem. | Sistem SafeTana berjalan normal, namun server pusat Kemenkes kewalahan. Tunggu sekitar 15 - 30 menit, lalu coba kembali. |
| **"Gagal Autentikasi / Token Expired"** | Durasi sesi token API SATUSEHAT telah usang di *backend*. | Secara umum *backend* akan melakukan *Auto-Retry*. Jika tetap gagal, silakan *refresh/muat ulang* halaman peramban Anda. |
| **"Beralih ke AI Darurat P3K"** | Perangkat Anda sama sekali tidak memiliki koneksi Internet (Mode Luring). | Sistem PWA bekerja dengan baik. Gunakan AI Darurat yang lebih ringan fungsinya. Untuk hasil detail, hidupkan kembali koneksi WiFi/Data. |
| **"Harap Izinkan Akses Lokasi"** | Izin GPS ditolak oleh peramban saat hendak mencari Fasyankes terdekat. | Klik ikon gembok pada URL atas *Browser*, izinkan fitur *Location*, lalu segarkan laman. |

### 3.6 Frequently Asked Questions (FAQ)

**T: Kenapa harus login untuk akses pusat kesehatan?**
J: Regulasi kerahasiaan medis yang ketat mengharuskan sistem menjamin data pemeriksaan BPJS & SATUSEHAT terkait erat dengan identitas individual demi keamanan siber data pribadi.

**T: Apakah aplikasi ini aman karena menyimpan data NIK saya?**
J: SafeTana menggunakan teknologi enkripsi AES-256 dan hanya bersifat menjembatani (sebagai *gateway*). Kami tidak menyebarkan profil kesehatan Anda ke pihak manapun selain otoritas medis resmi Kemenkes.

**T: Bagaimana jika ada ancaman bencana saat saya tidak membuka aplikasi?**
J: Selama Anda telah memberikan izin *Push Notification* dan sudah menginstal *SafeTana PWA* di perangkat, peringatan dini BMKG akan muncul sebagai notifikasi mendadak (*Pop-up*) di layar gawai Anda.
