// @ts-nocheck
import React, { useState, useEffect } from "react";
import { KeyRound, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../utils/supabase"; 
import { showSuccessAlert } from "../../utils/sweetalert"; 

export default function ProfilePasswordReset({ isDarkMode, onClose }) {
  const [step, setStep] = useState("sending_otp"); 
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const sendOtpOtomatis = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setErrorMsg("Gagal mendapatkan email user.");
        setStep("error");
        return;
      }
      
      setEmail(user.email);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(user.email);
        if (error) throw error;
        setStep("otp");
      } catch (err) {
        setErrorMsg(err.message || "Terjadi kesalahan saat mengirim OTP.");
        setStep("error");
      }
    };

    sendOtpOtomatis();
  }, []);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "recovery",
      });
      if (error) throw error;
      setStep("new_password");
    } catch (err) {
      setErrorMsg("Kode OTP salah atau sudah kadaluarsa.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) return setErrorMsg("Password minimal 6 karakter.");
    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      showSuccessAlert("Berhasil!", "Password Anda telah berhasil diperbarui. 🚀", isDarkMode);
      onClose(); 
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan password baru.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = isDarkMode 
    ? "bg-slate-950/70 border-slate-700 text-slate-100 focus:border-purple-400" 
    : "bg-white/90 border-slate-200 text-slate-800 focus:border-purple-600";

  return (
    <div className={`p-5 rounded-xl border mt-3 transition-all shadow-sm ${
      isDarkMode ? "bg-slate-900/50 border-purple-500/30" : "bg-purple-50/50 border-purple-200"
    }`}>
      {errorMsg && <p className="text-red-500 text-xs font-bold text-center mb-3">{errorMsg}</p>}

      {step === "sending_otp" && (
        <div className={`flex flex-col items-center justify-center py-4 gap-2 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}>
          <Loader2 size={24} className="animate-spin" />
          <span className="text-xs font-bold">Mengirim OTP ke email Anda...</span>
        </div>
      )}

      {step === "error" && (
        <div className="text-center">
          <button onClick={onClose} className="text-xs font-bold text-slate-500 hover:underline cursor-pointer">Batal</button>
        </div>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
          <p className={`text-xs text-center ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
            Masukkan 8-digit OTP yang dikirim ke <br/><span className="font-bold">{email}</span>
          </p>
          <div className="relative mt-1">
            <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required maxLength={8}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="00000000"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-center font-mono tracking-widest outline-none ${inputStyle}`}
            />
          </div>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border cursor-pointer ${isDarkMode ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-slate-300 hover:bg-slate-50 text-slate-700"}`}>
              Batal
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md shadow-purple-500/20 disabled:opacity-50">
              {loading ? "Mengecek..." : "Verifikasi"}
            </button>
          </div>
        </form>
      )}

      {step === "new_password" && (
        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3">
          <div>
            <label className={`text-xs font-bold block mb-1.5 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>Password Baru</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPass ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none ${inputStyle}`}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full mt-1 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md shadow-purple-500/20 disabled:opacity-50">
            {loading ? "Menyimpan..." : "Simpan Password"}
          </button>
        </form>
      )}
    </div>
  );
}
