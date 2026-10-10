// @ts-nocheck
import React, { useRef, useState, useEffect } from "react";
import { Camera, Award, Zap, Briefcase, Calendar, Edit3, Loader2 } from "lucide-react";

export default function ProfileHeaderCard({ user, isDarkMode, onImageSelect, onProfessionChange, isUploadingAvatar }) {
  const fileInputRef = useRef(null);
  
  const [isEditingProf, setIsEditingProf] = useState(false);
  const [profValue, setProfValue] = useState("");

  useEffect(() => {
    setProfValue(user.stats?.profession || "");
  }, [user.stats?.profession]);

  const cardStyle = isDarkMode
    ? "bg-slate-900/80 backdrop-blur-md border border-slate-800/80 shadow-[0_0_20px_rgba(0,0,0,0.25)]"
    : "bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-[0_0_20px_rgba(0,0,0,0.08)]";

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageSelect) {
      onImageSelect(file); 
    }
  };

  const handleSaveProfesi = () => {
    setIsEditingProf(false);
    if (profValue.trim() !== user.stats?.profession && profValue.trim() !== "") {
      onProfessionChange(profValue.trim()); 
    }
  };

  return (
    <div className={`${cardStyle} rounded-2xl p-6 transition-all`}>
      <div className="flex flex-col sm:flex-row items-center gap-5">
        
        {/* Area Foto Profil */}
        <div className="relative group shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 p-1 shadow-md relative flex items-center justify-center overflow-hidden">
            <img
              src={user.avatarUrl || "/assets/user1.avif"} 
              alt={user.name}
              className={`w-full h-full object-cover rounded-full border-2 border-white dark:border-slate-800 bg-white transition-opacity ${isUploadingAvatar ? "opacity-40" : "opacity-100"}`}
            />
            {isUploadingAvatar && <Loader2 size={28} className="absolute text-white animate-spin drop-shadow-md" />}
          </div>
          
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute bottom-0 right-0 p-2 bg-purple-600 text-white rounded-full shadow-md hover:bg-purple-700 transition cursor-pointer disabled:opacity-50"
          >
            <Camera size={14} />
          </button>
        </div>

        {/* Info Singkat & Biodata (Udah dibalikin!) */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className={`text-xl font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              {user.name || "Nama Pengguna"}
            </h2>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-bold w-fit mx-auto sm:mx-0 ${
              isDarkMode ? "bg-purple-950/60 text-purple-300 border-purple-800/60" : "bg-purple-50 text-purple-700 border-purple-200"
            }`}>
              <Award size={13} /> {user.badge}
            </span>
          </div>
          <p className={`text-xs font-semibold mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            @{user.username || "username"} • {user.email}
          </p>
          {/* Ini baris Bio yang balik lagi */}
          <p className={`text-xs mt-2 line-clamp-2 max-w-lg ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
            {user.bio || "Belum ada bio. Ceritakan sedikit tentang diri Anda!"}
          </p>
        </div>
      </div>

      {/* Statistik Gamifikasi & Profesi */}
      <div className={`grid grid-cols-3 gap-3 mt-6 pt-5 border-t ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
        
        <div className={`flex flex-col items-center sm:items-start p-2.5 rounded-xl border ${isDarkMode ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50/80 border-slate-100"}`}>
          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Zap size={12} className={isDarkMode ? "text-purple-400" : "text-purple-600"} /> Total XP
          </span>
          <span className={`text-base font-black mt-0.5 ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
            {user.stats?.totalXP}
          </span>
        </div>

        {/* FITUR KLIK UNTUK EDIT PROFESI (Udah di-center!) */}
        <div 
          onClick={() => !isEditingProf && setIsEditingProf(true)}
          className={`flex flex-col items-center sm:items-start justify-center p-2.5 rounded-xl border group cursor-pointer transition ${
            isDarkMode ? "bg-slate-800/50 border-slate-700/60 hover:bg-slate-800" : "bg-slate-50/80 border-slate-100 hover:bg-slate-100"
          }`}
          title="Klik untuk ubah profesi"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Briefcase size={12} className="text-amber-500" /> Profesi
          </span>
          
          {isEditingProf ? (
            <input
              autoFocus
              type="text"
              value={profValue}
              onChange={(e) => setProfValue(e.target.value)}
              onBlur={handleSaveProfesi}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveProfesi()}
              className={`mt-0.5 w-full bg-transparent border-b outline-none text-base font-black text-center sm:text-left ${
                isDarkMode ? "border-purple-500 text-slate-100" : "border-purple-400 text-slate-800"
              }`}
            />
          ) : (
            <span className={`text-base font-black mt-0.5 relative flex items-center justify-center sm:justify-start w-full ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
              <span className="truncate">{user.stats?.profession || "-"}</span>
              <Edit3 size={12} className="absolute -right-1 sm:static sm:ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-purple-500" />
            </span>
          )}
        </div>

        <div className={`flex flex-col items-center sm:items-start p-2.5 rounded-xl border ${isDarkMode ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50/80 border-slate-100"}`}>
          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Calendar size={12} className="text-blue-500" /> Bergabung
          </span>
          <span className={`text-base font-black mt-0.5 ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
            {user.stats?.joinedDate}
          </span>
        </div>
        
      </div>
    </div>
  );
}
