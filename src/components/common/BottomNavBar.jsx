import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavBar = ({ onSOSClick, isSOS = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home', label: 'Beranda', icon: 'grid_view', path: '/' },
    { id: 'map', label: 'Peta', icon: 'explore', path: '/map' },
    { id: 'sos', label: 'SOS', icon: 'emergency', action: onSOSClick, isSpecial: true },
    { id: 'health', label: 'Klinik', icon: 'medical_services', path: '/health' },
    { id: 'profile', label: 'Profil', icon: 'person', path: '/admin' }, // Pointing to admin/login as placeholder for profile
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed bottom-0 w-full rounded-t-[32px] border-t z-50 transition-all duration-500 ${
      isSOS 
      ? 'bg-red-900/90 backdrop-blur-2xl border-white/20 shadow-[0_-20px_50px_rgba(220,38,38,0.3)]' 
      : 'bg-[#0b1326]/60 backdrop-blur-xl border-white/5 shadow-2xl'
    }`}>
      <div className="flex justify-around items-center px-4 pt-3 pb-8 w-full gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => (item.action ? item.action() : navigate(item.path))}
            className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-200 ${
              item.isSpecial
                ? isSOS ? 'text-white animate-pulse' : 'text-error opacity-90'
                : isActive(item.path)
                ? isSOS 
                  ? 'bg-white text-error rounded-full px-5 py-2 scale-105 shadow-xl'
                  : 'bg-primary text-white rounded-full px-5 py-2 scale-105 shadow-lg shadow-primary/20'
                : isSOS ? 'text-white/40' : 'text-slate-400 opacity-70'
            }`}
          >
            {item.id === 'sos' ? (
              <div className={`p-2.5 rounded-full mb-0.5 border ${isSOS ? 'bg-white/20 border-white/30' : 'bg-error-container/20 border-error/10'}`}>
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isSOS ? 'emergency_home' : item.icon}
                </span>
              </div>
            ) : (
              <span className={`material-symbols-outlined text-2xl ${isActive(item.path) ? 'scale-90' : ''}`} style={{ fontVariationSettings: isActive(item.path) ? "'FILL' 1" : "" }}>
                {item.icon}
              </span>
            )}
            {!isActive(item.path) && <span className="font-headline font-bold text-[10px] tracking-tight">{item.label}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavBar;
