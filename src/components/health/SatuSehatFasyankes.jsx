import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { satuSehatService } from '../../services/health/satuSehatService';
import { calculateDistance } from '../../utils/geoUtils';

const JENIS_SARANA = [
  { id: '104', label: 'Rumah Sakit', icon: 'local_hospital' },
  { id: '103', label: 'Klinik', icon: 'medical_services' },
  { id: '102', label: 'Puskesmas', icon: 'health_and_safety' },
  { id: '101', label: 'Praktik Mandiri', icon: 'stethoscope' }
];

const SatuSehatFasyankes = () => {
  const navigate = useNavigate();
  const [selectedJenis, setSelectedJenis] = useState('104');
  const [searchQuery, setSearchQuery] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          jenis_sarana: selectedJenis,
          kode_provinsi: '32', // Filter khusus Jawa Barat (Kode BPS 32)
          limit: 100, // Jika ada pencarian nama, 100 sudah cukup spesifik
          page: 1
        };
        if (searchQuery.trim()) {
           params.nama = searchQuery.trim();
        }
        
        const response = await satuSehatService.getMasterSarana(params);
        
        if (response && response.data) {
          let faskesList = response.data;
          
          // Dapatkan lokasi pengguna untuk sortir terdekat
          const getUserLoc = () => new Promise((resolve) => {
             if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                  () => resolve(null),
                  { timeout: 5000 }
                );
             } else {
                resolve(null);
             }
          });

          const loc = await getUserLoc();
          if (loc) {
             faskesList = faskesList.map(f => {
                let distance = Infinity;
                // Cek properti latitude/longitude di root atau di dalam posisi
                const lat = f.latitude || f.posisi?.latitude;
                const lon = f.longitude || f.posisi?.longitude;
                if (lat && lon) {
                   distance = calculateDistance(loc.lat, loc.lon, parseFloat(lat), parseFloat(lon));
                }
                return { ...f, distance };
             }).sort((a, b) => a.distance - b.distance);
          }

          setFacilities(faskesList);
        } else {
          setFacilities([]);
        }
      } catch (err) {
        console.error('Failed to fetch fasyankes:', err);
        setError('Gagal memuat data dari SATUSEHAT Sandbox. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    // Use a small debounce for search query
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedJenis, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-on-background font-body pb-20">
      <header className="glass-card shadow-sm sticky top-0 z-50 border-b border-outline-variant/20 relative">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-[-1]" />
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between relative z-10">
          <button onClick={() => navigate('/health')} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-2">
               <span className="material-symbols-outlined text-primary">local_hospital</span>
               <h1 className="font-headline font-black text-lg text-on-surface tracking-tight">Direktori Fasyankes</h1>
             </div>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 pb-32 space-y-8">
        
        {/* Header Info */}
        <section className="text-center space-y-4">
           <h2 className="text-3xl font-headline font-black text-on-surface tracking-tight">Cari Sarana Kesehatan Terdekat</h2>
           <p className="text-sm font-medium text-on-surface-variant opacity-80 max-w-xl mx-auto leading-relaxed">
             Data ini bersumber langsung dari Master Sarana Index (MSI) Kemenkes via integrasi SATUSEHAT Sandbox.
           </p>
           <div className="max-w-md mx-auto relative pt-4">
             <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 translate-y-2 text-on-surface-variant">search</span>
             <input 
               type="text" 
               placeholder="Cari nama rumah sakit, puskesmas, atau klinik..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner placeholder:text-on-surface-variant/40"
             />
           </div>
        </section>

        {/* Tab Filters */}
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x">
           {JENIS_SARANA.map((jenis) => (
             <button
               key={jenis.id}
               onClick={() => setSelectedJenis(jenis.id)}
               className={`snap-center flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-300 shadow-sm ${
                 selectedJenis === jenis.id 
                   ? 'bg-primary text-on-primary border-primary shadow-primary/20 shadow-lg scale-[1.02]' 
                   : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high border-outline-variant/10'
               }`}
             >
               <span className="material-symbols-outlined" style={{ fontVariationSettings: selectedJenis === jenis.id ? "'FILL' 1" : "'FILL' 0" }}>
                 {jenis.icon}
               </span>
               <span className="font-bold text-sm uppercase tracking-widest">{jenis.label}</span>
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest animate-pulse">Menghubungkan ke Kemenkes...</p>
            </div>
          ) : error ? (
            <div className="glass-card p-8 rounded-3xl border-error/20 bg-error/5 text-center flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-4xl text-error">wifi_off</span>
              <p className="text-sm font-bold text-error">{error}</p>
              <button onClick={() => setSelectedJenis(selectedJenis)} className="mt-2 bg-error text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-error/90 active:scale-95 transition-all">
                Coba Lagi
              </button>
            </div>
          ) : facilities.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border-outline-variant/10 text-center flex flex-col items-center gap-4 opacity-70">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant">search_off</span>
              <h3 className="font-headline font-black text-xl text-on-surface">Tidak Ada Data</h3>
              <p className="text-sm font-medium text-on-surface-variant max-w-md">Belum ada sarana kesehatan untuk kategori ini di dalam sistem sandbox SATUSEHAT.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {facilities.map((facility) => (
                <div key={facility.kode_satusehat} className="glass-card rounded-[2rem] p-6 border border-outline-variant/10 shadow-lg hover:shadow-xl transition-shadow group flex flex-col h-full bg-surface-container-low/30 hover:bg-white/5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {JENIS_SARANA.find(j => j.id === selectedJenis)?.icon || 'business'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline font-black text-on-surface leading-tight group-hover:text-primary transition-colors">{facility.nama}</h3>
                        <p className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mt-1">ID: {facility.kode_satusehat}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-grow space-y-4">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm text-primary mt-0.5 shrink-0">location_on</span>
                      <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{facility.alamat}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {facility.distance !== undefined && facility.distance !== Infinity && (
                        <span className="px-3 py-1 bg-tertiary/10 rounded-lg text-[10px] font-bold text-tertiary border border-tertiary/20 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">near_me</span>
                          {facility.distance.toFixed(1)} km
                        </span>
                      )}
                      {facility.kabkota?.nama && (
                        <span className="px-3 py-1 bg-surface-container-highest rounded-lg text-[10px] font-bold text-on-surface-variant border border-outline-variant/10">
                          {facility.kabkota.nama}
                        </span>
                      )}
                      {facility.provinsi?.nama && (
                        <span className="px-3 py-1 bg-surface-container-highest rounded-lg text-[10px] font-bold text-on-surface-variant border border-outline-variant/10">
                          {facility.provinsi.nama}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${facility.status_aktif ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-error'}`} />
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                         {facility.status_aktif ? 'Aktif Beroperasi' : 'Tidak Aktif'}
                       </span>
                     </div>
                     {facility.status_sarana && (
                       <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-2 py-1 bg-primary/10 rounded-md">
                         {facility.status_sarana}
                       </span>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SatuSehatFasyankes;
