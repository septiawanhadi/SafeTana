/**
 * Synthetic Dataset of Healthcare Facilities in West Java
 * Used as a fallback for SATUSEHAT Sandbox API instability.
 * Structure mimics the exact Master Sarana Index response.
 * 
 * Jenis Sarana: 
 * 104 = Rumah Sakit
 * 103 = Klinik
 * 102 = Puskesmas
 * 101 = Praktik Mandiri
 */

export const mockFasyankesJabar = [
  // --- RUMAH SAKIT (104) ---
  {
    kode_satusehat: "RS1000001",
    nama: "RSUP Dr. Hasan Sadikin",
    jenis_sarana: { id: "104", nama: "Rumah Sakit" },
    alamat: "Jl. Pasteur No.38, Pasteur, Kec. Sukajadi",
    latitude: -6.8953,
    longitude: 107.5968,
    kabkota: { id: "3273", nama: "KOTA BANDUNG" },
    provinsi: { id: "32", nama: "JAWA BARAT" },
    status_aktif: true,
    status_sarana: "Terverifikasi"
  },
  {
    kode_satusehat: "RS1000002",
    nama: "RSUD Al-Ihsan Provinsi Jawa Barat",
    jenis_sarana: { id: "104", nama: "Rumah Sakit" },
    alamat: "Jl. Kiastramanggala, Baleendah, Kec. Baleendah",
    latitude: -7.0099,
    longitude: 107.6251,
    kabkota: { id: "3204", nama: "KAB. BANDUNG" },
    provinsi: { id: "32", nama: "JAWA BARAT" },
    status_aktif: true,
    status_sarana: "Terverifikasi"
  },
  {
    kode_satusehat: "RS1000003",
    nama: "RS Borromeus",
    jenis_sarana: { id: "104", nama: "Rumah Sakit" },
    alamat: "Jl. Ir. H. Juanda No.100, Lebakgede, Kec. Coblong",
    latitude: -6.8941,
    longitude: 107.6117,
    kabkota: { id: "3273", nama: "KOTA BANDUNG" },
    provinsi: { id: "32", nama: "JAWA BARAT" },
    status_aktif: true,
    status_sarana: "Terverifikasi"
  },
  {
    kode_satusehat: "RS1000004",
    nama: "RS Mitra Kasih Cimahi",
    jenis_sarana: { id: "104", nama: "Rumah Sakit" },
    alamat: "Jl. Jend. H. Amir Machmud No.341, Cigugur Tengah",
    latitude: -6.8778,
    longitude: 107.5451,
    kabkota: { id: "3277", nama: "KOTA CIMAHI" },
    provinsi: { id: "32", nama: "JAWA BARAT" },
    status_aktif: true,
    status_sarana: "Terverifikasi"
  },
  {
    kode_satusehat: "RS1000005",
    nama: "RS AMC Bandung",
    jenis_sarana: { id: "104", nama: "Rumah Sakit" },
    alamat: "Jl. Raya Cileunyi No.01, Cileunyi Wetan",
    latitude: -6.9385,
    longitude: 107.7562,
    kabkota: { id: "3204", nama: "KAB. BANDUNG" },
    provinsi: { id: "32", nama: "JAWA BARAT" },
    status_aktif: true,
    status_sarana: "Terverifikasi"
  },

  // --- KLINIK (103) ---
  {
    kode_satusehat: "KL1000001",
    nama: "Klinik Pratama Siliwangi",
    jenis_sarana: { id: "103", nama: "Klinik" },
    alamat: "Jl. Siliwangi No.14, Ciumbuleuit",
    latitude: -6.8839,
    longitude: 107.6074,
    kabkota: { id: "3273", nama: "KOTA BANDUNG" },
    provinsi: { id: "32", nama: "JAWA BARAT" },
    status_aktif: true,
    status_sarana: "Terverifikasi"
  },
  {
    kode_satusehat: "KL1000002",
    nama: "Klinik Kimia Farma Dago",
    jenis_sarana: { id: "103", nama: "Klinik" },
    alamat: "Jl. Ir. H. Juanda No.69",
    latitude: -6.8996,
    longitude: 107.6115,
    kabkota: { id: "3273", nama: "KOTA BANDUNG" },
    provinsi: { id: "32", nama: "JAWA BARAT" },
    status_aktif: true,
    status_sarana: "Terverifikasi"
  },
  {
    kode_satusehat: "KL1000003",
    nama: "Klinik Mutiara Cikutra",
    jenis_sarana: { id: "103", nama: "Klinik" },
    alamat: "Jl. Cikutra No.115, Cikutra, Kec. Cibeunying Kidul",
    latitude: -6.9038,
    longitude: 107.6366,
    kabkota: { id: "3273", nama: "KOTA BANDUNG" },
    provinsi: { id: "32", nama: "JAWA BARAT" },
    status_aktif: true,
    status_sarana: "Terverifikasi"
  },
  {
    kode_satusehat: "KL1000004",
    nama: "Klinik Utama Sehat Sejahtera",
    jenis_sarana: { id: "103", nama: "Klinik" },
    alamat: "Jl. Raya Bojongsoang No.44, Lengkong",
    latitude: -6.9744,
    longitude: 107.6309,
    kabkota: { id: "3204", nama: "KAB. BANDUNG" },
    provinsi: { id: "32", nama: "JAWA BARAT" },
    status_aktif: true,
    status_sarana: "Terverifikasi"
  },

  // --- PUSKESMAS (102) ---
  {
    kode_satusehat: "PK1000001",
    nama: "Puskesmas Garuda",
    jenis_sarana: { id: "102", nama: "Puskesmas" },
    alamat: "Jl. Garuda No.73, Garuda, Kec. Andir",
    latitude: -6.9135,
    longitude: 107.5752,
    kabkota: { id: "3273", nama: "KOTA BANDUNG" },
    provinsi: { id: "32", nama: "JAWA BARAT" },
    status_aktif: true,
    status_sarana: "Terverifikasi"
  },
  {
    kode_satusehat: "PK1000002",
    nama: "Puskesmas Puter",
    jenis_sarana: { id: "102", nama: "Puskesmas" },
    alamat: "Jl. Puter No.3, Sadang Serang, Kec. Coblong",
    latitude: -6.8929,
    longitude: 107.6203,
    kabkota: { id: "3273", nama: "KOTA BANDUNG" },
    provinsi: { id: "32", nama: "JAWA BARAT" },
    status_aktif: true,
    status_sarana: "Terverifikasi"
  },
  {
    kode_satusehat: "PK1000003",
    nama: "Puskesmas Baleendah",
    jenis_sarana: { id: "102", nama: "Puskesmas" },
    alamat: "Jl. Adipati Ukur No.2, Baleendah",
    latitude: -7.0069,
    longitude: 107.6321,
    kabkota: { id: "3204", nama: "KAB. BANDUNG" },
    provinsi: { id: "32", nama: "JAWA BARAT" },
    status_aktif: true,
    status_sarana: "Terverifikasi"
  },
  {
    kode_satusehat: "PK1000004",
    nama: "Puskesmas Cileunyi",
    jenis_sarana: { id: "102", nama: "Puskesmas" },
    alamat: "Jl. Cinunuk No.1, Cileunyi",
    latitude: -6.9388,
    longitude: 107.7410,
    kabkota: { id: "3204", nama: "KAB. BANDUNG" },
    provinsi: { id: "32", nama: "JAWA BARAT" },
    status_aktif: true,
    status_sarana: "Terverifikasi"
  },

  // --- PRAKTIK MANDIRI (101) ---
  {
    kode_satusehat: "PM1000001",
    nama: "Praktik Dokter Gigi Drg. Anton",
    jenis_sarana: { id: "101", nama: "Praktik Mandiri" },
    alamat: "Jl. Buah Batu No.145, Turangga, Kec. Lengkong",
    latitude: -6.9366,
    longitude: 107.6256,
    kabkota: { id: "3273", nama: "KOTA BANDUNG" },
    provinsi: { id: "32", nama: "JAWA BARAT" },
    status_aktif: true,
    status_sarana: "Terverifikasi"
  },
  {
    kode_satusehat: "PM1000002",
    nama: "Praktik Umum Dr. Siti Anisa",
    jenis_sarana: { id: "101", nama: "Praktik Mandiri" },
    alamat: "Jl. Antapani Lama No.45, Antapani Tengah",
    latitude: -6.9142,
    longitude: 107.6548,
    kabkota: { id: "3273", nama: "KOTA BANDUNG" },
    provinsi: { id: "32", nama: "JAWA BARAT" },
    status_aktif: true,
    status_sarana: "Terverifikasi"
  },
  {
    kode_satusehat: "PM1000003",
    nama: "Praktik Bidan Ningsih",
    jenis_sarana: { id: "101", nama: "Praktik Mandiri" },
    alamat: "Jl. Raya Soreang-Banjaran No. 89",
    latitude: -7.0345,
    longitude: 107.5320,
    kabkota: { id: "3204", nama: "KAB. BANDUNG" },
    provinsi: { id: "32", nama: "JAWA BARAT" },
    status_aktif: true,
    status_sarana: "Terverifikasi"
  }
];
