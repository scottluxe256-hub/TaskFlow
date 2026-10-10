// @ts-nocheck
import React, { useState } from "react";
import { CalendarDays, Menu, Sun, Moon, GitCommit, RotateCw } from "lucide-react";

export interface HeaderProps {
  setIsMobileMenuOpen: (open: boolean) => void;
  userName?: string;
  avatarUrl?: string;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export default function Header({
  setIsMobileMenuOpen,
  userName = "",
  avatarUrl = "/assets/user1.avif",
  isDarkMode,
  setIsDarkMode
}: HeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const todayDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  return (
    <header className={`sticky top-0 z-40 border-b h-16 px-3 sm:px-8 flex items-center justify-between shrink-0 transition-colors duration-300 ${isDarkMode
        ? "bg-slate-900/85 backdrop-blur-md border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        : "bg-white/85 backdrop-blur-md border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
      }`}>

      {/* SISI KIRI */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className={`md:hidden p-1 transition cursor-pointer shrink-0 ${isDarkMode ? "text-slate-300 hover:text-purple-400" : "text-slate-600 hover:text-purple-600"
            }`}
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2.5 truncate">
          <span className="text-[11px] sm:text-xs font-extrabold tracking-tight shrink-0">
            <span className={isDarkMode ? "text-slate-100" : "text-slate-900"}>Web</span>
            <span className="text-purple-600">Console</span>
          </span>

          <div className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-mono font-semibold shrink-0 ${isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}>
            <GitCommit size={12} className="text-purple-500" />
            <span>v2.4</span>
          </div>

          <span className={`text-[10px] ${isDarkMode ? "text-slate-700" : "text-slate-300"}`}>•</span>

          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh Website"
            className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded-lg border transition cursor-pointer active:scale-95 ${
              isDarkMode
                ? "bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/50"
                : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
            }`}
          >
            <RotateCw size={12} className={isRefreshing ? "animate-spin text-purple-500" : "text-purple-500"} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* SISI KANAN */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-2xs ${isDarkMode
            ? "bg-slate-800/80 border-slate-700/80 text-slate-300"
            : "bg-white/80 border-slate-200/80 text-slate-700"
          }`}>
          <CalendarDays size={14} className="text-purple-500" />
          <span>{todayDate}</span>
        </div>

        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
          className={`p-1.5 sm:p-2 rounded-full transition cursor-pointer border shadow-2xs ${isDarkMode
              ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-purple-600"
            }`}
        >
          {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div className={`w-px h-5 sm:h-6 ${isDarkMode ? "bg-slate-800" : "bg-slate-300/80"}`} />

        <div className="flex items-center gap-2">
          <img
            src={avatarUrl}
            alt="Profile"
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border shadow-sm ${isDarkMode ? "border-slate-700" : "border-slate-300"
              }`}
          />
          <span className={`text-sm font-bold hidden md:block ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
            {userName || <span className="inline-block w-16 h-4 bg-slate-400/20 rounded animate-pulse" />}
          </span>
        </div>
      </div>
    </header>
  );
}
