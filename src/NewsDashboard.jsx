import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const FALLBACK_ARTICLES = [
  {
    title: "Tentang SafeTana AI: Pelopor Mitigasi Bencana Terintegrasi Berbasis AI",
    slug: "tentang-safetana-ai-mitigasi-bencana",
    description: "Mengenal SafeTana AI, sistem terintegrasi berbasis kecerdasan buatan (Gemini AI) yang menggabungkan pemetaan geospasial real-time, telemetry darurat BMKG, dan layanan medis mandiri.",
    content: `
      <p class="mb-4"><strong>SafeTana AI</strong> adalah platform progresif perintis yang dirancang khusus untuk memperkuat resiliensi masyarakat terhadap bencana alam dan krisis kesehatan. Dengan menggabungkan kekuatan pemetaan geospasial real-time, kecerdasan buatan (<strong>Google Gemini AI</strong>), dan modul layanan medis prediktif (Klinik AI), platform ini memberikan perlindungan menyeluruh—baik dari ancaman alam maupun risiko kesehatan personal.</p>
      <p class="mb-4">Mengusung jargon <em>"Cerdas Berbagi, Sigap Mitigasi, dan Peduli Kesehatan"</em>, SafeTana memadukan teknologi canggih seperti:</p>
      <ul class="list-disc pl-6 mb-4 space-y-3">
        <li><strong>AI Early Detection Engine & Voice Assistant (TTS):</strong> Integrasi Gemini AI untuk memandu evakuasi dengan asisten suara lantang.</li>
        <li><strong>Live User Tracking & SOS System:</strong> Fitur tracking lokasi anonim menggunakan algoritma Haversine dan enkripsi koordinat demi menjaga privasi penuh pengguna.</li>
        <li><strong>Peta Bencana Live:</strong> Visualisasi peta interaktif 24/7 berbasis Leaflet yang menampilkan data real-time BMKG & GDACS beserta titik kumpul evakuasi terdekat.</li>
      </ul>
      <p class="mb-4">SafeTana AI berkomitmen tinggi menjadi pelindung digital utama Anda, memastikan Anda selalu sigap dan terlindungi di mana pun Anda berada.</p>
    `,
    author: "Septiawan Hadi Prasetyo",
    publishedAt: "2026-05-29T12:00:00Z",
    source: { name: "SafeTana Editorial" },
    image: "https://images.unsplash.com/photo-1542159670-ef1d7ad795b8?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Klinik AI: Revolusi Layanan Medis Mandiri Berstandar HL7 FHIR di SafeTana",
    slug: "klinik-ai-safetana-layanan-kesehatan-mandiri",
    description: "Bagaimana Klinik AI memberdayakan masyarakat melalui skrining kesehatan mandiri JNC-8, pencatatan jurnal emosi 30 hari, dan sinkronisasi HL7 FHIR Kemenkes.",
    content: `
      <p class="mb-4">Kesehatan adalah pilar utama dalam keselamatan. Oleh karena itu, SafeTana menghadirkan <strong>SafeTana AI Health (Klinik AI)</strong>—sebuah ekosistem kesehatan mandiri digital yang canggih dan tersertifikasi standar internasional.</p>
      <p class="mb-4">Modul Klinik AI memberdayakan pengguna melalui serangkaian fitur medis presisi:</p>
      <ol class="list-decimal pl-6 mb-4 space-y-3">
        <li><strong>Skrining Kesehatan Mandiri:</strong> Penilaian instan cerdas untuk mengalkulasi Indeks Massa Tubuh (IMT) guna mendeteksi risiko obesitas, serta memantau ambang batas tekanan darah sistolik dan diastolik sesuai klasifikasi JNC-8.</li>
        <li><strong>Catatan Jurnal & Mood Tracker 30 Hari:</strong> Layanan catatan psikologis harian terintegrasi dengan dasbor analitik personal untuk memantau emosi dominan dan tren kesehatan mental Anda.</li>
        <li><strong>SatuSehat HL7 FHIR R4 Compliance:</strong> Seluruh data observasi kesehatan Anda dipetakan langsung ke format rekam medis digital HL7 FHIR (LOINC-compliant) yang siap disinkronisasikan ke kementerian kesehatan SatuSehat Indonesia.</li>
        <li><strong>SafeTanaBot (Health AI Assistant):</strong> Chatbot medis 24/7 siap menjawab gejala umum, rekomendasi gaya hidup sehat, hingga lokasi klinik terdekat secara interaktif.</li>
      </ol>
      <p class="mb-4">Dengan Klinik AI, kesehatan Anda berada dalam kendali penuh yang aman, terenkripsi, dan cerdas.</p>
    `,
    author: "Restu Utami",
    publishedAt: "2026-05-28T09:30:00Z",
    source: { name: "SafeTana Editorial" },
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Di Balik Layar SafeTana AI: Mengenal Septiawan Hadi Prasetyo dan Restu Utami",
    slug: "mengenal-developer-safetana-ai",
    description: "Di balik keandalan SafeTana AI. Profil Septiawan Hadi Prasetyo selaku Lead Developer dan Security Architect, serta Restu Utami selaku Co-Developer dan UI/UX Specialist.",
    content: `
      <p class="mb-4">Inovasi besar lahir dari dedikasi dan visi yang kuat. Platform <strong>SafeTana AI</strong> yang tangguh dan estetik ini dirancang serta dibangun oleh kolaborasi hebat talenta pengembang terbaik:</p>
      <h3 class="font-bold text-lg text-white mt-4 mb-2"><strong>1. Septiawan Hadi Prasetyo – Lead Developer dan Security Architect</strong></h3>
      <p class="mb-4">Bertindak sebagai arsitek utama sistem, Septiawan mendedikasikan keahliannya dalam menyusun infrastruktur web yang sangat aman dan berkinerja tinggi. Septiawan bertanggung jawab atas:</p>
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li>Penerapan <strong>Triple-Tier AI Fallback Chain</strong> (Gemini -> Groq -> OpenAI) yang memastikan asisten AI tidak pernah padam saat bencana melanda.</li>
        <li>Enkripsi koordinat lokasi real-time dan penyamaran data PII (Personal Identifiable Information) demi keamanan privasi mutlak pengguna.</li>
        <li>Implementasi arsitektur <em>Service Pattern</em> tersentralisasi pada backend serverless Vercel.</li>
      </ul>
      <h3 class="font-bold text-lg text-white mt-4 mb-2"><strong>2. Restu Utami – Co-Developer dan UI/UX Specialist</strong></h3>
      <p class="mb-4">Menjadi otak di balik kemudahan interaksi dan visual premium SafeTana, Restu merancang antarmuka pengguna yang memukau dan ergonomis. Restu bertanggung jawab atas:</p>
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li>Desain sistem estetika premium yang ramah mata (High-Contrast Dark Mode) guna memastikan layar tetap terbaca jelas saat terjadi pemadaman listrik akibat bencana.</li>
        <li>Modul wizard <strong>HL7 FHIR Health Screening</strong> dan dashboard interaktif <strong>Mood Tracker 30 Hari</strong>.</li>
        <li>Efek micro-animations dan chime engine Web Audio API yang menyambut pengguna secara hangat.</li>
      </ul>
      <p class="mb-4">Kolaborasi sinergis ini melahirkan SafeTana AI sebagai platform tangguh, terpercaya, dan indah dipandang mata.</p>
    `,
    author: "SafeTana Editorial",
    publishedAt: "2026-05-27T08:15:00Z",
    source: { name: "SafeTana Editorial" },
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
  }
];

