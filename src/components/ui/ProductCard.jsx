import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { getSwatchStyle } from '../../utils/swatchResolver';

export function ProductCard({ product, isLarge = false }) {
  const { formatPrice, addToCart, openProduct, isFavorite, toggleFavorite } = useShop();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);

  const favorited = isFavorite(product.id);

  const selectedColor = product.colors && product.colors[selectedColorIdx];
  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];

  // Dynamic image switching: Read activeImageIndex so photo refreshes when navigating arrows/thumbnails/colors
  const currentImage = imagesList[activeImageIndex] || (selectedColor && selectedColor.image_url) || product.image;

  const showSaleBadge = Boolean(product.isSale && product.originalPrice);
  const showNewBadge = Boolean(product.isNew && !showSaleBadge);

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev + 1) % imagesList.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev - 1 + imagesList.length) % imagesList.length);
  };

  const handleColorClick = (e, idx, colorObj) => {
    e.stopPropagation();
    setSelectedColorIdx(idx);

    if (colorObj && colorObj.image_url) {
      const matchIdx = imagesList.findIndex(img => img === colorObj.image_url);
      if (matchIdx !== -1) {
        setActiveImageIndex(matchIdx);
        return;
      }
    }
    if (imagesList[idx]) {
      setActiveImageIndex(idx);
    }
  };

  const activePrice = (selectedColor && selectedColor.price) ? selectedColor.price : product.price;

  return (
    <div
      className={`group flex flex-col bg-white border border-[#e2ded9] p-3 sm:p-4 cursor-pointer transition-shadow hover:shadow-md ${
        isLarge ? 'col-span-1 md:col-span-2' : 'col-span-1'
      }`}
      onClick={() => openProduct({ ...product, price: activePrice, selectedColor })}
    >
      {/* Image Container with Dynamic Color Variant Swap */}
      <div className="relative w-full aspect-[3/4] mb-3 bg-[#f3f0ec] overflow-hidden border border-[#e2ded9]">
        <img
          src={currentImage}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
        />

        {/* Carousel Controls */}
        {imagesList.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Previous image"
            >
              ‹
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Next image"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
              {imagesList.map((_, idx) => (
                <span
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx); }}
                  className={`w-2 h-2 rounded-full cursor-pointer ${idx === activeImageIndex ? 'bg-white scale-110' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Status Badges */}
        {showSaleBadge && (
          <div className="absolute top-3 left-3 border border-[#93000a] bg-[#93000a] text-white px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest shadow-sm z-10">
            SALE
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-1 transition-colors z-10 ${
            favorited ? 'text-[#93000a]' : 'text-gray-600 hover:text-[#151616] drop-shadow'
          }`}
          title={favorited ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <svg className="w-5 h-5" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {/* Quick Add Overlay Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCart({ ...product, price: activePrice, selectedColor });
          }}
          className="absolute bottom-3 left-3 right-3 bg-[#151616]/90 hover:bg-[#151616] text-white text-[10px] uppercase tracking-widest py-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold"
        >
          Add to Cart
        </button>
      </div>

      {/* Brand & Rating */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold truncate">
          {product.brand || 'SHO.V'}
        </span>

        {product.rating && (
          <div className="flex items-center space-x-1 text-[10px] text-amber-600 font-semibold">
            <span>★ {product.rating}</span>
            {product.reviewCount ? <span className="text-gray-400">({product.reviewCount})</span> : null}
          </div>
        )}
      </div>

      {/* Product Title */}
      <h3 className="text-xs sm:text-sm font-medium mb-2 text-[#151616] group-hover:text-[#bc9c85] transition-colors line-clamp-2 leading-snug">
        {product.name}
      </h3>

      {/* Exact Color Swatches */}
      {product.colors && product.colors.length > 0 ? (
        <div className="flex items-center space-x-1.5 mb-2">
          {product.colors.map((cObj, idx) => {
            const colorName = cObj.name || `Color ${idx + 1}`;
            const swatchStyle = getSwatchStyle(colorName, cObj.hex);
            return (
              <button
                key={idx}
                onClick={(e) => handleColorClick(e, idx, cObj)}
                className={`w-4 h-4 rounded-full border transition-all ${swatchStyle.borderClass} ${
                  idx === selectedColorIdx ? 'scale-125 ring-2 ring-offset-1 ring-[#151616]' : 'hover:scale-110 opacity-90'
                }`}
                style={swatchStyle}
                title={`${colorName} — Click to view color`}
              />
            );
          })}
        </div>
      ) : null}

      {/* Size Buttons */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {product.sizes.map((sz, idx) => {
            const sizeName = typeof sz === 'string' ? sz : sz.name;
            const isAvail = typeof sz === 'object' && sz.available !== undefined ? sz.available : true;
            return (
              <button
                key={idx}
                disabled={!isAvail}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSize(sizeName);
                }}
                className={`px-1.5 py-0.5 text-[9px] font-semibold uppercase border transition-colors ${
                  selectedSize === sizeName
                    ? 'bg-[#151616] text-white border-[#151616]'
                    : isAvail
                    ? 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                    : 'bg-gray-100 text-gray-400 border-gray-200 line-through opacity-50 cursor-not-allowed'
                }`}
              >
                {sizeName}
              </button>
            );
          })}
        </div>
      )}

      {/* Price & Availability */}
      <div className="mt-auto pt-2 border-t border-[#f0ebd8] flex justify-between items-baseline text-xs">
        <div className="font-semibold flex items-center space-x-2">
          {product.originalPrice ? (
            <>
              <span className="text-[#93000a] font-bold">{formatPrice(activePrice)}</span>
              <span className="text-gray-400 line-through text-[10px]">{formatPrice(product.originalPrice)}</span>
            </>
          ) : (
            <span className="text-[#151616]">{formatPrice(activePrice)}</span>
          )}
        </div>

        <span className="text-[9px] text-gray-500 uppercase tracking-wider font-medium">
          {product.availability || 'In Stock'}
        </span>
      </div>
    </div>
  );
}
