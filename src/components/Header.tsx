// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { CalendarDays, Menu, Sun, Moon, GitCommit, RotateCw, Bell, CheckCheck, Clock } from "lucide-react";
import { supabase } from "../lib/supabase";

export interface HeaderProps {
  setIsMobileMenuOpen: (open: boolean) => void;
  userName?: string;
  avatarUrl?: string;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  setActiveTab?: (tab: any) => void;
}

export default function Header({
  setIsMobileMenuOpen,
  userName = "",
  avatarUrl = "/assets/user1.avif",
  isDarkMode,
  setIsDarkMode,
  setActiveTab
}: HeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const todayDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "short", year: "numeric"
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Ambil preferensi durasi dari profil user (Default: 15 Menit)
        const { data: profile } = await supabase
          .from("profiles")
          .select("reminder_duration")
          .eq("id", user.id)
          .single();

        const durationStr = profile?.reminder_duration || "15 Menit";
        let thresholdMs = 15 * 60 * 1000; // 15 menit dalam milidetik
        
        // 2. Konversi string durasi (misal: "1 Jam") menjadi milidetik
        const parts = durationStr.split(" ");
        if (parts.length === 2) {
          const val = parseInt(parts[0], 10);
          const unit = parts[1].toLowerCase();
          if (!isNaN(val)) {
            if (unit === "menit") thresholdMs = val * 60 * 1000;
            else if (unit === "jam") thresholdMs = val * 60 * 60 * 1000;
            else if (unit === "hari") thresholdMs = val * 24 * 60 * 60 * 1000;
          }
        }

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

        // 3. Tarik tugas hari ini
        const { data, error } = await supabase
          .from("tasks")
          .select("id, title, due_date")
          .eq("user_id", user.id)
          .eq("is_completed", false)
          .eq("is_hidden", false)
          .not("due_date", "is", null)
          .gte("due_date", startOfDay)
          .lte("due_date", endOfDay)
          .order("due_date", { ascending: true });

        if (!error && data) {
          const nowMs = now.getTime();
          const todayStr = now.toDateString(); 
          
          const lastClearedDate = localStorage.getItem("taskflow_notif_date");
          let readNotifs = JSON.parse(localStorage.getItem("taskflow_read_notifs") || "[]");

          if (lastClearedDate !== todayStr) {
            readNotifs = [];
            localStorage.setItem("taskflow_read_notifs", JSON.stringify([]));
            localStorage.setItem("taskflow_notif_date", todayStr);
          }

          // 4. Saring berdasarkan threshold waktu yang dipilih user
          const activeNotifs = data.filter(task => {
            const dueMs = new Date(task.due_date).getTime();
            return (dueMs - nowMs) <= thresholdMs; 
          }).map(task => {
            const dueDate = new Date(task.due_date);
            return {
              id: task.id,
              title: task.title,
              time: dueDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
              isOverdue: nowMs > dueDate.getTime(),
              isRead: readNotifs.includes(task.id)
            };
          });

          setNotifications(activeNotifs);
        }
      } catch (err) {
        console.error("Gagal load notifikasi:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Cek setiap 1 menit
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    localStorage.setItem("taskflow_read_notifs", JSON.stringify(allIds));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

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
          className={`md:hidden p-1 transition cursor-pointer shrink-0 ${isDarkMode ? "text-slate-300 hover:text-purple-400" : "text-slate-600 hover:text-purple-600"}`}
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2.5 truncate">
          <span className="text-[11px] sm:text-xs font-extrabold tracking-tight shrink-0">
            <span className={isDarkMode ? "text-slate-100" : "text-slate-900"}>Web</span>
            <span className="text-purple-600">Console</span>
          </span>
          <div className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-mono font-semibold shrink-0 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            <GitCommit size={12} className="text-purple-500" />
            <span>v2.4</span>
          </div>
          <span className={`text-[10px] ${isDarkMode ? "text-slate-700" : "text-slate-300"}`}>•</span>
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh Website"
            className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded-lg border transition cursor-pointer active:scale-95 ${
              isDarkMode ? "bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/50" : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
            }`}
          >
            <RotateCw size={12} className={isRefreshing ? "animate-spin text-purple-500" : "text-purple-500"} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* SISI KANAN */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-2xs ${isDarkMode ? "bg-slate-800/80 border-slate-700/80 text-slate-300" : "bg-white/80 border-slate-200/80 text-slate-700"}`}>
          <CalendarDays size={14} className="text-purple-500" />
          <span>{todayDate}</span>
        </div>

        {/* TOMBOL MODE GELAP/TERANG */}
        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
          className={`p-1.5 sm:p-2 rounded-full transition cursor-pointer border shadow-2xs ${isDarkMode ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-purple-600"}`}
        >
          {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* TOMBOL LONCENG NOTIFIKASI */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotif(!showNotif)}
            className={`relative p-1.5 sm:p-2 rounded-full transition cursor-pointer border shadow-2xs ${isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-purple-400" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-purple-600"}`}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white border-2 border-white dark:border-slate-900 shadow-md">
                {unreadCount}
              </span>
            )}
          </button>

          {/* DROPDOWN NOTIFIKASI */}
          {showNotif && (
            <div className={`absolute right-0 mt-3 w-72 sm:w-80 rounded-2xl border shadow-2xl overflow-hidden z-50 transition-all origin-top-right animate-in fade-in zoom-in-95 duration-200 ${
              isDarkMode ? "bg-slate-900/95 border-slate-800 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]" : "bg-white/95 border-slate-200 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)]"
            }`}>
              <div className={`flex items-center justify-between px-4 py-3 border-b ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
                <span className={`font-black text-sm ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>Notifikasi</span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer active:scale-95">
                    <CheckCheck size={14} /> Baca Semua
                  </button>
                )}
              </div>

              <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center px-4 py-10 text-center gap-2 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                    <Bell size={24} className="opacity-50" />
                    <span className="text-xs font-bold">Belum ada notifikasi tenggat waktu.</span>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className={`px-4 py-3 border-b last:border-0 transition-colors ${
                      !notif.isRead 
                        ? (isDarkMode ? "bg-purple-900/20" : "bg-purple-50/50") 
                        : (isDarkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-50")
                    } ${isDarkMode ? "border-slate-800/50" : "border-slate-100"}`}>
                      <div className="flex gap-3">
                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!notif.isRead ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" : "bg-transparent"}`} />
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isDarkMode ? (!notif.isRead ? "text-slate-100" : "text-slate-300") : (!notif.isRead ? "text-slate-900" : "text-slate-600")}`}>
                            {notif.title}
                          </p>
                          <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                            <Clock size={11} /> {notif.time} 
                            {notif.isOverdue ? (
                              <span className="text-rose-500 ml-1 bg-rose-500/10 px-1.5 py-0.5 rounded">Melewati Tenggat!</span>
                            ) : (
                              <span className="text-amber-500 ml-1 bg-amber-500/10 px-1.5 py-0.5 rounded">Segera Berakhir!</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className={`w-px h-5 sm:h-6 ${isDarkMode ? "bg-slate-800" : "bg-slate-300/80"}`} />

        {/* FOTO PROFIL (Bisa di-klik untuk pindah halaman) */}
        <button 
          onClick={() => setActiveTab && setActiveTab("profile")}
          className="flex items-center gap-2 cursor-pointer group active:scale-95 transition-transform text-left"
        >
          <img
            src={avatarUrl}
            alt="Profile"
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border shadow-sm transition-colors ${isDarkMode ? "border-slate-700 group-hover:border-purple-500" : "border-slate-300 group-hover:border-purple-400"}`}
          />
          <span className={`text-sm font-bold hidden md:block transition-colors ${isDarkMode ? "text-slate-200 group-hover:text-purple-400" : "text-slate-800 group-hover:text-purple-600"}`}>
            {userName || <span className="inline-block w-16 h-4 bg-slate-400/20 rounded animate-pulse" />}
          </span>
        </button>
      </div>
    </header>
  );
}
