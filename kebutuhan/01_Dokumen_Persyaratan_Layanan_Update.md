# Dokumen Persyaratan Layanan: SafeTana

## 1. Pendahuluan
### 1.1 Tujuan Penulisan Dokumen
Dokumen ini disusun untuk merinci kebutuhan bisnis dan fungsional dari aplikasi SafeTana. Dokumen ini akan digunakan oleh tim pengembang, pemangku kepentingan (stakeholders), dan pihak manajemen sebagai acuan utama dalam pembangunan dan evaluasi sistem.

### 1.2 Lingkup Masalah
SafeTana adalah platform mitigasi bencana terintegrasi berbasis AI dan layanan kesehatan mandiri yang dirancang untuk meningkatkan resiliensi masyarakat terhadap bencana alam dan krisis kesehatan melalui monitoring real-time dan bantuan cerdas.

### 1.3 Definisi, Istilah dan Singkatan
*   **SafeTana:** Sistem Mitigasi Bencana Terintegrasi.
*   **Klinik AI:** Modul layanan kesehatan mandiri di dalam SafeTana.
*   **Gemini AI:** Engine kecerdasan buatan dari Google yang digunakan untuk asisten cerdas.
*   **GDACS:** Global Disaster Alert and Coordination System.
*   **BMKG:** Badan Meteorologi, Klimatologi, dan Geofisika.
*   **SOS:** Signal Of Distress / Layanan darurat.
*   **SATUSEHAT:** Platform layanan kesehatan terintegrasi nasional dari Kementerian Kesehatan RI.
*   **BPJS Kesehatan:** Badan Penyelenggara Jaminan Sosial Kesehatan.
*   **Fasyankes:** Fasilitas Pelayanan Kesehatan.

### 1.4 Aturan Penomoran
Penomoran fitur menggunakan format BR-XXX untuk Business Requirements dan F-XX untuk Functional Requirements.

### 1.5 Referensi
*   Dokumen SKPL SafeTana v1.0.0.
*   Dokumentasi API Google Gemini.
*   Panduan Integrasi BMKG & PetaBencana.id.

### 1.6 Deskripsi Umum Dokumen (Ikhtisar)
Dokumen ini membahas landasan pembangunan SafeTana, analisis kelayakan dari berbagai aspek, hingga rincian fitur yang akan diimplementasikan untuk mencapai target efisiensi mitigasi bencana.

## 2. Latar Belakang
Indonesia merupakan negara yang berada di wilayah Ring of Fire, membuatnya sangat rentan terhadap bencana alam seperti gempa bumi dan banjir. Selain itu, akses terhadap layanan kesehatan dan dukungan mental pasca bencana seringkali terbatas. SafeTana hadir untuk menutup celah tersebut dengan menyediakan teknologi pemantauan real-time dan asisten AI yang dapat diakses dengan mudah oleh masyarakat.

## 3. Dasar Hukum
*   UU No. 24 Tahun 2007 tentang Penanggulangan Bencana.
*   Peraturan Pemerintah No. 21 Tahun 2008 tentang Penyelenggaraan Penanggulangan Bencana.
*   UU No. 11 Tahun 2008 (ITE) terkait penyelenggaraan sistem elektronik.

## 4. Maksud dan Tujuan
Maksud dari pembangunan SafeTana adalah untuk menciptakan ekosistem digital yang tangguh dalam menghadapi bencana. Tujuannya adalah memberikan peringatan dini yang akurat, mempermudah akses lokasi evakuasi, dan menyediakan layanan kesehatan mental serta fisik bagi terdampak bencana.

## 5. Pelaksana Pembangunan Aplikasi
Pembangunan aplikasi dilaksanakan secara mandiri oleh Tim Internal SafeTana yang dipimpin oleh Septiawan Hadi Prasetyo (Lead Developer) dan didukung oleh tim ahli pengembang perangkat lunak.

## 6. Target/Sasaran yang Ingin Dicapai
*   Terintegrasinya data bencana dari minimal 3 sumber utama (BMKG, GDACS, PetaBencana) dalam 6 bulan.
*   Tersedianya informasi 60+ titik aman evakuasi di wilayah pilot project (Bandung).
*   Terhubungnya sistem dengan API Kesehatan Nasional (SATUSEHAT & BPJS) untuk pendataan fasyankes.
*   Waktu respon asisten AI untuk triase kesehatan di bawah 2 detik.

## 7. Manfaat / Business Value
### 7.1 Intangible Value
*   Meningkatkan rasa aman di tengah masyarakat.
*   Meningkatkan kesadaran dan literasi mitigasi bencana.
*   Membangun kepercayaan publik terhadap efisiensi layanan darurat digital.

### 7.2 Tangible Value
*   Mengurangi waktu respon evakuasi hingga 30% melalui navigasi titik aman yang presisi.
*   Menurunkan beban fasilitas kesehatan melalui screening mandiri berbasis AI.
*   Target penggunaan oleh 10,000+ warga di wilayah rawan bencana pada tahun pertama.

