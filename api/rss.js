const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || "safetana-app";

// Artikel Edukasi Bawaan (Fallback & Default) agar RSS tidak kosong saat verifikasi Google News
const DEFAULT_ARTICLES = [
  {
    title: "Panduan Evakuasi Gempa Bumi di Gedung Bertingkat",
    slug: "panduan-evakuasi-gempa-gedung-bertingkat",
    content: `
      <p>Gempa bumi dapat terjadi kapan saja tanpa peringatan. Jika Anda berada di dalam gedung bertingkat saat gempa terjadi, berikut adalah langkah-langkah keselamatan terpenting yang wajib Anda lakukan:</p>
      <ul>
        <li><strong>Drop, Cover, and Hold On:</strong> Segera tiarap di bawah meja kokoh, lindungi kepala dan leher Anda, dan pegang kaki meja.</li>
        <li><strong>Jauhi Jendela kaca:</strong> Pecahan kaca jendela luar sangat berbahaya saat terjadi guncangan besar.</li>
        <li><strong>Jangan Gunakan Lift:</strong> Lift dapat kehilangan daya listrik secara mendadak. Gunakan tangga darurat secara tertib.</li>
        <li><strong>Ikuti Panduan Peta Bencana SafeTana:</strong> Setelah guncangan mereda, periksa aplikasi SafeTana Anda untuk menemukan rute evakuasi dan shelter/titik kumpul terdekat di wilayah Anda.</li>
      </ul>
    `,
    author: "Septiawan Hadi Prasetyo",
    publishedAt: "2026-05-29T12:00:00Z"
  },
  {
    title: "Kesiapsiagaan Menghadapi Banjir di Musim Pancaroba",
    slug: "kesiapsiagaan-menghadapi-banjir-pancaroba",
    content: `
      <p>Memasuki musim pancaroba, curah hujan ekstrem seringkali memicu luapan sungai dan banjir bandang. SafeTana mengimbau masyarakat untuk mempersiapkan langkah mitigasi mandiri:</p>
      <ol>
        <li><strong>Siapkan Tas Siaga Bencana (TSB):</strong> Isi dengan dokumen penting terenkripsi, obat-obatan darurat, lampu senter, air minum, dan makanan instan.</li>
        <li><strong>Pantau AQI & Level Air:</strong> Selalu cek dashboard SafeTana secara berkala untuk memantau curah hujan dan tingkat kerawanan wilayah Anda.</li>
        <li><strong>Gunakan Peta Evakuasi Live:</strong> Jika wilayah Anda tergenang, manfaatkan peta interaktif SafeTana untuk menuju Fasilitas Kesehatan atau Posko Evakuasi terdekat yang aman.</li>
      </ol>
    `,
    author: "Restu Utami",
    publishedAt: "2026-05-28T09:30:00Z"
  },
  {
    title: "Manfaat Skrining Kesehatan Mandiri Secara Berkala",
    slug: "manfaat-skrining-kesehatan-berkala",
    content: `
      <p>Resiliensi tidak hanya tentang bencana alam, melainkan juga ketahanan kesehatan tubuh kita. Melakukan skrining kesehatan mandiri memiliki dampak luar biasa bagi kesehatan jangka panjang Anda:</p>
      <p>Melalui modul <strong>SafeTana AI Health (Klinik AI)</strong>, Anda dapat dengan mudah menghitung Indeks Massa Tubuh (IMT) secara otomatis untuk mendeteksi risiko obesitas, serta memantau ambang batas tekanan darah sistolik dan diastolik guna mendeteksi pra-hipertensi sejak dini.</p>
      <p>Dengan mengintegrasikan data hasil observasi ke dalam standar rekam medis digital HL7 FHIR, data kesehatan Anda menjadi lebih aman, terstruktur, dan siap disinkronisasikan secara langsung dengan fasilitas kesehatan terdekat.</p>
    `,
    author: "SafeTana Health Team",
    publishedAt: "2026-05-27T08:15:00Z"
  }
];

export default async function handler(req, res) {
  // Hanya ijinkan method GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let customArticles = [];

    // Ambil artikel dinamis dari Firestore jika ada
    if (PROJECT_ID) {
      try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/news_articles?orderBy=publishedAt desc&limit=10`;
        const apiResponse = await fetch(firestoreUrl);
        
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          if (data.documents) {
            customArticles = data.documents.map(doc => {
              const fields = doc.fields || {};
              return {
                title: fields.title?.stringValue || "Untitled Article",
                slug: fields.slug?.stringValue || doc.name.split('/').pop(),
                content: fields.content?.stringValue || "",
                author: fields.author?.stringValue || "SafeTana Writer",
                publishedAt: fields.publishedAt?.timestampValue || fields.publishedAt?.stringValue || new Date().toISOString()
              };
            });
          }
        }
      } catch (dbErr) {
        console.warn("Membaca Firestore news_articles gagal, menggunakan default fallback:", dbErr);
      }
    }

    // Gabungkan artikel dinamis (jika ada) dengan artikel edukasi default
    const allArticles = [...customArticles, ...DEFAULT_ARTICLES];

    // Format menjadi XML RSS 2.0 yang compliant dengan Google Publisher Center
    const itemsXml = allArticles.map(art => `
    <item>
      <title><![CDATA[${art.title}]]></title>
      <link>https://safetana.vercel.app/news/${art.slug}</link>
      <guid isPermaLink="true">https://safetana.vercel.app/news/${art.slug}</guid>
      <pubDate>${new Date(art.publishedAt).toUTCString()}</pubDate>
      <author>${art.author}</author>
      <description><![CDATA[${art.content}]]></description>
    </item>`).join('');

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>SafeTana AI - Krisis, Mitigasi & Layanan Kesehatan</title>
    <link>https://safetana.vercel.app</link>
    <description>Sistem Mitigasi Bencana Terintegrasi Berbasis AI &amp; Platform Layanan Kesehatan Mandiri.</description>
    <language>id</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${itemsXml}
  </channel>
</rss>`.trim();

    // Kirim response XML
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=1800'); // Cache 30 menit
    return res.status(200).send(rssXml);

  } catch (error) {
    console.error("Gagal men-generate RSS feed:", error);
    return res.status(500).send("<error>Failed to generate RSS feed</error>");
  }
}
