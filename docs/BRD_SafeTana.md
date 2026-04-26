# Dokumen Persyaratan Layanan (Business Requirement Document) - SafeTana

## DAFTAR PERUBAHAN
| Revisi | Deskripsi | Tanggal |
| :--- | :--- | :--- |
| A | Pengembangan Core Mitigasi & Peta (BMKG, GDACS, Leaflet) | 10 Maret 2026 |
| B | Integrasi Klinik AI & Gemini Assistant (Skrining Kesehatan) | 25 Maret 2026 |
| C | Arsitektur Service Pattern & Keamanan (Encryption, PII Masking) | 05 April 2026 |
| D | Integrasi Local AI (Null Claw Wasm) & Offline-First (N.O.M.A.D.) | 12 April 2026 |
| E | Finalisasi Dual AI (Gemini + Groq) & Integrasi Telegram Bot | 18 April 2026 |
| F | Optimalisasi UI (True Black Dark Mode) & PWA Readiness | 20 April 2026 |
| G | Penyusunan BRD & Finalisasi Draft SKPL | 22 April 2026 |

## INDEX
| TGL | - | A | B | C | D | E | F | G |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Ditulis oleh** | Septiawan Hadi | [v] | [v] | [v] | [v] | [v] | [v] | [v] |
| **Diperiksa oleh** | Restu Utami | [v] | [v] | [v] | [v] | [v] | [v] | [v] |
| **Disetujui oleh** | Kepala Dinas | [v] | [v] | [v] | [v] | [v] | [v] | [v] |

## Daftar Halaman Perubahan
| Halaman | Revisi | Halaman | Revisi |
| :--- | :--- | :--- | :--- |
| 1-5 | A | 10-12 | E |
| 6-8 | B | 1-15 | F |
| 9-10 | C | Semua | G |
| 11 | D | | |


---