const MOCK_NEWS = [
    {
        title: "Gempa Magnitudo 6.2 Guncang Pesisir Barat Sumatra",
        description: "Gempa bumi tektonik dengan magnitudo 6.2 terasa kuat di wilayah pesisir barat Sumatra. Masyarakat diimbau untuk tetap tenang.",
        url: "#",
        image: "https://images.unsplash.com/photo-1542159670-ef1d7ad795b8?auto=format&fit=crop&q=80&w=800",
        publishedAt: new Date().toISOString(),
        source: { name: "BMKG Official" },
        type: "Gempa Bumi",
        icon: "warning"
    },
    {
        title: "Banjir Bandang Melanda Sebagian Wilayah Jawa Tengah",
        description: "Hujan deras memicu luapan sungai yang merendam ratusan rumah di Jawa Tengah.",
        url: "#",
        image: "https://images.unsplash.com/photo-1547683905-f30e618e3881?auto=format&fit=crop&q=80&w=800",
        publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        source: { name: "BNPB" },
        type: "Banjir",
        icon: "waves"
    },
    {
        title: "Status Gunung Merapi Ditingkatkan Menjadi Siaga",
        description: "Aktivitas vulkanik Gunung Merapi mengalami peningkatan signifikan.",
        url: "#",
        image: "https://images.unsplash.com/photo-1463132647313-f42f7fc53cfa?auto=format&fit=crop&q=80&w=800",
        publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        source: { name: "PVMBG" },
        type: "Erupsi",
        icon: "volcano"
    }
];

