// @ts-nocheck
import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle2, Circle, Clock, Sun, Layers, Flame, CheckCheck, AlertCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ScrollAnimate from "../components/ScrollAnimate";
import { supabase } from "../lib/supabase";
import { fetchIndonesianHolidays } from "../services/googleCalendar";
import { Task } from "../types";
import { ActiveTabType } from "../App";
import { getTaskCategory } from "../components/TaskItem";

export interface DashboardViewProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  onLogout: () => Promise<void> | void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

function LiquidWaveCircle({ progress, waveBg, waveCrest, isDarkMode }: { progress: number; waveBg: string; waveCrest: string; isDarkMode: boolean }) {
  const textColor = isDarkMode ? "text-white" : progress >= 50 ? "text-white" : "text-slate-900";
  return (
    <div className={`relative w-14 h-14 rounded-full overflow-hidden border shrink-0 flex items-center justify-center shadow-inner transition-colors ${isDarkMode ? "border-slate-700/80 bg-slate-800/90" : "border-slate-200 bg-slate-100"}`}>
      <div className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out" style={{ height: `${Math.min(Math.max(progress, 0), 100)}%`, backgroundColor: waveBg }}>
        {progress > 0 && progress < 100 && (
          <div className="absolute -top-2 left-0 w-[200%] h-3 animate-liquid-wave opacity-90">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-current" style={{ color: waveCrest }}><path d="M0,0 C150,90 350,-40 500,40 C650,120 900,-20 1200,40 L1200,120 L0,120 Z"></path></svg>
          </div>
        )}
      </div>
      <span className={`relative z-10 text-xs font-black tracking-tight ${textColor}`} style={{ textShadow: isDarkMode || progress >= 50 ? "0px 1px 3px rgba(0, 0, 0, 0.9)" : "0px 1px 2px rgba(255, 255, 255, 0.9)" }}>{progress}%</span>
    </div>
  );
}

