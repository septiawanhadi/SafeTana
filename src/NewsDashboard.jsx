import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const FALLBACK_ARTICLES = [
  {
    title: "Panduan Evakuasi Gempa Bumi di Gedung Bertingkat",
    slug: "panduan-evakuasi-gempa-gedung-bertingkat",
    description: "Gempa bumi dapat terjadi kapan saja tanpa peringatan. Jika Anda berada di dalam gedung bertingkat saat gempa terjadi, berikut adalah langkah-langkah keselamatan terpenting yang wajib Anda lakukan.",
    content: `
      <p class="mb-4">Gempa bumi dapat terjadi kapan saja tanpa peringatan. Jika Anda berada di dalam gedung bertingkat saat gempa terjadi, berikut adalah langkah-langkah keselamatan terpenting yang wajib Anda lakukan:</p>
      <ul class="list-disc pl-6 mb-4 space-y-3">
        <li><strong>Drop, Cover, and Hold On:</strong> Segera tiarap di bawah meja kokoh, lindungi kepala dan leher Anda, dan pegang kaki meja.</li>
        <li><strong>Jauhi Jendela Kaca:</strong> Pecahan kaca jendela luar sangat berbahaya saat terjadi guncangan besar.</li>
        <li><strong>Jangan Gunakan Lift:</strong> Lift dapat kehilangan daya listrik secara mendadak. Gunakan tangga darurat secara tertib.</li>
        <li><strong>Ikuti Panduan Peta Bencana SafeTana:</strong> Setelah guncangan mereda, periksa aplikasi SafeTana Anda untuk menemukan rute evakuasi dan shelter/titik kumpul terdekat di wilayah Anda.</li>
      </ul>
      <p class="mb-4">Ingat untuk selalu tenang, jangan panik, dan bantu sesama yang membutuhkan evakuasi jika kondisi Anda sendiri sudah aman.</p>
    `,
    author: "Septiawan Hadi Prasetyo",
    publishedAt: "2026-05-29T12:00:00Z",
    source: { name: "SafeTana Editorial" },
    image: "https://images.unsplash.com/photo-1542159670-ef1d7ad795b8?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Kesiapsiagaan Menghadapi Banjir di Musim Pancaroba",
    slug: "kesiapsiagaan-menghadapi-banjir-pancaroba",
    description: "Memasuki musim pancaroba, curah hujan ekstrem seringkali memicu luapan sungai dan banjir bandang. SafeTana mengimbau masyarakat untuk mempersiapkan langkah mitigasi mandiri.",
    content: `
      <p class="mb-4">Memasuki musim pancaroba, curah hujan ekstrem seringkali memicu luapan sungai dan banjir bandang. SafeTana mengimbau masyarakat untuk mempersiapkan langkah mitigasi mandiri:</p>
      <ol class="list-decimal pl-6 mb-4 space-y-3">
        <li><strong>Siapkan Tas Siaga Bencana (TSB):</strong> Isi dengan dokumen penting terenkripsi, obat-obatan darurat, lampu senter, air minum, dan makanan instan.</li>
        <li><strong>Pantau AQI & Level Air:</strong> Selalu cek dashboard SafeTana secara berkala untuk memantau curah hujan dan tingkat kerawanan wilayah Anda.</li>
        <li><strong>Gunakan Peta Evakuasi Live:</strong> Jika wilayah Anda tergenang, manfaatkan peta interaktif SafeTana untuk menuju Fasilitas Kesehatan atau Posko Evakuasi terdekat yang aman.</li>
      </ol>
      <p class="mb-4">Pastikan instalasi listrik di rumah dimatikan jika genangan air mulai masuk ke pemukiman, dan segera laporkan insiden banjir di sekitar Anda melalui menu Pelaporan Warga di SafeTana.</p>
    `,
    author: "Restu Utami",
    publishedAt: "2026-05-28T09:30:00Z",
    source: { name: "SafeTana Editorial" },
    image: "https://images.unsplash.com/photo-1547683905-f30e618e3881?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Manfaat Skrining Kesehatan Mandiri Secara Berkala",
    slug: "manfaat-skrining-kesehatan-berkala",
    description: "Resiliensi tidak hanya tentang bencana alam, melainkan juga ketahanan kesehatan tubuh kita. Melakukan skrining kesehatan mandiri secara rutin dapat mendeteksi dini berbagai risiko penyakit kronis.",
    content: `
      <p class="mb-4">Resiliensi tidak hanya tentang bencana alam, melainkan juga ketahanan kesehatan tubuh kita. Melakukan skrining kesehatan mandiri memiliki dampak luar biasa bagi kesehatan jangka panjang Anda:</p>
      <p class="mb-4">Melalui modul <strong>SafeTana AI Health (Klinik AI)</strong>, Anda dapat dengan mudah menghitung Indeks Massa Tubuh (IMT) secara otomatis untuk mendeteksi risiko obesitas, serta memantau ambang batas tekanan darah sistolik dan diastolik guna mendeteksi pra-hipertensi sejak dini.</p>
      <p class="mb-4">Dengan mengintegrasikan data hasil observasi ke dalam standar rekam medis digital HL7 FHIR, data kesehatan Anda menjadi lebih aman, terstruktur, dan siap disinkronisasikan secara langsung dengan fasilitas kesehatan terdekat.</p>
      <p class="mb-4">Pastikan Anda meluangkan waktu sejenak setiap minggu untuk mencatat tanda-tanda vital di menu skrining demi menjaga kebugaran di tengah lingkungan yang dinamis.</p>
    `,
    author: "SafeTana Health Team",
    publishedAt: "2026-05-27T08:15:00Z",
    source: { name: "SafeTana Health" },
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800"
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
