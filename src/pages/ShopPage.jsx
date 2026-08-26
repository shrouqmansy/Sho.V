import React, { useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductSkeleton } from '../components/ui/ProductSkeleton';

export function ShopPage() {
  const { categoryFilter, setCategoryFilter, dbProducts, isDbLoading } = useShop();

  const FULL_BLEED_CATEGORY_IMAGES = {
    Dresses: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop',
    Hoodies: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop',
    DENIM: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop',
    Tops: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop',
    Suits: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop'
  };

  const mainFeatureCategory = {
    name: 'Dresses',
    image: FULL_BLEED_CATEGORY_IMAGES.Dresses,
    fontStyle: 'font-serif italic font-normal'
  };

  const gridCategories = [
    {
      name: 'Hoodies',
      image: FULL_BLEED_CATEGORY_IMAGES.Hoodies,
      fontStyle: 'font-serif italic font-normal'
    },
    {
      name: 'DENIM',
      image: FULL_BLEED_CATEGORY_IMAGES.DENIM,
      fontStyle: 'font-serif tracking-widest font-bold uppercase'
    },
    {
      name: 'Tops',
      image: FULL_BLEED_CATEGORY_IMAGES.Tops,
      fontStyle: 'font-serif italic font-normal'
    },
    {
      name: 'Suits',
      image: FULL_BLEED_CATEGORY_IMAGES.Suits,
      fontStyle: 'font-serif tracking-widest font-bold uppercase'
    }
  ];

  const activeCategoriesList = ['Dresses', 'Hoodies', 'DENIM', 'Tops', 'Suits'];
  const isSpecificCategorySelected = categoryFilter !== 'All';

  const categoryProducts = isSpecificCategorySelected
    ? dbProducts.filter(p => p.category && p.category.toLowerCase() === categoryFilter.toLowerCase())
    : dbProducts;

  const [visibleCount, setVisibleCount] = React.useState(12);

  React.useEffect(() => {
    setVisibleCount(12);
  }, [categoryFilter]);

  const displayedProducts = categoryProducts.slice(0, visibleCount);

  return (
    <main className="w-full max-w-[1400px] mx-auto px-3 sm:px-8 py-4 sm:py-10 flex-grow space-y-10">
      {/* 1. VISUAL CATEGORY CARDS GRID (Restored at Top when viewing All) */}
      {!isSpecificCategorySelected && (
        <div className="space-y-3 sm:space-y-6 mb-12">
          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#bc9c85] font-semibold block mb-1">
              Women's Curated Collections
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#151616] tracking-wider uppercase font-light">
              Explore Featured Categories
            </h2>
          </div>

          {/* Feature Category Banner (Dresses) */}
          <div
            onClick={() => setCategoryFilter(mainFeatureCategory.name)}
            className="w-full aspect-[16/10] sm:aspect-[21/9] bg-white relative overflow-hidden cursor-pointer group shadow-sm border border-[#e2ded9]"
          >
            <img
              src={mainFeatureCategory.image}
              alt={mainFeatureCategory.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center text-center p-2 sm:p-4">
              <h2 className={`text-3xl sm:text-5xl md:text-6xl text-white drop-shadow-lg tracking-wide ${mainFeatureCategory.fontStyle}`}>
                {mainFeatureCategory.name}
              </h2>
            </div>
          </div>

          {/* Twin-by-Twin Category Cards Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {gridCategories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => setCategoryFilter(cat.name)}
                className="w-full aspect-[1/1] bg-white relative overflow-hidden cursor-pointer group shadow-sm border border-[#e2ded9]"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center text-center p-1.5 sm:p-4">
                  <h3 className={`text-xl sm:text-4xl md:text-5xl text-white drop-shadow-md tracking-wide ${cat.fontStyle}`}>
                    {cat.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. CATEGORY PILLS FILTER BAR */}
      <div className="flex flex-wrap gap-2 justify-center pb-4 border-b border-[#e2ded9]">
        <button
          onClick={() => setCategoryFilter('All')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full border transition-colors ${
            categoryFilter === 'All'
              ? 'bg-[#151616] text-white border-[#151616]'
              : 'bg-white text-[#151616] border-[#e2ded9] hover:border-[#151616]'
          }`}
        >
          All Women's Products ({dbProducts.length})
        </button>
        {activeCategoriesList.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full border transition-colors ${
              categoryFilter === cat
                ? 'bg-[#151616] text-white border-[#151616]'
                : 'bg-white text-[#151616] border-[#e2ded9] hover:border-[#151616]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. PRODUCT CATALOG GRID */}
      <div>
        <div className="pb-6 mb-8 border-b border-[#e2ded9] text-center">
          <span className="text-xs uppercase tracking-widest text-[#bc9c85] font-semibold block mb-1">
            Women's Live Collection
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-[#151616] uppercase tracking-wider font-light">
            {categoryFilter === 'All' ? "All Women's Products" : categoryFilter} ({categoryProducts.length} Items)
          </h1>
        </div>

        {isDbLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-8 sm:gap-y-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : categoryProducts.length === 0 ? (
          <div className="py-20 text-center text-gray-500 text-sm">
            No products currently available in {categoryFilter}.
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-8 sm:gap-y-12">
              {displayedProducts.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>

            {/* Progressive Loading: Load More (+12) Button */}
            {visibleCount < categoryProducts.length && (
              <div className="text-center pt-8 border-t border-[#e2ded9]">
                <button
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="px-8 py-3.5 bg-[#151616] hover:bg-[#bc9c85] text-white text-xs font-semibold uppercase tracking-widest transition-colors duration-300 shadow-sm"
                >
                  Load More Products (+12) — {categoryProducts.length - visibleCount} Remaining
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
