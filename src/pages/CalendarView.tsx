// @ts-nocheck
import { useState, useMemo, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { Plus, Calendar as CalendarIcon, ArrowRight, Loader2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ScrollAnimate from "../components/ScrollAnimate";
import TaskItem from "../components/TaskItem";
import { supabase } from "../lib/supabase";
import { fetchIndonesianHolidays, fetchAllGoogleData } from "../services/googleCalendar";
import { Task } from "../types";
import { ActiveTabType } from "../App";
import "../App.css";

export interface CalendarViewProps {
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

const formatDateObj = (date: Date) => {
  if (!(date instanceof Date)) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function CalendarView(props: CalendarViewProps) {
  const { isDarkMode, setIsDarkMode, setActiveTab } = props;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState<string[]>([]);
  
  // State untuk Data Pengguna dan Avatar
  const [userData, setUserData] = useState({ name: "", avatarUrl: "" });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [googleData, setGoogleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasksData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Ambil info profil & URL Avatar Cloudinary
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profile) {
        const displayName = profile.full_name || user.email?.split("@")[0] || "User";
        setUserData({
          name: displayName,
          avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8b5cf6&color=fff&bold=true`
        });
      }

      const { data } = await supabase.from("tasks").select("*, categories(name, color), category:categories(name, color)").eq("user_id", user.id).order("created_at", { ascending: false });
      if (data) setTasks(data as Task[]);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const loadExternalData = async () => {
      try {
        const holidayData = await fetchIndonesianHolidays(activeYear);
        setHolidays(holidayData.map((h: any) => h.date));

        const gData = await fetchAllGoogleData(activeYear);
        if (gData.length > 0) {
          setGoogleData(gData);
        }
      } catch (err) {
        console.error("Gagal load external data");
      }
    };
    loadExternalData();
  }, [activeYear]);

  useEffect(() => {
    fetchTasksData();
    const channel = supabase.channel("realtime-calendar-view").on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => fetchTasksData()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleToggleTaskDone = async (id: string, currentStatus: boolean) => {
    if (id.startsWith("gev_") || id.startsWith("gtsk_")) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
    await supabase.from("tasks").update({ is_completed: !currentStatus }).eq("id", id);
  };

  const tasksForSelectedDate = useMemo(() => {
    const selectedStr = formatDateObj(selectedDate);
    const sbTasks = tasks.filter(t => t.due_date && t.due_date.startsWith(selectedStr));
    const gItems = googleData.filter(e => e.due_date && e.due_date.startsWith(selectedStr) && !e.description.includes("Sync via TaskFlow"));
    return [...sbTasks, ...gItems];
  }, [tasks, googleData, selectedDate]);

  const cardStyle = isDarkMode ? "bg-slate-900/80 backdrop-blur-md border border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.25)] rounded-2xl p-4 sm:p-5 lg:min-h-[460px] flex flex-col justify-between" : "bg-white/80 backdrop-blur-md border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-4 sm:p-5 lg:min-h-[460px] flex flex-col justify-between";

  return (
    <div className={`relative min-h-screen w-full font-sans flex overflow-x-hidden bg-transparent ${isDarkMode ? "dark text-slate-100" : "text-slate-800"}`}>
      <style>{`
        .react-calendar__tile.text-red-holiday { color: #f43f5e !important; font-weight: 800 !important; }
        .dark .react-calendar__tile.text-red-holiday { color: #fb7185 !important; font-weight: 800 !important; }
      `}</style>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={isDarkMode ? "/assets/bg_mobile_dark.avif" : "/assets/bg_mobile.avif"} className="w-full h-full object-cover block sm:hidden" />
        <img src={isDarkMode ? "/assets/bg_desktop_dark.avif" : "/assets/bg_desktop.avif"} className="w-full h-full object-cover hidden sm:block" />
      </div>

      <div className="relative z-10 flex w-full min-h-screen">
        <Sidebar {...props} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
          
          {/* FOTO PROFIL DAN NAMA MASUK KE HEADER DI SINI */}
          <Header 
            setIsMobileMenuOpen={setIsMobileMenuOpen} 
            userName={userData.name} 
            avatarUrl={userData.avatarUrl} 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
          />

          <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
            <ScrollAnimate animation="fade-up" delay={0}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>Jadwal & Agenda</h1>
                </div>
                <button type="button" onClick={() => setActiveTab("tasks")} className="w-fit px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 cursor-pointer shadow-md">
                  <Plus size={16} /> Buat Tugas Baru
                </button>
              </div>
            </ScrollAnimate>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <ScrollAnimate animation="fade-up" delay={100}>
                  <div className={cardStyle}>
                    <div className={`flex items-center justify-between pb-2.5 mb-2 border-b ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-500">Kalender Interaktif</span>
                        <h3 className={`text-sm sm:text-base font-extrabold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>Pilih Tanggal</h3>
                      </div>
                      <button type="button" onClick={() => setSelectedDate(new Date())} className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer ${isDarkMode ? "bg-slate-800 border-slate-700 text-purple-300" : "bg-purple-50 border-purple-100 text-purple-700"}`}>Hari Ini</button>
                    </div>

                    <div className="taskflow-calendar w-full flex-1 flex flex-col justify-center items-center my-1">
                      <Calendar
                        onChange={(val: any) => setSelectedDate(val as Date)}
                        value={selectedDate}
                        locale="id-ID"
                        onActiveStartDateChange={({ activeStartDate }) => activeStartDate && setActiveYear(activeStartDate.getFullYear())}
                        tileClassName={({ date, view }) => {
                          if (view === "month") {
                            const isSunday = date.getDay() === 0;
                            if (isSunday || holidays.includes(formatDateObj(date))) return "text-red-holiday";
                          }
                          return null;
                        }}
                      />
                    </div>
                  </div>
                </ScrollAnimate>
              </div>

              <div className="lg:col-span-5">
                <ScrollAnimate animation="fade-up" delay={150}>
                  <div className={cardStyle}>
                    <div className={`flex items-center justify-between pb-2.5 mb-2 border-b ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-500">Agenda Terjadwal</span>
                        <h3 className={`text-sm sm:text-base font-extrabold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>{selectedDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</h3>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border shrink-0 ${isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-purple-50 border-purple-100 text-purple-700"}`}>{tasksForSelectedDate.length} Agenda</span>
                    </div>

                    <div className="space-y-2 flex-1 min-h-[260px] max-h-[270px] overflow-y-auto pr-1 custom-scrollbar">
                      {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-8 gap-2 text-slate-400"><Loader2 size={24} className="animate-spin text-purple-600" /><span className="text-xs font-bold">Memuat agenda...</span></div>
                      ) : tasksForSelectedDate.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-8"><CalendarIcon size={32} className={`mb-1.5 ${isDarkMode ? "text-slate-700" : "text-slate-300"}`} /><p className={`text-xs font-bold ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Tidak ada agenda pada tanggal ini</p></div>
                      ) : (
                        tasksForSelectedDate.map(task => (
                          <TaskItem key={task.id} task={task} onToggleDone={(id, status) => handleToggleTaskDone(id, status)} isDarkMode={isDarkMode} hideActions={true} />
                        ))
                      )}
                    </div>
                    <div className={`pt-2.5 border-t mt-2 ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
                      <button type="button" onClick={() => setActiveTab("tasks")} className={`w-full py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${isDarkMode ? "border-slate-700 bg-slate-800 text-purple-300" : "border-purple-200 bg-purple-50 text-purple-700"}`}>
                        Lihat Semua Tugas <ArrowRight size={14} />
                      </button>
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
