import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, CheckSquare, Calendar, User,
  LogOut, X, Flame, CalendarClock,
  ChevronDown, ChevronRight
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { ActiveTabType } from "../App";
import { Category } from "../types";

const normalizeColor = (colorStr: string, name: string = ""): string => {
  if (!colorStr) return "#8b5cf6";
  if (colorStr.startsWith("#")) return colorStr;
  const s = colorStr.toLowerCase();
  const n = name.toLowerCase();
  if (s.includes("amber") || s.includes("orange") || n === "kerja") return "#f59e0b";
  if (s.includes("blue") || n === "sekolah") return "#3b82f6";
  if (s.includes("emerald") || s.includes("green") || n === "pribadi") return "#10b981";
  if (s.includes("rose") || s.includes("pink") || s.includes("red")) return "#f43f5e";
  return "#8b5cf6";
};

export interface SidebarProps {
  activeTab: ActiveTabType;
  setActiveTab: React.Dispatch<React.SetStateAction<ActiveTabType>> | ((tab: ActiveTabType) => void);
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>> | ((open: boolean) => void);
  onLogout: () => Promise<void> | void;
  activeCategory: string;
  setActiveCategory: React.Dispatch<React.SetStateAction<string>> | ((category: string) => void);
  activeFilter: string;
  setActiveFilter: React.Dispatch<React.SetStateAction<string>> | ((filter: string) => void);
  isDarkMode?: boolean;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onLogout,
  activeCategory,
  setActiveCategory,
  activeFilter,
  setActiveFilter,
  isDarkMode = false
}: SidebarProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const defaultCategories: Category[] = [
    { id: "def-1", name: "Kerja", color: "#f59e0b", user_id: "" },
    { id: "def-2", name: "Sekolah", color: "#3b82f6", user_id: "" },
    { id: "def-3", name: "Pribadi", color: "#10b981", user_id: "" }
  ];

  const fetchCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCategories(defaultCategories);
        return;
      }

      const { data: tasksData } = await supabase
        .from("tasks")
        .select("category_id")
        .eq("user_id", user.id);

      const usedCategoryIds = new Set((tasksData || []).map(t => t.category_id).filter(Boolean));

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (!error && data) {
        const sanitizedData = data.map(cat => ({
          ...cat,
          color: normalizeColor(cat.color, cat.name)
        }));

        const combined = [...defaultCategories, ...sanitizedData];

        const filtered = combined.filter(cat => {
          const isDefault = defaultCategories.some(def => def.name.toLowerCase() === cat.name.toLowerCase());
          const isUsedByTask = usedCategoryIds.has(cat.id);
          return isDefault || isUsedByTask;
        });

        const unique = Array.from(
          new Map(filtered.map((cat) => [cat.name.toLowerCase(), cat as Category])).values()
        );
        
        setCategories(unique);
      } else {
        setCategories(defaultCategories);
      }
    } catch (err) {
      console.error("Error fetching sidebar categories:", err);
      setCategories(defaultCategories);
    }
  };

  useEffect(() => {
    fetchCategories();

    const channel = supabase
      .channel("realtime-sidebar-categories")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => fetchCategories()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        () => fetchCategories()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, activeCategory]);

  const handleNavClick = (
    tabName: ActiveTabType,
    filterType: string = "semua",
    categoryType: string = "semua"
  ) => {
    setActiveTab(tabName);
    setActiveFilter(filterType);
    setActiveCategory(categoryType);
    setIsMobileMenuOpen(false);
  };

  const activeBtnStyle = isDarkMode
    ? "bg-purple-500/20 text-purple-300 border border-purple-500/50 font-extrabold shadow-sm"
    : "bg-purple-500/10 text-slate-900 border border-purple-600 shadow-[0_2px_10px_rgba(147,51,234,0.15)] font-extrabold";

  const inactiveBtnStyle = isDarkMode
    ? "text-slate-400 border border-transparent hover:bg-slate-800/60 hover:text-slate-200 font-bold"
    : "text-slate-600 border border-transparent hover:bg-purple-50/80 hover:text-slate-900 font-bold";

  return (
    <>
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden"
        />
      )}

      {/* STRUKTUR DIPERBAIKI: h-[100dvh] & overflow-y-auto dipindah ke div dalam */}
      <aside className={`fixed md:sticky top-0 left-0 h-[100dvh] w-64 border-r flex flex-col shrink-0 z-30 transition-all duration-300 ${isDarkMode
          ? "bg-slate-900/85 backdrop-blur-md border-slate-800/80 shadow-[4px_0_20px_rgba(0,0,0,0.3)] text-slate-100"
          : "bg-white/85 backdrop-blur-md border-slate-200/80 shadow-[4px_0_20px_rgba(0,0,0,0.06)] text-slate-800"
        } ${isMobileMenuOpen ? "translate-x-0 z-50" : "-translate-x-full md:translate-x-0"
        }`}>
        
        {/* AREA ATAS: Bisa di-scroll berkat flex-1 dan overflow-y-auto */}
        <div className="flex flex-col p-5 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-8 px-2 shrink-0">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick("dashboard")}>
              <img src="/assets/logo.webp" alt="TaskFlow" className="w-8 h-8 object-contain" />
              <span className={`text-xl font-extrabold tracking-tight ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
                Task<span className="text-purple-600">Flow</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`md:hidden p-1 cursor-pointer shrink-0 ${isDarkMode ? "text-slate-400 hover:text-purple-400" : "text-slate-500 hover:text-purple-600"}`}
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <p className={`text-[11px] font-extrabold uppercase tracking-wider mb-2 px-3 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                Navigasi Utama
              </p>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleNavClick("dashboard")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${activeTab === "dashboard" ? activeBtnStyle : inactiveBtnStyle
                    }`}
                >
                  <LayoutDashboard size={18} className={isDarkMode ? "text-purple-400" : "text-purple-600"} /> Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick("tasks", "semua", "semua")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${activeTab === "tasks" && activeFilter === "semua" && activeCategory === "semua"
                      ? activeBtnStyle
                      : inactiveBtnStyle
                    }`}
                >
                  <CheckSquare size={18} className={isDarkMode ? "text-purple-400" : "text-purple-600"} /> Tugas Saya
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick("calendar")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${activeTab === "calendar" ? activeBtnStyle : inactiveBtnStyle
                    }`}
                >
                  <Calendar size={18} className={isDarkMode ? "text-purple-400" : "text-purple-600"} /> Kalender
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick("profile")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${activeTab === "profile" ? activeBtnStyle : inactiveBtnStyle
                    }`}
                >
                  <User size={18} className={isDarkMode ? "text-purple-400" : "text-purple-600"} /> Profil
                </button>
              </nav>
            </div>

            <div>
              <p className={`text-[11px] font-extrabold uppercase tracking-wider mb-2 px-3 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                Filter Cepat
              </p>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleNavClick("tasks", "today", "semua")}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm transition cursor-pointer ${activeTab === "tasks" && activeFilter === "today" ? activeBtnStyle : inactiveBtnStyle
                    }`}
                >
                  <span className="flex items-center gap-3"><Flame size={18} className="text-amber-500" /> Hari Ini</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick("tasks", "upcoming", "semua")}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm transition cursor-pointer ${activeTab === "tasks" && activeFilter === "upcoming" ? activeBtnStyle : inactiveBtnStyle
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <CalendarClock size={18} className={isDarkMode ? "text-purple-400" : "text-purple-600"} /> Mendatang
                  </span>
                </button>
              </nav>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`w-full flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider px-3 mb-2 transition cursor-pointer ${isDarkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <span>Kategori Saya</span>
                {isCategoryOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {isCategoryOpen && (
                <div className="space-y-1 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                  {categories.map((cat) => {
                    const catSlug = cat.name.toLowerCase();
                    const isCatActive = activeTab === "tasks" && activeCategory.toLowerCase() === catSlug;

                    return (
                      <button
                        key={cat.id || cat.name}
                        type="button"
                        onClick={() => handleNavClick("tasks", "semua", catSlug)}
                        className={`w-full flex items-center gap-3 px-3.5 py-1.5 rounded-xl text-sm transition cursor-pointer ${isCatActive ? activeBtnStyle : inactiveBtnStyle
                          }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AREA BAWAH: Dipaku permanen dengan shrink-0 */}
        <div className={`p-5 border-t shrink-0 ${isDarkMode ? "border-slate-800/80" : "border-slate-200/80"}`}>
          <button
            type="button"
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl font-bold text-sm transition cursor-pointer ${isDarkMode
                ? "text-slate-400 hover:bg-rose-950/40 hover:text-rose-400"
                : "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
              }`}
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