const NewsDashboard = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
            let fetched = [];
            if (!API_KEY) {
                fetched = MOCK_NEWS;
            } else {
                const response = await fetch(`https://gnews.io/api/v4/search?q=bencana OR gempa OR banjir OR tsunami OR erupsi&lang=id&country=id&topic=nation&apikey=${API_KEY}&max=10`);
                if (!response.ok) throw new Error("API Limit Reached");
                const data = await response.json();
                fetched = data.articles || MOCK_NEWS;
            }
            // Kombinasikan FALLBACK_ARTICLES dengan berita dinamis
            setNews([...FALLBACK_ARTICLES, ...fetched]);
        } catch {
            setNews([...FALLBACK_ARTICLES, ...MOCK_NEWS]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const assignTypeTags = (article) => {
        const text = (article.title + " " + (article.description || "")).toLowerCase();
        if (text.includes('gempa')) return { type: 'Quake', color: 'text-error', bg: 'bg-error/10', icon: 'emergency' };
        if (text.includes('banjir')) return { type: 'Flood', color: 'text-primary', bg: 'bg-primary/10', icon: 'waves' };
        if (text.includes('gunung')) return { type: 'Volcano', color: 'text-tertiary', bg: 'bg-tertiary/10', icon: 'volcano' };
        return { type: 'Alert', color: 'text-secondary', bg: 'bg-secondary/10', icon: 'notifications' };
    };

    // Fungsi pembantu navigasi agar tidak memicu reload halaman penuh
    const handleArticleClick = (e, article) => {
        if (article.slug) {
            e.preventDefault();
            navigate(`/news/${article.slug}`);
        }
    };

    // Deteksi artikel aktif berdasarkan slug di URL
    const activeArticle = slug ? FALLBACK_ARTICLES.find(art => art.slug === slug) : null;

    return (
        <div className="bg-background text-on-background font-body min-h-screen pb-32">
            <main className="pt-24 pb-32 px-6 max-w-6xl mx-auto space-y-10">
                {/* News Header */}
                <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="font-display text-5xl text-on-surface leading-none tracking-tighter mb-2">Crisis Feed</h2>
                    <p className="text-on-surface-variant font-medium opacity-80 uppercase tracking-[0.2em] text-[10px]">Real-time Disaster Intelligence</p>
                  </div>
                  <button onClick={fetchNews} className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-primary active:scale-90 transition-transform shadow-lg shadow-primary/10">
                    <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>refresh</span>
                  </button>
                </section>

                {/* News Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Featured News (Left side, large) */}
                    {news[0] && (
                        <a 
                            href={news[0].slug ? `/news/${news[0].slug}` : news[0].url} 
                            onClick={(e) => handleArticleClick(e, news[0])}
                            target={news[0].slug ? "_self" : "_blank"} 
                            rel="noreferrer" 
                            className="md:col-span-8 glass-card rounded-lg overflow-hidden group relative min-h-[400px] flex flex-col justify-end p-8 border-l-4 border-error shadow-2xl active:scale-[0.99] transition-transform"
                        >
                            <div className="absolute inset-0 z-0">
                                <img src={news[0].image} className="w-full h-full object-cover grayscale brightness-[0.3] group-hover:scale-110 transition-transform duration-700" alt="News" />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <span className="bg-error text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                    {news[0].slug ? "SafeTana Editorial" : "Urgent Update"}
                                </span>
                                <h3 className="font-headline font-black text-3xl md:text-5xl text-white leading-none tracking-tighter max-w-2xl">{news[0].title}</h3>
                                <p className="text-white/70 text-sm font-medium line-clamp-2 max-w-xl">{news[0].description}</p>
                            </div>
                        </a>
                    )}

                    {/* Secondary News Stream (Right side, stacked) */}
                    <div className="md:col-span-4 flex flex-col gap-6">
                        {news.slice(1, 3).map((item, idx) => (
                            <a 
                                key={idx} 
                                href={item.slug ? `/news/${item.slug}` : item.url} 
                                onClick={(e) => handleArticleClick(e, item)}
                                target={item.slug ? "_self" : "_blank"} 
                                rel="noreferrer" 
                                className="glass-card rounded-lg p-5 flex flex-col justify-between aspect-square md:aspect-auto md:flex-1 active:scale-95 transition-transform shadow-xl"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary border border-outline-variant/10">
                                        <span className="material-symbols-outlined">{assignTypeTags(item).icon}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">
                                        {item.slug ? "Editorial" : "Live Feed"}
                                    </span>
                                </div>
                                <h4 className="font-headline font-black text-lg text-on-surface leading-tight tracking-tight line-clamp-3">{item.title}</h4>
                            </a>
                        ))}
                    </div>

                    {/* Grid of smaller news items under */}
                    <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                        {news.slice(3, 7).map((item, idx) => {
                            const tag = assignTypeTags(item);
                            return (
                                <a 
                                    key={idx} 
                                    href={item.slug ? `/news/${item.slug}` : item.url} 
                                    onClick={(e) => handleArticleClick(e, item)}
                                    target={item.slug ? "_self" : "_blank"} 
                                    rel="noreferrer" 
                                    className="glass-card rounded-lg p-5 group active:scale-95 transition-transform shadow-lg border-b-2 border-outline-variant/10 hover:border-primary/40"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`material-symbols-outlined text-sm ${tag.color}`}>{tag.icon}</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${tag.color}`}>{item.slug ? "Mitigation" : tag.type}</span>
                                    </div>
                                    <h5 className="font-headline font-black text-on-surface leading-tight tracking-tight mb-4 group-hover:text-primary transition-colors line-clamp-3">{item.title}</h5>
                                    <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">
                                        <span>{item.source.name}</span>
                                        <span className="material-symbols-outlined text-sm">arrow_outward</span>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </div>

                {/* Regional Safety Advisory */}
                <section className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10 shadow-md flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 bg-tertiary/20 rounded-full flex items-center justify-center text-tertiary shrink-0">
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>gshield</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-black text-on-surface text-lg tracking-tight mb-1 uppercase tracking-widest text-xs opacity-60">Guardian Advisory</h4>
                    <p className="text-on-surface font-headline font-bold text-sm leading-relaxed">
                      "Indonesia is currently in the seasonal monsoon transition. Expect sudden wind shifts and flash floods. Keep your digital emergency kit updated."
                    </p>
                  </div>
                </section>
            </main>

            {/* --- PREMIUM DYNAMIC READER PANEL OVERLAY --- */}
            {activeArticle && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl animate-fadeIn overflow-y-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) navigate('/news');
                    }}
                >
                    <div className="glass-card max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/10 max-h-[90vh] flex flex-col my-8 animate-fadeUp">
                        {/* Header hero image */}
                        <div className="relative h-64 md:h-80 w-full shrink-0">
                            <img src={activeArticle.image} alt={activeArticle.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1326] via-transparent to-transparent" />
                            <button 
                                onClick={() => navigate('/news')} 
                                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-background/60 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-all border border-white/10 hover:bg-background/80"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                        </div>
                        
                        {/* Article body */}
                        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                    {activeArticle.source.name}
                                </span>
                                <span className="text-xs text-on-surface-variant font-bold opacity-60">
                                    {new Date(activeArticle.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                            
                            <h1 className="font-display text-3xl md:text-4xl font-black text-on-surface leading-tight tracking-tight">
                                {activeArticle.title}
                            </h1>
                            
                            <div className="flex items-center gap-3 py-3 border-y border-outline-variant/10">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/10">
                                    {activeArticle.author[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-on-surface leading-none">{activeArticle.author}</p>
                                    <p className="text-[10px] text-on-surface-variant font-bold opacity-60 uppercase tracking-wider mt-1">Penulis Editorial SafeTana</p>
                                </div>
                            </div>

                            <div 
                                className="font-body text-base text-on-surface-variant leading-relaxed space-y-4 text-left"
                                dangerouslySetInnerHTML={{ __html: activeArticle.content }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsDashboard;
