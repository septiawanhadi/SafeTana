import { db } from './src/firebase.js'; // Ensure path is correct relative to execution root
import { collection, doc, setDoc } from 'firebase/firestore';

const initialSafeZones = [
    {
        id: 'bdg-u1',
        position: [-6.8792, 107.6186],
        name: "Kantor Kelurahan Dago",
        addr: "Kec. Coblong, Kel. Dago",
        faskes: "Puskesmas Dago"
    },
    {
        id: 'bdg-u2',
        position: [-6.8845, 107.6135],
        name: "Kantor Kelurahan Lebakgede",
        addr: "Kec. Coblong, Kel. Lebakgede",
        faskes: "Puskesmas Puter"
    },
    {
        id: 'bdg-u3',
        position: [-6.8612, 107.5936],
        name: "Gymnasium UPI",
        addr: "Kec. Sukasari, Kel. Isola",
        faskes: "Puskesmas Sukasari"
    },
    {
        id: 'bdg-s1',
        position: [-7.1039, 107.4578],
        name: "Kantor Desa Ciwidey",
        addr: "Kec. Ciwidey, Desa Ciwidey",
        faskes: "Puskesmas Ciwidey"
    },
    {
        id: 'bdg-s2',
        position: [-7.0227, 107.5197],
        name: "Gedung Inkanas (Shelter)",
        addr: "Kec. Soreang, Desa Terusan",
        faskes: "RSUD Otto Iskandar Di Nata"
    },
    {
        id: 'bdg-s3',
        position: [-7.1824, 107.5594],
        name: "Kantor Kecamatan Pangalengan",
        addr: "Kec. Pangalengan, Desa Pangalengan",
        faskes: "Puskesmas Pangalengan DTP"
    },
    {
        id: 'bdg-s4',
        position: [-7.0506, 107.5878],
        name: "Alun-Alun Banjaran",
        addr: "Kec. Banjaran, Desa Banjaran Kota",
        faskes: "Puskesmas Banjaran Kota"
    },
    {
        id: 'bdg-s5',
        position: [-6.9745, 107.6321],
        name: "Kantor Desa Bojongsoang",
        addr: "Kec. Bojongsoang, Desa Bojongsoang",
        faskes: "Puskesmas Bojongsoang"
    },
    {
        id: 'bdg-s6',
        position: [-7.0031, 107.5689],
        name: "Puskesmas Sangkanhurip (Titik Evakuasi)",
        addr: "Kec. Katapang, Desa Sukamukti",
        faskes: "Puskesmas Sangkanhurip"
    },
    {
        id: 'bdg-s7',
        position: [-7.1524, 107.3889],
        name: "Kantor Kecamatan Rancabali",
        addr: "Kec. Rancabali, Desa Patengan",
        faskes: "Puskesmas Rancabali"
    },
    {
        id: 'bdg-s8',
        position: [-7.0654, 107.5432],
        name: "GOR Cimaung",
        addr: "Kec. Cimaung, Desa Cimaung",
        faskes: "Puskesmas Cimaung"
    },
    {
        id: 'bdg-s9',
        position: [-7.2189, 107.6541],
        name: "Lapang Desa Tarumajaya",
        addr: "Kec. Kertasari, Desa Tarumajaya",
        faskes: "Puskesmas Kertasari"
    },
    {
        id: 'bdg-s10',
        position: [-7.0765, 107.7123],
        name: "Kantor Desa Ciparay",
        addr: "Kec. Ciparay, Desa Ciparay",
        faskes: "Puskesmas Ciparay DTP"
    },
    {
        id: 'bdg-s11',
        position: [-7.0456, 107.7543],
        name: "Alun-Alun Majalaya",
        addr: "Kec. Majalaya, Desa Majalaya",
        faskes: "RSUD Majalaya"
    },
    {
        id: 'bdg-s12',
        position: [-6.9654, 107.7654],
        name: "RTC (Rancaekek Trade Center)",
        addr: "Kec. Rancaekek, Desa Bojongloa",
        faskes: "Puskesmas Rancaekek"
    },
    {
        id: 'bdg-s13',
        position: [-6.9123, 107.7234],
        name: "Kampus IPDN/Jatinangor",
        addr: "Kec. Jatinangor",
        faskes: "Puskesmas Jatinangor"
    },
    {
        id: 'bdg-s14',
        position: [-6.9876, 107.8234],
        name: "Stasiun Cicalengka (Titik Kumpul)",
        addr: "Kec. Cicalengka, Desa Cicalengka Kulon",
        faskes: "RSUD Cicalengka"
    }
];

const migrateSafeZones = async () => {
    try {
        console.log("Migrating safe zones to Firestore...");
        for (const zone of initialSafeZones) {
            const docId = zone.id;
            // create a copy of the object minus the id field which will be the document key
            const data = { ...zone };
            delete data.id;

            await setDoc(doc(db, 'safe_zones', docId), data);
        }
        console.log("Successfully migrated safe zones.");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed", e);
        process.exit(1);
    }
}

migrateSafeZones();
