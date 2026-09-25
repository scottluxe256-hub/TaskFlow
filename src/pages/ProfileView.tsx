// @ts-nocheck
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ScrollAnimate from "../components/ScrollAnimate";

import ProfileHeaderCard from "../components/profile/ProfileHeaderCard";
import PersonalInfoSection from "../components/profile/PersonalInfoSection";
import PreferencesSection from "../components/profile/PreferencesSection";
import SecurityDangerSection from "../components/profile/SecurityDangerSection";
import ActiveSessionsSection from "../components/profile/ActiveSessionsSection";

import { supabase } from "../utils/supabase";
import { uploadToCloudinary, getOptimizedImageUrl } from "../utils/cloudinary";
import { showSuccessAlert } from "../utils/sweetalert";
import { Loader2 } from "lucide-react";

export default function ProfileView({
  activeTab, setActiveTab, activeCategory, setActiveCategory,
  activeFilter, setActiveFilter, onLogout, isDarkMode, setIsDarkMode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const [userData, setUserData] = useState({
    name: "", username: "", email: "", bio: "", avatarUrl: "", badge: "Initiator",
    stats: { totalXP: "0 XP", profession: "Pelajar", joinedDate: "" }
  });

  // 1. TARIK DATA AWAL
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        const { count } = await supabase.from("tasks").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_completed", true);

        const xp = (count || 0) * 10;
        let badgeName = xp > 1000 ? "Mastermind" : xp > 200 ? "Executor" : "Initiator";

        const joinDate = new Date(profile?.created_at || user.created_at).toLocaleDateString("id-ID", { month: "short", year: "numeric" });
        const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
        const defaultInitialAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8b5cf6&color=fff&bold=true`;

        setUserData({
          name: displayName,
          username: profile?.username || "",
          email: user.email || "",
          bio: profile?.bio || "",
          avatarUrl: profile?.avatar_url || defaultInitialAvatar,
          badge: badgeName,
          stats: { totalXP: `${xp.toLocaleString()} XP`, profession: profile?.profession || "Pelajar", joinedDate: joinDate }
        });

      } catch (error) {
        console.error("Gagal memuat profil:", error);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchProfileData();
  }, []);

    // 2. AUTO-UPLOAD FOTO & HAPUS FOTO LAMA VIA CLOUDFLARE
  const handleAutoUploadImage = async (file) => {
    setIsUploadingAvatar(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Upload ke Cloudinary
      const rawUrl = await uploadToCloudinary(file);
      if (!rawUrl) throw new Error("Gagal upload gambar ke Cloudinary");
      const finalAvatarUrl = getOptimizedImageUrl(rawUrl, "f_avif");

      // === EKSEKUSI HAPUS FOTO LAMA ===
      const oldAvatarUrl = userData.avatarUrl;
      if (oldAvatarUrl && oldAvatarUrl.includes("cloudinary.com")) {
        try {
          // Trik Super Simpel: Potong URL berdasarkan garis miring, ambil yang paling ujung
          const urlParts = oldAvatarUrl.split('/');
          const lastSegment = urlParts[urlParts.length - 1]; // Contoh dapet: "gchd7lxyeuvdirosn6u8.avif"
          
          // Buang titik ekstensinya buat dapetin ID murni
          const public_id = lastSegment.split('.')[0]; // Hasil akhir: "gchd7lxyeuvdirosn6u8"

          // Eksekusi tembak backend lokal Cloudflare Pages
          fetch('/api/delete-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_id })
          })
          .then(res => res.json())
          .then(data => {
            if (data.result === 'ok') {
              console.log("Cloudinary: Foto lama musnah!");
            } else {
              alert(`Gagal Hapus Foto Lama!\n\nID Foto: ${public_id}\nAlasan: ${JSON.stringify(data)}`);
            }
          })
          .catch(err => console.error("Backend API tidak merespon:", err));
          
        } catch (err) {
          console.error("Gagal mengekstrak ID foto lama:", err);
        }
      }
      // ================================

      // Langsung simpan URL baru ke Supabase
      const { error } = await supabase.from("profiles").update({ avatar_url: finalAvatarUrl }).eq("id", user.id);
      if (error) throw error;

      // Update UI
      setUserData((prev) => ({ ...prev, avatarUrl: finalAvatarUrl }));
      showSuccessAlert("Foto Diperbarui!", "Foto profil Anda berhasil diubah.", isDarkMode);

    } catch (error) {
      console.error("Gagal upload foto:", error);
      alert("Terjadi kesalahan saat mengunggah foto profil.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // 3. AUTO-SAVE PROFESI
  const handleAutoSaveProfession = async (newProfession) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("profiles").update({ profession: newProfession }).eq("id", user.id);
      if (error) throw error;

      setUserData((prev) => ({ ...prev, stats: { ...prev.stats, profession: newProfession } }));
      
    } catch (error) {
      console.error("Gagal menyimpan profesi:", error);
    }
  };

  // 4. SIMPAN BIODATA MANUAL
  const handleSaveBioOnly = async (updatedFields) => {
    setIsSavingBio(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("profiles").update({
        full_name: updatedFields.name,
        username: updatedFields.username,
        bio: updatedFields.bio
      }).eq("id", user.id);

      if (error) throw error;

      setUserData((prev) => ({ 
        ...prev, 
        name: updatedFields.name,
        username: updatedFields.username,
        bio: updatedFields.bio
      }));
      
      showSuccessAlert("Tersimpan!", "Biodata berhasil diperbarui.", isDarkMode);
    } catch (error) {
      console.error("Gagal simpan biodata:", error);
      alert("Terjadi kesalahan saat menyimpan biodata.");
    } finally {
      setIsSavingBio(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-800"}`}>
        <Loader2 size={30} className="animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen w-full font-sans flex overflow-x-hidden bg-transparent ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={isDarkMode ? "/assets/bg_mobile_dark.avif" : "/assets/bg_mobile.avif"} alt="Background" className="w-full h-full object-cover block sm:hidden" />
        <img src={isDarkMode ? "/assets/bg_desktop_dark.avif" : "/assets/bg_desktop.avif"} alt="Background" className="w-full h-full object-cover hidden sm:block" />
      </div>

      <div className="relative z-10 flex w-full min-h-screen">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} onLogout={onLogout} activeCategory={activeCategory} setActiveCategory={setActiveCategory} activeFilter={activeFilter} setActiveFilter={setActiveFilter} isDarkMode={isDarkMode} />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
          
          {/* AVATAR URL DITAMBAHKAN DI SINI */}
          <Header 
            setIsMobileMenuOpen={setIsMobileMenuOpen} 
            userName={userData.name} 
            avatarUrl={userData.avatarUrl} 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
          />

          <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
            <ScrollAnimate animation="fade-up" delay={0}>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>Pengaturan Profil 👤</h1>
                <p className={`text-sm mt-1 font-medium ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Kelola informasi akun, preferensi notifikasi, dan keamanan TaskFlow Anda.</p>
              </div>
            </ScrollAnimate>

            <ScrollAnimate animation="fade-up" delay={100}>
              <ProfileHeaderCard 
                user={userData} 
                isDarkMode={isDarkMode} 
                onImageSelect={handleAutoUploadImage}
                onProfessionChange={handleAutoSaveProfession}
                isUploadingAvatar={isUploadingAvatar}
              />
            </ScrollAnimate>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="flex flex-col gap-6">
                <ScrollAnimate animation="fade-up" delay={150}>
                  <PersonalInfoSection user={userData} onSave={handleSaveBioOnly} isDarkMode={isDarkMode} isSaving={isSavingBio} />
                </ScrollAnimate>

                <ScrollAnimate animation="fade-up" delay={200} className="flex-1">
                  <div className="h-full"><ActiveSessionsSection isDarkMode={isDarkMode} /></div>
                </ScrollAnimate>
              </div>

              <div className="flex flex-col gap-6">
                <ScrollAnimate animation="fade-up" delay={150} className="flex-1">
                  <PreferencesSection isDarkMode={isDarkMode} />
                </ScrollAnimate>

                <ScrollAnimate animation="fade-up" delay={200}>
                  <div className="h-full"><SecurityDangerSection onLogout={onLogout} isDarkMode={isDarkMode} /></div>
                </ScrollAnimate>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
