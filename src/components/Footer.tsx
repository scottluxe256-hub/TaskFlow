// @ts-nocheck
import React from 'react';
import { ShieldCheck, Smartphone, CheckCircle2, Zap, Mail } from "lucide-react";
import { FaGithub, FaInstagram, FaTelegram, FaTiktok } from 'react-icons/fa6';

export default function Footer({ handleDownloadApp }) {
  return (
    <footer className="relative border-t border-slate-800 z-10 text-white overflow-hidden">
      
      {/* Background Image bg_footer.avif (Hitam / Dark) */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/bg_footer.avif" 
          alt="Footer Background" 
          className="w-full h-full object-cover opacity-100"
        />
        {/* Dark Overlay tipis biar kontras sempurna */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10">
        {/* TRUST INDICATORS BAR */}
        <div className="border-b border-white/10 py-5 px-4 bg-black/30 backdrop-blur-xs">
          <div className="flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-xs font-semibold text-white max-w-3xl w-full">
              <div className="flex items-center gap-2 justify-start">
                <ShieldCheck className="text-purple-400 shrink-0" size={16} />
                <span className="text-[11px] sm:text-xs">Google OAuth 2.0</span>
              </div>
              <div className="flex items-center gap-2 justify-start">
                <Smartphone className="text-purple-400 shrink-0" size={16} />
                <span className="text-[11px] sm:text-xs">Android Kotlin</span>
              </div>
              <div className="flex items-center gap-2 justify-start">
                <CheckCircle2 className="text-purple-400 shrink-0" size={16} />
                <span className="text-[11px] sm:text-xs">Bebas Iklan</span>
              </div>
              <div className="flex items-center gap-2 justify-start">
                <Zap className="text-purple-400 shrink-0" size={16} />
                <span className="text-[11px] sm:text-xs">Sinkron Instan</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN FOOTER CONTENT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <div className="flex justify-center mb-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 max-w-4xl w-full text-left">
              
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Fitur</h3>
                <ul className="space-y-2 text-xs text-slate-200">
                  <li><a href="#fitur" className="hover:text-purple-400 transition-colors">Fokus Hari Ini</a></li>
                  <li><a href="#fitur" className="hover:text-purple-400 transition-colors">Kanban Board</a></li>
                  <li><a href="#fitur" className="hover:text-purple-400 transition-colors">Kalender Warna</a></li>
                  <li><a href="#fitur" className="hover:text-purple-400 transition-colors">Tren Mingguan</a></li>
                  <li><a href="#fitur" className="hover:text-purple-400 transition-colors">Kategori Tugas</a></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Solusi</h3>
                <ul className="space-y-2 text-xs text-slate-200">
                  <li><a href="#pengguna" className="hover:text-purple-400 transition-colors">Mahasiswa</a></li>
                  <li><a href="#pengguna" className="hover:text-purple-400 transition-colors">Content Creator</a></li>
                  <li><a href="#pengguna" className="hover:text-purple-400 transition-colors">Freelancer</a></li>
                  <li><a href="#solusi" className="hover:text-purple-400 transition-colors">Manajemen Waktu</a></li>
                  <li><a href="#solusi" className="hover:text-purple-400 transition-colors">Beban Tugas</a></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Bantuan</h3>
                <ul className="space-y-2 text-xs text-slate-200">
                  <li><a href="#faq" className="hover:text-purple-400 transition-colors">FAQ</a></li>
                  <li><a href="#cara-kerja" className="hover:text-purple-400 transition-colors">Panduan</a></li>
                  <li>
                    <span className="hover:text-purple-400 transition-colors inline-flex items-center gap-1 cursor-pointer" onClick={handleDownloadApp}>
                      App Android <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.5 rounded font-mono font-medium">v2.4</span>
                    </span>
                  </li>
                  <li><a href="#solusi" className="hover:text-purple-400 transition-colors">Google OAuth</a></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Pembaruan Versi</h3>
                <ul className="space-y-2 text-xs text-slate-200">
                  <li><a href="#changelog" className="hover:text-purple-400 transition-colors">Catatan Rilis (v2.4)</a></li>
                  <li><a href="#roadmap" className="hover:text-purple-400 transition-colors">Rencana Fitur</a></li>
                  <li><a href="#status" className="hover:text-purple-400 transition-colors">Status Layanan</a></li>
                  <li><a href="#komunitas" className="hover:text-purple-400 transition-colors">Komunitas Pengguna</a></li>
                </ul>
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-300">
            <p>© {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
            <p className="text-white font-medium">Dibuat oleh kelompok 4.</p>
            
            {/* Ikon-Ikon Sosmed Putih */}
            <div className="flex items-center space-x-4 text-white">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors"><FaGithub size={16} /></a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors"><FaTelegram size={16} /></a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors"><FaTiktok size={15} /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors"><FaInstagram size={16} /></a>
              <a href="mailto:support@taskflow.app" className="hover:text-purple-400 transition-colors"><Mail size={16} /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
