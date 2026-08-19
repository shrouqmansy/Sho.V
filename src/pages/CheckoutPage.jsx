import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';

export function CheckoutPage() {
  const {
    cart,
    cartSubtotal,
    formatPrice,
    navigateTo,
    userAccount,
    placeOrder
  } = useShop();

  // Form Fields State (pre-filled if logged in)
  const [formData, setFormData] = useState({
    fullName: userAccount.isLoggedIn ? userAccount.name : '',
    email: userAccount.isLoggedIn ? userAccount.email : '',
    phone: '',
    country: 'Egypt',
    city: 'Cairo',
    area: '',
    street: '',
    building: '',
    deliveryNotes: '',
    shippingMethod: 'standard', // 'standard' (50 EGY) | 'express' (100 EGY)
    paymentMethod: 'cod', // 'cod' | 'card' | 'instapay'
    promoCode: '',
  });

  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountMessage, setDiscountMessage] = useState('');
  const [errors, setErrors] = useState({});

  if (cart.length === 0) {
    return (
      <main className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-16 text-center flex-grow">
        <h1 className="font-serif text-3xl md:text-4xl text-[#151616] mb-4">Your Cart is Empty</h1>
        <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
          You currently have no items in your shopping cart to checkout.
        </p>
        <button
          onClick={() => navigateTo('shop')}
          className="bg-[#151616] hover:bg-[#bc9c85] text-white uppercase text-xs tracking-widest py-4 px-8 transition-colors font-medium"
        >
          Explore Shop
        </button>
      </main>
    );
  }

  // Calculate Costs
  const shippingCost = formData.shippingMethod === 'express' ? 100 : 50;
  const discountAmount = (cartSubtotal * appliedDiscount) / 100;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = formData.promoCode.trim().toUpperCase();
    if (code === 'SHOV10' || code === 'WELCOME10') {
      setAppliedDiscount(10);
      setDiscountMessage('✓ 10% Discount Applied!');
    } else if (code === 'VIP20') {
      setAppliedDiscount(20);
      setDiscountMessage('✓ 20% VIP Discount Applied!');
    } else if (code) {
      setAppliedDiscount(0);
      setDiscountMessage('✕ Invalid Promo Code');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'Valid email is required';
    if (!formData.phone.trim() || formData.phone.length < 8) newErrors.phone = 'Valid phone number is required (+20)';
    if (!formData.area.trim()) newErrors.area = 'Area / District is required';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    placeOrder({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      area: formData.area,
      street: `${formData.street} ${formData.building ? '(Bldg: ' + formData.building + ')' : ''}`,
      shippingMethod: formData.shippingMethod === 'express' ? 'Express Next-Day Delivery' : 'Standard Delivery (2-4 Days)',
      paymentMethod: formData.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : formData.paymentMethod === 'card' ? 'Credit / Debit Card' : 'InstaPay / Vodafone Cash',
      totalPrice: finalTotal
    });
  };

  return (
    <main className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-16 flex-grow">
      {/* Header Title */}
      <div className="mb-10 text-center md:text-left border-b border-[#e2ded9] pb-6">
        <span className="text-xs uppercase tracking-widest text-[#bc9c85] font-semibold block mb-1">
          Checkout Process
        </span>
        <h1 className="font-serif text-3xl md:text-4xl text-[#151616] font-light uppercase tracking-wider">
          Secure Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
        {/* LEFT COLUMN: Customer & Shipping Details Form (lg:col-span-7) */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-10">
          {/* SECTION 1: Customer Information */}
          <div className="bg-white border border-[#e2ded9] p-6 sm:p-8 space-y-5 shadow-sm">
            <h2 className="font-serif text-xl text-[#151616] uppercase tracking-wider font-light border-b border-[#e2ded9] pb-3">
              1. Customer Information
            </h2>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="e.g. Salma El-Din"
                className={`w-full px-4 py-3 text-sm bg-[#fcfaf7] border text-[#151616] focus:outline-none focus:border-[#bc9c85] ${
                  errors.fullName ? 'border-[#93000a]' : 'border-[#e2ded9]'
                }`}
              />
              {errors.fullName && <p className="text-xs text-[#93000a] mt-1">{errors.fullName}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="salma@example.com"
                  className={`w-full px-4 py-3 text-sm bg-[#fcfaf7] border text-[#151616] focus:outline-none focus:border-[#bc9c85] ${
                    errors.email ? 'border-[#93000a]' : 'border-[#e2ded9]'
                  }`}
                />
                {errors.email && <p className="text-xs text-[#93000a] mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                  Phone Number (Egypt) *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+20 100 123 4567"
                  className={`w-full px-4 py-3 text-sm bg-[#fcfaf7] border text-[#151616] focus:outline-none focus:border-[#bc9c85] ${
                    errors.phone ? 'border-[#93000a]' : 'border-[#e2ded9]'
                  }`}
                />
                {errors.phone && <p className="text-xs text-[#93000a] mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* SECTION 2: Delivery Address (Egypt Only) */}
          <div className="bg-white border border-[#e2ded9] p-6 sm:p-8 space-y-5 shadow-sm">
            <h2 className="font-serif text-xl text-[#151616] uppercase tracking-wider font-light border-b border-[#e2ded9] pb-3">
              2. Shipping Address (Egypt)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  value="Egypt"
                  disabled
                  className="w-full px-4 py-3 text-sm bg-[#f0ebd8] border border-[#e2ded9] text-gray-700 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                  City / Governorate *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-[#fcfaf7] border border-[#e2ded9] text-[#151616] focus:outline-none focus:border-[#bc9c85]"
                >
                  <option value="Cairo">Cairo (القاهرة)</option>
                  <option value="Giza">Giza (الجيزة)</option>
                  <option value="Alexandria">Alexandria (الإسكندرية)</option>
                  <option value="New Cairo">New Cairo / Fifth Settlement</option>
                  <option value="Sheikh Zayed">Sheikh Zayed / 6th October</option>
                  <option value="Delta">Delta (Mansoura, Tanta, Zagazig)</option>
                  <option value="Red Sea">Red Sea (Hurghada, El Gouna)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                Area / District / Neighborhood *
              </label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                placeholder="e.g. Zamalek, Maadi, Heliopolis"
                className={`w-full px-4 py-3 text-sm bg-[#fcfaf7] border text-[#151616] focus:outline-none focus:border-[#bc9c85] ${
                  errors.area ? 'border-[#93000a]' : 'border-[#e2ded9]'
                }`}
              />
              {errors.area && <p className="text-xs text-[#93000a] mt-1">{errors.area}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="Street name & number"
                  className={`w-full px-4 py-3 text-sm bg-[#fcfaf7] border text-[#151616] focus:outline-none focus:border-[#bc9c85] ${
                    errors.street ? 'border-[#93000a]' : 'border-[#e2ded9]'
                  }`}
                />
                {errors.street && <p className="text-xs text-[#93000a] mt-1">{errors.street}</p>}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                  Building / Apt #
                </label>
                <input
                  type="text"
                  value={formData.building}
                  onChange={(e) => handleInputChange('building', e.target.value)}
                  placeholder="Apt 4B"
                  className="w-full px-4 py-3 text-sm bg-[#fcfaf7] border border-[#e2ded9] text-[#151616] focus:outline-none focus:border-[#bc9c85]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.deliveryNotes}
                onChange={(e) => handleInputChange('deliveryNotes', e.target.value)}
                placeholder="Gate code or specific courier instructions..."
                className="w-full px-4 py-3 text-sm bg-[#fcfaf7] border border-[#e2ded9] text-[#151616] focus:outline-none focus:border-[#bc9c85]"
              />
            </div>
          </div>

          {/* SECTION 3: Shipping Method */}
          <div className="bg-white border border-[#e2ded9] p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="font-serif text-xl text-[#151616] uppercase tracking-wider font-light border-b border-[#e2ded9] pb-3">
              3. Delivery Options
            </h2>

            <label className="flex items-center justify-between p-4 border border-[#e2ded9] cursor-pointer hover:border-[#bc9c85] transition-colors">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="shippingMethod"
                  value="standard"
                  checked={formData.shippingMethod === 'standard'}
                  onChange={() => handleInputChange('shippingMethod', 'standard')}
                  className="accent-[#151616] w-4 h-4"
                />
                <div>
                  <p className="text-sm font-semibold text-[#151616]">Standard Nationwide Shipping</p>
                  <p className="text-xs text-gray-500">Delivering across Egypt (2 - 4 business days)</p>
                </div>
              </div>
              <span className="font-semibold text-sm text-[#151616]">EGY 50</span>
            </label>

            <label className="flex items-center justify-between p-4 border border-[#e2ded9] cursor-pointer hover:border-[#bc9c85] transition-colors">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="shippingMethod"
                  value="express"
                  checked={formData.shippingMethod === 'express'}
                  onChange={() => handleInputChange('shippingMethod', 'express')}
                  className="accent-[#151616] w-4 h-4"
                />
                <div>
                  <p className="text-sm font-semibold text-[#151616]">Express Courier (Next Day)</p>
                  <p className="text-xs text-gray-500">Fast delivery Cairo / Giza / Alexandria</p>
                </div>
              </div>
              <span className="font-semibold text-sm text-[#151616]">EGY 100</span>
            </label>
          </div>

          {/* SECTION 4: Payment Method */}
          <div className="bg-white border border-[#e2ded9] p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="font-serif text-xl text-[#151616] uppercase tracking-wider font-light border-b border-[#e2ded9] pb-3">
              4. Payment Method
            </h2>

            <label className="flex items-center space-x-3 p-4 border border-[#e2ded9] cursor-pointer hover:border-[#bc9c85]">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={formData.paymentMethod === 'cod'}
                onChange={() => handleInputChange('paymentMethod', 'cod')}
                className="accent-[#151616] w-4 h-4"
              />
              <div>
                <p className="text-sm font-semibold text-[#151616]">Cash on Delivery (COD)</p>
                <p className="text-xs text-gray-500">Pay cash directly to courier upon receiving your package</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-4 border border-[#e2ded9] cursor-pointer hover:border-[#bc9c85]">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={formData.paymentMethod === 'card'}
                onChange={() => handleInputChange('paymentMethod', 'card')}
                className="accent-[#151616] w-4 h-4"
              />
              <div>
                <p className="text-sm font-semibold text-[#151616]">Credit / Debit Card (Visa / Mastercard)</p>
                <p className="text-xs text-gray-500">Encrypted 256-bit secure online card payment</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-4 border border-[#e2ded9] cursor-pointer hover:border-[#bc9c85]">
              <input
                type="radio"
                name="paymentMethod"
                value="instapay"
                checked={formData.paymentMethod === 'instapay'}
                onChange={() => handleInputChange('paymentMethod', 'instapay')}
                className="accent-[#151616] w-4 h-4"
              />
              <div>
                <p className="text-sm font-semibold text-[#151616]">InstaPay / Vodafone Cash</p>
                <p className="text-xs text-gray-500">Direct mobile wallet transfer in Egypt</p>
              </div>
            </label>
          </div>

          {/* Place Order CTA Button */}
          <button
            type="submit"
            className="w-full bg-[#151616] hover:bg-[#bc9c85] text-white uppercase text-sm tracking-[0.2em] py-5 font-semibold transition-colors duration-300 shadow-md"
          >
            Place Order — {formatPrice(finalTotal)}
          </button>
        </form>

        {/* RIGHT COLUMN: Order Summary (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-[#e2ded9] p-6 sm:p-8 space-y-6 shadow-sm sticky top-24">
          <h2 className="font-serif text-xl text-[#151616] uppercase tracking-wider font-light border-b border-[#e2ded9] pb-3">
            Order Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})
          </h2>

          {/* Cart Product List */}
          <div className="divide-y divide-[#e2ded9] max-h-[350px] overflow-y-auto pr-1">
            {cart.map(({ product, quantity }) => (
              <div key={product.id} className="py-4 flex space-x-4 items-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-20 object-cover bg-gray-100 flex-shrink-0 border border-[#e2ded9]"
                />
                <div className="flex-grow">
                  <h3 className="text-sm font-medium text-[#151616]">{product.name}</h3>
                  <p className="text-xs text-gray-500">Qty: {quantity}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{product.brand}</p>
                </div>
                <span className="text-sm font-semibold text-[#151616]">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Promo Code Input */}
          <form onSubmit={handleApplyPromo} className="pt-2 border-t border-[#e2ded9]">
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-2">
              Promo Code / Discount
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.promoCode}
                onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                placeholder="Try: SHOV10"
                className="flex-grow px-3 py-2.5 text-sm bg-[#fcfaf7] border border-[#e2ded9] uppercase tracking-wider focus:outline-none focus:border-[#bc9c85]"
              />
              <button
                type="submit"
                className="bg-[#2c2a29] hover:bg-[#bc9c85] text-white text-xs uppercase tracking-widest px-4 font-semibold transition-colors"
              >
                Apply
              </button>
            </div>
            {discountMessage && (
              <p className={`text-xs mt-1.5 font-semibold ${appliedDiscount > 0 ? 'text-green-700' : 'text-[#93000a]'}`}>
                {discountMessage}
              </p>
            )}
          </form>

          {/* Pricing Totals Breakdown */}
          <div className="border-t border-[#e2ded9] pt-4 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-[#151616]">{formatPrice(cartSubtotal)}</span>
            </div>

            {appliedDiscount > 0 && (
              <div className="flex justify-between text-green-700 font-semibold">
                <span>Discount ({appliedDiscount}%)</span>
                <span>− {formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600">
              <span>Shipping (Egypt)</span>
              <span className="font-semibold text-[#151616]">{formatPrice(shippingCost)}</span>
            </div>

            <div className="border-t border-[#e2ded9] pt-4 flex justify-between items-baseline text-[#151616]">
              <span className="font-serif text-lg uppercase tracking-wider font-light">Total</span>
              <span className="font-serif text-2xl font-semibold text-[#bc9c85]">
                {formatPrice(finalTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
