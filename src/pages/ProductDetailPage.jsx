import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { getSwatchStyle } from '../utils/swatchResolver';
import { RecommendationSection } from '../components/common/RecommendationSection';

export function ProductDetailPage() {
  const { selectedProduct, navigateTo, addToCart, formatPrice, openCollection, isFavorite, toggleFavorite } = useShop();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [inventoryList, setInventoryList] = useState([]);

  const p = selectedProduct;
  const favorited = p ? isFavorite(p.id) : false;

  useEffect(() => {
    if (!p) return;
    async function fetchInventory() {
      try {
        const res = await fetch(`http://localhost:3001/api/products/${p.id}/inventory`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setInventoryList(data.inventory);
          }
        }
      } catch (err) {
        console.warn('Could not fetch product inventory:', err.message);
      }
    }
    fetchInventory();
  }, [p]);

  if (!selectedProduct) {
    navigateTo('home');
    return null;
  }

  const selectedColor = p.colors && p.colors[selectedColorIdx];
  const imagesList = p.images && p.images.length > 0 ? p.images : [p.image];
  const currentImage = imagesList[activeImageIdx] || (selectedColor && selectedColor.image_url) || p.image;

  const sizesList = p.sizes && p.sizes.length > 0 ? p.sizes : [
    { name: 'XS', available: true },
    { name: 'S', available: true },
    { name: 'M', available: true },
    { name: 'L', available: true },
    { name: 'XL', available: true }
  ];

  const currentColorName = selectedColor ? selectedColor.name : 'Default Color';
  const currentSkuInv = inventoryList.find(
    inv => inv.color_name.toLowerCase() === currentColorName.toLowerCase() &&
           inv.size_name.toLowerCase() === (selectedSize || 'M').toLowerCase()
  );

  const availableQty = currentSkuInv ? currentSkuInv.available_quantity : 15;
  const isOutOfStock = availableQty <= 0;

  const handleColorClick = (idx, cObj) => {
    setSelectedColorIdx(idx);

    if (cObj && cObj.image_url) {
      const matchIdx = imagesList.findIndex(img => img === cObj.image_url);
      if (matchIdx !== -1) {
        setActiveImageIdx(matchIdx);
        return;
      }
    }

    if (imagesList[idx]) {
      setActiveImageIdx(idx);
    }
  };

  const handleAddToCart = () => {
    if (sizesList.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    if (isOutOfStock) return;
    setSizeError(false);
    addToCart({ ...p, selectedSize, selectedColor, skuId: currentSkuInv?.sku_id }, Math.min(quantity, availableQty));
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const activePrice = (selectedColor && selectedColor.price) ? selectedColor.price : p.price;

  return (
    <main className="w-full max-w-[1440px] mx-auto px-4 md:px-12 py-6 md:py-16 flex-grow">
      {/* Breadcrumb Navigation */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#e2ded9]">
        <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-gray-500">
          <button onClick={() => navigateTo('home')} className="hover:text-[#bc9c85] transition-colors">
            Home
          </button>
          <span>›</span>
          <button
            onClick={() => openCollection(p.category)}
            className="hover:text-[#bc9c85] transition-colors"
          >
            {p.category}
          </button>
          <span>›</span>
          <span className="text-[#151616] font-semibold truncate max-w-[180px]">{p.name}</span>
        </nav>
      </div>

      {/* Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
        {/* Left Side: Images Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] bg-[#f3f0ec] overflow-hidden border border-[#e2ded9]">
            <img
              src={currentImage}
              alt={p.name}
              className="w-full h-full object-cover"
            />
            {p.isSale && (
              <div className="absolute top-5 left-5 bg-[#93000a] text-white px-3 py-1 text-[10px] font-semibold uppercase tracking-widest z-10">
                SALE
              </div>
            )}

            {/* Favorite Wishlist Button */}
            <button
              onClick={() => toggleFavorite(p.id)}
              className={`absolute top-4 right-4 p-2 transition-colors z-10 ${
                favorited ? 'text-[#93000a]' : 'text-gray-600 hover:text-[#151616] drop-shadow'
              }`}
              title={favorited ? "Remove from Wishlist" : "Save to Wishlist"}
            >
              <svg className="w-6 h-6" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>

          {/* Multiple Image Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {imagesList.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImageIdx(idx);
                    if (p.colors && p.colors[idx]) {
                      setSelectedColorIdx(idx);
                    }
                  }}
                  className={`w-20 h-24 flex-shrink-0 border-2 overflow-hidden bg-gray-100 transition-all ${
                    idx === activeImageIdx ? 'border-[#151616] scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`${p.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Info */}
        <div className="flex flex-col justify-center space-y-6">
          {/* Brand & Wishlist */}
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">{p.brand || 'SHO.V'}</span>
            <button
              onClick={() => toggleFavorite(p.id)}
              className="text-xs uppercase tracking-wider font-semibold text-gray-600 hover:text-[#93000a] flex items-center space-x-1"
            >
              <span>{favorited ? '♥ Saved in Wishlist' : '♡ Add to Wishlist'}</span>
            </button>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl md:text-4xl text-[#151616] tracking-wide uppercase font-light">
            {p.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline space-x-3">
            <span className="text-2xl font-semibold text-[#151616]">
              {formatPrice(activePrice)}
            </span>
            {p.originalPrice && p.originalPrice > activePrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(p.originalPrice)}
              </span>
            )}
          </div>

          {/* Real-time SKU Stock Availability Badge */}
          <div className="pt-1">
            {availableQty <= 0 ? (
              <span className="inline-block bg-red-100 border border-red-300 text-red-800 text-xs font-semibold px-3 py-1 uppercase tracking-wider">
                Out of Stock
              </span>
            ) : availableQty <= 5 ? (
              <span className="inline-block bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold px-3 py-1 uppercase tracking-wider">
                Only {availableQty} Left in Stock — Order Soon
              </span>
            ) : (
              <span className="inline-block bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold px-3 py-1 uppercase tracking-wider">
                In Stock ({availableQty} Available)
              </span>
            )}
          </div>

          <div className="border-t border-[#e2ded9]" />

          {/* Colors Selection */}
          {p.colors && p.colors.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">
                Select Color: <span className="text-[#151616] font-bold">{p.colors[selectedColorIdx]?.name || ''}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {p.colors.map((c, idx) => {
                  const swatchStyle = getSwatchStyle(c.name, c.hex);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleColorClick(idx, c)}
                      className={`flex items-center space-x-2 border px-3.5 py-2 transition-all ${
                        idx === selectedColorIdx ? 'border-[#151616] bg-[#fcfaf7] ring-1 ring-[#151616]' : 'border-[#e2ded9] bg-white hover:border-gray-400'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border ${swatchStyle.borderClass}`} style={swatchStyle} />
                      <span className="text-xs font-medium text-[#151616]">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Select Size</p>
              {sizeError && (
                <span className="text-xs text-[#93000a] font-semibold">Please choose a size to continue</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {sizesList.map((sz, idx) => {
                const name = typeof sz === 'string' ? sz : sz.name;
                const isAvail = typeof sz === 'object' && sz.available !== undefined ? sz.available : true;
                return (
                  <button
                    key={idx}
                    disabled={!isAvail}
                    onClick={() => {
                      setSelectedSize(name);
                      setSizeError(false);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase border transition-colors ${
                      selectedSize === name
                        ? 'bg-[#151616] text-white border-[#151616]'
                        : isAvail
                        ? 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                        : 'bg-gray-100 text-gray-400 border-gray-200 line-through opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector & Add to Cart */}
          <div className="space-y-4 pt-4 border-t border-[#e2ded9]">
            <div className="flex space-x-4">
              <div className="flex border border-gray-300">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={isOutOfStock}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-semibold flex items-center">{isOutOfStock ? 0 : quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(availableQty, q + 1))}
                  disabled={isOutOfStock || quantity >= availableQty}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-grow uppercase text-xs tracking-widest py-3.5 px-8 transition-colors duration-300 font-semibold shadow-sm ${
                  isOutOfStock
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#151616] hover:bg-[#bc9c85] text-white'
                }`}
              >
                {isOutOfStock ? 'Out of Stock' : addedFeedback ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Widget: Similar Items */}
      <RecommendationSection
        title="Because You Liked This"
        subtitle="Similar styles, colors, and cuts selected by our AI Recommendation Engine"
        type="similar"
        productId={p.id}
        limit={4}
      />
    </main>
  );
}
