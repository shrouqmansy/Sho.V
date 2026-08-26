import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { ProductSkeletonGrid } from '../ui/ProductSkeleton';
import { ProductCard } from '../ui/ProductCard';

export function SearchModal() {
  const {
    isSearchOpen,
    setIsSearchOpen,
    searchKeyword,
    setSearchKeyword,
    executeSearch,
    isSearching,
    searchResults,
    isClothingQuery,
    triggeredAgentState,
    searchFeedbackMsg,
    openProduct
  } = useShop();

  const [inputVal, setInputVal] = useState(searchKeyword || '');

  if (!isSearchOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      executeSearch(inputVal.trim());
    }
  };

  const handleQuickKeywordClick = (kw) => {
    setInputVal(kw);
    executeSearch(kw);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#fcfaf7] shadow-2xl p-5 sm:p-8 z-10 border border-[#e2ded9] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#e2ded9]">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#bc9c85] font-semibold block">
              Search & Intelligent Discovery
            </span>
            <h2 className="font-serif text-xl md:text-2xl uppercase tracking-wider font-light text-[#151616]">
              Find Clothing Products
            </h2>
          </div>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-gray-500 hover:text-black p-2 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleFormSubmit} className="my-5">
          <div className="relative flex items-center border-b-2 border-[#151616]">
            <input
              type="text"
              placeholder="Try: black oversized hoodie, denim jacket, white t-shirt, silk dress..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              autoFocus
              className="w-full bg-transparent py-3 pr-24 text-base sm:text-lg focus:outline-none placeholder-gray-400 font-sans text-[#151616]"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-0 bg-[#151616] hover:bg-[#bc9c85] text-white uppercase text-xs tracking-widest px-5 py-2.5 font-semibold transition-colors disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Quick Category Suggestions */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Popular:</span>
            {['Black Oversized Hoodie', 'White T-Shirt', 'Raw Denim', 'Silk Dress', 'Tailored Blazer'].map(kw => (
              <button
                key={kw}
                type="button"
                onClick={() => handleQuickKeywordClick(kw)}
                className="bg-[#f3f0ec] hover:bg-[#e2ded9] text-gray-700 px-2.5 py-1 text-[11px] font-medium transition-colors"
              >
                {kw}
              </button>
            ))}
          </div>
        </form>

        {/* Results Area */}
        <div className="overflow-y-auto flex-grow pr-1">
          {/* STATE 1: SEARCHING / RELEVANCE RANKING LOADING STATE */}
          {isSearching ? (
            <ProductSkeletonGrid
              count={4}
              message="Searching PostgreSQL with Fashion Intent Extraction & Semantic Relevance Ranking..."
            />
          ) : !isClothingQuery ? (
            /* NON-CLOTHING QUERY STATE */
            <div className="py-12 text-center bg-white border border-[#e2ded9] p-6 my-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-xl mx-auto mb-3 font-serif">
                !
              </div>
              <h3 className="font-serif text-lg text-[#151616] uppercase tracking-wider mb-2">
                Clothing Apparel Search Only
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                {searchFeedbackMsg || 'The Sho.V Discovery Agent searches exclusively for clothing apparel (hoodies, t-shirts, denim, dresses, blazers). Non-clothing queries are not scraped.'}
              </p>
            </div>
          ) : searchResults.length > 0 ? (
            /* STATE 2 & 4: RELEVANT RESULTS FOUND STATE */
            <div className="space-y-4 my-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#e2ded9] pb-2 gap-2">
                <span className="text-xs uppercase tracking-widest text-gray-600 font-semibold">
                  Found {searchResults.length} Products
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
                {searchResults.map(prod => (
                  <div key={prod.id} onClick={() => setIsSearchOpen(false)}>
                    <ProductCard product={prod} />
                  </div>
                ))}
              </div>
            </div>
          ) : inputVal.trim() ? (
            /* STATE 5: NO RESULTS FOUND STATE */
            <div className="py-12 text-center text-gray-500 text-sm bg-white border border-[#e2ded9] my-4 p-6 space-y-2">
              <p className="font-serif text-lg text-[#151616] uppercase tracking-wider">No Products Found</p>
              <p className="text-xs text-gray-500 font-light">
                No matching clothing products found for "{inputVal}". Try searching for specific items like "Hoodie", "Dress", or "Blazer".
              </p>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-xs uppercase tracking-widest">
              Enter a search query above to search products.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
