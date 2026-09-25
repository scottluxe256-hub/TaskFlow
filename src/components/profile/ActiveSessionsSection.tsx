// @ts-nocheck
import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";

const REMINDER_OPTIONS = [
  { value: "15 Menit", label: "15 Menit" },
  { value: "1 Jam", label: "1 Jam" },
  { value: "1 Hari", label: "1 Hari" },
  { value: "Custom", label: "Custom" }
];
const UNIT_OPTIONS = ["Menit", "Jam", "Hari"];

export default function ActiveSessionsSection({ isDarkMode }) {
  const [userId, setUserId] = useState(null);
  const [defaults, setDefaults] = useState({
    reminderEnabled: false,
    reminderDuration: "15 Menit",
    customValue: 30,
    customUnit: "Menit",
    customConfirmed: false,
    autoDelete: false
  });
  const [reminderOpen, setReminderOpen] = useState(false);

  // 1. Tarik Data Preferensi dari Supabase
  useEffect(() => {
    const fetchPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("reminder_enabled, reminder_duration, auto_delete_tasks")
        .eq("id", user.id)
        .single();

      if (profile) {
        setDefaults((prev) => ({
          ...prev,
          reminderEnabled: profile.reminder_enabled || false,
          reminderDuration: profile.reminder_duration || "15 Menit",
          autoDelete: profile.auto_delete_tasks || false,
        }));
      }
    };
    fetchPreferences();
  }, []);

  // 2. Fungsi Auto-Save ke Supabase
  const updatePreference = async (updates) => {
    if (!userId) return;
    try {
      await supabase.from("profiles").update(updates).eq("id", userId);
    } catch (err) {
      console.error("Gagal menyimpan preferensi:", err);
    }
  };

  const handleToggleReminder = () => {
    const newVal = !defaults.reminderEnabled;
    setDefaults((prev) => ({ ...prev, reminderEnabled: newVal }));
    updatePreference({ reminder_enabled: newVal });
  };

  const handleSelectDuration = (val) => {
    setDefaults((prev) => ({
      ...prev,
      reminderDuration: val,
      ...(val === "Custom" ? { customConfirmed: false } : {})
    }));
    setReminderOpen(false);
    if (val !== "Custom") {
      updatePreference({ reminder_duration: val });
    }
  };

  const handleConfirmCustom = (unit) => {
    const customStr = `${defaults.customValue} ${unit}`;
    setDefaults((prev) => ({
      ...prev,
      customUnit: unit,
      customConfirmed: true,
      reminderDuration: customStr
    }));
    updatePreference({ reminder_duration: customStr });
  };

  const handleToggleAutoDelete = () => {
    const newVal = !defaults.autoDelete;
    setDefaults((prev) => ({ ...prev, autoDelete: newVal }));
    updatePreference({ auto_delete_tasks: newVal });
  };

  const cardStyle = isDarkMode ? "bg-slate-900/80 backdrop-blur-md border border-slate-800/80 shadow-[0_0_20px_rgba(0,0,0,0.25)]" : "bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-[0_0_20px_rgba(0,0,0,0.08)]";
  const itemBoxStyle = isDarkMode ? "p-4 rounded-xl border border-slate-700/60 bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all" : "p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all";
  const dropdownStyle = isDarkMode ? "bg-slate-950/70 border-slate-700 text-slate-100" : "bg-white/90 border-slate-200 text-slate-800";
  const inputStyle = isDarkMode ? "bg-slate-950/70 border-slate-700 text-slate-100 focus:border-purple-400" : "bg-white/90 border-slate-200 text-slate-800 focus:border-purple-600";
  const toggleTrack = (active) => active ? "bg-purple-600" : isDarkMode ? "bg-slate-700" : "bg-slate-300";

  const isCustom = defaults.reminderDuration?.includes("Custom") || (!REMINDER_OPTIONS.some(o => o.value === defaults.reminderDuration) && defaults.reminderDuration);
  const showCustomInput = (defaults.reminderDuration === "Custom" && !defaults.customConfirmed);
  
  const dropdownLabel = isCustom && defaults.customConfirmed ? `${defaults.customValue} ${defaults.customUnit}` : (!REMINDER_OPTIONS.some(o => o.value === defaults.reminderDuration) ? defaults.reminderDuration : defaults.reminderDuration);

  return (
    <div className={`${cardStyle} rounded-2xl p-6 transition-all flex flex-col h-full`}>
      <h3 className={`text-base font-extrabold pb-3 mb-4 border-b ${isDarkMode ? "text-slate-100 border-slate-800" : "text-slate-800 border-slate-100"}`}>
        Aturan Tugas Default
      </h3>

      <div className="flex flex-col gap-4">
        {/* Aktifkan Tenggat Waktu */}
        <div className={itemBoxStyle}>
          <div>
            <p className={`text-sm font-bold mb-0.5 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>Aktifkan Tenggat Waktu</p>
            <p className={`text-[11px] font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Setel pengingat default otomatis.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <button
                type="button" disabled={!defaults.reminderEnabled}
                onClick={() => setReminderOpen(!reminderOpen)}
                className={`flex items-center justify-between gap-2 w-28 px-3 py-2 rounded-xl border text-xs font-bold transition ${dropdownStyle} ${defaults.reminderEnabled ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
              >
                <span className="truncate">{dropdownLabel}</span>
                <span className="text-[10px]">▾</span>
              </button>
              {reminderOpen && defaults.reminderEnabled && (
                <div className={`absolute right-0 top-full mt-1 w-28 rounded-xl border overflow-hidden shadow-lg z-10 ${isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
                  {REMINDER_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => handleSelectDuration(opt.value)} className={`block w-full text-left px-3 py-2 text-xs font-bold transition ${opt.value === defaults.reminderDuration ? "bg-purple-600 text-white" : isDarkMode ? "text-slate-200 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" role="switch" aria-checked={defaults.reminderEnabled} onClick={handleToggleReminder} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${toggleTrack(defaults.reminderEnabled)}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${defaults.reminderEnabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        {showCustomInput && defaults.reminderEnabled && (
          <div className="flex items-center justify-end gap-2 -mt-2 animate-fade-in">
            <input type="number" min="1" value={defaults.customValue} onChange={(e) => setDefaults({ ...defaults, customValue: e.target.value })} className={`w-16 px-2 py-1.5 rounded-lg border text-xs font-bold text-center outline-none transition ${inputStyle}`} />
            <div className={`flex rounded-lg border overflow-hidden ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
              {UNIT_OPTIONS.map((unit) => (
                <button key={unit} type="button" onClick={() => handleConfirmCustom(unit)} className={`px-2.5 py-1.5 text-[11px] font-extrabold transition ${defaults.customUnit === unit ? "bg-purple-600 text-white" : isDarkMode ? "bg-slate-950/70 text-slate-300 hover:bg-slate-800" : "bg-white/90 text-slate-600 hover:bg-slate-100"}`}>
                  {unit}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hapus Tugas Otomatis */}
        <div className={itemBoxStyle}>
          <div>
            <p className={`text-sm font-bold mb-0.5 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>Hapus Tugas Otomatis</p>
            <p className={`text-[11px] font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Tugas terhapus saat ditandai selesai.</p>
          </div>
          <div className="shrink-0">
            <button type="button" role="switch" aria-checked={defaults.autoDelete} onClick={handleToggleAutoDelete} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${toggleTrack(defaults.autoDelete)}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${defaults.autoDelete ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
