import React from 'react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from '../ui/ProductCard';
import { ProductSkeleton } from '../ui/ProductSkeleton';

export function BestSellers() {
  const { navigateTo, dbProducts, isDbLoading } = useShop();

  const bestSellerProducts = dbProducts.length > 0 ? dbProducts.slice(0, 8) : [];

  return (
    <section className="py-8 sm:py-16 px-3 sm:px-6 md:px-12 bg-[#fcfaf7] border-b border-[#e2ded9] overflow-hidden">
      <div className="max-w-[1600px] mx-auto">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-4 sm:mb-8 pb-3 border-b border-[#e2ded9]">
          <div>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#bc9c85] font-semibold block mb-1">
              PostgreSQL Curated Selection
            </span>
            <h2 className="font-serif text-xl sm:text-3xl md:text-4xl text-[#151616]">
              OUR BEST SELLERS
            </h2>
          </div>

          <button
            onClick={() => navigateTo('shop')}
            className="text-[10px] sm:text-xs uppercase tracking-widest text-[#151616] hover:text-[#bc9c85] font-semibold transition-colors flex items-center space-x-1"
          >
            <span>View All</span>
            <span>→</span>
          </button>
        </div>

        {/* Touch Swipeable Horizontal Container for Desktop & Mobile */}
        <div className="w-full overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar no-scrollbar py-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex space-x-3 sm:space-x-6 w-max">
            {isDbLoading || bestSellerProducts.length === 0 ? (
              [1, 2, 3, 4].map(idx => (
                <div key={idx} className="w-[260px] sm:w-[340px] md:w-[400px] flex-shrink-0 snap-start">
                  <ProductSkeleton />
                </div>
              ))
            ) : (
              bestSellerProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="w-[260px] sm:w-[340px] md:w-[400px] flex-shrink-0 snap-start"
                >
                  <ProductCard product={prod} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
