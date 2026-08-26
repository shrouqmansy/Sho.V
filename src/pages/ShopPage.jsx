import React, { useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductSkeleton } from '../components/ui/ProductSkeleton';

export function ShopPage() {
  const { categoryFilter, setCategoryFilter, dbProducts, isDbLoading } = useShop();

  const defaultCategoryImages = {
    Dresses: 'https://eg.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/11/6980031/1.jpg?2180',
    Hoodies: 'https://eg.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/27/2994431/1.jpg?9775',
    DENIM: 'https://eg.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/51/1338331/1.jpg?1811',
    Tops: 'https://eg.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/22/1609621/1.jpg?4327',
    Suits: 'https://eg.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/31/9182231/1.jpg?4777'
  };

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

  const mainFeatureCategory = {
    name: 'Dresses',
    image: dynamicCategoryImages.Dresses,
    fontStyle: 'font-serif italic font-normal'
  };

  const gridCategories = [
    {
      name: 'Hoodies',
      image: dynamicCategoryImages.Hoodies,
      fontStyle: 'font-serif italic font-normal'
    },
    {
      name: 'DENIM',
      image: dynamicCategoryImages.DENIM,
      fontStyle: 'font-serif tracking-widest font-bold uppercase'
    },
    {
      name: 'Tops',
      image: dynamicCategoryImages.Tops,
      fontStyle: 'font-serif italic font-normal'
    },
    {
      name: 'Suits',
      image: dynamicCategoryImages.Suits,
      fontStyle: 'font-serif italic font-normal'
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

          {/* Main Hero Category Card (Dresses) */}
          <div
            onClick={() => setCategoryFilter(mainFeatureCategory.name)}
            className="w-full aspect-[21/9] bg-white relative overflow-hidden cursor-pointer group shadow-sm border border-[#e2ded9]"
          >
            <img
              src={mainFeatureCategory.image}
              alt={mainFeatureCategory.name}
              className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-700 ease-in-out"
            />
            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center text-center p-4">
              <h2 className={`text-4xl sm:text-6xl md:text-7xl text-white drop-shadow-md tracking-wider ${mainFeatureCategory.fontStyle}`}>
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
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700 ease-in-out"
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
          <p className="text-xs text-gray-500 mt-1 font-light">
            Showing initial 12 of {categoryProducts.length} items
          </p>
        </div>

        {isDbLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-8 sm:gap-y-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : categoryProducts.length === 0 ? (
          <div className="py-20 text-center text-gray-500 text-sm">
            No products currently available in {categoryFilter}. Use search to trigger Product Discovery Service!
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
