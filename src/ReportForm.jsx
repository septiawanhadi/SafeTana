import React, { useState, useEffect, useRef } from 'react';
import { Send, MapPin, Camera, X, CheckCircle2 } from 'lucide-react';
import { sanitizeInput } from './securityUtils';
import { reverseGeocode } from './utils/geoUtils';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ReportForm = ({ onClose }) => {
  const [report, setReport] = useState({
    type: 'Banjir',
    description: '',
    location: 'Mendeteksi lokasi...',
    coords: null,
    photo: null
  });
  const [isLocating, setIsLocating] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const address = await reverseGeocode(lat, lon);
            setReport(prev => ({ 
              ...prev, 
              coords: { lat, lon },
              location: address || `${lat.toFixed(4)}, ${lon.toFixed(4)}`
            }));
          } catch {
            setReport(prev => ({ 
              ...prev, 
              coords: { lat, lon },
              location: `${lat.toFixed(4)}, ${lon.toFixed(4)}` 
            }));
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.warn("Geolokasi gagal:", error);
          setReport(prev => ({ ...prev, location: 'Gagal mendeteksi lokasi. Pastikan GPS aktif.' }));
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setReport(prev => ({ ...prev, location: 'Geolokasi tidak didukung di browser ini.' }));
      setIsLocating(false);
    }
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReport(prev => ({ ...prev, photo: file }));
    }
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'Banjir': return 'bg-primary';
      case 'Gempa Bumi': return 'bg-error';
      case 'Tanah Longsor': return 'bg-amber-500';
      case 'Kebakaran': return 'bg-error';
      case 'Angin Puting Beliung': return 'bg-surface-variant';
      default: return 'bg-tertiary';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!report.coords) {
      alert("Gagal mengirim: Lokasi belum didapatkan. Pastikan GPS aktif.");
      return;
    }

    // Generate slight random offset (jitter) so markers don't overlap perfectly with user location
    const offsetLat = report.coords.lat + (Math.random() - 0.5) * 0.002;
    const offsetLon = report.coords.lon + (Math.random() - 0.5) * 0.002;

    // Sanitize and format before submitting to database
    const sanitizedReport = {
      type: sanitizeInput(report.type),
      desc: sanitizeInput(report.description),
      loc: report.location,
      position: [offsetLat, offsetLon],
      source: 'Warga',
      photoName: report.photo ? report.photo.name : null,
      timestamp: serverTimestamp(),
      statusColor: getStatusColor(report.type)
    };

    try {
      await addDoc(collection(db, 'user_reports'), sanitizedReport);
      
      // AI Triage Simulation: Auto-Broadcast critical events
      const criticalTypes = ['Gempa Bumi', 'Tanah Longsor', 'Kebakaran', 'Banjir', 'Angin Puting Beliung'];
      if (criticalTypes.includes(sanitizedReport.type)) {
        await addDoc(collection(db, 'broadcasts'), {
          message: `🚨 AWAS: Terdeteksi ${sanitizedReport.type} di area ${sanitizedReport.loc}. Harap waspada dan jauhi area!`,
          type: 'Darurat',
          timestamp: serverTimestamp()
        });
      }

      alert("Laporan Anda telah terkirim dan sedang dianalisis AI.");
      onClose();
    } catch (err) {
      console.error("Gagal mengirim laporan:", err);
      if (err.code === 'permission-denied') {
        alert("Gagal mengirim: Akses ditolak oleh Firebase. Pastikan Rules Firestore Anda sudah diatur ke 'allow read, write: if true;'.");
      } else {
        alert("Gagal mengirim laporan. Silakan periksa koneksi internet atau ekstensi Adblocker Anda.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-red-600/10">
          <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
            <Send size={20} /> Laporkan Kejadian
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Jenis Bencana</label>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 mt-1 text-white focus:ring-2 focus:ring-red-500 outline-none transition"
              value={report.type}
              onChange={(e) => setReport({ ...report, type: e.target.value })}
            >
              <option>Banjir</option>
              <option>Gempa Bumi</option>
              <option>Tanah Longsor</option>
              <option>Kebakaran</option>
              <option>Angin Puting Beliung</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Detail Kejadian</label>
            <textarea
              rows="3"
              placeholder="Contoh: Air setinggi pinggang, butuh perahu karet..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 mt-1 text-white focus:ring-2 focus:ring-red-500 outline-none transition"
              onChange={(e) => setReport({ ...report, description: e.target.value })}
            ></textarea>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 flex items-center gap-3">
            <MapPin size={18} className={`${isLocating ? 'text-amber-500 animate-pulse' : 'text-red-500'}`} />
            <span className={`text-xs ${isLocating ? 'text-amber-500/80' : 'text-slate-300'}`}>{report.location}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload}
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 ${report.photo ? 'bg-green-900/40 text-green-400 border-green-700/50 hover:bg-green-900/60' : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'} py-3 rounded-xl flex items-center justify-center gap-2 border transition`}
            >
              {report.photo ? <CheckCircle2 size={18} /> : <Camera size={18} />} 
              <span className="text-sm font-semibold truncate max-w-[80px]">
                {report.photo ? 'Terlampir' : 'Foto'}
              </span>
            </button>
            <button 
              type="submit" 
              disabled={isLocating}
              className={`flex-[2] py-3 rounded-xl font-bold transition shadow-lg ${isLocating ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20 active:scale-95'}`}
            >
              {isLocating ? 'Menyiapkan...' : 'Kirim Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;