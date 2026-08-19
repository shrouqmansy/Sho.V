import React from 'react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from '../ui/ProductCard';

export function BestSellers() {
  const { navigateTo, dbProducts } = useShop();

  const bestSellerProducts = dbProducts.length > 0 ? dbProducts.slice(0, 8) : [];

  if (bestSellerProducts.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 px-3 sm:px-6 md:px-12 bg-[#fcfaf7] border-b border-[#e2ded9]">
      <div className="max-w-[1600px] mx-auto">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-6 sm:mb-8 pb-4 border-b border-[#e2ded9]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#bc9c85] font-semibold block mb-1">
              PostgreSQL Curated Selection
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#151616]">
              OUR BEST SELLERS
            </h2>
          </div>

          <button
            onClick={() => navigateTo('shop')}
            className="text-xs uppercase tracking-widest text-[#151616] hover:text-[#bc9c85] font-semibold transition-colors"
          >
            View All →
          </button>
        </div>

        {/* Touch Swipeable Horizontal Container */}
        <div className="w-full overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar no-scrollbar py-2">
          <div className="flex space-x-4 sm:space-x-8 w-max">
            {bestSellerProducts.map((prod) => (
              <div
                key={prod.id}
                className="w-[300px] sm:w-[380px] md:w-[440px] flex-shrink-0 snap-start"
              >
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
