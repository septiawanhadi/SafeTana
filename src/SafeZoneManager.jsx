import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ShieldCheck, Plus, Trash2, MapPin, Building2, AlignLeft, Search } from 'lucide-react';

const SafeZoneManager = () => {
    const [safeZones, setSafeZones] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // form state
    const [name, setName] = useState('');
    const [addr, setAddr] = useState('');
    const [faskes, setFaskes] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');

    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const q = collection(db, 'safe_zones');
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const zones = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSafeZones(zones);
        });

        return () => unsubscribe();
    }, []);

    const handleAddZone = async (e) => {
        e.preventDefault();
        if (!name || !addr || !lat || !lng) return;

        setIsAdding(true);
        try {
            await addDoc(collection(db, 'safe_zones'), {
                name,
                addr,
                faskes: faskes || 'Tidak Tersedia',
                position: [parseFloat(lat), parseFloat(lng)]
            });
            // clear form
            setName('');
            setAddr('');
            setFaskes('');
            setLat('');
            setLng('');
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Gagal menambahkan titik aman.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteZone = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus titik aman ini?")) {
            try {
                await deleteDoc(doc(db, 'safe_zones', id));
            } catch (error) {
                console.error("Error deleting document: ", error);
                alert("Gagal menghapus titik aman.");
            }
        }
    };

    const filteredZones = safeZones.filter(zone =>
        zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.addr.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-slate-900/30 border border-slate-800 rounded-[3rem] overflow-hidden flex flex-col text-white h-[800px]">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-green-900/20 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="bg-green-600/20 p-2 rounded-xl border border-green-500/30">
                        <ShieldCheck className="text-green-500" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-white leading-none">Manajemen Titik Aman</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Kelola Lokasi Evakuasi Bencana</p>
                    </div>
                </div>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" placeholder="Cari Titik Aman..." className="bg-slate-950 border border-slate-700 pl-10 pr-4 py-2 rounded-2xl text-xs text-white outline-none focus:border-green-500/50 transition-colors w-64" onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} />
                </div>
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-12 relative">

                {/* VIEW PANEL */}
                <div className="col-span-8 border-r border-slate-800 overflow-y-auto p-6 custom-scrollbar bg-slate-950/20">
                    <div className="grid grid-cols-2 gap-4">
                        {filteredZones.length === 0 ? (
                            <div className="col-span-2 py-10 text-center text-slate-500 text-xs italic">Belum ada titik aman yang ditambahkan.</div>
                        ) : (
                            filteredZones.map(zone => (
                                <div key={zone.id} className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl hover:border-green-500/50 transition-colors group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-sm text-green-400 uppercase tracking-tighter line-clamp-1 pr-8">{zone.name}</h4>
                                        <button onClick={() => handleDeleteZone(zone.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-500 transition-colors bg-slate-950 p-2 rounded-xl">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium mb-4 line-clamp-2 h-8">{zone.addr}</p>

                                    <div className="grid grid-cols-2 gap-2 mt-auto">
                                        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/50">
                                            <p className="text-[8px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1"><MapPin size={10} /> Koordinat</p>
                                            <p className="text-[10px] font-bold text-slate-300 font-mono tracking-tight">{zone.position?.[0]?.toFixed(4)}, {zone.position?.[1]?.toFixed(4)}</p>
                                        </div>
                                        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/50">
                                            <p className="text-[8px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1"><Building2 size={10} /> Fas. Medis</p>
                                            <p className="text-[10px] font-bold text-slate-300 truncate">{zone.faskes}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* INPUT PANEL */}
                <div className="col-span-4 bg-slate-900/40 p-6 overflow-y-auto custom-scrollbar">
                    <h4 className="font-black uppercase tracking-widest text-xs text-slate-400 mb-6 flex items-center gap-2">
                        <Plus size={16} className="text-green-500" /> Tambah Titik Baru
                    </h4>
                    <form onSubmit={handleAddZone} className="space-y-4">

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block flex items-center gap-2"><AlignLeft size={12} /> Nama Lokasi *</label>
                            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-green-500 transition-colors" placeholder="Misal: GOR Saparua" />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block flex items-center gap-2"><MapPin size={12} /> Alamat / Area *</label>
                            <textarea required value={addr} onChange={(e) => setAddr(e.target.value)} rows="3" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-green-500 transition-colors resize-none" placeholder="Kecamatan, Kelurahan, dll" />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block flex items-center gap-2"><Building2 size={12} /> Fasilitas Medis Terdekat</label>
                            <input type="text" value={faskes} onChange={(e) => setFaskes(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-green-500 transition-colors" placeholder="Opsional (Misal: RSUD Kota)" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Latitude *</label>
                                <input required type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-green-500 transition-colors placeholder:font-sans" placeholder="-6.9147" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Longitude *</label>
                                <input required type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-green-500 transition-colors placeholder:font-sans" placeholder="107.6098" />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-800 mt-6 !mb-0">
                            <button type="submit" disabled={isAdding} className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] active:scale-95 flex justify-center items-center gap-2">
                                {isAdding ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={16} />}
                                {isAdding ? "Menyimpan..." : "Simpan Titik Aman"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SafeZoneManager;
