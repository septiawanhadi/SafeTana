# Dokumen Skenario Pengujian Keseluruhan - SafeTana

Dokumen ini berisi kumpulan test case komprehensif untuk aplikasi **SafeTana**, disusun menggunakan berbagai metode pengujian seperti *State Transition Testing, End-to-End (E2E), PWA/Offline, API, Security,* dan *Load Testing*. Pengujian ini memvalidasi transisi antar status (*state*) dari berbagai entitas di dalam sistem, memastikan aplikasi berperilaku sesuai alur bisnis yang didefinisikan, dan menguji ketahanan fungsionalitas secara menyeluruh.

---

## Tabel Identifikasi Status (State Identification Table)

Tabel di bawah ini mendefinisikan seluruh status (*state*) utama yang ada di dalam ekosistem SafeTana, deskripsi kondisinya, dan ke arah mana status tersebut diizinkan untuk bertransisi (*Valid Next State*).

| Nama Status (State) | Entitas / Modul | Deskripsi Kondisi | Status Berikutnya yang Valid |
| :--- | :--- | :--- | :--- |
| **Unverified** | Akun Pengguna | Akun baru diregistrasi namun belum memverifikasi email/OTP. | Active |
| **Active** | Akun Pengguna | Akun yang sudah diverifikasi dan dapat mengakses fitur aplikasi secara normal. | Suspended |
| **Suspended** | Akun Pengguna | Akun dibekukan sementara atau permanen oleh sistem/admin karena pelanggaran. | Active (Jika pemulihan disetujui) |
| **Draft** | Laporan Bencana | Laporan sedang disusun (form diisi) oleh pelapor dan belum disubmit. | Verifying |
| **Verifying** | Laporan Bencana | Laporan berhasil dikirim dan menunggu pemeriksaan manual oleh verifikator/admin. | Processing, Rejected |
| **Processing** | Laporan Bencana | Laporan terverifikasi valid dan saat ini sedang ditangani oleh tim lapangan. | Completed |
| **Completed** | Laporan Bencana | Penanganan lapangan selesai dilakukan dan tiket laporan telah ditutup. | *(End State)* |
| **Rejected** | Laporan Bencana | Laporan ditolak oleh admin (misal: duplikat, tidak relevan, atau hoaks). | *(End State)* |
| **Aman (Siaga 4)** | Status Lokasi EWS | Kondisi normal, parameter sensor berada di bawah ambang batas waspada. | Waspada (Siaga 3) |
| **Waspada (Siaga 3)** | Status Lokasi EWS | Potensi awal ancaman terdeteksi, parameter sensor melewati threshold waspada. | Siaga (Siaga 2), Aman (Siaga 4) |
| **Siaga (Siaga 2)** | Status Lokasi EWS | Ancaman berpotensi membahayakan, tahap persiapan peringatan darurat. | Awas (Siaga 1), Waspada (Siaga 3) |
| **Awas (Siaga 1)** | Status Lokasi EWS | Kondisi bahaya kritis yang mewajibkan evakuasi (misal banjir besar/gempa destruktif). | Siaga (Siaga 2) |
| **Idle** | Telegram Bot (AI) | Bot standby dan tidak memproses antrean pesan (menunggu interaksi baru). | AI Processing |
| **AI Processing** | Telegram Bot (AI) | Sistem sedang melakukan inferensi atas instruksi pengguna via Vercel & Groq/Gemini. | Responded, Closed (Jika Error) |
| **Responded** | Telegram Bot (AI) | Bot berhasil mengembalikan teks balasan ke sesi chat pengguna. | Idle |

---

## 1. Modul Autentikasi & Manajemen Akun
**Entitas:** Akun Pengguna | **Siklus State:** Unverified ➔ Active ➔ Suspended

