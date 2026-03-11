import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Menyiapkan konfigurasi manual Firebase dari file .env klien
// Kita harus membaca file .env di lokal karena ini script terpisah
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
const envData = fs.readFileSync(envPath, 'utf8');

const getEnvValue = (key) => {
    const match = envData.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : undefined;
};

const firebaseConfig = {
    apiKey: getEnvValue("VITE_FIREBASE_API_KEY"),
    authDomain: getEnvValue("VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: getEnvValue("VITE_FIREBASE_PROJECT_ID"),
    storageBucket: getEnvValue("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: getEnvValue("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    appId: getEnvValue("VITE_FIREBASE_APP_ID")
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const bandungSafeZones = [
    {
        id: "sz-gasibu",
        name: "Lapangan Gasibu",
        addr: "Jl. Diponegoro, Citarum, Kec. Bandung Wetan, Kota Bandung",
        position: [-6.900445, 107.618640],
        faskes: "RSUP Dr. Hasan Sadikin (2.7 km)",
        capacity: "Sangat Besar (> 10.000 jiwa)",
        desc: "Lahan terbuka paling strategis di pusat kota (depan Gedung Sate). Mudah diakses dari berbagai penjuru, aman dari pepohonan tinggi yang mudah tumbang."
    },
    {
        id: "sz-tegalega",
        name: "Taman Konservasi Tegalega",
        addr: "Jl. Otto Iskandar Dinata, Ciateul, Kec. Regol, Kota Bandung",
        position: [-6.936647, 107.603332],
        faskes: "RS Immanuel (1.6 km)",
        capacity: "Sangat Besar (> 10.000 jiwa)",
        desc: "Kawasan Monumen Bandung Lautan Api. Area terbuka hijau yang ideal untuk menampung warga di wilayah Bandung Tengah dan Selatan."
    },
    {
        id: "sz-gbla",
        name: "Pelataran Parkir Stadion GBLA",
        addr: "Jl. Gerbang Biru, Rancanumpang, Kec. Gedebage, Kota Bandung",
        position: [-6.956667, 107.712166],
        faskes: "RS Al Islam (3.8 km)",
        capacity: "Super Besar (> 25.000 jiwa)",
        desc: "Kawasan stadion megah dengan area parkir super luas. Titik evakuasi akhir bagi penduduk Bandung Timur (Gedebage, Cinambo, Panyileukan)."
    },
    {
        id: "sz-sabuga",
        name: "Pelataran Sabuga & ITB",
        addr: "Jl. Tamansari No.73, Lb. Siliwangi, Kec. Coblong, Kota Bandung",
        position: [-6.885698, 107.607498],
        faskes: "RS Santo Borromeus (1.6 km)",
        capacity: "Besar (5.000 jiwa)",
        desc: "Kawasan terpadu di kawasan Bandung Utara yang ditunjuk sebagai rujukan evakuasi warga sekitar Dago dan Cihampelas atas."
    },
    {
        id: "sz-arcamanik",
        name: "Kawasan SOR Arcamanik",
        addr: "Jl. Pacuan Kuda No.15, Sukamiskin, Kec. Arcamanik, Kota Bandung",
        position: [-6.911365, 107.669866],
        faskes: "RS Hermina Arcamanik (2.5 km)",
        capacity: "Besar (8.000 jiwa)",
        desc: "Sport Jabar Arcamanik memiliki banyak lahan datar dan rindang yang mumpuni sebagai pusat evakuasi dan pendirian tenda BNPB."
    },
    {
        id: "sz-alunalun",
        name: "Alun-Alun Kota Bandung",
        addr: "Jl. Asia Afrika, Balonggede, Kec. Regol, Kota Bandung",
        position: [-6.921855, 107.606214],
        faskes: "RS Bungsu (1.5 km)",
        capacity: "Sedang (3.000 jiwa)",
        desc: "Lapangan rumput sintetis di atas atap parkiran *basement*. Dapat digunakan sementara bila guncangan dihentikan, akses mudah via Jalan Asia Afrika."
    }
];

const injectData = async () => {
    console.log("Memulai injeksi data Titik Aman Bandung ke Firestore...");

    // Coba tambahkan 1 data per satu
    for (const zone of bandungSafeZones) {
        try {
            await setDoc(doc(db, "safe_zones", zone.id), zone);
            console.log(`✅ Berhasil menyimpan: ${zone.name}`);
        } catch (error) {
            console.error(`❌ Gagal menyimpan ${zone.name}:`, error);
        }
    }

    console.log("Injeksi Selesai. Tekan CTRL+C untuk menutup.");
    process.exit(0);
};

injectData();
