import React, { useState, useEffect } from 'react';
import { Newspaper, ChevronLeft, Calendar, ExternalLink, AlertCircle, RefreshCw, Flame, Droplets, Wind, Mountain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_NEWS = [
    {
        title: "Gempa Magnitudo 6.2 Guncang Pesisir Barat Sumatra",
        description: "Gempa bumi tektonik dengan magnitudo 6.2 terasa kuat di wilayah pesisir barat Sumatra. Masyarakat diimbau untuk tetap tenang dan waspada terhadap gempa susulan.",
        content: "BMKG melaporkan pusat gempa berada di kedalaman 10km. Tim SAR sedang melakukan penyisiran di area terdampak.",
        url: "#",
        image: "https://images.unsplash.com/photo-1542159670-ef1d7ad795b8?auto=format&fit=crop&q=80&w=800",
        publishedAt: new Date().toISOString(),
        source: { name: "BMKG Official" },
        type: "Gempa Bumi",
        icon: <AlertCircle size={16} className="text-red-500" />
    },
    {
        title: "Banjir Bandang Melanda Sebagian Wilayah Jawa Tengah",
        description: "Hujan deras berhari-hari memicu luapan sungai yang merendam ratusan rumah di Jawa Tengah.",
        content: "Evakuasi warga sedang berlangsung. Bantuan makanan dan tenda darurat sangat dibutuhkan.",
        url: "#",
        image: "https://images.unsplash.com/photo-1547683905-f30e618e3881?auto=format&fit=crop&q=80&w=800",
        publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        source: { name: "BNPB" },
        type: "Banjir",
        icon: <Droplets size={16} className="text-blue-500" />
    },
    {
        title: "Status Gunung Merapi Ditingkatkan Menjadi Siaga",
        description: "Aktivitas vulkanik Gunung Merapi mengalami peningkatan signifikan dalam 24 jam terakhir.",
        content: "Warga yang tinggal di radius 5 km dari puncak Gunung Merapi diminta untuk segera mengungsi ke tempat aman.",
        url: "#",
        image: "https://images.unsplash.com/photo-1463132647313-f42f7fc53cfa?auto=format&fit=crop&q=80&w=800",
        publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        source: { name: "PVMBG" },
        type: "Erupsi Gunung",
        icon: <Mountain size={16} className="text-orange-500" />
    },
    {
        title: "Cuaca Ekstrem: Angin Puting Beliung Sapu Puluhan Rumah",
        description: "BMKG memperingatkan cuaca ekstrem masih berpotensi terjadi di wilayah pesisir utara.",
        content: "Puting beliung merusak puluhan atap rumah warga. Tim gabungan telah dikerahkan.",
        url: "#",
        image: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&q=80&w=800",
        publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        source: { name: "Antara News" },
        type: "Angin Kencang",
        icon: <Wind size={16} className="text-slate-400" />
    },
    {
        title: "Kebakaran Hutan Mulai Mengancam Permukiman",
        description: "Titik api baru terpantau di hutan lindung dan mulai mendekat ke area desa.",
        content: "Gubernur menetapkan status tanggap darurat karhutla untuk provinsi ini.",
        url: "#",
        image: "https://images.unsplash.com/photo-1601332069884-15a8149de789?auto=format&fit=crop&q=80&w=800",
        publishedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        source: { name: "Kompas" },
        type: "Kebakaran",
        icon: <Flame size={16} className="text-orange-600" />
    }
];

const NewsDashboard = () => {
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        try {
            // Menggunakan GNews API gratis. Ganti dengan key Anda jika ingin live, fallback ke mock jika tidak ada key atau error.
            const API_KEY = import.meta.env.VITE_NEWS_API_KEY;

            if (!API_KEY) {
                console.warn("VITE_NEWS_API_KEY tidak ditemukan di .env, menggunakan data simulasi/mock.");
                // Beri waktu seolah-olah loading network
                await new Promise(r => setTimeout(r, 1000));
                setNews(MOCK_NEWS);
                setLoading(false);
                return;
            }

            // Request ke Vercel Serverless Function (Backend kita)
            let response;

            // Cek apakah jalan di lokal (Vite Dev Server) atau Vercel Production
            if (import.meta.env.DEV) {
                // Jika di lokal, panggil GNews langsung (Vite dev server tidak mengeksekusi api/news.js)
                response = await fetch(`https://gnews.io/api/v4/search?q=bencana OR gempa OR banjir OR tsunami OR erupsi&lang=id&country=id&topic=nation&apikey=${API_KEY}&max=10`);
            } else {
                // Jika di Vercel, panggil Backend Serverless Vercel kita
                response = await fetch(`/api/news`);
            }

            if (!response.ok) {
                throw new Error("Gagal mengambil berita. API Key mungkin melebihi batas (limit) atau tidak valid.");
            }

            const textResponse = await response.text();

            // Pencegahan tambahan jika response mengembalikan file statis JS (saat config lokal salah)
            if (textResponse.trim().startsWith('export')) {
                throw new Error("Local dev server is serving static JS instead of executing function.");
            }

            const data = JSON.parse(textResponse);

            if (data.articles && data.articles.length > 0) {
                setNews(data.articles);
            } else {
                throw new Error("Tidak ada berita ditemukan dari API.");
            }

        } catch (err) {
            console.warn(err);
            setError("Gagal memuat berita terkini dari server. Menampilkan arsip/simulasi berita.");
            setNews(MOCK_NEWS); // Fallback data
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const assignTypeTags = (article) => {
        const text = (article.title + " " + article.description).toLowerCase();
        if (text.includes('gempa') || text.includes('tsunami')) return { type: 'Gempa Bumi', color: 'text-red-500', bg: 'bg-red-500/10' };
        if (text.includes('banjir') || text.includes('hujan')) return { type: 'Banjir', color: 'text-blue-500', bg: 'bg-blue-500/10' };
        if (text.includes('gunung') || text.includes('erupsi')) return { type: 'Erupsi', color: 'text-orange-500', bg: 'bg-orange-500/10' };
        if (text.includes('angin') || text.includes('puting')) return { type: 'Cuaca Ekstrem', color: 'text-slate-400', bg: 'bg-slate-400/10' };
        return { type: 'Berita Bencana', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans p-4 lg:p-8">
            {/* Header / Navigasi Atas */}
            <nav className="max-w-[1600px] mx-auto flex justify-between items-center mb-10 pb-6 border-b border-slate-800">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                >
                    <div className="bg-slate-800 p-2 rounded-xl group-hover:bg-slate-700 transition">
                        <ChevronLeft size={20} />
                    </div>
                    <span className="font-bold uppercase tracking-widest text-sm">Kembali ke Peta</span>
                </button>

                <div className="flex items-center gap-3">
                    <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-600/30">
                        <Newspaper size={24} className="text-blue-500" />
                    </div>
                    <div>
                        <h1 className="font-black text-2xl text-white uppercase tracking-tighter leading-none">Pusat Berita <span className="text-blue-500">Bencana</span></h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Update Terkini Wilayah Indonesia</p>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-[1600px] mx-auto animate-in fade-in duration-700">

                {/* Banner Alert jika error */}
                {error && (
                    <div className="bg-red-950/40 border border-red-900/50 p-4 rounded-2xl flex items-start gap-4 mb-8">
                        <AlertCircle size={24} className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-black text-white uppercase tracking-tight text-sm">Peringatan Koneksi</h4>
                            <p className="text-slate-400 text-xs font-medium mt-1">{error}</p>
                        </div>
                        <button onClick={fetchNews} className="ml-auto bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-white transition flex items-center gap-2 text-xs font-bold uppercase">
                            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Coba Lagi
                        </button>
                    </div>
                )}

                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                        Sorotan Terkini
                        {loading && <RefreshCw size={16} className="text-blue-500 animate-spin" />}
                    </h2>
                </div>

                {/* Grid Layout Berita */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading && !news.length ? (
                        // Skeleton Loading Cards
                        [...Array(8)].map((_, i) => (
                            <div key={i} className="bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden min-h-[400px] flex flex-col p-2 animate-pulse">
                                <div className="w-full h-48 bg-slate-800/80 rounded-2xl mb-4" />
                                <div className="p-4 flex-1 flex flex-col gap-3">
                                    <div className="w-24 h-4 bg-slate-800 rounded-lg" />
                                    <div className="w-full h-6 bg-slate-800 rounded-lg" />
                                    <div className="w-3/4 h-6 bg-slate-800 rounded-lg" />
                                    <div className="w-full h-16 bg-slate-800 rounded-lg mt-auto" />
                                </div>
                            </div>
                        ))
                    ) : (
                        // News Cards
                        news.map((item, index) => {
                            const tag = assignTypeTags(item);

                            return (
                                <a
                                    key={index}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group bg-slate-900/40 hover:bg-slate-800/60 rounded-[2rem] border border-slate-800 hover:border-blue-500/50 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-15px_rgba(59,130,246,0.2)] p-2"
                                >
                                    <div className="relative w-full h-52 rounded-tl-[1.5rem] rounded-tr-[1.5rem] overflow-hidden">
                                        <img
                                            src={item.image || "https://images.unsplash.com/photo-1542159670-ef1d7ad795b8?auto=format&fit=crop&q=80&w=800"}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            onError={(e) => {
                                                e.target.src = "https://images.unsplash.com/photo-1542159670-ef1d7ad795b8?auto=format&fit=crop&q=80&w=800"; // Fallback image if broken
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />

                                        {/* Badge Tipe Bencana */}
                                        <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border backdrop-blur-md ${tag.bg} ${tag.color} border-current border-opacity-30 flex items-center gap-1.5`}>
                                            {item.icon || <AlertCircle size={12} />}
                                            {item.type || tag.type}
                                        </div>

                                        {/* Badge Sumber */}
                                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-xs font-bold text-white z-10">
                                            <span className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">{item.source.name}</span>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col bg-gradient-to-b from-[#020617]/50 to-transparent rounded-bl-[1.5rem] rounded-br-[1.5rem]">
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">
                                            <Calendar size={12} />
                                            {formatDate(item.publishedAt)}
                                        </div>

                                        <h3 className="text-base font-black text-white leading-snug mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                                            {item.title}
                                        </h3>

                                        <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-3 mb-5 flex-1">
                                            {item.description}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-slate-800/80 flex items-center justify-between text-blue-500 font-bold uppercase tracking-widest text-[10px]">
                                            BACA SELENGKAPNYA
                                            <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </div>
                                    </div>
                                </a>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
};

export default NewsDashboard;
