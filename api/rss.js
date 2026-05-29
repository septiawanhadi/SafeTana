const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || "safetana-app";

// Artikel Branding Bawaan (Default & Fallback) untuk Google Publisher Center
const DEFAULT_ARTICLES = [
  {
    title: "Tentang SafeTana AI: Pelopor Mitigasi Bencana Terintegrasi Berbasis AI",
    slug: "tentang-safetana-ai-mitigasi-bencana",
    content: `
      <p><strong>SafeTana AI</strong> adalah platform progresif perintis yang dirancang khusus untuk memperkuat resiliensi masyarakat terhadap bencana alam dan krisis kesehatan. Dengan menggabungkan kekuatan pemetaan geospasial real-time, kecerdasan buatan (<strong>Google Gemini AI</strong>), dan modul layanan medis prediktif (Klinik AI), platform ini memberikan perlindungan menyeluruh—baik dari ancaman alam maupun risiko kesehatan personal.</p>
      <p>Mengusung jargon <em>"Cerdas Berbagi, Sigap Mitigasi, & Peduli Kesehatan"</em>, SafeTana memadukan teknologi canggih seperti:</p>
      <ul>
        <li><strong>AI Early Detection Engine & Voice Assistant (TTS):</strong> Integrasi Gemini AI untuk memandu evakuasi dengan asisten suara lantang.</li>
        <li><strong>Live User Tracking & SOS System:</strong> Fitur tracking lokasi anonim menggunakan algoritma Haversine dan enkripsi koordinat demi menjaga privasi penuh pengguna.</li>
        <li><strong>Peta Bencana Live:</strong> Visualisasi peta interaktif 24/7 berbasis Leaflet yang menampilkan data real-time BMKG & GDACS beserta titik kumpul evakuasi terdekat.</li>
      </ul>
      <p>SafeTana AI berkomitmen tinggi menjadi pelindung digital utama Anda, memastikan Anda selalu sigap dan terlindungi di mana pun Anda berada.</p>
    `,
    author: "Septiawan Hadi Prasetyo",
    publishedAt: "2026-05-29T12:00:00Z"
  },
  {
    title: "Klinik AI: Revolusi Layanan Medis Mandiri Berstandar HL7 FHIR di SafeTana",
    slug: "klinik-ai-safetana-layanan-kesehatan-mandiri",
    content: `
      <p>Kesehatan adalah pilar utama dalam keselamatan. Oleh karena itu, SafeTana menghadirkan <strong>SafeTana AI Health (Klinik AI)</strong>—sebuah ekosistem kesehatan mandiri digital yang canggih dan tersertifikasi standar internasional.</p>
      <p>Modul Klinik AI memberdayakan pengguna melalui serangkaian fitur medis presisi:</p>
      <ol>
        <li><strong>Skrining Kesehatan Mandiri:</strong> Penilaian instan cerdas untuk mengalkulasi Indeks Massa Tubuh (IMT) guna mendeteksi risiko obesitas, serta memantau ambang batas tekanan darah sistolik dan diastolik sesuai klasifikasi JNC-8.</li>
        <li><strong>Catatan Jurnal & Mood Tracker 30 Hari:</strong> Layanan catatan psikologis harian terintegrasi dengan dasbor analitik personal untuk memantau emosi dominan dan tren kesehatan mental Anda.</li>
        <li><strong>SatuSehat HL7 FHIR R4 Compliance:</strong> Seluruh data observasi kesehatan Anda dipetakan langsung ke format rekam medis digital HL7 FHIR (LOINC-compliant) yang siap disinkronisasikan ke kementerian kesehatan SatuSehat Indonesia.</li>
        <li><strong>SafeTanaBot (Health AI Assistant):</strong> Chatbot medis 24/7 siap menjawab gejala umum, rekomendasi gaya hidup sehat, hingga lokasi klinik terdekat secara interaktif.</li>
      </ol>
      <p>Dengan Klinik AI, kesehatan Anda berada dalam kendali penuh yang aman, terenkripsi, dan cerdas.</p>
    `,
    author: "Restu Utami",
    publishedAt: "2026-05-28T09:30:00Z"
  },
  {
    title: "Di Balik Layar SafeTana AI: Mengenal Septiawan Hadi Prasetyo & Restu Utami",
    slug: "mengenal-developer-safetana-ai",
    content: `
      <p>Inovasi besar lahir dari dedikasi dan visi yang kuat. Platform <strong>SafeTana AI</strong> yang tangguh dan estetik ini dirancang serta dibangun oleh kolaborasi hebat talenta pengembang terbaik:</p>
      <h3><strong>1. Septiawan Hadi Prasetyo – Lead Developer & Security Architect</strong></h3>
      <p>Bertindak sebagai arsitek utama sistem, Septiawan mendedikasikan keahliannya dalam menyusun infrastruktur web yang sangat aman dan berkinerja tinggi. Septiawan bertanggung jawab atas:</p>
      <ul>
        <li>Penerapan <strong>Triple-Tier AI Fallback Chain</strong> (Gemini -> Groq -> OpenAI) yang memastikan asisten AI tidak pernah padam saat bencana melanda.</li>
        <li>Enkripsi koordinat lokasi real-time dan penyamaran data PII (Personal Identifiable Information) demi keamanan privasi mutlak pengguna.</li>
        <li>Implementasi arsitektur <em>Service Pattern</em> tersentralisasi pada backend serverless Vercel.</li>
      </ul>
      <h3><strong>2. Restu Utami – Co-Developer & UI/UX Specialist</strong></h3>
      <p>Menjadi otak di balik kemudahan interaksi dan visual premium SafeTana, Restu merancang antarmuka pengguna yang memukau dan ergonomis. Restu bertanggung jawab atas:</p>
      <ul>
        <li>Desain sistem estetika premium yang ramah mata (High-Contrast Dark Mode) guna memastikan layar tetap terbaca jelas saat terjadi pemadaman listrik akibat bencana.</li>
        <li>Modul wizard <strong>HL7 FHIR Health Screening</strong> dan dashboard interaktif <strong>Mood Tracker 30 Hari</strong>.</li>
        <li>Efek micro-animations dan chime engine Web Audio API yang menyambut pengguna secara hangat.</li>
      </ul>
      <p>Kolaborasi sinergis ini melahirkan SafeTana AI sebagai platform tangguh, terpercaya, dan indah dipandang mata.</p>
    `,
    author: "SafeTana Editorial",
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
