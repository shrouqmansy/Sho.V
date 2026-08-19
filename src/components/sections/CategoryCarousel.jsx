import React, { useMemo } from 'react';
import { useShop } from '../../context/ShopContext';

export function CategoryCarousel() {
  const { openCollection, dbProducts } = useShop();

  const defaultCategoryImages = {
    Dresses: 'https://eg.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/11/6980031/1.jpg?2180',
    Hoodies: 'https://eg.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/27/2994431/1.jpg?9775',
    DENIM: 'https://eg.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/51/1338331/1.jpg?1811',
    Tops: 'https://eg.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/22/1609621/1.jpg?4327',
    Suits: 'https://eg.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/31/9182231/1.jpg?4777'
  };

  // Dynamically select a different authentic scraped product image for each category on page refresh
  const dynamicCategoryImages = useMemo(() => {
    const categories = ['Dresses', 'Hoodies', 'DENIM', 'Tops', 'Suits'];
    const result = {};

    categories.forEach(cat => {
      const matchingProds = (dbProducts || []).filter(
        p => p.category && p.category.toLowerCase() === cat.toLowerCase() && (p.image || (p.images && p.images[0]))
      );

      if (matchingProds.length > 0) {
        const randomIndex = Math.floor(Math.random() * matchingProds.length);
        const selectedProd = matchingProds[randomIndex];
        result[cat] = selectedProd.image || (selectedProd.images && selectedProd.images[0]);
      } else {
        result[cat] = defaultCategoryImages[cat];
      }
    });

    return result;
  }, [dbProducts]);

  const categoryList = [
    {
      name: 'Dresses',
      image: dynamicCategoryImages.Dresses,
    },
    {
      name: 'Hoodies',
      image: dynamicCategoryImages.Hoodies,
    },
    {
      name: 'DENIM',
      image: dynamicCategoryImages.DENIM,
    },
    {
      name: 'Tops',
      image: dynamicCategoryImages.Tops,
    },
    {
      name: 'Suits',
      image: dynamicCategoryImages.Suits,
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
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700 ease-out"
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
