// @ts-nocheck
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <img src="/assets/logo.webp" alt="TaskFlow Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
          <span className="font-extrabold text-xl tracking-tight text-slate-900 drop-shadow-sm">
            Task<span className="text-purple-600">Flow</span>
          </span>
        </div>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-900 ml-auto">
          <a href="#solusi" className="hover:text-purple-600 transition-colors drop-shadow-sm">Solusi</a>
          <a href="#fitur" className="hover:text-purple-600 transition-colors drop-shadow-sm">Fitur</a>
          <a href="#cara-kerja" className="hover:text-purple-600 transition-colors drop-shadow-sm">Cara Kerja</a>
          <a href="#pengguna" className="hover:text-purple-600 transition-colors drop-shadow-sm">Testimoni</a>
          <a href="#faq" className="hover:text-purple-600 transition-colors drop-shadow-sm">FAQ</a>
        </nav>

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-900 font-bold">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 mt-2 shadow-xl">
          <a href="#solusi" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-900">Solusi</a>
          <a href="#fitur" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-900">Fitur</a>
          <a href="#cara-kerja" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-900">Cara Kerja</a>
          <a href="#pengguna" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-900">Testimoni</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-900">FAQ</a>
        </div>
      )}
    </header>
  );
}
