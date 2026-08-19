import React from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ui/ProductCard';

export function CollectionPage() {
  const { selectedCollection, navigateTo, dbProducts, isDbLoading } = useShop();

  const collectionName = selectedCollection || 'All Collections';

  const filteredProducts = selectedCollection
    ? (selectedCollection === 'New in'
        ? dbProducts.filter(p => p.isNew)
        : dbProducts.filter(p => p.category && p.category.toLowerCase() === selectedCollection.toLowerCase()))
    : dbProducts;

  return (
    <main className="w-full max-w-[1600px] mx-auto px-3 sm:px-8 py-6 md:py-16 flex-grow">
      {/* Top Breadcrumb */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#e2ded9]">
        <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-gray-500 my-2 sm:my-0">
          <button onClick={() => navigateTo('home')} className="hover:text-[#bc9c85] transition-colors">
            Home
          </button>
          <span>›</span>
          <button onClick={() => navigateTo('shop')} className="hover:text-[#bc9c85] transition-colors">
            Collections
          </button>
          <span>›</span>
          <span className="text-[#151616] font-semibold">{collectionName}</span>
        </nav>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-widest text-[#bc9c85] font-semibold mb-2 block">
          PostgreSQL Curated Collection
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#151616] mb-4">
          {collectionName}
        </h1>
        <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
          Explore our quiet luxury pieces in the {collectionName} collection.
        </p>
      </div>

      {/* Products Grid Ordered 2 under 2 (grid-cols-2) */}
      {isDbLoading ? (
        <div className="py-20 text-center text-gray-500 text-sm">
          Loading collection products from PostgreSQL...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center text-gray-500 text-sm">
          No products currently available in this collection. Use search to trigger Browser Agent web discovery!
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 sm:gap-x-6 gap-y-8 sm:gap-y-16">
          {filteredProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </main>
  );
}
