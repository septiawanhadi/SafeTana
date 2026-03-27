import React from 'react';

const TopAppBar = ({ title = "SafeTana AI", userAvatar = null, isSOS = false }) => {
  return (
    <header className={`fixed top-0 w-full z-50 transition-colors duration-500 ${isSOS ? 'bg-error shadow-2xl' : 'bg-[#0b1326]/60 backdrop-blur-xl shadow-lg'}`}>
      <div className="flex items-center justify-between px-6 h-16 w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="SafeTana Logo" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <h1 className={`font-headline font-black text-xl tracking-tight ${isSOS ? 'text-white' : 'text-[#c3c0ff]'}`}>
            {isSOS ? 'PERINGATAN KRITIS' : title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
           {isSOS && (
             <div className="bg-white/20 px-3 py-1 rounded-full border border-white/30 animate-pulse">
               <span className="text-[10px] font-black text-white uppercase tracking-widest">SOS AKTIF</span>
             </div>
           )}
           <button className={`w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors active:scale-95 duration-200 overflow-hidden`}>
             {userAvatar ? (
               <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <span className={`material-symbols-outlined text-[18px] ${isSOS ? 'text-white' : 'text-[#c3c0ff]'}`}>person</span>
             )}
           </button>
           <button className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors active:scale-95 duration-200 ${isSOS ? 'text-white' : 'text-[#c3c0ff]'}`}>
             <span className="material-symbols-outlined">{isSOS ? 'emergency_share' : 'notifications'}</span>
           </button>
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;