## 8. Analisis Kelayakan Pembangunan Aplikasi
### 8.1 Analisis Kelayakan Teknis
*   **Risiko Kefamilieran dengan Aplikasi:** Risiko Rendah. Tim pengembang memiliki pengalaman dalam membangun sistem geospasial dan integrasi API pihak ketiga.
*   **Risiko Kefamilieran dengan Teknologi:** Risiko Rendah. Tim menguasai React, Firebase, dan integrasi Google Gemini AI. Infrastruktur cloud (Vercel/Firebase) sudah siap digunakan.
*   **Risiko Ukuran Project:** Risiko Rendah. Project dikerjakan oleh tim kecil yang lincah (Agile) dengan estimasi waktu pengembangan 6-8 bulan.
*   **Kompatibilitas Sistem:** Risiko Rendah. Aplikasi dibangun berbasis Web (PWA) sehingga sangat kompatibel dengan berbagai perangkat mobile pengguna saat ini.

### 8.2 Analisis Kelayakan Ekonomi
*   **Return on Investment (ROI):** Estimasi penghematan biaya operasional penanggulangan bencana sebesar 25% dalam 3 tahun.
*   **Break-even point (BEP):** 1.8 tahun.
*   **Total Manfaat Ekonomi:** Efisiensi biaya distribusi informasi darurat yang sebelumnya manual/terpencar.

### 8.3 Analisis Kelayakan Organisasi
*   **Resiko Rendah.** SafeTana selaras dengan visi strategis pemerintah dalam digitalisasi layanan publik dan peningkatan keamanan nasional dari aspek kebencanaan.

## 9. Proses Bisnis Layanan
### 9.1 Proses Bisnis Saat Ini (As-Is)
Masyarakat mendapatkan informasi bencana dari media massa atau pengumuman manual, yang seringkali terlambat dan tidak memberikan instruksi spesifik lokasi titik aman terdekat secara personal.

### 9.2 Proses Bisnis Usulan (To-Be)
Sistem secara otomatis mendeteksi bahaya ➔ Memberikan notifikasi personal ➔ Mengarahkan pengguna ke titik aman terdekat ➔ Menyediakan layanan kesehatan pasca evakuasi via AI dan integrasi fasilitas kesehatan nasional.

## 10. Ruang Lingkup Aplikasi / Business Requirement
*   **Dashboard Monitoring Bencana:** Visualisasi peta real-time gempa dan banjir.
*   **Sistem Notifikasi Dini (Early Warning):** Push notification berbasis lokasi.
*   **Manajemen Titik Aman:** Database dan navigasi ke 61+ titik evakuasi.
*   **Klinik AI Health:** Skrining kesehatan mandiri (BMI, Hipertensi, Stres).
*   **Voice Assistant (TTS):** Instruksi suara untuk panduan evakuasi.
*   **SOS & Tracking:** Fitur pelaporan status keamanan pengguna.
*   **Integrasi Fasyankes (SATUSEHAT & BPJS):** Direktori fasilitas kesehatan terintegrasi berskala nasional untuk memudahkan pencarian layanan medis.
*   **Dukungan Offline (PWA):** Kemampuan aplikasi untuk caching data esensial sehingga tetap dapat diakses sebagian tanpa koneksi internet (offline mode).

## 11. Kebutuhan Non-Fungsional (Non-Functional Requirements)
*   **Keamanan & Privasi Data:** Sistem harus mengenkripsi data kesehatan pengguna dan mematuhi standar keamanan perlindungan data medis yang berlaku (contoh: kepatuhan SATUSEHAT/HIPAA).
*   **Ketersediaan Sistem (Availability):** Mengingat ini adalah aplikasi darurat, infrastruktur harus mendukung *auto-scaling* dan memiliki *uptime* minimal 99.9% agar tidak down (tumbang) akibat lonjakan trafik mendadak saat terjadi bencana.

## 12. Output
*   Aplikasi Web SafeTana (Progressive Web App).
*   Dashboard Admin untuk monitoring status pengguna dan titik bencana.
*   Laporan analitik tren bencana dan kesehatan pengguna.

## 13. Biaya
Estimasi anggaran operasional bulanan pada saat rilis untuk 10.000 pengguna aktif:
*   **Infrastruktur Cloud & Database (Vercel Pro & Firebase):** Rp 500.000 - Rp 1.000.000 / bulan.
*   **Layanan API Kecerdasan Buatan (Google Gemini):** Rp 1.000.000 - Rp 1.500.000 / bulan.
*   **Layanan Peta Digital (Google Maps/Mapbox):** Rp 500.000 / bulan.
*   **Total Estimasi Biaya Rutin:** Rp 2.000.000 - Rp 3.000.000 / bulan.

## 14. Waktu
Target penyelesaian dan peluncuran fase stabil adalah pada bulan Oktober 2026, dengan rincian jadwal (timeline) sebagai berikut:
*   **Bulan 1-2 (Mei - Juni 2026):** Analisis & Perancangan sistem, UI/UX, dan persiapan arsitektur Cloud.
*   **Bulan 3-5 (Juli - September 2026):** Pengembangan Fitur Core (Peta bencana, Notifikasi Dini, Integrasi SATUSEHAT/BPJS, Klinik AI, Offline Mode).
*   **Bulan 6 (Oktober 2026):** Pengujian (Security, UAT, E2E Testing) dan final deployment ke Production.
