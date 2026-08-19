import React from 'react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from '../ui/ProductCard';
import { products } from '../../data/products';

export function FeaturedCollection() {
  const { navigateTo } = useShop();

  const featuredProducts = products.filter(p => p.isFeatured);
  const largeProduct = featuredProducts[0];
  const sideProductsGroup1 = featuredProducts.slice(1, 3);
  const sideProductsGroup2 = featuredProducts.slice(3, 5);

  return (
    <section className="py-20 px-6 md:px-12 max-w-[1600px] mx-auto">
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-widest text-gray-500 mb-2 block font-semibold">
          Pieces designed to elevate the everyday
        </span>
        <h2 className="font-serif text-3xl md:text-4xl text-[#151616]">Featured collection</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
        {/* Large Showcase Product */}
        {largeProduct && (
          <ProductCard product={largeProduct} isLarge={true} />
        )}

        {/* Product Column 2 */}
        <div className="col-span-1 flex flex-col justify-between space-y-8">
          {sideProductsGroup1.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>

        {/* Product Column 3 */}
        <div className="col-span-1 flex flex-col justify-between space-y-8">
          {sideProductsGroup2.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>

      <div className="mt-16 text-center">
        <button
          onClick={() => navigateTo('shop')}
          className="inline-block bg-[#bc9c85] hover:bg-[#a6856d] text-white uppercase text-xs tracking-widest py-3.5 px-12 transition-colors duration-300 font-semibold"
        >
          Shop All
        </button>
      </div>
    </section>
  );
}
