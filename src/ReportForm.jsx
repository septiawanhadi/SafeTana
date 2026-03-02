import React, { useState } from 'react';
import { Send, MapPin, Camera, X } from 'lucide-react';
import { sanitizeInput } from './securityUtils';

const ReportForm = ({ onClose }) => {
  const [report, setReport] = useState({
    type: 'Banjir',
    description: '',
    location: 'Mendeteksi lokasi...'
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Sanitize before submitting to database (demonstrated here)
    const sanitizedReport = {
      ...report,
      type: sanitizeInput(report.type),
      description: sanitizeInput(report.description),
    };

    console.log("Submitting Sanitized Report:", sanitizedReport);
    alert("Laporan Anda telah terkirim dan sedang dianalisis AI.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
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
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 mt-1 text-white focus:ring-2 focus:ring-red-500 outline-none"
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
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 mt-1 text-white focus:ring-2 focus:ring-red-500 outline-none"
              onChange={(e) => setReport({ ...report, description: e.target.value })}
            ></textarea>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 flex items-center gap-3">
            <MapPin size={18} className="text-red-500" />
            <span className="text-xs text-slate-400">{report.location}</span>
          </div>

          <div className="flex gap-3">
            <button type="button" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition">
              <Camera size={18} /> Foto
            </button>
            <button type="submit" className="flex-[2] bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-red-900/20">
              Kirim Laporan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;