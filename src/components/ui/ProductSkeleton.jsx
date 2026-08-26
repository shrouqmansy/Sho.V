import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="group relative flex flex-col bg-white border border-[#e2ded9] overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-[3/4] bg-[#eae6e1] w-full flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gray-300 border-t-[#bc9c85] rounded-full animate-spin" />
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

export function ProductSkeletonGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 my-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductSkeleton key={idx} />
      ))}
    </div>
  );
}
