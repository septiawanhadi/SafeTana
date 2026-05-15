# Pembaruan Test Case: SafeTana (State Transition Testing)

Dokumen ini berisi penambahan *test case* untuk modul-modul terbaru di aplikasi SafeTana yang **belum tercakup** di dokumen pengujian (`Testing SafeTana.xlsx`) sebelumnya. Anda dapat menyalin tabel ini langsung ke dalam file Excel Anda.

## Modul 4: Klinik AI (PWA & Offline Null Claw)
Menggantikan modul *Telegram Bot* lama.
*Entitas: Sesi Konsultasi AI | Siklus State: Idle ➔ Cloud Processing (Gemini) ➔ Local Fallback (Null Claw) ➔ Responded*

| Test Case ID | Test Case Summary | Prerequisites | Test Steps | Test Data | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **STT-KLN-001** | Konsultasi Klinik AI Online (Gemini) | Pengguna login. Koneksi internet perangkat aktif. | 1. Buka Klinik AI.<br/>2. Ketik keluhan medis.<br/>3. Kirim. | Teks keluhan medis (misal: "Saya sesak napas karena debu gempa") | State berubah ke *Cloud Processing*. Request dikirim ke Gemini. AI memberikan panduan medis awal (*Responded*). | Not Executed |
| **STT-KLN-002** | Konsultasi Klinik AI Offline (Null Claw Fallback) | Pengguna login. Internet perangkat dimatikan (Offline Mode aktif). | 1. Buka Klinik AI.<br/>2. Kirim keluhan medis. | Teks keluhan medis | State *Cloud Processing* gagal. Sistem mendeteksi internet mati dan beralih ke *Local Fallback*. AI Lokal (Null Claw Wasm) memberikan respon medis ringan (*Responded*). | Not Executed |

## Modul 5: Layanan Integrasi BPJS Kesehatan (VClaim v2.0)
*Entitas: BPJS Proxy Request | Siklus State: Initiated ➔ HMAC Signing ➔ AES Decrypting ➔ Completed/Error*

| Test Case ID | Test Case Summary | Prerequisites | Test Steps | Test Data | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **STT-BPJS-001** | Cek Keaktifan BPJS (Valid NIK) | Server backend beroperasi. Kredensial VClaim di `.env` valid. | 1. Buka menu Kesehatan.<br/>2. Input NIK.<br/>3. Klik Cek BPJS. | NIK terdaftar (valid) | Backend berhasil membuat *HMAC signature*, menarik data API, dan sukses dekripsi AES-256. UI menampilkan status "AKTIF" dan rendering kartu digital. | Not Executed |
| **STT-BPJS-002** | Handling NIK Tidak Valid | Server backend beroperasi normal. | 1. Buka menu Kesehatan.<br/>2. Input NIK tidak terdaftar.<br/>3. Klik Cek. | NIK 16 digit acak | API Proxy gagal menemukan data (Meta Code != 200). UI menangkap error dengan *graceful degradation*, menampilkan pesan "Data tidak ditemukan" (State *Error*). | Not Executed |
| **STT-BPJS-003** | Serverless Proxy Timeout | Koneksi ke API VClaim terputus (down dari pihak server BPJS). | 1. Trigger pencarian saat endpoint pusat *down*. | NIK valid | Vercel Function *timeout*. UI merender *fallback UI* dengan toast peringatan "Layanan BPJS Sedang Sibuk / Gangguan Jaringan". | Not Executed |

## Modul 6: Sinkronisasi SATUSEHAT (HL7 FHIR R4)
*Entitas: FHIR Transaction | Siklus State: Form Filling ➔ OAuth Authenticating ➔ FHIR Posting ➔ Synced*

| Test Case ID | Test Case Summary | Prerequisites | Test Steps | Test Data | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **STT-SS-001** | Skrining Kesehatan Sukses | Akses Sandbox SATUSEHAT aktif (Client ID valid). | 1. Buka form Skrining.<br/>2. Isi parameter vital.<br/>3. Klik Submit. | Tensi 120/80, BB 70, TB 175 | OAuth token berhasil di-*generate*. Payload *Encounter*, *Observation*, dan *Condition* sukses dikirim ke Kemenkes. UI memunculkan ID Kunjungan. | Not Executed |
| **STT-SS-002** | Direktori Fasyankes (Fallback Mock Data Jabar) | API Master Sarana Kemenkes tidak stabil / *timeout*. | 1. Buka tab Direktori Fasyankes.<br/>2. Cari nama rumah sakit. | Keyword: "Hasan Sadikin" | Fungsi *fallback* tereksekusi. Sistem mem-bypass *fetch error* dan menarik titik koordinat RS Hasan Sadikin dari dataset sintetik lokal `mockFasyankesJabar.js`. Peta tetap terender normal. | Not Executed |
| **STT-SS-003** | Auto-Refresh Token SATUSEHAT | Token Bearer *expired* di memori server. | 1. Lakukan aksi simpan data ke SATUSEHAT. | Form valid | Proxy backend menyadari *response* 401 Unauthorized, lalu memicu request token OAuth baru dan melakukan transmisi ulang data (State *Auto-Retry*) tanpa melempar *error* ke *user*. | Not Executed |
