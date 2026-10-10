import React from "react";
import { Tag, Filter, ArrowUpDown, ChevronDown, Check, Search } from "lucide-react";

export interface TaskFilterBarProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  sortBy: "terbaru" | "terlama";
  setSortBy: (sort: "terbaru" | "terlama") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openDropdown: string | null;
  toggleDropdown: (name: string) => void;
  closeDropdowns: () => void;
  isDarkMode?: boolean;
}

export default function TaskFilterBar({
  activeCategory,
  setActiveCategory,
  activeFilter,
  setActiveFilter,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  openDropdown,
  toggleDropdown,
  closeDropdowns,
  isDarkMode = false
}: TaskFilterBarProps) {

  const cardStyle = isDarkMode
    ? "bg-slate-900/80 backdrop-blur-md border border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.25)] rounded-2xl p-3.5 sm:p-4 transition-all"
    : "bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-3.5 sm:p-4 transition-all";

  const categoryLabels: Record<string, string> = {
    semua: "Semua Kategori",
    kerja: "Kerja",
    sekolah: "Sekolah",
    pribadi: "Pribadi"
  };

  const filterLabels: Record<string, string> = {
    semua: "Semua Status",
    today: "Hari Ini",
    upcoming: "Mendatang",
    pending: "Belum Selesai",
    done: "Selesai"
  };

  const sortLabels: Record<string, string> = {
    terbaru: "Terbaru",
    terlama: "Terlama"
  };

  const renderDropdownMenu = (
    isOpen: boolean,
    items: Record<string, string>,
    currentVal: string,
    onSelect: (key: any) => void,
    alignRight = false
  ) => (
    <div
      style={{
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.94)",
        pointerEvents: isOpen ? "auto" : "none",
        transformOrigin: "top"
      }}
      className={`absolute top-full ${alignRight ? "right-0 left-auto" : "left-0"} mt-2 w-44 sm:w-48 backdrop-blur-xl border rounded-2xl p-1.5 z-[100] space-y-1 ${isDarkMode
          ? "bg-slate-900/95 border-slate-800 shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
          : "bg-white/95 border-purple-200 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
        }`}
    >
      {Object.entries(items).map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => { onSelect(key); closeDropdowns(); }}
          className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-between ${currentVal === key
              ? (isDarkMode ? "bg-purple-950/60 text-purple-300 font-extrabold" : "bg-purple-100 text-purple-700 font-extrabold")
              : (isDarkMode ? "text-slate-300 hover:bg-slate-800/80 hover:text-purple-400" : "text-slate-700 hover:bg-purple-50 hover:text-purple-600")
            }`}
        >
          {label}
          {currentVal === key && <Check size={14} className={isDarkMode ? "text-purple-400" : "text-purple-600"} />}
        </button>
      ))}
    </div>
  );

  const buttonStyle = isDarkMode
    ? "bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-slate-200"
    : "bg-white/90 hover:bg-white border-slate-200 text-slate-700";

  return (
    <div className={`relative z-40 ${cardStyle} flex flex-col sm:flex-row items-center justify-between gap-3`}>
      
      {/* SEKSI KIRI: DROPDOWNS (Kategori & Status) */}
      <div className="flex items-center gap-2 w-full sm:w-auto order-1 flex-1 sm:flex-none">
        {/* Dropdown Kategori */}
        <div className="relative flex-1 sm:flex-none" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => toggleDropdown("category")}
            className={`w-full sm:w-auto flex items-center justify-between gap-1.5 sm:gap-2 border px-3 py-2 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer active:scale-95 ${buttonStyle}`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Tag size={14} className={isDarkMode ? "text-purple-400 shrink-0" : "text-purple-600 shrink-0"} />
              <span className="truncate">{categoryLabels[activeCategory] || "Kategori"}</span>
            </div>
            <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-300 ${openDropdown === "category" ? "rotate-180" : ""}`} />
          </button>
          {renderDropdownMenu(openDropdown === "category", categoryLabels, activeCategory, setActiveCategory)}
        </div>

        {/* Dropdown Status */}
        <div className="relative flex-1 sm:flex-none" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => toggleDropdown("filter")}
            className={`w-full sm:w-auto flex items-center justify-between gap-1.5 sm:gap-2 border px-3 py-2 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer active:scale-95 ${buttonStyle}`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Filter size={14} className={isDarkMode ? "text-purple-400 shrink-0" : "text-purple-600 shrink-0"} />
              <span className="truncate">{filterLabels[activeFilter] || "Status"}</span>
            </div>
            <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-300 ${openDropdown === "filter" ? "rotate-180" : ""}`} />
          </button>
          {renderDropdownMenu(openDropdown === "filter", filterLabels, activeFilter, setActiveFilter)}
        </div>
      </div>

      {/* SEKSI TENGAH (DESKTOP) / KANAN ATAS (MOBILE): SEARCH BAR */}
      <div className="relative w-full sm:w-1/3 order-3 sm:order-2 group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={15} className={`transition-colors ${isDarkMode ? "text-slate-500 group-focus-within:text-purple-400" : "text-slate-400 group-focus-within:text-purple-600"}`} />
        </div>
        <input
          type="text"
          placeholder="Cari tugas atau kategori..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-bold transition-all border outline-none ${
            isDarkMode 
              ? "bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-purple-500 focus:bg-slate-800" 
              : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:bg-white"
          }`}
        />
      </div>

      {/* SEKSI KANAN: SORTING DROPDOWN */}
      <div className="relative w-full sm:w-auto order-2 sm:order-3" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => toggleDropdown("sort")}
          className={`w-full sm:w-auto flex items-center justify-between gap-2 border px-3 py-2 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer active:scale-95 ${buttonStyle}`}
        >
          <div className="flex items-center gap-1.5">
            <ArrowUpDown size={14} className="text-slate-400 shrink-0" />
            <span>Urutkan: {sortLabels[sortBy]}</span>
          </div>
          <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-300 ${openDropdown === "sort" ? "rotate-180" : ""}`} />
        </button>
        {renderDropdownMenu(openDropdown === "sort", sortLabels, sortBy, setSortBy, true)}
      </div>

    </div>
  );
}
