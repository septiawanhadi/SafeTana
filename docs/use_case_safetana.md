# Dokumentasi Use Case - SafeTana

Dokumen ini menjelaskan alur interaksi pengguna dengan sistem SafeTana secara menyeluruh.

## 1. Visualisasi Diagram Use Case

![Use Case Diagram SafeTana](file:///C:/Users/Septiawan%20Hadi/.gemini/antigravity/brain/f1af3728-3ef9-4354-86fe-b3810608d60b/safetana_use_case_diagram_1777083997764.png)

---

## 2. Diagram Kode (Mermaid)

```mermaid
useCaseDiagram
    actor "Masyarakat Umum" as User
    actor "Administrator" as Admin

    package "SafeTana System" {
        %% Shared Use Cases
        usecase "Login" as UC_Login
        usecase "Log Out" as UC_Logout
        usecase "Monitoring Peta Bencana" as UC_Map
        usecase "Baca Materi Edukasi" as UC_Edu_Read

        %% User Specific
        usecase "Cari Shelter & Rute Evakuasi" as UC_Shelter_Find
        usecase "Konsultasi Klinik AI" as UC_AI
        usecase "Skrining & Jurnal Kesehatan" as UC_Health
        usecase "Lapor Status SOS" as UC_SOS_Report
        
        %% Admin Specific
        usecase "Manajemen Data Shelter" as UC_Shelter_Mgmt
        usecase "Monitor Laporan SOS Warga" as UC_SOS_Monitor
        usecase "Manajemen Konten Edukasi" as UC_Edu_Mgmt
        usecase "Monitor Log & PII Masking" as UC_Log
    }

    %% Shared Connections
    User --> UC_Login
    Admin --> UC_Login
    User --> UC_Logout
    Admin --> UC_Logout
    User --> UC_Map
    Admin --> UC_Map
    User --> UC_Edu_Read
    Admin --> UC_Edu_Read

    %% User Connections
    User --> UC_Shelter_Find
    User --> UC_AI
    User --> UC_Health
    User --> UC_SOS_Report

    %% Admin Connections
    Admin --> UC_Shelter_Mgmt
    Admin --> UC_SOS_Monitor
    Admin --> UC_Edu_Mgmt
    Admin --> UC_Log

    %% Relationships
    UC_SOS_Report ..> UC_SOS_Monitor : <<include>>
    UC_Edu_Mgmt ..> UC_Edu_Read : <<extend>>
    UC_Map <.. UC_Shelter_Find : <<extend>>
```

---

## 2. Deskripsi Aktor

| Aktor | Deskripsi |
| :--- | :--- |
| **Masyarakat Umum** | Pengguna akhir yang menggunakan aplikasi untuk mitigasi bencana, mencari bantuan medis mandiri, dan melaporkan status keamanan. |
| **Administrator** | Pengelola sistem yang bertanggung jawab atas validitas data shelter, pemantauan laporan darurat, dan pemeliharaan konten edukasi. |

---

## 3. Fitur Bersama (Shared Features)

Fitur-fitur di bawah ini dapat diakses oleh kedua aktor (**User** & **Admin**):

1.  **Login & Log Out**: Standar keamanan untuk masuk dan keluar dari sistem menggunakan Firebase Auth.
2.  **Monitoring Peta Bencana**: Visualisasi real-time data gempa/cuaca. Admin menggunakan ini untuk gambaran umum wilayah, sementara User menggunakannya untuk kewaspadaan pribadi.
3.  **Akses Materi Edukasi**: User membaca materi untuk edukasi diri, Admin membaca materi untuk verifikasi kualitas konten sebelum atau sesudah dipublikasikan.

---

## 4. Alur Use Case Utama

### 4.1. Mitigasi & Navigasi Evakuasi
1. **Trigger**: Pengguna membuka aplikasi atau menerima notifikasi bencana.
2. **Alur**:
    - Sistem menampilkan titik bencana di Dashboard Peta (BMKG/GDACS).
    - Pengguna menggunakan fitur **Safe Zone Finder** (extend dari Monitoring Peta).
    - Sistem menghitung rute terdekat ke shelter terdaftar.

### 4.2. Klinik AI (Cloud & Local)
1. **Trigger**: Pengguna memerlukan bantuan medis darurat atau konseling psikologis.
2. **Alur**:
    - **Online**: Menggunakan Gemini AI.
    - **Offline**: Menggunakan Null Claw Agent.
    - Hasil disimpan secara lokal dan terenkripsi.

### 4.3. Pelaporan SOS & Monitoring
1. **Trigger**: Pengguna menekan tombol **Lapor SOS**.
2. **Alur**:
    - **User** mengirimkan laporan SOS.
    - **Admin** secara otomatis menerima data tersebut pada dashboard monitor (**include** hubungan).
    - Admin dapat mengoordinasikan bantuan berdasarkan lokasi yang diterima.

---

## 5. Matriks Hak Akses

| Fitur | User | Admin | Keterangan |
| :--- | :---: | :---: | :--- |
| Login / Logout | v | v | Shared |
| Monitoring Peta | v | v | Shared |
| Baca Edukasi | v | v | Shared |
| Klinik AI | v | - | Private (User only) |
| Lapor SOS | v | - | User Triggered |
| Monitor SOS | - | v | Admin Only |
| CRUD Data Shelter| - | v | Admin Only |
| CRUD Edukasi | - | v | Admin Only |
