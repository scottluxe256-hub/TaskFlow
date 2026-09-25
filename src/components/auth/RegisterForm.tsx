import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, AtSign, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface RegisterFormProps {
  onSwitchView: (view: "login") => void;
  onLoginSuccess?: () => void;
}

export default function RegisterForm({ onSwitchView, onLoginSuccess }: RegisterFormProps) {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "", email: "", username: "", password: "", confirmPassword: "", agree: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (formData.password !== formData.confirmPassword) {
      return setErrorMsg("Konfirmasi password tidak cocok.");
    }
    
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          username: formData.username,
        }
      }
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data.session) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setSuccessMsg("Pendaftaran berhasil! Silakan cek email Anda.");
      setTimeout(() => onSwitchView("login"), 3000);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider, 
      options: { 
        redirectTo: window.location.origin 
      } 
    });
    if (error) {
      setLoading(false);
      setErrorMsg(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {errorMsg && <p className="text-red-500 text-xs font-semibold text-center">{errorMsg}</p>}
      {successMsg && <p className="text-green-600 text-xs font-semibold text-center">{successMsg}</p>}

      <div>
        <label className="text-xs font-bold mb-1 block text-slate-800 drop-shadow-xs">Nama Lengkap</label>
        <div className="relative">
          <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 drop-shadow-xs" />
          <input
            type="text"
            name="name"
            required
            placeholder="Masukkan nama lengkap"
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2 rounded-xl border text-sm outline-none transition shadow-sm focus:shadow-md bg-white/95 border-slate-300 focus:border-purple-600 text-slate-900"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold mb-1 block text-slate-800 drop-shadow-xs">Email</label>
        <div className="relative">
          <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 drop-shadow-xs" />
          <input
            type="email"
            name="email"
            required
            placeholder="Masukkan email"
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2 rounded-xl border text-sm outline-none transition shadow-sm focus:shadow-md bg-white/95 border-slate-300 focus:border-purple-600 text-slate-900"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold mb-1 block text-slate-800 drop-shadow-xs">Username</label>
        <div className="relative">
          <AtSign size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 drop-shadow-xs" />
          <input
            type="text"
            name="username"
            required
            placeholder="Buat username"
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2 rounded-xl border text-sm outline-none transition shadow-sm focus:shadow-md bg-white/95 border-slate-300 focus:border-purple-600 text-slate-900"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold mb-1 block text-slate-800 drop-shadow-xs">Password</label>
        <div className="relative">
          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 drop-shadow-xs" />
          <input
            type={showPass ? "text" : "password"}
            name="password"
            required
            placeholder="Buat password"
            onChange={handleChange}
            className="w-full pl-10 pr-10 py-2 rounded-xl border text-sm outline-none transition shadow-sm focus:shadow-md bg-white/95 border-slate-300 focus:border-purple-600 text-slate-900"
          />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold mb-1 block text-slate-800 drop-shadow-xs">Konfirmasi Password</label>
        <div className="relative">
          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 drop-shadow-xs" />
          <input
            type={showConfirmPass ? "text" : "password"}
            name="confirmPassword"
            required
            placeholder="Ulangi password"
            onChange={handleChange}
            className="w-full pl-10 pr-10 py-2 rounded-xl border text-sm outline-none transition shadow-sm focus:shadow-md bg-white/95 border-slate-300 focus:border-purple-600 text-slate-900"
          />
          <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
            {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <label className="flex items-start gap-2 cursor-pointer mt-1">
        <input
          type="checkbox"
          name="agree"
          required
          onChange={handleChange}
          className="mt-0.5 rounded border-slate-400 text-purple-600 focus:ring-purple-500 shadow-sm"
        />
        <span className="text-[11px] leading-tight font-medium drop-shadow-xs text-slate-700">
          Saya setuju dengan <a href="#" className="text-purple-700 font-bold underline">Syarat & Ketentuan</a> dan <a href="#" className="text-purple-700 font-bold underline">Kebijakan Privasi</a>
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-xl font-bold text-sm mt-1 bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg shadow-black/10 hover:shadow-black/20 transition cursor-pointer drop-shadow-sm flex items-center justify-center disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <span className="drop-shadow-sm">Daftar</span>}
      </button>

      <div className="flex items-center gap-3 my-0.5">
        <div className="h-px flex-1 bg-slate-300" />
        <span className="text-xs text-slate-500 font-semibold drop-shadow-xs">atau daftar dengan</span>
        <div className="h-px flex-1 bg-slate-300" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleOAuthLogin("google")}
          className="py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm hover:shadow-md border-slate-300 bg-white hover:bg-slate-50 text-slate-800 disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0 drop-shadow-xs" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span className="drop-shadow-xs">Google</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleOAuthLogin("github")}
          className="py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm hover:shadow-md border-slate-300 bg-white hover:bg-slate-50 text-slate-800 disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0 fill-current drop-shadow-xs" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <span className="drop-shadow-xs">GitHub</span>
        </button>
      </div>

      <p className="text-center text-xs mt-1 text-slate-500 font-medium drop-shadow-xs">
        Sudah punya akun?{" "}
        <button type="button" onClick={() => onSwitchView("login")} className="font-bold text-purple-700 hover:text-purple-800 hover:underline cursor-pointer">
          Login sekarang
        </button>
      </p>
    </form>
  );
}
