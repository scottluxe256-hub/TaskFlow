// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Plus, CheckCircle2, Loader2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ScrollAnimate from "../components/ScrollAnimate";
import TaskFilterBar from "../components/TaskFilterBar";
import TaskItem, { getTaskCategory } from "../components/TaskItem";
import TaskModal from "../components/TaskModal";
import { supabase } from "../lib/supabase";
import { Task } from "../types";
import { ActiveTabType } from "../App";
import { showDeleteConfirm } from "../utils/sweetalert";

export interface TasksViewProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  onLogout: () => Promise<void> | void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export default function TasksView(props: TasksViewProps) {
  const { activeCategory, setActiveCategory, activeFilter, setActiveFilter, isDarkMode } = props;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"terbaru" | "terlama">("terbaru");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Data Pengguna dan Pengaturan Profil
  const [userData, setUserData] = useState({ name: "", avatarUrl: "" });
  const [userSettings, setUserSettings] = useState({
    reminderEnabled: false,
    reminderDuration: "15 Menit",
    autoDelete: false
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Tarik Data Profil (Avatar Cloudinary, Nama, & Settingan Tugas)
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      
      if (profile) {
        const displayName = profile.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
        setUserData({
          name: displayName,
          avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8b5cf6&color=fff&bold=true`
        });
        setUserSettings({
          reminderEnabled: profile.reminder_enabled || false,
          reminderDuration: profile.reminder_duration || "15 Menit",
          autoDelete: profile.auto_delete_tasks || false
        });
      }

      // 2. Tarik Data Tugas
      const { data, error } = await supabase
        .from("tasks")
        .select("*, categories(name, color), category:categories(name, color)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: sortBy === "terlama" });

      if (!error && data) {
        setTasks(data as Task[]);
      }
    } catch (err) {
      console.error("Error fetching tasks view data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();

    const channel = supabase
      .channel("realtime-tasks-view")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => fetchInitialData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sortBy]);

  const toggleDropdown = (name: string) => setOpenDropdown(prev => prev === name ? null : name);
  const closeDropdowns = () => setOpenDropdown(null);

  // LOGIKA HAPUS OTOMATIS DIMASUKKAN KE SINI
  const handleToggleTaskDone = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    if (newStatus === true && userSettings.autoDelete) {
      // Jika auto-delete nyala, langsung hapus dari state UI & Supabase
      setTasks(prev => prev.filter(t => t.id !== id));
      await supabase.from("tasks").delete().eq("id", id);
      return; 
    }

    // Jika mati, update status normal
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: newStatus } : t));
    await supabase.from("tasks").update({ is_completed: newStatus }).eq("id", id);
  };

  const handleDeleteTask = (id: string) => {
    const targetTask = tasks.find(t => t.id === id);
    const title = targetTask ? targetTask.title : "tugas ini";

    showDeleteConfirm(
      title,
      async () => {
        setTasks(prev => prev.filter(t => t.id !== id));
        const { error } = await supabase.from("tasks").delete().eq("id", id);
        if (error) fetchInitialData();
      },
      isDarkMode
    );
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setModalMode("edit");
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const filteredTasks = tasks.filter(t => {
    const { name: categoryNameRaw } = getTaskCategory(t);
    const categoryName = categoryNameRaw.toLowerCase();
    const taskTitle = t.title.toLowerCase();
    const q = searchQuery.toLowerCase();
    
    const matchSearch = q === "" || taskTitle.includes(q) || categoryName.includes(q);
    const matchCategory = activeCategory === "semua" || categoryName === activeCategory.toLowerCase();

    let matchStatus = true;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const taskDateStr = t.due_date ? t.due_date.split("T")[0] : "";

    if (activeFilter === "today") {
      matchStatus = !!t.due_date && taskDateStr === todayStr;
    } else if (activeFilter === "upcoming") {
      matchStatus = !!t.due_date && taskDateStr > todayStr && !t.is_completed;
    } else if (activeFilter === "done") {
      matchStatus = t.is_completed;
    } else if (activeFilter === "pending") {
      matchStatus = !t.is_completed;
    }

    return matchSearch && matchCategory && matchStatus;
  });

  const cardStyle = isDarkMode
    ? "bg-slate-900/80 backdrop-blur-md border border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.25)] rounded-2xl p-5 transition-all"
    : "bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-5 transition-all";

  return (
    <div className={`relative min-h-screen w-full font-sans flex overflow-x-hidden bg-transparent ${isDarkMode ? "text-slate-100" : "text-slate-800"}`} onClick={closeDropdowns}>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={isDarkMode ? "/assets/bg_mobile_dark.avif" : "/assets/bg_mobile.avif"} alt="Background Mobile" className="w-full h-full object-cover block sm:hidden" />
        <img src={isDarkMode ? "/assets/bg_desktop_dark.avif" : "/assets/bg_desktop.avif"} alt="Background Desktop" className="w-full h-full object-cover hidden sm:block" />
      </div>

      <div className="relative z-10 flex w-full min-h-screen">
        <Sidebar {...props} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
          <div className="relative z-40">
            {/* AVATAR & NAMA DILEMPAR KE HEADER */}
            <Header
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              userName={userData.name}
              avatarUrl={userData.avatarUrl}
              isDarkMode={isDarkMode}
              setIsDarkMode={props.setIsDarkMode}
            />
          </div>

          <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">

            <ScrollAnimate animation="fade-up" delay={0}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>Tugas Saya</h1>
                  <p className={`text-sm mt-0.5 font-medium ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Kelola dan selesaikan tanggung jawab harianmu.</p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="w-fit px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md shadow-purple-500/20 active:scale-[0.98]"
                >
                  <Plus size={16} /> Tambah Tugas Baru
                </button>
              </div>
            </ScrollAnimate>

            <div className="relative z-30">
              <ScrollAnimate animation="fade-up" delay={100}>
                <TaskFilterBar
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  activeFilter={activeFilter}
                  setActiveFilter={setActiveFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  openDropdown={openDropdown}
                  toggleDropdown={toggleDropdown}
                  closeDropdowns={closeDropdowns}
                  isDarkMode={isDarkMode}
                />
              </ScrollAnimate>
            </div>

            <div className="relative z-10">
              <ScrollAnimate animation="fade-up" delay={200}>
                <div className={`${cardStyle} flex flex-col gap-3 min-h-[350px]`}>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 gap-2">
                      <Loader2 size={30} className="animate-spin text-purple-600" />
                      <span className="text-xs font-bold">Memuat daftar tugas...</span>
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <CheckCircle2 size={40} className={`mb-2 ${isDarkMode ? "text-slate-700" : "text-slate-300"}`} />
                      <p className={`text-sm font-bold ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Tidak ada tugas yang sesuai ☕</p>
                    </div>
                  ) : (
                    filteredTasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggleDone={handleToggleTaskDone}
                        onEdit={handleOpenEditModal}
                        onDelete={handleDeleteTask}
                        isDarkMode={isDarkMode}
                      />
                    ))
                  )}
                </div>
              </ScrollAnimate>
            </div>
          </main>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        mode={modalMode}
        taskToEdit={taskToEdit}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchInitialData}
        isDarkMode={isDarkMode}
        userSettings={userSettings} 
      />
    </div>
  );
}
