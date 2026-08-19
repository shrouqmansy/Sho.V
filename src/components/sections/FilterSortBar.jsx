import React from 'react';
import { useShop } from '../../context/ShopContext';

export function FilterSortBar({ totalCount }) {
  const { categoryFilter, setCategoryFilter, sortOption, setSortOption } = useShop();

  const categories = [
    'All',
    'Dresses',
    'Blazers',
    'Trousers',
    'Tops',
    'Skirts',
    'Suits',
    'Outerwear',
    'Accessories'
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-center border-b border-[#e2ded9] py-4 mb-10 space-y-4 md:space-y-0">
      {/* Categories Bar — Listed one after another for quick filtering */}
      <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 text-xs uppercase tracking-widest transition-all flex-shrink-0 font-medium ${
              categoryFilter === cat
                ? 'bg-[#151616] text-white font-semibold shadow-sm'
                : 'bg-[#f3f0ec] text-[#151616] hover:bg-[#e2ded9]'
            }`}
          >
            {cat === 'All' ? 'ALL PRODUCTS' : cat}
          </button>
        ))}
      </div>

      {/* Item Count & Sorting Dropdown */}
      <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end text-xs uppercase tracking-wider">
        <span className="text-gray-500 font-medium">{totalCount} Items</span>
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 font-medium">Sort By:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-transparent border-b border-[#151616] py-1 text-xs font-semibold focus:outline-none uppercase"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}
