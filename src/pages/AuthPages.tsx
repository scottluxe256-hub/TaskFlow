import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";

type AuthView = "login" | "register" | "forgot" | "reset";

interface AuthPagesProps {
  initialView?: AuthView;
  onNavigate?: (targetPage: string) => void;
  onLoginSuccess?: () => void;
}

const headerTitles: Record<AuthView, { title: string; desc: string }> = {
  login: { title: "Selamat Datang Kembali!", desc: "Login untuk melanjutkan ke akun Anda" },
  register: { title: "Buat Akun Baru", desc: "Daftar untuk mulai menggunakan TaskFlow" },
  forgot: { title: "Lupa Password?", desc: "Masukkan email Anda untuk menerima instruksi pemulihan" },
  reset: { title: "Atur Ulang Password", desc: "Langkah terakhir untuk mengamankan akun Anda." },
};

export default function AuthPages({
  initialView = "login",
  onNavigate,
  onLoginSuccess
}: AuthPagesProps) {
  const [view, setView] = useState<AuthView>(initialView);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 transition-colors duration-300 relative overflow-x-hidden font-sans bg-slate-50 text-slate-800">

      {/* --- BACKGROUND UTAMA RESPONSIVE --- */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center">
        <picture className="w-full h-full">
          <source media="(min-width: 768px)" srcSet="/assets/bg_desktop.avif" />
          <img
            src="/assets/bg_mobile.avif"
            alt="Auth Background"
            className="w-full h-full object-cover object-top opacity-100"
          />
        </picture>
      </div>

      {/* --- CARD UTAMA --- */}
      <div className="relative w-full max-w-md my-auto p-6 sm:p-8 rounded-3xl z-10 transition-all duration-300 transform-gpu gpu-layer overflow-hidden border border-slate-400/60 shadow-[0_15px_50px_rgba(0,0,0,0.15)] my-6">

        {/* BACKGROUND CARD */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/bg_card.avif"
            alt="Card Background"
            className="w-full h-full object-cover object-bottom opacity-100"
          />
        </div>

        {/* KONTEN DALAM CARD */}
        <div className="relative z-10">
          {/* TOMBOL BERANDA */}
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate("landing") : undefined}
            className="absolute -top-2 left-0 px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer z-20 shadow-sm drop-shadow-xs border-slate-300 bg-white/90 hover:bg-slate-50 text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft size={14} /> <span className="drop-shadow-xs">Beranda</span>
          </button>

          {/* LOGO & HEADER */}
          <div className="flex flex-col items-center text-center mb-5 pt-6">
            <div className="flex items-center gap-1.5 mb-2 cursor-pointer" onClick={() => onNavigate ? onNavigate("landing") : undefined}>
              <img src="/assets/logo.webp" alt="TaskFlow" className="w-8 h-8 object-contain drop-shadow-md" />
              <span className="text-2xl font-extrabold tracking-tight drop-shadow-md">
                <span className="text-slate-900">Task</span>
                <span className="text-purple-600">Flow</span>
              </span>
            </div>

            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 drop-shadow-md">
              {headerTitles[view]?.title}
            </h1>
            <p className="text-xs mt-1 drop-shadow-xs font-medium text-slate-600">
              {headerTitles[view]?.desc}
            </p>
          </div>

          {/* DYNAMIC FORM RENDER */}
          {view === "login" && (
            <LoginForm
              onSwitchView={setView}
              onLoginSuccess={onLoginSuccess}
            />
          )}
          {view === "register" && (
            <RegisterForm
              onSwitchView={setView}
              onLoginSuccess={onLoginSuccess}
            />
          )}
          {view === "forgot" && (
            <ForgotPasswordForm
              onSwitchView={setView}
            />
          )}
          {view === "reset" && (
            <ResetPasswordForm
              onSwitchView={setView}
            />
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-xs z-10 pt-2 pb-1 drop-shadow-sm text-slate-700 font-semibold">
        © {new Date().getFullYear()} TaskFlow. Semua hak dilindungi.
      </div>
    </div>
  );
}