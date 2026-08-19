import React from 'react';
import { useShop } from '../../context/ShopContext';
import { collections } from '../../data/products';

export function CollectionList() {
  const { openCollection } = useShop();

  return (
    <section className="py-16 px-6 md:px-12 bg-white border-y border-[#e2ded9]">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl md:text-4xl text-[#151616]">Collection list</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-[1600px] mx-auto">
        {collections.map(col => (
          <button
            key={col.id}
            onClick={() => openCollection(col.name)}
            className="group block text-center cursor-pointer"
          >
            <div className="relative bg-[#f3f0ec] overflow-hidden mb-4 aspect-[3/4]">
              <img
                src={col.image}
                alt={col.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
              />
            </div>
            <h3 className="font-medium text-sm md:text-base uppercase tracking-wider group-hover:text-[#bc9c85] transition-colors text-[#151616]">
              {col.name}
            </h3>
          </button>
        ))}
      </div>
    </section>
  );
}
