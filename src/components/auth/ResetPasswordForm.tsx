import React, { useState } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface ResetPasswordFormProps {
  onSwitchView: (view: "login") => void;
}

export default function ResetPasswordForm({ onSwitchView }: ResetPasswordFormProps) {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setErrorMsg("Konfirmasi password tidak cocok.");
    }

    if (password.length < 6) {
      return setErrorMsg("Password minimal 6 karakter.");
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // ✅ Update password pengguna di Supabase
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccessMsg("Password berhasil diperbarui! Mengalihkan ke Login...");

      setTimeout(async () => {
        await supabase.auth.signOut();
        onSwitchView("login");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {errorMsg && <p className="text-red-500 text-xs font-semibold text-center">{errorMsg}</p>}
      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-semibold text-center">
          {successMsg}
        </div>
      )}

      <div>
        <label className="text-xs font-bold mb-1.5 block text-slate-800 drop-shadow-xs">Password Baru</label>
        <div className="relative">
          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 drop-shadow-xs" />
          <input
            type={showPass ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password baru"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition shadow-sm focus:shadow-md bg-white/95 border-slate-300 focus:border-purple-600 text-slate-900 placeholder:text-slate-400"
          />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold mb-1.5 block text-slate-800 drop-shadow-xs">Ulangi Password Baru</label>
        <div className="relative">
          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 drop-shadow-xs" />
          <input
            type={showConfirmPass ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi password baru"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition shadow-sm focus:shadow-md bg-white/95 border-slate-300 focus:border-purple-600 text-slate-900 placeholder:text-slate-400"
          />
          <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
            {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Konfirmasi Ganti Password</span>}
      </button>

      <div className="text-center mt-2">
        <button
          type="button"
          onClick={() => onSwitchView("login")}
          className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
        >
          Masuk sekarang
        </button>
      </div>
    </form>
  );
}