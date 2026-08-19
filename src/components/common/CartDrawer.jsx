import React from 'react';
import { useShop } from '../../context/ShopContext';

export function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    formatPrice,
    navigateTo
  } = useShop();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[#fcfaf7] h-full shadow-2xl flex flex-col justify-between z-10 p-6 md:p-8">
        <div>
          <div className="flex justify-between items-center pb-6 border-b border-[#e2ded9]">
            <h2 className="font-serif text-xl tracking-wide uppercase">Your Shopping Cart</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-gray-500 hover:text-black p-2"
            >
              ✕
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-500 mb-6 text-sm">Your cart is currently empty.</p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigateTo('shop');
                }}
                className="bg-[#2c2a29] text-white uppercase text-xs tracking-widest py-3 px-6 hover:bg-[#bc9c85] transition-colors"
              >
                Explore Shop
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#e2ded9] max-h-[60vh] overflow-y-auto my-4 pr-1">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="py-4 flex space-x-4 items-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-20 object-cover bg-gray-100 flex-shrink-0 border border-gray-200"
                  />
                  <div className="flex-grow">
                    <h3 className="text-sm font-medium text-[#151616]">{product.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-gray-500 my-1">
                      <span>{product.brand || 'SHO.V'}</span>
                      {product.selectedSize && (
                        <span className="bg-[#151616] text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm">
                          Size: {product.selectedSize}
                        </span>
                      )}
                      {product.selectedColor?.name && (
                        <span className="text-gray-600 font-medium">
                          Color: {product.selectedColor.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 mt-2">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="w-6 h-6 border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="text-xs font-semibold">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="w-6 h-6 border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-[#151616]">{formatPrice(product.price * quantity)}</div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-xs text-[#93000a] hover:underline mt-2 inline-block font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-[#e2ded9] pt-6">
            <div className="flex justify-between items-center mb-4 text-sm font-medium">
              <span className="uppercase tracking-widest">Subtotal</span>
              <span className="font-serif text-lg font-semibold">{formatPrice(cartSubtotal)}</span>
            </div>
            <p className="text-xs text-gray-500 mb-6">Taxes and shipping calculated at checkout.</p>
            <button
              onClick={() => {
                setIsCartOpen(false);
                navigateTo('checkout');
              }}
              className="w-full bg-[#151616] hover:bg-[#bc9c85] text-white uppercase text-xs tracking-[0.2em] py-4 transition-colors font-bold shadow-md cursor-pointer border border-[#151616]"
            >
              Checkout — {formatPrice(cartSubtotal)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