| Test Case ID | Deskripsi Pengujian | Prerequisites | Test Steps | Test Data | Expected Result | Status | Created By | Executed By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **STT-AUTH-001** | Transisi akun Unverified ke Active | Pengguna baru saja mendaftar dan menerima email verifikasi. | 1. Buka link verifikasi atau masukkan OTP.<br>2. Klik "Verifikasi Akun". | Token verifikasi valid. | Status berubah menjadi *Active*. Pengguna dapat login. | Pass | QA Engineer | Septiawan |
| **STT-AUTH-002** | Penolakan transisi dengan Token Expired | Akun Unverified dengan token kedaluwarsa. | 1. Buka link verifikasi yang lewat batas waktu (>24 jam). | Token kedaluwarsa. | Sistem menolak. Muncul pesan "Token Expired". Status tetap *Unverified*. | Pass | QA Engineer | Septiawan |
| **STT-AUTH-003** | Transisi Active menjadi Suspended | Akun *Active*. Admin telah login. | 1. Buka Manajemen Pengguna.<br>2. Pilih akun terkait.<br>3. Klik "Suspend Account". | Alasan: Spam laporan. | Status berubah menjadi *Suspended*. Pengguna tidak dapat login. | Fail | QA Engineer | Septiawan |
| **STT-AUTH-004** | Pencegahan Bypass Suspended ke Active | Akun berstatus *Suspended*. | 1. Lakukan reset password.<br>2. Coba login kembali dengan password baru. | Password baru valid. | Reset berhasil, namun login ditolak karena status tetap *Suspended*. | Pass | QA Engineer | Septiawan |

## 2. Modul Pelaporan Bencana (Disaster Reporting)
**Entitas:** Tiket Laporan Bencana | **Siklus State:** Draft ➔ Verifying ➔ Processing ➔ Completed / Rejected

| Test Case ID | Deskripsi Pengujian | Prerequisites | Test Steps | Test Data | Expected Result | Status | Created By | Executed By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **STT-RPT-001** | Transisi valid Draft ke Verifying | Pelapor login, memiliki draf laporan. | 1. Isi form laporan.<br>2. Klik "Kirim Laporan". | Foto, Titik Koordinat, Deskripsi. | Laporan terkirim, status menjadi *Verifying*. Muncul notifikasi sukses. | In Progress | QA Engineer | Septiawan |
| **STT-RPT-002** | Transisi valid Verifying ke Processing | Laporan *Verifying*. Verifikator login. | 1. Buka daftar verifikasi.<br>2. Klik "Setujui & Proses Laporan". | ID Laporan: RPT-101 | Status menjadi *Processing*, masuk ke dashboard tim lapangan BNPB/BPBD. | In Progress | QA Engineer | Septiawan |
| **STT-RPT-003** | Transisi valid Verifying ke Rejected | Laporan *Verifying*. Verifikator login. | 1. Buka daftar verifikasi.<br>2. Klik "Tolak Laporan" dan isi alasan. | Alasan: "Foto tidak relevan". | Status menjadi *Rejected*. Pelapor mendapat notifikasi penolakan. | In Progress | QA Engineer | Septiawan |
| **STT-RPT-004** | Transisi valid Processing ke Completed | Laporan *Processing*. Tim Lapangan login. | 1. Buka detail tugas.<br>2. Klik "Tandai Selesai" dan unggah foto bukti. | Foto bukti penanganan. | Status menjadi *Completed*. Tiket ditutup. | In Progress | QA Engineer | Septiawan |
| **STT-RPT-005** | Invalid transisi Bypass Draft ke Processing | Pelapor login, membuat draf. | 1. Intercept request payload.<br>2. Ubah atribut "status" menjadi "Processing". | Payload dimanipulasi via API Tools. | API mengembalikan Error 400/403. Transaksi dibatalkan. | Not Executed | QA Engineer | - |

## 3. Modul Peringatan Dini & Status Lokasi (EWS)
**Entitas:** Status Bahaya Lokasi | **Siklus State:** Aman ➔ Waspada ➔ Siaga ➔ Awas

| Test Case ID | Deskripsi Pengujian | Prerequisites | Test Steps | Test Data | Expected Result | Status | Created By | Executed By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **STT-EWS-001** | Peningkatan status Aman ke Waspada | Terhubung API Sensor. Status Aman. | 1. Simulasikan webhook dari sensor melewati Threshold 1. | Debit air: 100 cm | Status menjadi *Waspada*. Indikator UI berubah Kuning. | Not Executed | QA Engineer | - |
| **STT-EWS-002** | Peningkatan Waspada melompat ke Awas | Status Waspada. Cuaca memburuk mendadak. | 1. Simulasikan webhook melampaui Threshold 3 secara tiba-tiba. | Debit air: 350 cm | Status langsung *Awas*. Notifikasi darurat dikirim. UI berubah Merah. | Not Executed | QA Engineer | - |
| **STT-EWS-003** | Penurunan status Awas ke Aman | Status Awas. Banjir surut. | 1. Simulasikan payload normalisasi selama >12 jam. | Debit air normal >12 jam. | Status kembali ke *Aman*. UI Hijau/Biru kembali. | Not Executed | QA Engineer | - |

