import React, { useState } from "react";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface LoginFormProps {
  onSwitchView: (view: "register" | "forgot") => void;
  onLoginSuccess?: () => void;
}

export default function LoginForm({ onSwitchView, onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErrorMsg(error.message === "Invalid login credentials" ? "Email atau password salah." : error.message);
      return;
    }
    if (onLoginSuccess) onLoginSuccess();
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
        // KUNCI BARU: Tambah izin Google Tasks API
        scopes: provider === "google"
          ? "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/tasks.readonly"
          : undefined,
        queryParams: provider === "google" ? { access_type: "offline", prompt: "consent" } : undefined,
      },
    });
    if (error) { setLoading(false); setErrorMsg(error.message); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {errorMsg && <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl font-medium">{errorMsg}</div>}
      <div>
        <label className="text-xs font-bold mb-1.5 block text-slate-800">Email</label>
        <div className="relative">
          <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Masukkan email Anda" className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition shadow-sm focus:shadow-md bg-white/95 border-slate-300 focus:border-purple-600 text-slate-900" />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold mb-1.5 block text-slate-800">Password</label>
        <div className="relative">
          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type={showPass ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition shadow-sm focus:shadow-md bg-white/95 border-slate-300 focus:border-purple-600 text-slate-900" />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
      </div>
      <div className="text-right"><button type="button" onClick={() => onSwitchView("forgot")} className="text-xs font-bold text-purple-700 hover:text-purple-800 hover:underline cursor-pointer">Lupa password?</button></div>
      <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2">
        {loading ? <Loader2 size={18} className="animate-spin" /> : "Login"}
      </button>
      <div className="flex items-center gap-3 my-1">
        <div className="h-px flex-1 bg-slate-300" />
        <span className="text-xs text-slate-500 font-semibold">atau masuk dengan</span>
        <div className="h-px flex-1 bg-slate-300" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <button type="button" disabled={loading} onClick={() => handleOAuthLogin("google")} className="py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm hover:shadow-md border-slate-300 bg-white hover:bg-slate-50 text-slate-800 disabled:opacity-50">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" /></svg>
          <span>Google</span>
        </button>
        <button type="button" disabled={loading} onClick={() => handleOAuthLogin("github")} className="py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm hover:shadow-md border-slate-300 bg-white hover:bg-slate-50 text-slate-800 disabled:opacity-50">
          <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
          <span>GitHub</span>
        </button>
      </div>
      <p className="text-center text-xs mt-1 text-slate-500 font-medium">Belum punya akun? <button type="button" onClick={() => onSwitchView("register")} className="font-bold text-purple-700 hover:text-purple-800 hover:underline cursor-pointer">Daftar sekarang</button></p>
    </form>
  );
}