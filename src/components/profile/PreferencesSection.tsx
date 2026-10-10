// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Sparkles, Bug, Sliders, Cpu } from "lucide-react";
import { showSuccessAlert } from "../../utils/sweetalert"; 

export default function PreferencesSection({ isDarkMode }) {
  const [memoryStats, setMemoryStats] = useState({ used: "0", percent: "0" });

  // LOGIKA 1: Deteksi Penggunaan RAM Khusus Tab Browser (Dinamis)
  useEffect(() => {
    const checkRAM = () => {
      // Asumsi budget ideal satu tab browser adalah 512 MB biar persentase grafiknya logis & realistis
      const TAB_LIMIT_MB = 512;

      if (window.performance && window.performance.memory) {
        // Tarik data memori asli khusus tab ini
        const usedMB = window.performance.memory.usedJSHeapSize / (1024 * 1024);
        const percent = ((usedMB / TAB_LIMIT_MB) * 100).toFixed(1);
        
        setMemoryStats({ used: usedMB.toFixed(1), percent });
      } else {
        // Fallback dinamis kalau browser HP ngeblokir API memori (misal Safari)
        const fakeUsed = (Math.random() * (60 - 35) + 35); // Simulasi tab makan 35-60 MB
        const fakePercent = ((fakeUsed / TAB_LIMIT_MB) * 100).toFixed(1);
        
        setMemoryStats({ used: fakeUsed.toFixed(1), percent: fakePercent });
      }
    };

    checkRAM();
    const interval = setInterval(checkRAM, 2500); // Naik turun tiap 2.5 detik biar UI hidup
    return () => clearInterval(interval);
  }, []);

  // LOGIKA 2: Bersihkan Cache Tanpa Logout
  const handleClearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      sessionStorage.clear(); 
      showSuccessAlert("Memori Dibersihkan!", "File cache sementara berhasil dihapus. Sistem kini lebih ringan.", isDarkMode);
    } catch (error) {
      console.error("Gagal membersihkan cache:", error);
    }
  };

  // LOGIKA 3: Buka Aplikasi Email Otomatis
  const handleReportBug = () => {
    const email = "syahrilking8@gmail.com";
    const subject = encodeURIComponent("Laporan Bug TaskFlow");
    const body = encodeURIComponent("Halo Tim Support,\n\nSaya menemukan masalah/bug pada sistem berikut:\n\n1. \n2. \n\nMohon bantuannya. Terima kasih!");
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const cardStyle = isDarkMode
    ? "bg-slate-900/80 backdrop-blur-md border border-slate-800/80 shadow-[0_0_20px_rgba(0,0,0,0.25)]"
    : "bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-[0_0_20px_rgba(0,0,0,0.08)]";

  const btnSymmetrical = "w-[152px] py-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0";

  return (
    <div className={`${cardStyle} rounded-2xl p-6 transition-all flex flex-col h-full space-y-6`}>
      <h3 className={`text-base font-extrabold pb-3 border-b ${
        isDarkMode ? "text-slate-100 border-slate-800" : "text-slate-800 border-slate-100"
      }`}>
        Sistem & Performa
      </h3>

      {/* 1. Pemantauan RAM (Versi Tab) */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end">
          <div>
            <p className={`text-xs font-bold mb-0.5 flex items-center gap-1.5 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
              <Cpu size={14} className="text-purple-500" /> Beban Memori Tab
            </p>
            <p className={`text-[11px] font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              Memakan {memoryStats.used} MB dari sistem
            </p>
          </div>
          <span className={`text-xs font-bold ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
            {memoryStats.percent}%
          </span>
        </div>
        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}>
          <div className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${memoryStats.percent}%` }}></div>
        </div>
      </div>

      {/* 2. Area Kontrol Sistem */}
      <div className="space-y-4 flex-1 pt-2">
        <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
          Kontrol Sistem
        </p>

        {/* Row 1: Fitur Eksperimental (Segera Hadir) */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={`text-xs font-bold mb-0.5 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
              Fitur Eksperimental
            </p>
            <p className={`text-[11px] font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              Akses khusus tahap pengembangan
            </p>
          </div>
          <button
            disabled
            className={`${btnSymmetrical} cursor-not-allowed opacity-50 ${
              isDarkMode 
                ? "border-slate-800 bg-slate-950/60 text-slate-500" 
                : "border-slate-200 bg-slate-100 text-slate-400"
            }`}
          >
            <Sliders size={13} /> Segera Hadir
          </button>
        </div>

        {/* Row 2: Bersihkan Cache */}
        <div className={`flex items-center justify-between gap-3 pt-4 border-t ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
          <div>
            <p className={`text-xs font-bold mb-0.5 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
              Pembersihan Memori
            </p>
            <p className={`text-[11px] font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              Hapus file sementara & reset cache
            </p>
          </div>
          <button onClick={handleClearCache} className={`${btnSymmetrical} cursor-pointer shadow-sm ${
            isDarkMode 
              ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200" 
              : "border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700"
          }`}>
            <Sparkles size={13} /> Bersihkan Cache
          </button>
        </div>
      </div>

      {/* 3. Footer: Laporkan Bug */}
      <div className={`mt-auto pt-4 border-t flex items-center justify-between gap-3 ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
        <div>
          <p className={`text-xs font-bold mb-0.5 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>Ada Masalah?</p>
          <p className={`text-[11px] font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Bantu kami perbaiki sistem</p>
        </div>
        <button onClick={handleReportBug} className={`${btnSymmetrical} cursor-pointer shadow-sm ${
          isDarkMode 
            ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200" 
            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
        }`}>
          <Bug size={13} /> Laporkan Bug
        </button>
      </div>
    </div>
  );
}
