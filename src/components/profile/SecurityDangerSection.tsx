// @ts-nocheck
import React, { useState } from "react";
import { KeyRound, Trash2 } from "lucide-react";
import ProfilePasswordReset from "./ProfilePasswordReset";
import { supabase } from "../../utils/supabase";
import { showAccountDeleteConfirm } from "../../utils/sweetalert";

export default function SecurityDangerSection({ onLogout, isDarkMode }) {
  const [showChangePass, setShowChangePass] = useState(false);

  const cardStyle = isDarkMode
    ? "bg-slate-900/80 backdrop-blur-md border border-slate-800/80 shadow-[0_0_20px_rgba(0,0,0,0.25)]"
    : "bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-[0_0_20px_rgba(0,0,0,0.08)]";

  // Gaya kotak pembungkus yang simetris buat tiap baris pengaturan
  const itemBoxStyle = isDarkMode
    ? "p-4 rounded-xl border border-slate-700/60 bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
    : "p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all";

  const handleDeleteAccount = () => {
    showAccountDeleteConfirm(async () => {
      try {
        const { error } = await supabase.rpc("delete_user_account");
        if (error) throw error;
        onLogout(); // Tetap butuh buat nendang user ke halaman depan pas akun hancur
      } catch (err) {
        console.error("Gagal menghapus akun:", err);
      }
    }, isDarkMode);
  };

  return (
    <div className={`${cardStyle} rounded-2xl p-6 transition-all h-full`}>
      <h3 className={`text-base font-extrabold pb-3 mb-4 border-b ${
        isDarkMode ? "text-slate-100 border-slate-800" : "text-slate-800 border-slate-100"
      }`}>
        Keamanan Akun
      </h3>

      <div className="flex flex-col gap-4">
        
        {/* Baris 1: Ganti Password */}
        <div className={itemBoxStyle}>
          <div>
            <p className={`text-sm font-bold mb-0.5 flex items-center gap-1.5 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
              <KeyRound size={16} className="text-purple-500" /> Ganti Password
            </p>
            <p className={`text-[11px] font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              Perbarui kata sandi dengan verifikasi OTP email.
            </p>
          </div>
          <button
            onClick={() => setShowChangePass(!showChangePass)}
            className={`px-5 py-2.5 rounded-xl border text-xs font-extrabold transition cursor-pointer shrink-0 whitespace-nowrap shadow-sm ${
              isDarkMode
                ? "border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                : "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            {showChangePass ? "Tutup Form" : "Ganti Password"}
          </button>
        </div>

        {/* Muncul di bawah kotak Ganti Password kalau tombol ditekan */}
        {showChangePass && (
          <div className="animate-fade-in -mt-2">
            <ProfilePasswordReset isDarkMode={isDarkMode} onClose={() => setShowChangePass(false)} />
          </div>
        )}

        {/* Baris 2: Hapus Akun */}
        <div className={`${itemBoxStyle} ${isDarkMode ? "!border-rose-900/30 !bg-rose-950/10" : "!border-rose-100 !bg-rose-50/30"}`}>
          <div>
            <p className={`text-sm font-bold mb-0.5 flex items-center gap-1.5 ${isDarkMode ? "text-rose-400" : "text-rose-600"}`}>
              <Trash2 size={16} /> Hapus Akun
            </p>
            <p className={`text-[11px] font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              Hapus akun secara permanen. Data tidak bisa kembali.
            </p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className={`px-5 py-2.5 rounded-xl border text-xs font-extrabold transition cursor-pointer shrink-0 whitespace-nowrap shadow-sm ${
              isDarkMode
                ? "border-rose-800/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50"
                : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
            }`}
          >
            Hapus Akun
          </button>
        </div>

      </div>
    </div>
  );
}
