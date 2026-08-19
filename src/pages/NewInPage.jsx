import React from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ui/ProductCard';

export function NewInPage() {
  const { dbProducts, isDbLoading } = useShop();

  const newProducts = dbProducts.filter(p => p.isNew || p.id.includes('scraped'));
  const displayList = newProducts.length > 0 ? newProducts : dbProducts.slice(0, 6);

  return (
    <main className="w-full max-w-[1600px] mx-auto px-3 sm:px-8 py-8 md:py-16 flex-grow">
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-widest text-[#bc9c85] font-semibold mb-2 block">
          Latest PostgreSQL Arrivals
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#151616] mb-4">New In</h1>
        <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
          Be the first to experience our newest quiet luxury arrivals and web-discovered products.
        </p>
      </div>

      {isDbLoading ? (
        <div className="py-20 text-center text-gray-500 text-sm">
          Loading new arrivals from PostgreSQL...
        </div>
      ) : displayList.length === 0 ? (
        <div className="py-20 text-center text-gray-500 text-sm">
          No new arrivals found in PostgreSQL database. Use search to discover products!
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 sm:gap-x-6 gap-y-8 sm:gap-y-16">
          {displayList.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </main>
  );
}
