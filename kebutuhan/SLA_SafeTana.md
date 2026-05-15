# Dokumen Service Level Agreement (SLA): SafeTana

## 1. Pendahuluan
### 1.1 Tujuan Penulisan Dokumen
Tujuan penulisan dokumen *Service Level Agreement* (SLA) ini adalah untuk mendefinisikan dan menyepakati tingkat jaminan kualitas layanan teknis aplikasi SafeTana yang diberikan oleh Tim Pengembang (Penyedia Layanan) kepada Pengguna Akhir dan Pemangku Kepentingan (*Stakeholders*). Dokumen ini menjadi standar tolak ukur objektif dalam mengevaluasi kinerja operasional dan ketersediaan aplikasi.

### 1.2 Lingkup Masalah
SafeTana merupakan aplikasi terpadu integrasi layanan kesehatan digital dan peringatan dini mitigasi bencana alam. Ruang lingkup SLA ini mencakup jaminan operasional pada fitur inti sistem (Dasbor Bencana, Klinik AI, Integrasi BPJS/SATUSEHAT), keandalan lapis infrastruktur *serverless*, serta pedoman waktu penanganan masalah (eskalasi) apabila terjadi *bug*, gangguan teknis, atau *downtime*.

### 1.3 Definisi, Istilah dan Singkatan
*   **SLA**: *Service Level Agreement*, kesepakatan tingkat layanan antara penyedia dan pengguna.
*   **Availability (Ketersediaan)**: Persentase waktu (Uptime) di mana layanan dapat diakses dengan normal.
*   **Reliability (Keandalan)**: Tingkat kemampuan sistem untuk memproses perintah dengan akurat tanpa interupsi kesalahan (*error-free*).
*   **Performance (Kinerja)**: Kecepatan respons aplikasi dalam memproses dan mengirimkan timbal balik ke pengguna.
*   **Severity Level**: Tingkat keparahan dari sebuah insiden/gangguan sistem.
*   **Response Time**: Waktu maksimal yang dijanjikan oleh *technical support* untuk mulai merespons tiket aduan/insiden.
*   **Resolution Time**: Waktu maksimal yang dibutuhkan untuk menuntaskan perbaikan gangguan.
*   **SATUSEHAT / BPJS / BMKG**: Pihak ketiga penyedia *Application Programming Interface* (API) eksternal.

### 1.4 Aturan Penomoran
Aturan penomoran SLA ini menggunakan hierarki angka desimal standar (1, 1.1, 1.1.1, dst).

### 1.5 Referensi
*   Dokumen *Software Requirements Specification* (SRS) / SKPL Aplikasi SafeTana.
*   Dokumentasi SLA Eksternal dari Kemenkes RI (Platform SATUSEHAT) dan BPJS Kesehatan (VClaim).
*   SLA Standar penyedia layanan *Cloud Hosting* (Vercel) dan Pangkalan Data (Supabase/Firebase).

### 1.6 Deskripsi umum Dokumen (Ikhtisar)
Dokumen ini disusun mulai dari Bab 1 Pendahuluan; Bab 2 merinci target metrik SLA (Ketersediaan, Keandalan, Kinerja) dari dimensi Aplikasi dan Infrastruktur; Bab 3 membahas level keparahan (*Severity*) masalah beserta prioritas waktu penyelesaiannya; Bab 4, 5, dan 6 mencakup kebijakan manajemen perubahan/pembaruan, standar keamanan data medis, serta mekanisme pelaporan evaluasi kinerja secara berkala.

---

## 2. Service Level Agreement

### 2.1. Aplikasi
Berikut adalah target kualitas operasional untuk fungsi perangkat lunak (*Software*):

| No | Layanan / Modul Aplikasi | Waktu Kerja Layanan | Service Availability | Service Reliability | Service Performance |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | **Dasbor Peringatan Dini BMKG** | 24 Jam x 7 Hari | 99.5% | 99.0% | Pemuatan laman Peta & Cuaca < 3 Detik |
| 2 | **Klinik AI (Cloud Gemini)** | 24 Jam x 7 Hari | 99.0% | 98.5% | *Response Time* Asisten AI < 5 Detik |
| 3 | **Klinik AI Darurat (*Offline Null Claw*)** | Tergantung kondisi perangkat gawai | 99.9% | 99.5% | Transisi mode luring & eksekusi instan tanpa *delay* |
| 4 | **Integrasi API Kepesertaan BPJS** | Mengikuti *Uptime* Server BPJS Pusat | 98.0% | 98.0% | Pengecekan NIK dan dekripsi kartu < 4 Detik (jika pusat stabil) |
| 5 | **Skrining & Transmisi FHIR SATUSEHAT**| Mengikuti *Uptime* Server Kemenkes | 98.0% | 99.0% | Pengiriman JSON *Payload* dan generasi ID Kunjungan < 3 Detik |

### 2.2. Layanan Infrastruktur Pendukung
Berikut adalah target kualitas operasional jaringan, server *hosting*, dan pangkalan data:

