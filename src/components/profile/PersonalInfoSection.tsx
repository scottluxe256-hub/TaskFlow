// @ts-nocheck
import React, { useState, useEffect } from "react";
import { User, Mail, AtSign, Save } from "lucide-react";

export default function PersonalInfoSection({ user, onSave, isDarkMode, isSaving }) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: ""
  });

  // Otomatis update form saat data user dari Supabase masuk
  useEffect(() => {
    setFormData({
      name: user.name || "",
      username: user.username || "",
      bio: user.bio || ""
    });
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(formData);
  };

  const cardStyle = isDarkMode
    ? "bg-slate-900/80 backdrop-blur-md border border-slate-800/80 shadow-[0_0_20px_rgba(0,0,0,0.25)]"
    : "bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-[0_0_20px_rgba(0,0,0,0.08)]";

  const inputStyle = isDarkMode
    ? "bg-slate-950/70 border-slate-700 text-slate-100 focus:border-purple-400 placeholder:text-slate-500"
    : "bg-white/90 border-slate-200 text-slate-800 focus:border-purple-600 placeholder:text-slate-400";

  return (
    <div className={`${cardStyle} rounded-2xl p-6 transition-all`}>
      <h3 className={`text-base font-extrabold mb-4 pb-2 border-b ${
        isDarkMode ? "text-slate-100 border-slate-800" : "text-slate-800 border-slate-100"
      }`}>
        Informasi Pribadi
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`text-xs font-bold block mb-1.5 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>Nama Lengkap</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs font-medium focus:outline-none transition ${inputStyle}`}
              />
            </div>
          </div>

          <div>
            <label className={`text-xs font-bold block mb-1.5 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>Username</label>
            <div className="relative">
              <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/\s/g, '').toLowerCase() })} // Gak boleh spasi
                placeholder="tanpa_spasi"
                className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs font-medium focus:outline-none transition ${inputStyle}`}
              />
            </div>
          </div>
        </div>

        <div>
          <label className={`text-xs font-bold block mb-1.5 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>Email (Read-Only)</label>
          <div className="relative opacity-70 cursor-not-allowed">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              disabled
              value={user.email || ""}
              className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs font-medium focus:outline-none transition ${inputStyle}`}
            />
          </div>
        </div>

        <div>
          <label className={`text-xs font-bold block mb-1.5 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>Bio Singkat</label>
          <textarea
            rows={2}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className={`w-full p-3 rounded-xl border text-xs font-medium focus:outline-none transition resize-none ${inputStyle}`}
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Menyimpan..." : <><Save size={14} /> Simpan Perubahan</>}
          </button>
        </div>
      </form>
    </div>
  );
}
