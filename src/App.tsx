import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import OneSignal from "react-onesignal"; // 👈 Import OneSignal
import LandingPage from "./pages/LandingPage";
import AuthPages from "./pages/AuthPages";
import DashboardView from "./pages/DashboardView";
import TasksView from "./pages/TasksView";
import CalendarView from "./pages/CalendarView";
import ProfileView from "./pages/ProfileView";

export type PageType = "landing" | "login" | "register" | "forgot" | "reset" | "dashboard";
export type ActiveTabType = "dashboard" | "tasks" | "calendar" | "profile";

export interface NavigationProps {
  session: Session | null;
  activeTab: ActiveTabType;
  setActiveTab: React.Dispatch<React.SetStateAction<ActiveTabType>>;
  activeCategory: string;
  setActiveCategory: React.Dispatch<React.SetStateAction<string>>;
  activeFilter: string;
  setActiveFilter: React.Dispatch<React.SetStateAction<string>>;
  onLogout: () => Promise<void>;
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<PageType>("landing");

  // State Navigasi Utama Aplikasi
  const [activeTab, setActiveTab] = useState<ActiveTabType>("dashboard");
  const [activeCategory, setActiveCategory] = useState<string>("semua");
  const [activeFilter, setActiveFilter] = useState<string>("semua");

  // State Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // ✅ State Pengunci Khusus Mode Recovery Password
  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(false);

  // 1. Cek preferensi tema dari localStorage saat awal dimuat
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
    }
  }, []);

  // 2. Inisialisasi OneSignal saat pertama kali web dibuka
  useEffect(() => {
    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: "f5b62e2b-9ecd-4d42-8cfb-6cc19e269cad", // 👈 Masukkan OneSignal App ID kamu di sini
          allowLocalhostAsSecureOrigin: true, // Supaya bisa dites via localhost/Termux
        });

        // Tampilkan pop-up / slide permintaan izin notifikasi ke browser
        await OneSignal.Slidedown.promptPush();
      } catch (err) {
        console.error("Gagal inisialisasi OneSignal:", err);
      }
    };

    initOneSignal();
  }, []);

  // 3. Simpan preferensi pengguna ke localStorage
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // 4. Pasang kelas 'dark' pada HTML HANYA jika pengguna berada di area Dashboard
  useEffect(() => {
    if (session && page === "dashboard" && isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode, session, page]);

  // 5. Deteksi & Listener Auth Supabase (termasuk sync User ID ke OneSignal)
  useEffect(() => {
    // Listener Perubahan Status Auth Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);

      // Sinkronisasi status user ke OneSignal
      if (currentSession?.user) {
        try {
          await OneSignal.login(currentSession.user.id);
          console.log("OneSignal terhubung dengan User ID:", currentSession.user.id);
        } catch (err) {
          console.error("Gagal login OneSignal:", err);
        }
      } else if (event === "SIGNED_OUT") {
        try {
          await OneSignal.logout();
        } catch (err) {
          console.error("Gagal logout OneSignal:", err);
        }
      }

      // Tangkap event spesifik reset password dari Supabase
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true);
        setPage("reset");
      } else if (currentSession) {
        // Jika berhasil login (termasuk via Google OAuth), masuk ke dashboard
        setPage((prevPage) => (prevPage === "reset" ? "reset" : "dashboard"));
      } else {
        // Jika logout atau tidak ada sesi
        setPage((prevPage) => (prevPage === "reset" ? "reset" : "landing"));
      }
      setLoading(false);
    });

    // Cek session awal saat app pertama kali dibuka
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        try {
          await OneSignal.login(session.user.id);
        } catch (err) {
          console.error("Gagal login OneSignal:", err);
        }
        setPage((prevPage) => (prevPage === "reset" ? "reset" : "dashboard"));
      } else {
        setPage((prevPage) => (prevPage === "reset" ? "reset" : "landing"));
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStartAuth = () => setPage("login");

  const handleLogout = async () => {
    try {
      await OneSignal.logout();
    } catch (err) {
      console.error("Gagal logout OneSignal:", err);
    }
    await supabase.auth.signOut();
    setSession(null);
    setIsRecoveryMode(false);
    setPage("landing");
    setActiveTab("dashboard");
  };

  const navigationProps: NavigationProps = {
    session,
    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    activeFilter,
    setActiveFilter,
    onLogout: handleLogout,
    isDarkMode,
    setIsDarkMode,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-medium bg-white text-slate-800">
        Memuat TaskFlow...
      </div>
    );
  }

  const isDashboardArea = Boolean(session) && page === "dashboard";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDashboardArea
          ? isDarkMode
            ? "bg-slate-950 text-slate-200"
            : "bg-slate-50 text-slate-800"
          : "bg-transparent text-slate-800"
      }`}
    >
      {!session && page === "landing" && (
        <LandingPage
          onStart={handleStartAuth}
          handleDownloadApp={() => { }}
        />
      )}

      {(["login", "register", "forgot", "reset"] as PageType[]).includes(page) && (
        <AuthPages
          initialView={page as "login" | "register" | "forgot" | "reset"}
          onNavigate={(targetPage: PageType) => {
            if (targetPage !== "reset") setIsRecoveryMode(false);
            setPage(targetPage as PageType);
          }}
          onLoginSuccess={() => {
            setIsRecoveryMode(false);
            setPage("dashboard");
          }}
        />
      )}

      {session && page === "dashboard" && (
        <>
          {activeTab === "dashboard" && <DashboardView {...navigationProps} />}
          {activeTab === "tasks" && <TasksView {...navigationProps} />}
          {activeTab === "calendar" && <CalendarView {...navigationProps} />}
          {activeTab === "profile" && <ProfileView {...navigationProps} />}
        </>
      )}
    </div>
  );
}