| No | Layanan Infrastruktur | Waktu Kerja Layanan | Service Availability | Service Reliability | Service Performance |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | **Serverless Hosting / Frontend (Vercel)** | 24 Jam x 7 Hari | 99.99% | 99.5% | Latensi CDN domestik rata-rata < 100ms |
| 2 | **Database Engine (Storage/Auth)** | 24 Jam x 7 Hari | 99.95% | 99.9% | Operasi *Read/Write* kueri < 50ms per transaksi |
| 3 | **DNS Routing & Keamanan SSL/TLS** | 24 Jam x 7 Hari | 99.99% | 100% | Sertifikat keamanan HTTPS otomatis diperbarui tanpa gangguan |

---

## 3. Layanan Pelanggan dan Eskalasi Masalah
Segala bentuk gangguan sistem akan diklasifikasikan dan ditangani berdasarkan metrik *Severity Level*:

| Severity Level | Deskripsi | Contoh Kasus | Prioritas Penanganan | Target Response Time | Target Resolution Time |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Severity-1 (Kritis)** | Insiden fatal yang menyebabkan sistem utama (*Core System*) mati total (*Down*), atau terjadi kebocoran keamanan privasi tingkat tinggi. | Server *Hosting* tidak bisa diakses sama sekali (Error 502/503), Indikasi pembobolan sandi *database*. | **Mendesak (*Urgent*)** - Alokasi penuh semua *engineer*. | 15 Menit | < 4 Jam |
| **Severity-2 (Tinggi)** | Sebagian fitur vital aplikasi gagal berfungsi berulang kali, berdampak pada terputusnya aliran operasional skala besar. (*Partial Outage*). | Gagal memuat Peta Fasyankes secara massal, Transmisi API SATUSEHAT ditolak server terus-menerus. | **Tinggi (*High*)** | 30 Menit | < 12 Jam |
| **Severity-3 (Sedang)** | Penurunan performa sistem (*Slow/Lag*) atau *error* fitur pendukung yang tidak memblokir fungsionalitas esensial. | Grafik *Mood Tracker* rusak visualnya, sistem pencarian AI agak lambat merespon. | **Sedang (*Medium*)** | 2 Jam | < 2 x 24 Jam |
| **Severity-4 (Rendah)** | Ketidaksempurnaan antarmuka (*UI/UX Bug*), *typo* huruf, atau permohonan bimbingan teknis (*user support*). | Perbaikan warna tombol di layar HP yang tidak sejajar, konsultasi penggunaan aplikasi. | **Rendah (*Low*)** | 24 Jam | < 7 Hari Kerja (Atau disisipkan pada siklus pembaruan berikutnya) |

---

## 4. Manajemen Perubahan
Perubahan struktural pada aplikasi (seperti rilis fitur besar, pembaruan skema *Database*, transisi versi API) harus mengikuti protokol operasional agar SLA tetap terjaga:
1. Setiap kode baru wajib melewati tahapan *Testing* (*Quality Assurance*) di sistem UAT/*Staging* sebelum diterbitkan ke publik (*Production*).
2. Segala bentuk implementasi yang menyebabkan penghentian layanan sementara (*Downtime*) wajib dijadwalkan pada "Jendela Pemeliharaan" (*Maintenance Window*) jam non-sibuk, yakni pada pukul **00.00 WIB hingga 04.00 WIB**.
3. Pemberitahuan akan ditampilkan di laman depan aplikasi selambat-lambatnya **2x24 Jam** sebelum *Maintenance* berskala besar dilakukan.

## 5. Security
Keamanan data (terutama privasi rekam medis) merupakan fokus prioritas utama operasional:
1. **Enkripsi Kriptografi:** Komunikasi pertukaran data API dibungkus oleh perlindungan berlapis menggunakan HMAC Signature rahasia dan Enkripsi AES-256 (sesuai mandat keamanan BPJS dan SATUSEHAT).
2. **Koneksi Anonim:** *Payload* ke sistem nasional dirutekan melalui *Backend Proxy (Serverless Functions)*. Data rahasia kredensial API tidak akan pernah bocor dan tidak terekspos di sisi peramban klien.
3. **Pencadangan Berkesinambungan:** Basis data internal dicadangkan secara berkala (Harian) ke server *Disaster Recovery* untuk memastikan tidak ada data profil terhapus secara permanen bila terjadi insiden Server.

## 6. Pelaporan dan Review
Untuk menjamin tingkat layanan, performa SafeTana akan ditinjau secara berkala melalui langkah-langkah berikut:
1. **Laporan Ketersediaan (*Uptime Report*):** Diekstraksi otomatis sebulan sekali menggunakan alat *Automated Ping Monitoring* eksternal.
2. **Rapat Evaluasi Berkala:** Evaluasi target metrik resolusi dan keluhan (*Severity Tickets*) dilaksanakan internal setiap akhir triwulan.
3. **Audit Eksternal:** Menjalankan audit sertifikasi FHIR secara tahunan untuk mematuhi regulasi interoperabilitas digital Kementerian Kesehatan terbaru.
