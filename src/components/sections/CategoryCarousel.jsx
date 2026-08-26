import React, { useMemo } from 'react';
import { useShop } from '../../context/ShopContext';

export function CategoryCarousel() {
  const { openCollection, dbProducts } = useShop();

  const FULL_BLEED_CATEGORY_IMAGES = {
    Dresses: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop',
    Hoodies: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop',
    DENIM: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop',
    Tops: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop',
    Suits: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop'
  };

  const categoryList = [
    {
      name: 'Dresses',
      image: FULL_BLEED_CATEGORY_IMAGES.Dresses,
    },
    {
      name: 'Hoodies',
      image: FULL_BLEED_CATEGORY_IMAGES.Hoodies,
    },
    {
      name: 'DENIM',
      image: FULL_BLEED_CATEGORY_IMAGES.DENIM,
    },
    {
      name: 'Tops',
      image: FULL_BLEED_CATEGORY_IMAGES.Tops,
    },
    {
      name: 'Suits',
      image: FULL_BLEED_CATEGORY_IMAGES.Suits,
    },
  ];

  // Tripled list for 100% seamless infinite loop translation
  const infiniteCategories = [...categoryList, ...categoryList, ...categoryList];

  return (
    <section className="py-12 md:py-16 bg-[#fcfaf7] border-b border-[#e2ded9] px-4 md:px-12 overflow-hidden">
      <div className="max-w-[1400px] mx-auto text-center">
        {/* Section Header */}
        <div className="mb-8">
          <span className="text-xs uppercase tracking-[0.25em] text-[#bc9c85] font-semibold block mb-1">
            Women's Collections
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#151616] tracking-wider uppercase font-light">
            Featured Categories
          </h2>
        </div>

        {/* Seamless Infinite Horizontal Loop Track */}
        <div className="w-full relative overflow-hidden py-2">
          <div className="animate-marquee space-x-6 px-2 flex">
            {infiniteCategories.map((cat, idx) => (
              <div
                key={`${cat.name}-${idx}`}
                onClick={() => openCollection(cat.name)}
                className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] aspect-[4/5] bg-white relative overflow-hidden cursor-pointer group shadow-sm border border-[#e2ded9]"
              >
                {/* Category Cover Image (Dynamic Scraped Product Image on Each Refresh) */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                {/* Category Title Overlay */}
                <div className="absolute bottom-8 left-0 right-0 text-center px-4">
                  <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white tracking-[0.16em] uppercase font-light drop-shadow-md">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-white/90 mt-2 inline-block font-medium border-b border-white/40 pb-0.5 group-hover:border-white transition-colors">
                    Explore Collection →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
