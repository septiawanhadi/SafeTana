import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        try {
            const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
            if (!API_KEY) {
                setNews(MOCK_NEWS);
                setLoading(false);
                return;
            }
            const response = await fetch(`https://gnews.io/api/v4/search?q=bencana OR gempa OR banjir OR tsunami OR erupsi&lang=id&country=id&topic=nation&apikey=${API_KEY}&max=10`);
            if (!response.ok) throw new Error("API Limit Reached");
            const data = await response.json();
            setNews(data.articles || MOCK_NEWS);
        } catch (err) {
            setNews(MOCK_NEWS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const assignTypeTags = (article) => {
        const text = (article.title + " " + article.description).toLowerCase();
        if (text.includes('gempa')) return { type: 'Quake', color: 'text-error', bg: 'bg-error/10', icon: 'emergency' };
        if (text.includes('banjir')) return { type: 'Flood', color: 'text-primary', bg: 'bg-primary/10', icon: 'waves' };
        if (text.includes('gunung')) return { type: 'Volcano', color: 'text-tertiary', bg: 'bg-tertiary/10', icon: 'volcano' };
        return { type: 'Alert', color: 'text-secondary', bg: 'bg-secondary/10', icon: 'notifications' };
    };

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
                        <a href={news[0].url} target="_blank" rel="noreferrer" className="md:col-span-8 glass-card rounded-lg overflow-hidden group relative min-h-[400px] flex flex-col justify-end p-8 border-l-4 border-error shadow-2xl active:scale-[0.99] transition-transform">
                            <div className="absolute inset-0 z-0">
                                <img src={news[0].image} className="w-full h-full object-cover grayscale brightness-[0.3] group-hover:scale-110 transition-transform duration-700" alt="News" />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <span className="bg-error text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Urgent Update</span>
                                <h3 className="font-headline font-black text-3xl md:text-5xl text-white leading-none tracking-tighter max-w-2xl">{news[0].title}</h3>
                                <p className="text-white/70 text-sm font-medium line-clamp-2 max-w-xl">{news[0].description}</p>
                            </div>
                        </a>
                    )}

                    {/* Secondary News Stream (Right side, stacked) */}
                    <div className="md:col-span-4 flex flex-col gap-6">
                        {news.slice(1, 3).map((item, idx) => (
                            <a key={idx} href={item.url} target="_blank" rel="noreferrer" className="glass-card rounded-lg p-5 flex flex-col justify-between aspect-square md:aspect-auto md:flex-1 active:scale-95 transition-transform shadow-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary border border-outline-variant/10">
                                        <span className="material-symbols-outlined">{assignTypeTags(item).icon}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">2h ago</span>
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
                                <a key={idx} href={item.url} target="_blank" rel="noreferrer" className="glass-card rounded-lg p-5 group active:scale-95 transition-transform shadow-lg border-b-2 border-outline-variant/10 hover:border-primary/40">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`material-symbols-outlined text-sm ${tag.color}`}>{tag.icon}</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${tag.color}`}>{tag.type}</span>
                                    </div>
                                    <h5 className="font-headline font-black text-on-surface leading-tight tracking-tight mb-4 group-hover:text-primary transition-colors">{item.title}</h5>
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
        </div>
    );
};

export default NewsDashboard;
