import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
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

  // 2. Simpan preferensi pengguna ke localStorage
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // 3. Pasang kelas 'dark' pada HTML HANYA jika pengguna berada di area Dashboard
  useEffect(() => {
    if (session && page === "dashboard" && isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode, session, page]);

  // 4. Deteksi & Listener Auth Supabase
  useEffect(() => {
    // Cek apakah URL membawa token recovery / reset password
    const hash = window.location.hash;
    const search = window.location.search;
    const hasRecoveryToken =
      hash.includes("type=recovery") ||
      search.includes("type=recovery") ||
      hash.includes("access_token");

    if (hasRecoveryToken) {
      setIsRecoveryMode(true);
      setPage("reset");
    }

    // Listener Perubahan Status Auth Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);

      // Tangkap event spesifik reset password dari Supabase
      if (event === "PASSWORD_RECOVERY" || hasRecoveryToken) {
        setIsRecoveryMode(true);
        setPage("reset");
      } else if (currentSession) {
        // Jika ada session dan BUKAN dalam mode recovery, masuk ke dashboard
        setPage((prevPage) => (prevPage === "reset" ? "reset" : "dashboard"));
      } else {
        // Jika tidak ada session dan BUKAN dalam mode recovery, masuk ke landing
        setPage((prevPage) => (prevPage === "reset" ? "reset" : "landing"));
      }
      setLoading(false);
    });

    // Cek session awal saat app pertama kali dibuka
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (hasRecoveryToken) {
        setIsRecoveryMode(true);
        setPage("reset");
      } else if (session) {
        setPage("dashboard");
      } else {
        setPage("landing");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStartAuth = () => setPage("login");

  const handleLogout = async () => {
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
      className={`min-h-screen transition-colors duration-300 ${isDashboardArea
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