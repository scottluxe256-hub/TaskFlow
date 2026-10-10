import React from "react";
import { CheckCircle2, Circle, Clock, Edit2, Trash2 } from "lucide-react";
import { Task } from "../types";

export interface TaskItemProps {
  task: Task;
  onToggleDone?: (id: string, currentStatus: boolean) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  isDarkMode?: boolean;
  hideActions?: boolean;
}

export const normalizeColor = (colorStr: string, name: string = ""): string => {
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

// HELPER PINTAR: Mengatasi Array / Object dari Supabase
export const getTaskCategory = (task: any) => {
  let cat = task.categories || task.category;
  
  // Jika Supabase mengirimkan sebagai Array, ambil elemen pertama [0]
  if (Array.isArray(cat) && cat.length > 0) {
    cat = cat[0];
  }

  const name = cat?.name || "Umum";
  const rawColor = cat?.color || "";
  const color = normalizeColor(rawColor, name);

  return { name, color };
};

export default function TaskItem({
  task,
  onToggleDone,
  onEdit,
  onDelete,
  isDarkMode = false,
  hideActions = false
}: TaskItemProps) {

  // Gunakan helper pintar di sini
  const { name: categoryName, color: categoryColor } = getTaskCategory(task);

  let formattedTime = "09:00";
  let formattedDate = "Hari Ini";

  if (task.due_date) {
    const d = new Date(task.due_date);
    formattedTime = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(/\./g, ":");
    formattedDate = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  }

  return (
    <div className={`group flex items-center justify-between p-3 rounded-xl border transition-all shadow-2xs gap-2 ${isDarkMode
        ? "bg-slate-800/60 border-slate-700/80 hover:border-purple-500/50"
        : "bg-white/90 border-slate-200/80 hover:border-purple-300"
      }`}>
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onToggleDone?.(task.id, task.is_completed)}
          className={`shrink-0 transition cursor-pointer ${isDarkMode ? "text-slate-500 hover:text-purple-400" : "text-slate-400 hover:text-purple-600"
            }`}
        >
          {task.is_completed ? (
            <CheckCircle2 size={18} className="text-purple-600" />
          ) : (
            <Circle size={18} />
          )}
        </button>

        <div className="flex flex-col min-w-0 flex-1">
          <span className={`text-xs sm:text-sm font-bold truncate ${task.is_completed
              ? (isDarkMode ? "line-through text-slate-500" : "line-through text-slate-400")
              : (isDarkMode ? "text-slate-200" : "text-slate-800")
            }`}>
            {task.title}
          </span>
          <span className={`text-[11px] font-semibold flex items-center gap-1.5 mt-0.5 truncate ${isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}>
            <span className="flex items-center gap-1 shrink-0">
              <Clock size={11} /> {formattedTime}
            </span>
            <span>•</span>
            <span className="truncate">{formattedDate}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className="w-24 text-center text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border shrink-0 truncate transition-all"
          style={{
            backgroundColor: `${categoryColor}20`,
            borderColor: `${categoryColor}50`,
            color: categoryColor
          }}
        >
          {categoryName}
        </span>

        {!hideActions && (
          <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition">
            <button
              type="button"
              onClick={() => onEdit?.(task)}
              className={`p-1 rounded-lg transition cursor-pointer ${isDarkMode
                  ? "text-slate-400 hover:text-purple-400 hover:bg-slate-700"
                  : "text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                }`}
              title="Edit Tugas"
            >
              <Edit2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(task.id)}
              className={`p-1 rounded-lg transition cursor-pointer ${isDarkMode
                  ? "text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                  : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                }`}
              title="Hapus Tugas"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
