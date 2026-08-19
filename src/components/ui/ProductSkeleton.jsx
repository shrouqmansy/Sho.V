import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="group relative flex flex-col bg-white border border-[#e2ded9] overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-[3/4] bg-[#eae6e1] w-full flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gray-300 border-t-[#bc9c85] rounded-full animate-spin" />
        <span className="absolute bottom-3 left-3 bg-[#151616]/80 text-white text-[9px] uppercase tracking-widest px-2 py-1 font-semibold">
          Web Discovery
        </span>
      </div>

      {/* Info Skeleton */}
      <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-3 bg-[#eae6e1] w-1/3 rounded" />
          <div className="h-4 bg-[#e2ded9] w-3/4 rounded" />
          <div className="h-4 bg-[#eae6e1] w-1/2 rounded" />
        </div>

        <div className="pt-2 border-t border-[#f0ebd8] flex justify-between items-center">
          <div className="h-4 bg-[#e2ded9] w-1/3 rounded" />
          <div className="h-3 bg-[#eae6e1] w-1/4 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ProductSkeletonGrid({ count = 4, message = "Searching the web for products... Finding the best matches for you" }) {
  return (
    <div className="space-y-6 my-8">
      {/* Discovery Banner Notification */}
      <div className="bg-[#151616] text-white p-4 sm:p-6 text-center shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#bc9c85]/20 via-transparent to-[#bc9c85]/20 animate-pulse" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <div>
            <h3 className="font-serif text-base sm:text-lg text-white uppercase tracking-wider font-light">
              Browser Agent Searching Web...
            </h3>
            <p className="text-xs text-gray-300 tracking-wide font-sans">
              {message}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, idx) => (
          <ProductSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}
