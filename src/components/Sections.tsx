// @ts-nocheck
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Download, CheckCircle2, Star, ChevronDown } from "lucide-react";
import {
  heroStatsData, problemData, bentoFeatures,
  stepsData, whyUsData, testimonialsData, faqsData
} from '../data/landingData';

// --- HERO SECTION ---
export function HeroSection({ onStart, handleDownloadApp }) {
  return (
    <section className="relative pt-24 sm:pt-36 pb-12 px-4 w-full min-h-[40vh] sm:min-h-[60vh] flex flex-col justify-center items-center text-center overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <picture className="w-full h-full [mask-image:linear-gradient(to_bottom,black_70%,transparent_95%)] [-webkit-mask-image:linear-gradient(to_bottom,black_70%,transparent_95%)]">
          <source media="(min-width: 768px)" srcSet="/assets/bg_hero.avif" />
          <img
            src="/assets/bg_hero_mobile.avif"
            alt="Hero BG Mobile"
            className="w-full h-full object-cover object-top"
          />
        </picture>
      </div>

      <div className="relative z-20 max-w-4xl mx-auto px-2">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 mb-4 sm:mb-6"
        >
          Satu Tempat Untuk <br />
          <span className="text-purple-600">Tanggung Jawab Harian.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xs sm:text-base text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          TaskFlow menyatukan daftar tugas harian, jadwal kalender berkode warna, dan analisis tren mingguan dalam antarmuka yang tenang dan bebas beban pikiran.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4"
        >
          <button onClick={onStart} className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
            Mulai Pakai TaskFlow <ArrowRight size={16} />
          </button>
          <button onClick={handleDownloadApp} className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-white/90 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer">
            <Download size={16} className="text-purple-600" /> Download App
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// --- 3 CARD HERO ---
export function HeroStatsSection() {
  return (
    <section className="px-4 max-w-5xl mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
        {heroStatsData.map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="p-4 rounded-xl border border-purple-100/80 bg-white/70 backdrop-blur-md shadow-sm"
          >
            <div className="text-purple-600 font-bold text-xs sm:text-sm mb-1 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> {stat.title}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">{stat.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// --- SECTION 1 ---
export function ProblemSection() {
  return (
    <section id="solusi" className="px-4 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} className="order-2 md:order-1 text-left flex flex-col justify-center">
          <span className="text-purple-600 text-xs font-bold tracking-widest uppercase mb-2 block">{problemData.badge}</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3 leading-snug">{problemData.title}</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{problemData.desc}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} className="order-1 md:order-2 flex justify-center w-full">
          <img src="/assets/image_1.avif" alt="Workspace 1" className="w-full h-[280px] md:h-[380px] object-cover object-bottom rounded-2xl shadow-md border border-slate-200" />
        </motion.div>
      </div>
    </section>
  );
}

// --- SECTION 2 ---
export function BentoFeaturesSection() {
  return (
    <section id="fitur" className="px-4 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} className="order-1 md:order-1 flex justify-center w-full">
          <img src="/assets/image_2.avif" alt="Workspace 2" className="w-full h-[320px] md:h-[420px] object-cover object-bottom rounded-2xl shadow-md border border-slate-200" />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} className="order-2 md:order-2 text-left flex flex-col justify-center">
          <div>
            <span className="text-purple-600 text-xs font-bold tracking-widest uppercase mb-1.5 block">KEMAMPUAN PRODUK</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2.5 leading-snug">{bentoFeatures[0].title}</h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">{bentoFeatures[0].desc}</p>
          </div>
          <div className="space-y-2.5">
            {bentoFeatures.slice(1, 4).map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-purple-100/80 bg-white/70 backdrop-blur-md shadow-sm">
                <h4 className="font-bold text-xs text-slate-900 mb-0.5">{item.title}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// --- STEPS SECTION ---
export function StepsSection() {
  return (
    <section id="cara-kerja" className="px-4 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="text-center mb-8">
        <span className="text-purple-600 text-xs font-bold tracking-widest uppercase block mb-2">ALUR KERJA MUDAH</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">3 Langkah Menata Hari Anda</h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stepsData.map((step, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="p-5 rounded-2xl border border-purple-100/80 bg-white/70 backdrop-blur-md shadow-sm text-left flex flex-col justify-between"
          >
            <div>
              <span className="text-2xl font-black text-purple-600 mb-2 block">{step.num}</span>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-4 block">{step.badge}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// --- SECTION 3 ---
export function WhyUsSection() {
  return (
    <section className="px-4 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} className="order-2 md:order-1 text-left flex flex-col justify-center">
          <div>
            <span className="text-purple-600 text-xs font-bold tracking-widest uppercase mb-1.5 block">KEUNGGULAN UTAMA</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-4 leading-snug">Mengapa Memilih TaskFlow?</h2>
          </div>
          <div className="space-y-3">
            {whyUsData.map((item, idx) => (
              <div key={idx} className="flex gap-3 bg-white/70 backdrop-blur-md p-3 rounded-xl border border-purple-100/80 shadow-sm">
                <CheckCircle2 className="text-purple-600 shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-0.5">{item.title}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} className="order-1 md:order-2 flex justify-center w-full">
          <img src="/assets/image_3.avif" alt="Workspace 3" className="w-full h-[320px] md:h-[420px] object-cover object-bottom rounded-2xl shadow-md border border-slate-200" />
        </motion.div>
      </div>
    </section>
  );
}

// --- TESTIMONIALS SECTION ---
export function TestimonialsSection() {
  return (
    <section id="pengguna" className="py-14 px-4 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="text-center mb-10">
        <span className="text-purple-600 text-xs font-bold tracking-widest uppercase block mb-2">PENGALAMAN PENGGUNA</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Cerita Mereka yang Terbantu</h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonialsData.map((item, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="p-5 rounded-2xl border border-purple-100/80 bg-white/70 backdrop-blur-md shadow-sm flex flex-col justify-between text-left"
          >
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-amber-400 text-amber-400" />)}
                <span className="text-[11px] font-bold text-slate-500 ml-1">{item.rating}</span>
              </div>
              <p className="text-xs italic text-slate-600 leading-relaxed mb-4">"{item.comment}"</p>
            </div>
            <div className="flex items-center space-x-3 pt-3 border-t border-purple-100/80">
              <img src={item.avatar} alt={item.name} className="w-8 h-8 rounded-full object-cover border border-purple-200 bg-purple-50" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                <p className="text-[10px] text-slate-500">{item.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// --- FAQ SECTION ---
export function FaqSection() {
  const [openFaq, setOpenFaq] = useState(0);
  return (
    <section id="faq" className="py-12 px-4 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="text-center mb-8">
        <span className="text-purple-600 text-xs font-bold tracking-widest uppercase block mb-2">BANTUAN & INFORMASI</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Pertanyaan yang Sering Diajukan</h2>
      </motion.div>
      <div className="space-y-2.5">
        {faqsData.map((faq, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: idx * 0.05 }}
            key={idx}
            className="rounded-xl border border-purple-100/80 bg-white/70 backdrop-blur-md overflow-hidden text-left shadow-sm"
          >
            <button onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)} className="w-full p-3.5 text-left font-semibold text-xs sm:text-sm flex justify-between items-center text-slate-900 cursor-pointer hover:text-purple-600 transition-colors">
              <span>{faq.q}</span>
              <ChevronDown size={16} className={`transform transition-transform ${openFaq === idx ? 'rotate-180 text-purple-600' : 'text-slate-400'}`} />
            </button>
            {openFaq === idx && (
              <div className="px-3.5 pb-3.5 text-xs text-slate-600 leading-relaxed border-t border-purple-100/80 pt-2.5">
                {faq.a}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// --- CTA SECTION ---
export function CtaSection({ onStart }) {
  return (
    <section className="py-12 px-4 max-w-4xl mx-auto text-center mb-8">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false, amount: 0.2 }} className="p-8 sm:p-10 rounded-3xl border border-purple-100/80 bg-white/80 backdrop-blur-md shadow-md relative overflow-hidden">
        <h2 className="text-xl sm:text-3xl font-extrabold mb-3 text-slate-900">
          Mulai hari Anda dengan pikiran yang lebih tertata
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-6 max-w-xl mx-auto leading-relaxed">
          Bebaskan ingatan Anda dari kekhawatiran tugas yang terlewat. Masuk sekarang dan atur ritme produktivitas Anda tanpa biaya.
        </p>
        <button onClick={onStart} className="px-7 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all inline-flex items-center gap-2 cursor-pointer">
          Buka TaskFlow Sekarang <ArrowRight size={16} />
        </button>
      </motion.div>
    </section>
  );
}
