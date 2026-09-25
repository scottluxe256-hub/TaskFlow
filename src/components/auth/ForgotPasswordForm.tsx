import React, { useState } from "react";
import { Mail, KeyRound, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface ForgotPasswordFormProps {
  onSwitchView: (view: "login" | "reset") => void;
}

export default function ForgotPasswordForm({ onSwitchView }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Step 1: Minta Supabase kirim kode 6-digit ke Gmail
  const handleSendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      setStep("otp"); // Pindah ke input 6 digit angka
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengirim kode reset.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verifikasi Kode 6-Digit dengan Supabase
  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length < 6) {
      return setErrorMsg("Masukkan 6 digit kode OTP lengkap.");
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // ✅ Verifikasi kode 6-digit khusus alur recovery
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "recovery",
      });

      if (error) throw error;

      // Berhasil! Session recovery dibuat, buka halaman Reset Password
      onSwitchView("reset");
    } catch (err: any) {
      setErrorMsg(err.message || "Kode OTP salah atau kadaluarsa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {errorMsg && (
        <p className="text-red-500 text-xs font-semibold text-center mb-3">{errorMsg}</p>
      )}

      {step === "email" ? (
        /* --- FORM STEP 1: INPUT EMAIL --- */
        <form onSubmit={handleSendEmail} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold mb-1.5 block text-slate-800">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none bg-white/95 border-slate-300 focus:border-purple-600 text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 text-white shadow-md transition cursor-pointer flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Kirim Kode OTP"}
          </button>

          <div className="text-center mt-2">
            <button
              type="button"
              onClick={() => onSwitchView("login")}
              className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
            >
              Kembali ke Login
            </button>
          </div>
        </form>
      ) : (
        /* --- FORM STEP 2: INPUT KODE OTP 6-DIGIT --- */
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <p className="text-xs text-center text-slate-600">
            Kode verifikasi 6-digit telah dikirim ke <br />
            <span className="font-bold text-slate-800">{email}</span>
          </p>

          <div>
            <label className="text-xs font-bold mb-1.5 block text-slate-800">Kode OTP</label>
            <div className="relative">
              <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                maxLength={8}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} // Hanya angka
                placeholder="00000000"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-center font-mono tracking-widest outline-none bg-white/95 border-slate-300 focus:border-purple-600 text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 text-white shadow-md transition cursor-pointer flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Verifikasi & Ganti Password"}
          </button>

          <div className="flex justify-between items-center text-xs mt-1">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-slate-500 hover:underline flex items-center gap-1"
            >
              <ArrowLeft size={12} /> Ganti Email
            </button>
            <button
              type="button"
              onClick={() => handleSendEmail({ preventDefault: () => { } } as any)}
              disabled={loading}
              className="font-bold text-purple-700 hover:underline disabled:opacity-50"
            >
              Kirim Ulang Kode
            </button>
          </div>
        </form>
      )}
    </div>
  );
}