import React from 'react';

export function AboutPage() {
  return (
    <main className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-12 md:py-24 flex-grow">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <span className="text-xs uppercase tracking-widest text-[#bc9c85] font-semibold mb-3 block">
          Our Philosophy
        </span>
        <h1 className="font-serif text-4xl md:text-6xl text-[#151616] mb-6 leading-tight">
          Quiet Luxury.<br />Intentional Living.
        </h1>
        <p className="text-base text-gray-600 leading-relaxed font-sans">
          Sho.V was founded on the belief that true luxury does not shout. It speaks softly through immaculate tailoring, ethical textiles, and silhouettes that transcend fast-moving trends.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f3f0ec]">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuChlY182zeNwU5IT0_LURpxoJhAP1xPdhGlQKGShKda7ZnBXjFG5w2TmXEoJrRQA4vaMOAZppNFq72WLznAKA8NpEQv9FcHL6EfoDdmkOguQSpBPESNLwHqo6tIy5EXp53FB2zU-FOqvk8zrLv-mVgKQkY-OyW5-PqO117AQplynTdecpJshcusB5StSPBZY4p8vVk03qI-h4bCWuD_J01g0a96VBdwEkXW1Mc6JpKboppXlX0zEUTMng"
            alt="Craftsmanship"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-6 md:pl-8">
          <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Craftsmanship</span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#151616]">Crafted with Patience</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Every garment in our atelier undergo meticulous design iterations. From the drape of our silk dresses to the structured shoulders of our linen blazers, we collaborate directly with master artisans.
          </p>
          <div className="pt-4 border-t border-[#e2ded9] grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-serif text-2xl text-[#151616]">100%</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Natural Fibers</p>
            </div>
            <div>
              <h3 className="font-serif text-2xl text-[#151616]">Zero</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Synthetic Waste</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
