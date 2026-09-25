import React, { useState, useRef, useEffect } from "react";
import { Tag, ChevronDown, Check, Plus, Palette } from "lucide-react";
import { Category } from "../types";

export interface CategoryDropdownProps {
  categoryId: string;
  setCategoryId: (id: string) => void;
  categoryNameDisplay: string;
  setCategoryNameDisplay: (name: string) => void;
  dbCategories: Category[];
  setDbCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  isDarkMode?: boolean;
}

const DEFAULT_CATEGORIES = [
  { name: "Kerja", color: "#f59e0b" },
  { name: "Sekolah", color: "#3b82f6" },
  { name: "Pribadi", color: "#10b981" },
];

const PRESET_DOTS = [
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#06b6d4",
  "#14b8a6",
  "#84cc16",
];

const hueToHex = (h: number): string => {
  const s = 85, l = 50;
  const lNorm = l / 100;
  const a = (s * Math.min(lNorm, 1 - lNorm)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export default function CategoryDropdown({
  categoryId,
  setCategoryId,
  categoryNameDisplay,
  setCategoryNameDisplay,
  dbCategories,
  isDarkMode = false
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  
  const [hueValue, setHueValue] = useState(270);
  const [selectedColor, setSelectedColor] = useState("#8b5cf6");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const uniqueCategories = Array.from(
    new Map(dbCategories.map(cat => [cat.name.toLowerCase(), cat])).values()
  );

  const defaultList = uniqueCategories.filter(cat =>
    DEFAULT_CATEGORIES.some(def => def.name.toLowerCase() === cat.name.toLowerCase())
  );

  const handleSelectNone = () => {
    setCategoryId("");
    setCategoryNameDisplay("Pilih Kategori (Opsional)");
    setIsOpen(false);
  };

  const handleSelectDefault = (cat: Category) => {
    setCategoryId(cat.id);
    setCategoryNameDisplay(cat.name);
    setIsOpen(false);
  };

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setHueValue(val);
    setSelectedColor(hueToHex(val));
  };

  // LOGIKA BARU: Simpan sementara di memori lokal (Pending State)
  // Tidak langsung di-insert ke Supabase agar tidak menjadi sampah jika batal!
  const handleUseCustomCategory = () => {
    if (!newName.trim()) return;
    const cleanName = newName.trim();
    
    // Format ID Sementara: "NEW_CAT:NamaKategori:WarnaHex"
    setCategoryId(`NEW_CAT:${cleanName}:${selectedColor}`);
    setCategoryNameDisplay(cleanName);
    setIsAdding(false);
    setIsOpen(false);
    setNewName("");
  };

  const labelTextColor = isDarkMode ? "text-white" : "text-black";
  
  const inputBgStyle = isDarkMode
    ? "bg-slate-800/80 backdrop-blur-md border-slate-700 text-white focus:border-purple-500 placeholder:text-slate-400 font-semibold"
    : "bg-white/80 backdrop-blur-md border-slate-300 text-black focus:border-purple-600 placeholder:text-slate-500 font-semibold";

  const inlineCardBgStyle = isDarkMode
    ? "bg-slate-900/90 border-slate-700/80 text-white"
    : "bg-purple-50/90 border-purple-300/80 text-black";

  return (
    <div className="relative z-40" ref={dropdownRef}>
      <label className={`block text-xs font-black mb-1.5 flex items-center gap-1.5 ${labelTextColor}`}>
        <Tag size={14} className={isDarkMode ? "text-purple-400" : "text-purple-600"} /> Kategori
      </label>

      {isAdding ? (
        <div className={`p-3.5 rounded-2xl border backdrop-blur-md space-y-3 animate-in fade-in duration-150 ${inlineCardBgStyle}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black flex items-center gap-1 ${isDarkMode ? "text-purple-300" : "text-purple-900"}`}>
              <Palette size={13} /> Buat Kategori Kustom
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className={`text-[10px] font-black cursor-pointer hover:opacity-70 ${labelTextColor}`}
            >
              Batal
            </button>
          </div>

          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nama Kategori (Misal: Belanja)"
            className={`w-full px-3.5 py-2 text-xs rounded-xl border outline-none ${inputBgStyle}`}
          />

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                Pilih Warna Bebas:
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border border-black/20 dark:border-white/20 shadow-xs"
                  style={{ backgroundColor: selectedColor }}
                />
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className={`w-18 px-1.5 py-0.5 text-[10px] font-mono font-black rounded-md border text-center uppercase ${inputBgStyle}`}
                />
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="360"
              value={hueValue}
              onChange={handleHueChange}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer outline-none bg-[linear-gradient(to_right,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)]"
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                {PRESET_DOTS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setSelectedColor(hex)}
                    style={{ backgroundColor: hex }}
                    className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                      selectedColor === hex ? "scale-125 ring-2 ring-purple-600 ring-offset-1" : "hover:scale-110 opacity-80"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={!newName.trim()}
                onClick={handleUseCustomCategory}
                className="px-3.5 py-1.5 text-xs font-black text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-sm"
              >
                Gunakan
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-4 py-3 text-sm rounded-2xl border outline-none flex items-center justify-between transition cursor-pointer ${inputBgStyle}`}
          >
            <span className={categoryId ? (isDarkMode ? "text-white font-bold" : "text-black font-bold") : (isDarkMode ? "text-slate-400 font-semibold" : "text-slate-500 font-semibold")}>
              {categoryNameDisplay}
            </span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${isDarkMode ? "text-slate-300" : "text-slate-600"} ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div
              className={`absolute left-0 right-0 top-full mt-1.5 rounded-2xl border p-1.5 shadow-2xl backdrop-blur-xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150 ${
                isDarkMode
                  ? "bg-slate-900/95 border-slate-700 text-white"
                  : "bg-white/95 border-slate-200 text-black"
              }`}
            >
              <button
                type="button"
                onClick={handleSelectNone}
                className={`w-full text-left px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-between ${
                  !categoryId
                    ? (isDarkMode ? "bg-purple-950/60 text-purple-300" : "bg-purple-50 text-purple-700")
                    : (isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-700")
                }`}
              >
                <span>Pilih Kategori (Opsional)</span>
                {!categoryId && <Check size={14} className="text-purple-600" />}
              </button>

              {defaultList.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectDefault(cat)}
                  className={`w-full text-left px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-between ${
                    categoryId === cat.id
                      ? (isDarkMode ? "bg-purple-950/60 text-purple-300" : "bg-purple-50 text-purple-700")
                      : (isDarkMode ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-100 text-slate-800")
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          cat.name.toLowerCase() === "kerja" ? "#f59e0b" :
                          cat.name.toLowerCase() === "sekolah" ? "#3b82f6" : "#10b981"
                      }}
                    />
                    <span>{cat.name}</span>
                  </div>
                  {categoryId === cat.id && <Check size={14} className="text-purple-600" />}
                </button>
              ))}

              <div className={`h-px my-1 ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`} />

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsAdding(true);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  isDarkMode
                    ? "text-purple-400 hover:bg-slate-800"
                    : "text-purple-600 hover:bg-purple-50"
                }`}
              >
                <Plus size={14} />
                <span>Tambah Kategori Baru...</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