## Daftar Isi
1. [Pendahuluan](#1-pendahuluan)
2. [Latar Belakang](#2-latar-belakang)
3. [Dasar Hukum](#3-dasar-hukum)
4. [Maksud dan Tujuan](#4-maksud-dan-tujuan)
5. [Pelaksana Pembangunan Aplikasi](#5-pelaksana-pembangunan-aplikasi)
6. [Target/sasaran yang ingin dicapai](#6-targetsasaran-yang-ingin-dicapai)
7. [Manfaat / Business Value](#7-manfaat--business-value)
8. [Analisis Kelayakan Pembangunan Aplikasi](#8-analisis-kelayakan-pembangunan-aplikasi)
9. [Proses Bisnis Layanan](#9-proses-bisnis-layanan)
10. [Ruang Lingkup aplikasi / Business requirement](#10-ruang-lingkup-aplikasi--business-requirement)
11. [Output](#11-output)
12. [Biaya](#12-biaya)
13. [Waktu](#13-waktu)

---

## 1. Pendahuluan
### 1.1 Tujuan Penulisan Dokumen
Dokumen ini disusun untuk merinci kebutuhan bisnis dan fungsional dari aplikasi **SafeTana**. Dokumen ini akan digunakan oleh tim pengembang, pemangku kepentingan (stakeholders), dan pihak manajemen sebagai acuan utama dalam pembangunan dan evaluasi sistem.

### 1.2 Lingkup Masalah
**SafeTana** adalah platform mitigasi bencana terintegrasi berbasis AI dan layanan kesehatan mandiri yang dirancang untuk meningkatkan resiliensi masyarakat terhadap bencana alam dan krisis kesehatan melalui monitoring real-time dan bantuan cerdas.

### 1.3 Definisi, Istilah dan Singkatan
*   **SafeTana**: Sistem Mitigasi Bencana Terintegrasi.
*   **Klinik AI**: Modul layanan kesehatan mandiri di dalam SafeTana.
*   **Gemini AI**: Engine kecerdasan buatan dari Google yang digunakan untuk asisten cerdas.
*   **GDACS**: Global Disaster Alert and Coordination System.
*   **BMKG**: Badan Meteorologi, Klimatologi, dan Geofisika.
*   **SOS**: Signal Of Distress / Layanan darurat.

### 1.4 Aturan Penomoran
Penomoran fitur menggunakan format `BR-XXX` untuk Business Requirements dan `F-XX` untuk Functional Requirements.

### 1.5 Referensi
*   Dokumen SKPL SafeTana v1.0.0.
*   Dokumentasi API Google Gemini.
*   Panduan Integrasi BMKG & PetaBencana.id.

### 1.6 Deskripsi umum Dokumen (Ikhtisar)
Dokumen ini membahas landasan pembangunan SafeTana, analisis kelayakan dari berbagai aspek, hingga rincian fitur yang akan diimplementasikan untuk mencapai target efisiensi mitigasi bencana.

---

## 2. Latar Belakang
Indonesia merupakan negara yang berada di wilayah *Ring of Fire*, membuatnya sangat rentan terhadap bencana alam seperti gempa bumi dan banjir. Selain itu, akses terhadap layanan kesehatan dan dukungan mental pasca bencana seringkali terbatas. SafeTana hadir untuk menutup celah tersebut dengan menyediakan teknologi pemantauan real-time dan asisten AI yang dapat diakses dengan mudah oleh masyarakat.

---

## 3. Dasar Hukum
1.  **UU No. 24 Tahun 2007** tentang Penanggulangan Bencana.
2.  **Peraturan Pemerintah No. 21 Tahun 2008** tentang Penyelenggaraan Penanggulangan Bencana.
3.  **UU No. 11 Tahun 2008 (ITE)** terkait penyelenggaraan sistem elektronik.

---

## 4. Maksud dan Tujuan
Maksud dari pembangunan SafeTana adalah untuk menciptakan ekosistem digital yang tangguh dalam menghadapi bencana. Tujuannya adalah memberikan peringatan dini yang akurat, mempermudah akses lokasi evakuasi, dan menyediakan layanan kesehatan mental serta fisik bagi terdampak bencana.

---

## 5. Pelaksana Pembangunan Aplikasi
Pembangunan aplikasi dilaksanakan secara mandiri oleh Tim Internal SafeTana yang dipimpin oleh **Septiawan Hadi Prasetyo** (Lead Developer) dan didukung oleh tim ahli pengembang perangkat lunak.

---

## 6. Target/sasaran yang ingin dicapai
1.  Terintegrasinya data bencana dari minimal 3 sumber utama (BMKG, GDACS, PetaBencana) dalam 6 bulan.
2.  Tersedianya informasi 60+ titik aman evakuasi di wilayah pilot project (Bandung).
3.  Waktu respon asisten AI untuk triase kesehatan di bawah 2 detik.

---

## 7. Manfaat / Business Value
### 7.1 Intangible Value
*   Meningkatkan rasa aman di tengah masyarakat.
*   Meningkatkan kesadaran dan literasi mitigasi bencana.
*   Membangun kepercayaan publik terhadap efisiensi layanan darurat digital.

### 7.2 Tangible Value
*   Mengurangi waktu respon evakuasi hingga 30% melalui navigasi titik aman yang presisi.
*   Menurunkan beban fasilitas kesehatan melalui screening mandiri berbasis AI.
*   Target penggunaan oleh 10,000+ warga di wilayah rawan bencana pada tahun pertama.

---

## 8. Analisis Kelayakan Pembangunan Aplikasi
### 8.1 Analisis Kelayakan Teknis
**Risiko Berhubungan dengan Kefamilieran dengan Aplikasi: Resiko Rendah**
*   Tim pengembang memiliki pengalaman dalam membangun sistem geospasial dan integrasi API pihak ketiga.

**Risiko Berhubungan dengan Kefamilieran dengan Teknologi: Resiko Rendah**
*   Tim menguasai React, Firebase, dan integrasi Google Gemini AI.
*   Infrastruktur cloud (Vercel/Firebase) sudah siap digunakan.

**Risiko berhubungan dengan Ukuran Project: Risiko Rendah**
*   Project dikerjakan oleh tim kecil yang lincah (Agile) dengan estimasi waktu pengembangan 6-8 bulan.

**Kompatibilitas dengan sistem dan infrastruktur yang ada: Risiko Rendah**
*   Aplikasi dibangun berbasis Web (PWA) sehingga sangat kompatibel dengan berbagai perangkat mobile pengguna saat ini.

### 8.2 Analisis Kelayakan Ekonomi
*   **Return on Investment (ROI)**: Estimasi penghematan biaya operasional penanggulangan bencana sebesar 25% dalam 3 tahun.
*   **Break-even point (BEP)**: 1.8 tahun.
*   **Total Manfaat Ekonomi**: Efisiensi biaya distribusi informasi darurat yang sebelumnya manual/terpencar.

### 8.3 Analisis Kelayakan Organisasi
Resiko rendah. SafeTana selaras dengan visi strategis pemerintah dalam digitalisasi layanan publik dan peningkatan keamanan nasional dari aspek kebencanaan.

---

## 9. Proses Bisnis Layanan
### 9.1 Proses Bisnis Saat Ini (As-Is)
Masyarakat mendapatkan informasi bencana dari media massa atau pengumuman manual, yang seringkali terlambat dan tidak memberikan instruksi spesifik lokasi titik aman terdekat secara personal.

### 9.2 Proses Bisnis Usulan (To-Be)
Sistem secara otomatis mendeteksi bahaya -> Memberikan notifikasi personal -> Mengarahkan pengguna ke titik aman terdekat -> Menyediakan layanan kesehatan pasca evakuasi via AI.

---

## 10. Ruang Lingkup aplikasi / Business requirement
1.  **Dashboard Monitoring Bencana**: Visualisasi peta real-time gempa dan banjir.
2.  **Sistem Notifikasi Dini (Early Warning)**: Push notification berbasis lokasi.
3.  **Manajemen Titik Aman**: Database dan navigasi ke 61+ titik evakuasi.
4.  **Klinik AI Health**: Skrining kesehatan mandiri (BMI, Hipertensi, Stres).
5.  **Voice Assistant (TTS)**: Instruksi suara untuk panduan evakuasi.
6.  **SOS & Tracking**: Fitur pelaporan status keamanan pengguna.

---

## 11. Output
1.  Aplikasi Web SafeTana (PWA).
2.  Dashboard Admin untuk monitoring status pengguna dan titik bencana.
3.  Laporan analitik tren bencana dan kesehatan pengguna.

---

## 12. Biaya
Sumber anggaran berasal dari Dana Riset Internal/Hibah Teknologi dengan total estimasi anggaran yang dialokasikan untuk infrastruktur cloud dan API quota selama 1 tahun.

---

## 13. Waktu
Target penyelesaian fase stabil adalah pada bulan Oktober 2026, dengan tahapan:
*   Bulan 1-2: Analisis & Perancangan.
*   Bulan 3-5: Pengembangan Fitur Core.
*   Bulan 6: Testing & Deployment.
