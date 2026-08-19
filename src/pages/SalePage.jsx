import React from 'react';
import { ProductCard } from '../components/ui/ProductCard';
import { products } from '../data/products';

export function SalePage() {
  const saleProducts = products.filter(p => p.isSale || p.originalPrice);

  return (
    <main className="w-full max-w-[1600px] mx-auto px-3 sm:px-8 py-8 md:py-16 flex-grow">
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-widest text-[#93000a] font-semibold mb-2 block">
          Exclusive Offers
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#151616] mb-4">Archive Sale</h1>
        <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
          Limited selections from previous seasons, available at reduced prices in EGP.
        </p>
      </div>

      {/* Products Grid Ordered 2 under 2 (grid-cols-2) */}
      <div className="grid grid-cols-2 gap-x-3 sm:gap-x-6 gap-y-8 sm:gap-y-16">
        {saleProducts.map(prod => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </main>
  );
}
