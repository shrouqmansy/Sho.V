import React from 'react';
import { useShop } from '../../context/ShopContext';

export function HeroSection() {
  const { navigateTo } = useShop();

  const handleShopClick = () => {
    navigateTo('shop');
  };

  return (
    <section
      onClick={handleShopClick}
      className="relative w-full h-screen min-h-screen flex items-center justify-center overflow-hidden cursor-pointer group bg-[#151616]"
    >
      {/* Background Video (Zoomed Out & Framed Balance) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-[center_15%] transition-transform duration-1000 ease-out scale-100"
      >
        <source src="/zara-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Subtle Transparent Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60 pointer-events-none" />

      {/* Floating Centered Campaign Typography */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto flex flex-col items-center justify-center text-white space-y-5 md:space-y-6 pt-16">
        {/* Subtitle Label */}
        <span className="text-[11px] md:text-xs uppercase tracking-[0.3em] text-[#f4f1ea] font-medium drop-shadow-md">
          Beyond the Ordinary.
        </span>

        {/* Main Serif Headline */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-[1.1] tracking-wide text-white drop-shadow-lg">
          Your Inner<br />Beauty
        </h1>

        {/* Subtitle Description */}
        <p className="text-xs sm:text-sm md:text-base text-[#e8e2d6] font-light max-w-md mx-auto leading-relaxed tracking-wider drop-shadow">
          For those who find beauty beyond the expected.
        </p>

        {/* SHOP NOW CTA Button (Routes to dedicated Shop/Categories page) */}
        <div className="pt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShopClick();
            }}
            className="bg-white text-[#151616] hover:bg-[#bc9c85] hover:text-white uppercase text-xs tracking-[0.25em] py-4 px-11 font-semibold transition-all duration-300 shadow-xl border border-white/30"
          >
            SHOP NOW
          </button>
        </div>

        {/* Minimalist Scroll Arrow */}
        <div className="pt-6 opacity-80 transition-opacity group-hover:opacity-100">
          <svg className="w-5 h-5 mx-auto text-white animate-bounce" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
