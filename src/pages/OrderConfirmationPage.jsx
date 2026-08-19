import React from 'react';
import { useShop } from '../context/ShopContext';

export function OrderConfirmationPage() {
  const { lastPlacedOrder, formatPrice, navigateTo } = useShop();

  if (!lastPlacedOrder) {
    return (
      <main className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-16 text-center flex-grow">
        <h1 className="font-serif text-3xl md:text-4xl text-[#151616] mb-4">No Recent Order Found</h1>
        <button
          onClick={() => navigateTo('home')}
          className="bg-[#151616] hover:bg-[#bc9c85] text-white uppercase text-xs tracking-widest py-4 px-8 transition-colors font-medium"
        >
          Return to Home
        </button>
      </main>
    );
  }

  return (
    <main className="w-full max-w-[900px] mx-auto px-4 md:px-8 py-12 md:py-20 flex-grow">
      {/* Success Badge & Header */}
      <div className="bg-white border border-[#e2ded9] p-8 md:p-12 text-center space-y-6 shadow-sm mb-8">
        <div className="w-16 h-16 bg-[#bc9c85]/15 text-[#bc9c85] rounded-full flex items-center justify-center text-3xl mx-auto font-light">
          ✓
        </div>
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#bc9c85] font-semibold block mb-2">
            Thank You For Your Order
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-[#151616] uppercase tracking-wide font-light">
            Order Confirmed
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Order Reference ID: <strong className="text-[#151616] font-mono">{lastPlacedOrder.id}</strong>
          </p>
        </div>
        <p className="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed border-t border-b border-[#e2ded9] py-4">
          A confirmation email has been sent to <strong>{lastPlacedOrder.customerInfo.email}</strong>. Our courier team across Egypt will prepare your items for dispatch.
        </p>

        {/* Order Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2 text-xs">
          <div className="bg-[#fcfaf7] p-4 border border-[#e2ded9]">
            <span className="text-gray-400 uppercase tracking-widest font-semibold block mb-1">Customer</span>
            <p className="font-semibold text-[#151616]">{lastPlacedOrder.customerInfo.name}</p>
            <p className="text-gray-500">{lastPlacedOrder.customerInfo.phone}</p>
          </div>

          <div className="bg-[#fcfaf7] p-4 border border-[#e2ded9]">
            <span className="text-gray-400 uppercase tracking-widest font-semibold block mb-1">Shipping Address</span>
            <p className="font-semibold text-[#151616]">{lastPlacedOrder.shippingAddress}</p>
          </div>

          <div className="bg-[#fcfaf7] p-4 border border-[#e2ded9]">
            <span className="text-gray-400 uppercase tracking-widest font-semibold block mb-1">Payment Method</span>
            <p className="font-semibold text-[#151616]">{lastPlacedOrder.paymentMethod}</p>
            <p className="text-gray-500">{lastPlacedOrder.shippingMethod}</p>
          </div>
        </div>
      </div>

      {/* Purchased Items List */}
      <div className="bg-white border border-[#e2ded9] p-6 sm:p-8 space-y-6 shadow-sm mb-8">
        <h2 className="font-serif text-xl text-[#151616] uppercase tracking-wider font-light border-b border-[#e2ded9] pb-3">
          Order Items
        </h2>

        <div className="divide-y divide-[#e2ded9]">
          {lastPlacedOrder.items.map((item, idx) => (
            <div key={idx} className="py-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img src={item.image} alt={item.name} className="w-14 h-16 object-cover bg-gray-100 border border-[#e2ded9]" />
                <div>
                  <h3 className="text-sm font-medium text-[#151616]">{item.name}</h3>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-[#151616]">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-[#e2ded9] pt-4 flex justify-between items-baseline text-[#151616]">
          <span className="font-serif text-lg uppercase tracking-wider font-light">Total Paid</span>
          <span className="font-serif text-2xl font-semibold text-[#bc9c85]">
            {formatPrice(lastPlacedOrder.total)}
          </span>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => navigateTo('home')}
          className="bg-[#151616] hover:bg-[#bc9c85] text-white uppercase text-xs tracking-widest py-4 px-10 transition-colors font-semibold"
        >
          Continue Shopping
        </button>
      </div>
    </main>
  );
}