## 4. Modul Telegram Bot (AI Counseling)
**Entitas:** Chat Session | **Siklus State:** Idle ➔ AI Processing ➔ Responded ➔ Closed

| Test Case ID | Deskripsi Pengujian | Prerequisites | Test Steps | Test Data | Expected Result | Status | Created By | Executed By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **STT-BOT-001** | Transisi Idle ke AI Processing | Bot *Idle*. Buka chat Telegram. | 1. Ketik pesan bantuan ke bot. | Input: "Tolong kebanjiran". | State berubah ke *AI Processing*. Indikator typing muncul. | Not Executed | QA Engineer | - |
| **STT-BOT-002** | Transisi AI Processing ke Responded | Sedang memproses via Groq API. | 1. Tunggu respon Groq <2 detik.<br>2. Kirim balasan ke Telegram. | Response sukses 200 OK. | Pesan terkirim. State menjadi *Responded* lalu kembali ke *Idle*. | Not Executed | QA Engineer | - |
| **STT-BOT-003** | Fallback Groq Down ke Gemini | Konfigurasi dual-AI aktif. | 1. Simulasikan matinya API Groq (timeout/error 500). | Response 500 Groq. | Otomatis me-request ke Gemini. Balasan dikirim dari Gemini. | Not Executed | QA Engineer | - |
| **STT-BOT-004** | State Timeout pada Vercel Function | Kedua LLM timeout lambat. | 1. Simulasikan respon lambat melebihi batas 10 detik. | Timeout API > 10 detik. | Eksekusi dihentikan. Bot mengirim pesan error fallback default. | Not Executed | QA Engineer | - |

## 5. Modul End-to-End (E2E) - User Journey
**Fokus:** Memvalidasi integrasi fungsional di antarmuka web (Browser).

| Test Case ID | Deskripsi Pengujian | Prerequisites | Test Steps | Test Data | Expected Result | Status | Created By | Executed By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **E2E-MAP-001** | Visualisasi peta dan rute evakuasi | Akun *Active*, GPS diizinkan. | 1. Buka Peta Bencana.<br>2. Klik titik bencana.<br>3. Klik "Cari Rute Evakuasi". | Koordinat simulasi (Jakarta). | Rute (polyline) menuju shelter terdekat tergambar di Leaflet. | Not Executed | QA Engineer | - |
| **E2E-KLINIK-001**| Sesi penuh Klinik AI (Cloud) | Akun *Active*, internet stabil. | 1. Buka Klinik AI.<br>2. Mulai Skrining.<br>3. Jawab AI & Akhiri. | Input: "Saya merasa cemas". | AI memberikan skor resiliensi. Jurnal tersimpan ke Firestore. | Not Executed | QA Engineer | - |

## 6. Modul PWA & Offline State
**Fokus:** Menguji kapabilitas aplikasi saat koneksi internet terputus secara mendadak.

| Test Case ID | Deskripsi Pengujian | Prerequisites | Test Steps | Test Data | Expected Result | Status | Created By | Executed By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PWA-OFF-001** | Akses aplikasi Offline | App ter-cache Service Worker. | 1. Matikan internet.<br>2. Muat ulang halaman. | - | Tampil indikator "Offline Mode". Aset UI/CSS/JS tidak rusak. | Not Executed | QA Engineer | - |
| **PWA-OFF-002** | Klinik AI lokal (Null Claw) | Null Claw Wasm sudah diunduh. | 1. Buka Klinik AI offline.<br>2. Ketik input medis darurat. | Input medis dasar. | Wasm mengeksekusi kamus data lokal tanpa error koneksi. | Not Executed | QA Engineer | - |
| **PWA-SYNC-001**| Background Sync data SOS | Sistem offline. | 1. Buat Laporan SOS.<br>2. Nyalakan internet kembali. | Form laporan terisi. | Saat online, laporan otomatis tersinkronisasi ke server (Draft/Verifying). | Not Executed | QA Engineer | - |

## 7. Modul API & Integration (BMKG & GDACS)
**Fokus:** Memastikan sistem berhasil menarik data dari pihak ketiga tanpa kegagalan.

