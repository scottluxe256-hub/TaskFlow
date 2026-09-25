import React, { useState, useEffect } from "react";
import { Calendar, FileText, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Task, Category } from "../types";
import CategoryDropdown from "./CategoryDropdown";
import { getTaskCategory } from "./TaskItem";
import { createGoogleCalendarEvent } from "../services/googleCalendar"; // KUNCI SINKRONISASINYA DI SINI

export interface TaskModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  taskToEdit?: Task | null;
  initialDate?: string;
  onClose: () => void;
  onSuccess: () => void;
  isDarkMode?: boolean;
}

const DEFAULT_CATEGORIES = [
  { name: "Kerja", color: "#f59e0b" },
  { name: "Sekolah", color: "#3b82f6" },
  { name: "Pribadi", color: "#10b981" },
];

export default function TaskModal({
  isOpen,
  mode,
  taskToEdit,
  initialDate,
  onClose,
  onSuccess,
  isDarkMode = false
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categoryNameDisplay, setCategoryNameDisplay] = useState<string>("");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("09:00");

  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const fetchCategories = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (!error && data) {
      let cats = data as Category[];
      if (cats.length === 0) {
        const defaultPayloads = DEFAULT_CATEGORIES.map(cat => ({
          user_id: user.id,
          name: cat.name,
          color: cat.color
        }));
        const { data: insertedDefaults } = await supabase.from("categories").insert(defaultPayloads).select();
        if (insertedDefaults) {
          cats = insertedDefaults as Category[];
        }
      }
      setDbCategories(cats);

      if (mode === "create" && cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
        setCategoryNameDisplay(cats[0].name);
      }
    }
  };

  useEffect(() => {
    if (isOpen) fetchCategories();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);

    if (mode === "edit" && taskToEdit) {
      setTitle(taskToEdit.title || "");
      setDescription(taskToEdit.description || "");
      setCategoryId(taskToEdit.category_id || "");
      const { name: catName } = getTaskCategory(taskToEdit);
      setCategoryNameDisplay(catName !== "Umum" ? catName : "Pilih Kategori");

      if (taskToEdit.due_date) {
        const d = new Date(taskToEdit.due_date);
        setDateStr(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
        setTimeStr(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
      } else {
        setDateStr(getTodayStr());
        setTimeStr("09:00");
      }
    } else {
      setTitle("");
      setDescription("");
      if (dbCategories.length > 0) {
        setCategoryId(dbCategories[0].id);
        setCategoryNameDisplay(dbCategories[0].name);
      } else {
        setCategoryId("");
        setCategoryNameDisplay("Pilih Kategori *");
      }
      setDateStr(initialDate || getTodayStr());
      setTimeStr("09:00");
    }
  }, [isOpen, mode, taskToEdit, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setErrorMsg("Judul tugas tidak boleh kosong."); return; }
    if (!categoryId) { setErrorMsg("Silakan pilih kategori tugas terlebih dahulu!"); return; }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Pengguna belum terautentikasi.");

      let finalCategoryId: string | null = categoryId;
      if (categoryId && categoryId.startsWith("NEW_CAT:")) {
        const [, newCatName, newCatColor] = categoryId.split(":");
        const existingCat = dbCategories.find(c => c.name.toLowerCase() === newCatName.toLowerCase());
        if (existingCat) {
          finalCategoryId = existingCat.id;
        } else {
          const { data: insertedCat, error: catErr } = await supabase.from("categories").insert([{ user_id: user.id, name: newCatName, color: newCatColor }]).select().single();
          if (catErr) throw new Error(`Gagal membuat kategori: ${catErr.message}`);
          if (insertedCat) finalCategoryId = insertedCat.id;
        }
      }

      let dueISO: string | null = null;
      if (dateStr) {
        const [hours, minutes] = timeStr.split(":").map(Number);
        const [year, month, day] = dateStr.split("-").map(Number);
        const dueObj = new Date(year, month - 1, day, hours || 9, minutes || 0);
        dueISO = dueObj.toISOString();
      }

      if (mode === "create") {
        const { error } = await supabase.from("tasks").insert([{
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          category_id: finalCategoryId,
          due_date: dueISO,
          is_completed: false
        }]);
        if (error) throw error;

        // EKSEKUSI SINKRONISASI KE GOOGLE CALENDAR
        if (dueISO) {
          await createGoogleCalendarEvent(title.trim(), dueISO, description.trim() || undefined);
        }

      } else if (mode === "edit" && taskToEdit) {
        const { error } = await supabase.from("tasks").update({
          title: title.trim(),
          description: description.trim() || null,
          category_id: finalCategoryId,
          due_date: dueISO
        }).eq("id", taskToEdit.id);
        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan tugas.");
    } finally {
      setLoading(false);
    }
  };

  const labelTextColor = isDarkMode ? "text-white" : "text-black";
  const inputBgStyle = isDarkMode
    ? "bg-slate-800/80 backdrop-blur-md border-slate-700 text-white focus:border-purple-500 placeholder:text-slate-400 font-semibold"
    : "bg-white/80 backdrop-blur-md border-slate-300 text-black focus:border-purple-600 placeholder:text-slate-500 font-semibold";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose}>
      <div className={`relative w-full max-w-md p-6 sm:p-7 rounded-3xl z-10 border transition-all duration-300 shadow-2xl ${isDarkMode ? "border-slate-800 bg-[#070d1e]" : "border-slate-300/80 bg-white"}`} onClick={(e) => e.stopPropagation()}>
        <img src={isDarkMode ? "/assets/bg_card_dark.avif" : "/assets/bg_card.avif"} alt="Card Background" className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 rounded-3xl" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col items-center text-center pb-2 border-b border-slate-300/50 dark:border-slate-800/80">
            <img src="/assets/logo.webp" alt="TaskFlow Logo" className={`w-10 h-10 object-contain mb-1 transition-all ${isDarkMode ? "drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" : "drop-shadow-md"}`} />
            <h2 className={`text-xl font-black tracking-tight ${labelTextColor}`}>{mode === "create" ? "Tambah Tugas Baru" : "Edit Detail Tugas"}</h2>
          </div>
          {errorMsg && <div className="p-3 text-xs font-bold text-rose-600 bg-rose-50/90 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl">{errorMsg}</div>}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="relative z-10">
              <label className={`block text-xs font-black mb-1.5 ${labelTextColor}`}>Judul Tugas <span className="text-rose-500">*</span></label>
              <input type="text" required autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mau menyelesaikan apa hari ini?" className={`w-full px-4 py-3 text-sm rounded-2xl border outline-none transition ${inputBgStyle}`} />
            </div>
            <CategoryDropdown categoryId={categoryId} setCategoryId={setCategoryId} categoryNameDisplay={categoryNameDisplay} setCategoryNameDisplay={setCategoryNameDisplay} dbCategories={dbCategories} setDbCategories={setDbCategories} isDarkMode={isDarkMode} />
            <div className="relative z-10">
              <label className={`block text-xs font-black mb-1.5 flex items-center gap-1.5 ${labelTextColor}`}><Calendar size={14} className="text-purple-600 dark:text-purple-400" /> Tanggal & Waktu</label>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={dateStr} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} onChange={(e) => setDateStr(e.target.value)} className={`w-full px-3.5 py-2.5 text-xs font-extrabold rounded-2xl border outline-none cursor-pointer ${inputBgStyle}`} />
                <input type="time" value={timeStr} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} onChange={(e) => setTimeStr(e.target.value)} className={`w-full px-3.5 py-2.5 text-xs font-extrabold rounded-2xl border outline-none cursor-pointer ${inputBgStyle}`} />
              </div>
            </div>
            <div className="relative z-10">
              <label className={`block text-xs font-black mb-1.5 flex items-center gap-1.5 ${labelTextColor}`}><FileText size={14} className="text-purple-600 dark:text-purple-400" /> Catatan Tambahan (Opsional)</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tambahkan rincian atau catatan tugas di sini..." className={`w-full px-4 py-2.5 text-xs rounded-2xl border outline-none transition resize-none ${inputBgStyle}`} />
            </div>
            <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-300/50 dark:border-slate-800/80">
              <button type="button" onClick={onClose} className={`px-5 py-2.5 text-xs font-bold rounded-2xl border transition cursor-pointer active:scale-95 ${isDarkMode ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border-slate-300 bg-white text-black hover:bg-slate-100"}`}>Batal</button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 text-xs font-black text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-2xl shadow-md shadow-purple-500/25 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
                {loading ? <><Loader2 size={15} className="animate-spin" /><span>Menyimpan...</span></> : <span>Simpan Data</span>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}