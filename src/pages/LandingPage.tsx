// @ts-nocheck
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  HeroSection,
  HeroStatsSection,
  ProblemSection,
  BentoFeaturesSection,
  StepsSection,
  WhyUsSection,
  TestimonialsSection,
  FaqSection,
  CtaSection
} from "../components/Sections";

export default function LandingPage({ onStart, handleDownloadApp }) {
  return (
    <div className="relative min-h-screen text-slate-800 antialiased selection:bg-purple-600 selection:text-white">

      {/* Background Utama Responsive */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/assets/bg_web_mobile.avif"
          alt="Global BG Mobile"
          className="w-full h-full object-cover block sm:hidden"
        />
        <img
          src="/assets/bg_web.avif"
          alt="Global BG Desktop"
          className="w-full h-full object-cover hidden sm:block"
        />
      </div>

      <div className="relative z-10 overflow-hidden">
        <Navbar onStart={onStart} />

        <main>
          <HeroSection onStart={onStart} handleDownloadApp={handleDownloadApp} />
          <HeroStatsSection />

          <div className="flex flex-col gap-16 sm:gap-24 py-16">
            <ProblemSection />
            <BentoFeaturesSection />
            <StepsSection />
            <WhyUsSection />
          </div>

          <div>
            <TestimonialsSection />
            <FaqSection />
            <CtaSection onStart={onStart} />
          </div>
        </main>

        <Footer handleDownloadApp={handleDownloadApp} />
      </div>
    </div>
  );
}