| Test Case ID | Deskripsi Pengujian | Prerequisites | Test Steps | Test Data | Expected Result | Status | Created By | Executed By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **API-EXT-001** | Penarikan data BMKG | Backend berjalan normal. | 1. Trigger fungsi cron sinkronisasi.<br>2. Cek database Firestore. | URL Endpoint BMKG. | Data ter-parse, masuk Firestore dengan parameter lengkap. | Not Executed | QA Engineer | - |
| **API-EXT-002** | Error Handling GDACS API | Backend berjalan normal. | 1. Simulasikan GDACS error 504. | Mock HTTP 504. | Sistem tidak crash. Error tercatat, peta pakai data cache (Graceful Degradation). | Not Executed | QA Engineer | - |

## 8. Modul Security & Data Privacy
**Fokus:** Menguji standar keamanan enkripsi dan pelindungan data PII warga.

| Test Case ID | Deskripsi Pengujian | Prerequisites | Test Steps | Test Data | Expected Result | Status | Created By | Executed By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-ENC-001** | Enkripsi Koordinat (At Rest) | Pengirim form laporan valid. | 1. Intercept payload koordinat pelaporan. | Koordinat: -6.20, 106.81 | Payload dan DB tersimpan dalam string Base64/AES terenkripsi. | Not Executed | QA Engineer | - |
| **SEC-PII-001** | PII Masking Dashboard Admin | Terdapat 1 pelaporan dari warga. | 1. Login sebagai Admin.<br>2. Buka Detail Laporan. | Nama: "Budi Santoso", No: "0812345678" | Nama tampil termasking (B*** S***) dan No HP (081234****). | Not Executed | QA Engineer | - |
| **SEC-DB-001** | Firestore Security Rules | Punya token user biasa. | 1. Request API akses `/system_logs`. | Access token user. | Akses ditolak (Error 403 Permission Denied). | Not Executed | QA Engineer | - |

## 9. Modul Geolocation & Mocking Test
**Fokus:** Memanipulasi lokasi sensor untuk memastikan fungsi radius bahaya presisi.

| Test Case ID | Deskripsi Pengujian | Prerequisites | Test Steps | Test Data | Expected Result | Status | Created By | Executed By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GEO-RAD-001** | Notifikasi dalam radius bahaya | Bencana di Jakarta Pusat. | 1. Ubah mock GPS ke Jakarta Pusat.<br>2. Reload aplikasi. | Jarak < 5km dari titik. | Push notification bahaya terkirim, UI merah. | Not Executed | QA Engineer | - |
| **GEO-RAD-002** | Aman di luar radius | Bencana di Jakarta Pusat. | 1. Ubah mock GPS ke Bandung.<br>2. Reload aplikasi. | Jarak > 100km dari titik. | Status lokasi aman, tidak ada notifikasi palsu terkirim. | Not Executed | QA Engineer | - |

## 10. Modul Load & Scalability Testing
**Fokus:** Menguji ketahanan beban tinggi sesuai SKPL-NF-004.

| Test Case ID | Deskripsi Pengujian | Prerequisites | Test Steps | Test Data | Expected Result | Status | Created By | Executed By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **LOAD-API-001**| Stress Test Endpoint Pelaporan | Endpoint SOS aktif. | 1. Tembakkan 10.000 HTTP POST via JMeter/k6 selama 1 menit. | 10k request payload ringan. | Success rate >= 99%. Tidak ada limit database. Waktu respon < 5s. | Not Executed | QA Engineer | - |

---

## Keterangan Status Test Case
*   **Pass (Berhasil):** Hasil nyata (actual result) sesuai dengan hasil yang diharapkan (expected result).
*   **Fail (Gagal):** Hasil nyata tidak sesuai dengan yang diharapkan (ditemukan bug/error).
*   **Blocked (Terblokir):** Pengujian terhenti karena faktor eksternal atau bug di fitur sebelumnya (dependency issue).
*   **Not Executed (Belum Dijalankan):** Test case sudah dibuat namun belum dieksekusi oleh QA.
*   **In Progress (Dalam Proses):** Pengujian sedang berlangsung saat ini.
*   **Skipped (Dilewati):** Tidak dijalankan pada siklus ini karena fitur tidak berubah/relevan.
*   **Retest (Uji Ulang):** Verifikasi perbaikan bug setelah status sebelumnya dinyatakan Fail.