export default function DashboardView({ activeTab, setActiveTab, activeCategory, setActiveCategory, activeFilter, setActiveFilter, onLogout, isDarkMode, setIsDarkMode }: DashboardViewProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [time, setTime] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // State untuk Data Pengguna dan Avatar
  const [userData, setUserData] = useState({ name: "", avatarUrl: "" });
  const [loading, setLoading] = useState<boolean>(true);
  const [holidays, setHolidays] = useState<string[]>([]);

  useEffect(() => {
    const loadHolidays = async () => {
      const data = await fetchIndonesianHolidays(time.getFullYear());
      if (data && data.length > 0) setHolidays(data.map(h => h.date));
    };
    loadHolidays();
  }, [time.getFullYear()]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Ambil info profil & URL Avatar Cloudinary
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (profile) {
          const displayName = profile.full_name || user.email?.split("@")[0] || "User";
          setUserData({
            name: displayName,
            avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8b5cf6&color=fff&bold=true`
          });
        }

        const { data: tasksData, error } = await supabase.from("tasks").select("*, categories(name, color), category:categories(name, color)").eq("user_id", user.id).order("created_at", { ascending: false });
        if (!error && tasksData) setTasks(tasksData as Task[]);
      }
    } catch (err) { console.error("Error fetching dashboard data:", err); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchDashboardData();
    const channel = supabase.channel("realtime-dashboard").on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => fetchDashboardData()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
    const { error } = await supabase.from("tasks").update({ is_completed: !currentStatus }).eq("id", taskId);
    if (error) setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: currentStatus } : t));
  };

  const timeString = time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).replace(/\./g, ":");

  const todayStr = useMemo(() => {
    const y = time.getFullYear();
    const m = String(time.getMonth() + 1).padStart(2, "0");
    const d = String(time.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [time]);

  const todayTasks = useMemo(() => tasks.filter(t => t.due_date && t.due_date.startsWith(todayStr)), [tasks, todayStr]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.is_completed).length;
    const pending = total - completed;
    const todayCount = todayTasks.length;
    return {
      total, todayCount,
      todayProgress: total > 0 ? Math.round((todayCount / total) * 100) : 0,
      completed,
      completedProgress: total > 0 ? Math.round((completed / total) * 100) : 0,
      pending,
      pendingProgress: total > 0 ? Math.round((pending / total) * 100) : 0
    };
  }, [tasks, todayTasks]);

  const weeklyActivity = useMemo(() => {
    const daysLabel = ["M", "S", "S", "R", "K", "J", "S"];
    const now = new Date();
    const currentDayIdx = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (currentDayIdx === 0 ? 6 : currentDayIdx - 1));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const countCompleted = tasks.filter(t => t.is_completed && t.due_date && t.due_date.startsWith(dStr)).length;
      return { day: daysLabel[d.getDay()], val: countCompleted > 0 ? Math.min(countCompleted * 25, 100) : 10 };
    });
  }, [tasks]);

  const cardStyle = isDarkMode ? "bg-slate-900/80 backdrop-blur-md border border-slate-800/80 shadow-[0_0_20px_rgba(0,0,0,0.25)] rounded-2xl p-5 transition-all" : "bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-[0_0_20px_rgba(0,0,0,0.08)] rounded-2xl p-5 transition-all";

  return (
    <div className={`relative min-h-screen w-full font-sans flex overflow-x-hidden bg-transparent ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
      <style>{`@keyframes liquidWaveAnim { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-liquid-wave { animation: liquidWaveAnim 3s linear infinite; }`}</style>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={isDarkMode ? "/assets/bg_mobile_dark.avif" : "/assets/bg_mobile.avif"} className="w-full h-full object-cover block sm:hidden" />
        <img src={isDarkMode ? "/assets/bg_desktop_dark.avif" : "/assets/bg_desktop.avif"} className="w-full h-full object-cover hidden sm:block" />
      </div>

      <div className="relative z-10 flex w-full min-h-screen">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} onLogout={onLogout} activeCategory={activeCategory} setActiveCategory={setActiveCategory} activeFilter={activeFilter} setActiveFilter={setActiveFilter} isDarkMode={isDarkMode} />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
          
          {/* FOTO PROFIL DAN NAMA MASUK KE HEADER DI SINI */}
          <Header 
            setIsMobileMenuOpen={setIsMobileMenuOpen} 
            userName={userData.name} 
            avatarUrl={userData.avatarUrl} 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
          />

          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
            <ScrollAnimate animation="fade-up" delay={0}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Selamat Datang, {userData.name ? `${userData.name}! 👋` : <span className="inline-block w-32 h-7 bg-slate-400/20 rounded-lg animate-pulse" />}</h1>
                  <p className={`text-sm mt-1 font-medium ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Berikut adalah ringkasan progres dan agenda tugasmu.</p>
                </div>
                <div className={`flex items-center gap-3.5 px-4 py-2 rounded-2xl border shadow-sm backdrop-blur-md w-fit ${isDarkMode ? "bg-slate-900/80 border-slate-800 text-slate-200" : "bg-white/85 border-slate-200/80 text-slate-800"}`}>
                  <div className="flex items-center gap-2 border-r border-slate-200/80 dark:border-slate-800 pr-3.5"><Sun size={20} className="text-amber-500 animate-pulse shrink-0" /><div className="flex flex-col text-left"><span className="text-xs font-black leading-tight">28°C</span><span className="text-[10px] font-bold text-slate-500 leading-tight">Bandung</span></div></div>
                  <div className="flex flex-col text-right"><span className="text-xs font-black font-mono text-purple-600 dark:text-purple-400 tracking-wider leading-tight">{timeString}</span><span className="text-[10px] font-extrabold text-slate-400 uppercase leading-tight">WIB</span></div>
                </div>
              </div>
            </ScrollAnimate>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-6">
                <ScrollAnimate animation="fade-up" delay={100}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`flex items-center justify-between ${cardStyle} border-purple-500/30 bg-gradient-to-br ${isDarkMode ? "from-purple-950/30 via-slate-900/80 to-slate-900/80" : "from-purple-50/60 via-white/85 to-white/85"}`}>
                      <div className="flex flex-col justify-center h-full">
                        <span className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? "text-purple-300" : "text-purple-700"}`}>Semua Tugas</span>
                        <span className={`text-[11px] font-bold mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Total Terdaftar</span>
                        <div className="flex items-baseline gap-1.5 mt-2"><span className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>{stats.total}</span><span className={`text-xs font-extrabold uppercase ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Tugas</span></div>
                      </div>
                      <div className={`w-14 h-14 rounded-full border shrink-0 flex items-center justify-center shadow-xs ${isDarkMode ? "bg-purple-900/40 border-purple-700/50 text-purple-300" : "bg-purple-100/80 border-purple-200 text-purple-700"}`}><Layers size={22} /></div>
                    </div>
                    <div className={`flex items-center justify-between ${cardStyle}`}>
                      <div className="flex flex-col justify-center h-full"><div className="flex items-center gap-1.5 mb-1"><Flame size={15} className="text-purple-500" /><span className={`text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>Hari Ini</span></div><div className="flex items-baseline gap-1.5 mt-1"><span className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>{stats.todayCount}</span><span className={`text-xs font-extrabold uppercase ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Agenda</span></div></div>
                      <LiquidWaveCircle progress={stats.todayProgress} waveBg="#8b5cf6" waveCrest="#c084fc" isDarkMode={isDarkMode} />
                    </div>
                    <div className={`flex items-center justify-between ${cardStyle}`}>
                      <div className="flex flex-col justify-center h-full"><div className="flex items-center gap-1.5 mb-1"><CheckCheck size={15} className="text-emerald-500" /><span className={`text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>Selesai</span></div><div className="flex items-baseline gap-1.5 mt-1"><span className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>{stats.completed}</span><span className={`text-xs font-extrabold uppercase ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Tugas</span></div></div>
                      <LiquidWaveCircle progress={stats.completedProgress} waveBg="#10b981" waveCrest="#6ee7b7" isDarkMode={isDarkMode} />
                    </div>
                    <div className={`flex items-center justify-between ${cardStyle}`}>
                      <div className="flex flex-col justify-center h-full"><div className="flex items-center gap-1.5 mb-1"><AlertCircle size={15} className="text-rose-500" /><span className={`text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>Belum Selesai</span></div><div className="flex items-baseline gap-1.5 mt-1"><span className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>{stats.pending}</span><span className={`text-xs font-extrabold uppercase ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Tugas</span></div></div>
                      <LiquidWaveCircle progress={stats.pendingProgress} waveBg="#f43f5e" waveCrest="#fda4af" isDarkMode={isDarkMode} />
                    </div>
                  </div>
                </ScrollAnimate>

                <ScrollAnimate animation="fade-up" delay={200}>
                  <div className={`flex flex-col h-[239px] justify-between ${cardStyle}`}>
                    <div className="flex items-center justify-between mb-2 shrink-0">
                      <h2 className={`font-extrabold text-base sm:text-lg ${isDarkMode ? "text-white" : "text-slate-900"}`}>Fokus Hari Ini</h2>
                      <button type="button" onClick={() => setActiveTab("tasks")} className="text-xs font-bold text-purple-600 hover:text-purple-700 transition cursor-pointer">Lihat Semua</button>
                    </div>
                    <div className="flex flex-col gap-2 h-[140px] overflow-y-auto custom-scrollbar pr-1">
                      {loading ? (
                        <div className="text-center py-8 text-xs font-bold text-slate-400 animate-pulse">Memuat data...</div>
                      ) : todayTasks.length === 0 ? (
                        <div className="text-center py-8 text-xs font-bold text-slate-400">Tidak ada agenda tugas hari ini ☕</div>
                      ) : (
                        todayTasks.map((task) => {
                          const timeFormatted = task.due_date ? task.due_date.split("T")[1]?.substring(0, 5) || "09:00" : "09:00";
                          const { name: categoryName, color: categoryColor } = getTaskCategory(task);
                          return (
                            <div key={task.id} className={`flex items-center justify-between p-2.5 rounded-xl border transition-all shadow-2xs shrink-0 gap-2 ${isDarkMode ? "bg-slate-800/60 border-slate-700/80 hover:border-purple-500/50" : "bg-white/90 border-slate-200/80 hover:border-purple-300"}`}>
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <button type="button" onClick={() => handleToggleTask(task.id, task.is_completed)} className={`shrink-0 transition cursor-pointer ${isDarkMode ? "text-slate-500 hover:text-purple-400" : "text-slate-400 hover:text-purple-600"}`}>
                                  {task.is_completed ? <CheckCircle2 size={18} className="text-purple-600" /> : <Circle size={18} />}
                                </button>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className={`text-xs font-bold truncate ${task.is_completed ? (isDarkMode ? "line-through text-slate-500" : "line-through text-slate-400") : (isDarkMode ? "text-slate-200" : "text-slate-800")}`}>{task.title}</span>
                                  <span className={`text-[10px] font-semibold flex items-center gap-1 mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}><Clock size={11} /> {timeFormatted}</span>
                                </div>
                              </div>
                              <span className="w-24 text-center text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border shrink-0 truncate transition-all" style={{ backgroundColor: `${categoryColor}20`, borderColor: `${categoryColor}50`, color: categoryColor }}>{categoryName}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </ScrollAnimate>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <ScrollAnimate animation="fade-up" delay={150}>
                  <div className={`flex flex-col ${cardStyle}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className={`font-extrabold text-base ${isDarkMode ? "text-white" : "text-slate-900"}`}>Kalender</h2>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${isDarkMode ? "bg-purple-950/60 text-purple-300 border-purple-800/60" : "bg-purple-50 text-purple-600 border-purple-100"}`}>
                        {time.toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                      </span>
                    </div>

                    <div className={`grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold mb-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                      <span className="text-rose-500">M</span><span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span>
                    </div>

                    {(() => {
                      const currentYear = time.getFullYear();
                      const currentMonth = time.getMonth();
                      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                      const firstDayOffset = new Date(currentYear, currentMonth, 1).getDay();

                      return (
                        <div className={`grid grid-cols-7 gap-1 text-center text-xs font-bold ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                          {Array.from({ length: firstDayOffset }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                          ))}

                          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((date) => {
                            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
                            const isSunday = new Date(currentYear, currentMonth, date).getDay() === 0;
                            const isHoliday = holidays.includes(dateStr);

                            return (
                              <div
                                key={date}
                                className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer transition ${date === time.getDate()
                                    ? "bg-purple-600 text-white font-black"
                                    : (isSunday || isHoliday)
                                      ? (isDarkMode ? "text-rose-400 hover:bg-slate-800" : "text-rose-500 hover:bg-slate-100")
                                      : (isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100")
                                  }`}
                              >
                                {date}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </ScrollAnimate>

                <ScrollAnimate animation="fade-up" delay={250}>
                  <div className={`flex flex-col h-[210px] justify-between ${cardStyle}`}>
                    <h2 className={`font-extrabold text-base mb-1 shrink-0 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Aktivitas Minggu Ini</h2>
                    <div className="flex-1 flex items-end justify-between gap-2 pt-2 px-1 pb-1">
                      {weeklyActivity.map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
                          <div style={{ height: `${item.val}%` }} className={`w-full max-w-[14px] rounded-t-md transition-all duration-500 shadow-2xs ${isDarkMode ? "bg-purple-500" : "bg-purple-600"}`} />
                          <span className={`text-[10px] font-bold ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollAnimate>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
