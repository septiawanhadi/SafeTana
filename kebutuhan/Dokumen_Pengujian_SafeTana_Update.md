# Dokumen Pengujian SafeTana (Pembaruan Modul)

## 1. Pendahuluan

### 1.1 Tujuan Penulisan Dokumen
Tujuan penulisan dokumen persyaratan layanan pengujian ini adalah untuk merencanakan, mendokumentasikan, dan menjadi panduan jalannya pengujian perangkat lunak pada aplikasi SafeTana, khususnya pada fitur-fitur pembaruan terbaru (Klinik AI, Integrasi BPJS Kesehatan, dan Sinkronisasi SATUSEHAT). Dokumen ini ditujukan untuk digunakan oleh tim pengembang (Developer) dan tim penguji (Quality Assurance / QA).

### 1.2 Lingkup Masalah
Aplikasi SafeTana adalah sebuah platform kesehatan digital komprehensif yang memfasilitasi layanan skrining, pemetaan zonasi kesehatan, serta terintegrasi langsung dengan ekosistem kesehatan nasional. Fokus pengujian dokumen ini dibatasi pada fungsionalitas pembaruan baru, meliputi: mekanisme respon Klinik AI (State Transition), keamanan dan kelancaran akses API BPJS Kesehatan, serta alur pengiriman dan penerimaan data menggunakan standar SATUSEHAT (HL7 FHIR R4).

### 1.3 Definisi, Istilah dan Singkatan
- **PWA**: *Progressive Web App*, teknologi web app yang dapat diinstal dan berjalan layaknya aplikasi *native*.
- **AI**: *Artificial Intelligence*, sistem kecerdasan buatan (dalam konteks ini merujuk ke AI Cloud Gemini dan AI Local Null Claw).
- **BPJS**: Badan Penyelenggara Jaminan Sosial Kesehatan.
- **VClaim**: Sistem informasi layanan asuransi kesehatan dari BPJS.
- **SATUSEHAT**: Platform ekosistem integrasi layanan kesehatan nasional oleh Kementerian Kesehatan RI.
- **FHIR**: *Fast Healthcare Interoperability Resources*, standar pertukaran data kesehatan secara elektronik.
- **HMAC**: *Hash-based Message Authentication Code*, metode autentikasi berbasis kriptografi untuk verifikasi integritas komunikasi API.
- **AES**: *Advanced Encryption Standard*, standar enkripsi data.
- **STT**: *State Transition Testing*, metode pengujian berdasarkan perubahan state dalam aplikasi.

### 1.4 Aturan Penomoran
Aturan penomoran test case menggunakan format `STT-[KODE_MODUL]-[NOMOR_URUT]`. 
Contoh: `STT-KLN-001` (Klinik AI), `STT-BPJS-001` (Modul BPJS), `STT-SS-001` (Modul SATUSEHAT).

### 1.5 Referensi
- Dokumen Kebutuhan Perangkat Lunak (SKPL) Aplikasi SafeTana.
- Dokumentasi resmi API BPJS Kesehatan (VClaim v2.0).
- Dokumentasi resmi API SATUSEHAT Kemenkes RI (HL7 FHIR R4).
- Dokumen Rencana Pengujian Modul Sebelumnya (`Testing SafeTana.xlsx`).
- `Testing_SafeTana_Update.xlsx` / `Testing_SafeTana_Update.md`.

### 1.6 Deskripsi Umum Dokumen (Ikhtisar)
Dokumen ini disusun dalam 4 bab utama. Bab 1 Pendahuluan menjelaskan tujuan, lingkup dan istilah yang digunakan. Bab 2 memaparkan Lingkungan Pengujian yang dipersyaratkan. Bab 3 berisi Identifikasi dan Rencana Pengujian yang mencakup detail skenario dan tempat pelaporan hasil uji tiap test case. Bab 4 menyediakan ruang untuk Evaluasi Pengujian secara keseluruhan.

---

## 2. Lingkungan Pengujian

### 2.1. Perangkat Lunak Pengujian
- **Sistem Operasi Klien**: Windows 10/11, macOS, Android 10+, atau iOS 14+.
- **Browser Klien**: Google Chrome, Mozilla Firefox, Safari, atau Microsoft Edge versi terbaru (mendukung PWA dan Service Worker).
- **Alat Pendukung Pengujian API**: Postman / Thunder Client.
- **Sistem Operasi Server/Backend**: Environment berbasis Node.js / Vercel Serverless Functions.

### 2.2. Perangkat Keras Pengujian
- **PC / Laptop**: Spesifikasi standar yang mampu menjalankan peramban modern untuk mengakses web portal.
- **Smartphone / Tablet**: Digunakan khusus untuk menguji dukungan *Progressive Web App* (PWA) dan fungsionalitas Offline / Mode Pesawat (*Null Claw Fallback*).
- **Koneksi Jaringan**: Diperlukan jaringan internet aktif untuk uji fungsionalitas normal, serta opsi jaringan terputus untuk simulasi Offline Mode dan Timeout Server.

