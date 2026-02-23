# SafeTana AI - BPBD Integrated Disaster Monitoring

SafeTana AI adalah platform mitigasi bencana cerdas yang dirancang untuk meningkatkan resiliensi masyarakat terhadap potensi bencana alam, khususnya di wilayah Jawa Barat. Aplikasi ini mengintegrasikan data real-time dari otoritas resmi untuk memberikan peringatan dini yang akurat dan personal.

## 🌟 Fitur Utama

### 1. Halaman Pengenalan (Onboarding)
Saat pertama kali dibuka, aplikasi menyambut pengguna dengan informasi kritis mengenai:
* **Urgensi Kesiapsiagaan**: Penjelasan mengenai risiko bencana di wilayah "Ring of Fire".
* **Pantauan Terpadu**: Bagaimana aplikasi mengintegrasikan data aktivitas seismik dan cuaca ekstrem berdasarkan koordinat GPS pengguna.
* **Validitas Data**: Penekanan bahwa seluruh informasi terhubung langsung dengan sistem komando BPBD untuk mencegah hoaks.

### 2. Dashboard Monitoring & Berita Terkini
Halaman utama yang menyediakan informasi real-time bagi warga:
* **Update Bencana Terkini**: Daftar otomatis gempa bumi (data BMKG) dan cuaca ekstrem (data Open-Meteo) lengkap dengan koordinat dan tingkat risiko.
* **Peta Interaktif**: Visualisasi titik bencana dan lokasi pengguna.
* **AI Risk Analysis**: Analisis risiko (Rendah, Sedang, Tinggi) berdasarkan parameter lingkungan di sekitar pengguna.
* **Pesan Darurat Admin**: Fitur broadcast pesan instruksi evakuasi langsung dari pusat komando.

### 3. Pusat Literasi & Edukasi
Modul edukasi untuk mempersiapkan warga menghadapi situasi darurat:
* **SOP Mitigasi**: Panduan langkah demi langkah menghadapi Gempa Bumi (Sesar Lembang) dan Banjir Luapan Sungai.
* **Kontak Darurat Jabar**: Akses cepat ke Call Center 112 untuk bantuan segera.

### 4. Pusat Komando (Admin)
Halaman khusus otoritas untuk memantau status keamanan warga di lapangan dan mengirimkan instruksi broadcast massal.

## 🛠️ Teknologi yang Digunakan

* **Frontend**: React.js & Vite
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **Real-time Data**:
    * BMKG API (Gempa Terkini)
    * Open-Meteo API (Cuaca Lokal)
* **Firebase**: Cloud Messaging untuk notifikasi darurat.

## 🚀 Cara Menjalankan Project

1. **Clone Repository**
   ```bash
   git clone [https://github.com/septiawanhadi/safetana.git](https://github.com/septiawanhadi/safetana.git)

2. **Install Dependensi**
```bash
npm install

3. **Menjalankan Aplikasi**

```bash
npm run dev
