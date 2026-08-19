import React from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ui/ProductCard';
import { RecommendationSection } from '../components/common/RecommendationSection';

export function WishlistPage() {
  const { dbProducts, favorites, navigateTo } = useShop();

  const favoriteProducts = (dbProducts || []).filter(p => favorites.includes(p.id));

  return (
    <main className="w-full max-w-[1600px] mx-auto px-3 sm:px-8 py-8 md:py-16 flex-grow">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-widest text-[#bc9c85] font-semibold mb-2 block">
          Your Curated Collection
        </span>
        <h1 className="font-serif text-4xl md:text-5xl text-[#151616] mb-3">My Wishlist</h1>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-2">
          Saved Items ({favoriteProducts.length})
        </p>
        <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
          Your saved quiet luxury pieces. Easily review, add to cart, or purchase when you're ready.
        </p>
      </div>

      {/* Wishlist Grid */}
      {favoriteProducts.length === 0 ? (
        <div className="py-20 text-center bg-white border border-[#e2ded9] p-8 max-w-md mx-auto">
          <p className="text-gray-500 text-sm mb-6">Your wishlist is currently empty.</p>
          <button
            onClick={() => navigateTo('shop')}
            className="bg-[#151616] text-white uppercase text-xs tracking-widest py-3 px-8 hover:bg-[#bc9c85] transition-colors font-medium"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-8 sm:gap-y-16">
          {favoriteProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}

      {/* AI Recommendation Widget: Based On Your Wishlist */}
      <RecommendationSection
        title="Based On Your Wishlist"
        subtitle="Complementary styles matching the colors, categories, and cuts in your wishlist"
        type="wishlist"
        limit={4}
      />
    </main>
  );
}