### 2.3. Sumber Daya Manusia
- **Software Tester / QA Engineer**: Mengeksekusi pengujian fungsional UI/UX, fungsional *state transition*, pencatatan *bug*, serta validasi error handling.
- **Backend / System Developer**: Mendampingi validasi log proxy server (HMAC / Enkripsi AES), pemantauan pertukaran data payload FHIR R4 di sisi server, serta perbaikan sistem.

---

## 3. Identifikasi dan Rencana Pengujian

### 3.1. Rencana Pengujian

| No | Modul yang di uji | Skenario | Hasil yang diharapkan | Metode Pengujian |
|:---:|:---|:---|:---|:---|
| 1 | Klinik AI | Konsultasi Klinik AI Online (Gemini) | Permintaan diproses di Cloud, AI merespon dengan panduan medis | Black Box / State Transition |
| 2 | Klinik AI | Konsultasi Klinik AI Offline (Null Claw) | Sistem mendeteksi offline, *fallback* AI lokal memberikan respon ringan | Black Box / State Transition |
| 3 | Layanan Integrasi BPJS | Cek Keaktifan BPJS (Valid NIK) | Autentikasi dan dekripsi berhasil, UI merender kartu status "AKTIF" | Black Box / API Testing |
| 4 | Layanan Integrasi BPJS | Handling NIK Tidak Valid | Sistem menampilkan peringatan *"Data tidak ditemukan"* dengan *graceful degradation* | Black Box / API Testing |
| 5 | Layanan Integrasi BPJS | Serverless Proxy Timeout | UI merender *fallback* dengan notif *"Layanan BPJS Sedang Sibuk"* | Black Box / Error Handling |
| 6 | Sinkronisasi SATUSEHAT | Skrining Kesehatan Sukses | Payload sukses terkirim ke Kemenkes, ID Kunjungan terbit di UI | Black Box / Integration Testing |
| 7 | Sinkronisasi SATUSEHAT | Direktori Fasyankes (Fallback) | UI mampu memuat data rumah sakit fiktif/lokal apabila API pusat *down* | Black Box / Fallback Testing |
| 8 | Sinkronisasi SATUSEHAT | Auto-Refresh Token SATUSEHAT | Sistem me-*retry* otomatis tanpa memunculkan error API ke *user* | Black Box / API Testing |

---

### 3.2. Hasil Pengujian

Pengujian Ke	:	________________________
Waktu Pengujian	:	________________________
Tempat			:	________________________

| No | Skenario Pengujian | Test Case | Hasil yang diharapkan | Hasil Pengujian |
|:---:|:---|:---|:---|:---|
| 1 | Konsultasi AI Online | STT-KLN-001 | State *Cloud Processing* berhasil, teks keluhan dibalas oleh AI Server. | [  ] Pass <br> [  ] Fail |
| 2 | Konsultasi AI Offline | STT-KLN-002 | Request *Cloud* gagal, State beralih ke *Local Fallback*, AI lokal membalas. | [  ] Pass <br> [  ] Fail |
| 3 | Cek Keaktifan BPJS | STT-BPJS-001 | HMAC & dekripsi AES sukses, UI memunculkan kartu "AKTIF". | [  ] Pass <br> [  ] Fail |
| 4 | Cek BPJS NIK Invalid | STT-BPJS-002 | API gagal (bukan 200), UI memunculkan peringatan data tidak ditemukan. | [  ] Pass <br> [  ] Fail |
| 5 | Timeout Layanan BPJS | STT-BPJS-003 | *Timeout* tertangkap, memunculkan *toast/alert* peringatan jaringan. | [  ] Pass <br> [  ] Fail |
| 6 | Submit Skrining SS | STT-SS-001 | OAuth token aman, payload Encounter & Condition sukses dikirim. | [  ] Pass <br> [  ] Fail |
| 7 | Load Fasyankes Offline | STT-SS-002 | Fungsi *bypass error* aktif, daftar RS dan Peta merender data lokal Jabar. | [  ] Pass <br> [  ] Fail |
| 8 | Expired Token SATUSEHAT| STT-SS-003 | *Retry* berjalan di *background*, *user* tidak mengalami gagal submit. | [  ] Pass <br> [  ] Fail |

---

## 4. Evaluasi Pengujian

*(Bagian ini disediakan untuk diisi oleh tim penguji setelah keseluruhan proses pengujian di atas telah diselesaikan)*

**Ringkasan Eksekutif:**
- **Persentase Keberhasilan:** ______ % (____ Test Case Berhasil / ____ Total Test Case)
- **Modul dengan Catatan Kritis:** _____________________________________________________

**Detail Temuan & Rekomendasi:**
1. ____________________________________________________________________________________
2. ____________________________________________________________________________________
3. ____________________________________________________________________________________

**Kesimpulan:**
[ ] Layak untuk di-deploy (Go-Live)
[ ] Membutuhkan perbaikan (Rework)
[ ] Lainnya: ______________________
