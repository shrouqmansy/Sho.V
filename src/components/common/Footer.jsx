import React from 'react';
import { useShop } from '../../context/ShopContext';

export function Footer() {
  const { activePage, navigateTo } = useShop();

  const isHome = activePage === 'home';

  // =========================================================
  // SUBPAGE COMPACT FOOTER (for non-home pages)
  // =========================================================
  if (!isHome) {
    return (
      <footer className="bg-[#2c2a29] text-white py-6 px-6 md:px-12 border-t border-[#e2ded9]">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center text-[11px] text-gray-400 gap-4">
          {/* Brand & Simplified Delivery Info */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateTo('home')}
              className="font-serif text-xl tracking-widest uppercase text-white hover:opacity-80 transition-opacity"
            >
              Sho.V
            </button>
            <span className="text-gray-600">|</span>
            <span className="uppercase tracking-widest text-[10px] text-gray-300 font-semibold">
              Delivering across Egypt
            </span>
          </div>

          {/* Compact Links */}
          <div className="flex items-center space-x-6 text-[10px] uppercase tracking-wider">
            <button onClick={() => navigateTo('shipping')} className="hover:text-white transition-colors">
              Shipping & Returns
            </button>
            <button onClick={() => navigateTo('privacy')} className="hover:text-white transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => navigateTo('contact')} className="hover:text-white transition-colors">
              Contact
            </button>
            <button onClick={() => navigateTo('account')} className="hover:text-white transition-colors">
              Account
            </button>
          </div>

          {/* Copyright & Currency */}
          <p className="text-[10px] text-gray-500">
            © 2024 Sho.V • EGY
          </p>
        </div>
      </footer>
    );
  }

  // =========================================================
  // MAIN HOMEPAGE FULL DETAILED FOOTER
  // =========================================================
  return (
    <footer className="bg-[#2c2a29] text-white pt-16 pb-8 px-6 md:px-12 border-t border-[#e2ded9]">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Brand & Mission */}
        <div className="lg:col-span-2">
          <button
            onClick={() => navigateTo('home')}
            className="font-serif text-3xl tracking-widest uppercase block mb-6 text-white text-left hover:opacity-80 transition-opacity"
          >
            Sho.V
          </button>
          <p className="text-xs text-gray-400 mb-6 max-w-sm leading-relaxed">
            Elevating everyday essentials through intentional design, quiet luxury, and timeless craftsmanship.
          </p>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
            Delivering Exclusively across Egypt (Cairo • Alexandria • Delta • Red Sea)
          </p>
        </div>

        {/* Links Column 1 */}
        <div>
          <h4 className="font-serif text-lg mb-6 tracking-wide">Shop</h4>
          <ul className="space-y-3 text-xs uppercase tracking-wider text-gray-400">
            <li>
              <button onClick={() => navigateTo('shop')} className="hover:text-white transition-colors">
                Shop All
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('newin')} className="hover:text-white transition-colors">
                New In
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('sale')} className="hover:text-white transition-colors">
                Sale
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('wishlist')} className="hover:text-white transition-colors text-[#bc9c85]">
                ♥ My Wishlist
              </button>
            </li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h4 className="font-serif text-lg mb-6 tracking-wide">Information</h4>
          <ul className="space-y-3 text-xs uppercase tracking-wider text-gray-400">
            <li>
              <button onClick={() => navigateTo('about')} className="hover:text-white transition-colors">
                About Us
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('contact')} className="hover:text-white transition-colors">
                Contact
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('shipping')} className="hover:text-white transition-colors">
                Shipping & Returns
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('privacy')} className="hover:text-white transition-colors">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('account')} className="hover:text-white transition-colors">
                Client Account
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
        <p>© 2024 Sho.V. All rights reserved. • Currency: EGY</p>
        <div className="flex space-x-6 mt-4 md:mt-0 uppercase tracking-widest text-[10px]">
          <a href="#instagram" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Instagram</a>
          <a href="#facebook" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Facebook</a>
          <a href="#pinterest" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Pinterest</a>
        </div>
      </div>
    </footer>
  );
}
