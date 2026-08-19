import React from 'react';
import { useShop } from '../../context/ShopContext';
import { ShoVLogo } from './ShoVLogo';

export function MobileMenu() {
  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    navigateTo,
    userAccount,
    logoutUser,
    favorites,
    language,
    setLanguage
  } = useShop();

  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Dark transparent backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Full-height slide-out menu drawer */}
      <div className="relative w-5/6 max-w-xs sm:max-w-sm bg-[#fcfaf7] text-[#151616] h-full shadow-2xl p-6 flex flex-col justify-between z-10 transition-transform duration-300 ease-out overflow-y-auto">
        <div>
          {/* Header of Mobile Menu: Sho.V Mountain Logo & X Close Button */}
          <div className="flex justify-between items-center pb-5 border-b border-[#e2ded9]">
            <ShoVLogo />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-black transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main Navigation (HOME, SHOP >, CONTACT US, NEW IN, ABOUT) */}
          <nav className="flex flex-col font-sans uppercase text-xs tracking-[0.2em] font-semibold">
            {/* HOME */}
            <button
              onClick={() => { navigateTo('home'); setIsMobileMenuOpen(false); }}
              className="text-left py-4 border-b border-[#e2ded9] hover:text-[#bc9c85] transition-colors flex items-center justify-between"
            >
              <span>HOME</span>
            </button>

            {/* SHOP > */}
            <button
              onClick={() => { navigateTo('shop'); setIsMobileMenuOpen(false); }}
              className="text-left py-4 border-b border-[#e2ded9] hover:text-[#bc9c85] transition-colors flex items-center justify-between group"
            >
              <span>SHOP</span>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-[#bc9c85] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {/* CONTACT US */}
            <button
              onClick={() => { navigateTo('contact'); setIsMobileMenuOpen(false); }}
              className="text-left py-4 border-b border-[#e2ded9] hover:text-[#bc9c85] transition-colors flex items-center justify-between"
            >
              <span>CONTACT US</span>
            </button>

            {/* NEW IN */}
            <button
              onClick={() => { navigateTo('newin'); setIsMobileMenuOpen(false); }}
              className="text-left py-4 border-b border-[#e2ded9] hover:text-[#bc9c85] transition-colors flex items-center justify-between"
            >
              <span>NEW IN</span>
              <span className="bg-[#2c2a29] text-white text-[9px] px-1.5 py-0.5 font-bold uppercase">NEW</span>
            </button>

            {/* ABOUT */}
            <button
              onClick={() => { navigateTo('about'); setIsMobileMenuOpen(false); }}
              className="text-left py-4 border-b border-[#e2ded9] hover:text-[#bc9c85] transition-colors flex items-center justify-between"
            >
              <span>ABOUT</span>
            </button>
          </nav>

          {/* Account & Wish List Section */}
          <div className="mt-6 pt-2 border-t border-[#e2ded9] space-y-4">
            {userAccount.isLoggedIn ? (
              <>
                <button
                  onClick={() => { navigateTo('account'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left flex items-center space-x-3 text-xs uppercase tracking-wider font-medium text-[#151616] hover:text-[#bc9c85] transition-colors py-2"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 1 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <span>My Profile ({userAccount.name})</span>
                </button>

                <button
                  onClick={() => { logoutUser(); setIsMobileMenuOpen(false); }}
                  className="w-full text-left flex items-center space-x-3 text-xs uppercase tracking-wider font-medium text-red-700 hover:text-red-900 transition-colors py-2"
                >
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              /* Sign In */
              <button
                onClick={() => { navigateTo('account'); setIsMobileMenuOpen(false); }}
                className="w-full text-left flex items-center space-x-3 text-xs uppercase tracking-wider font-medium text-[#151616] hover:text-[#bc9c85] transition-colors py-2"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span>Sign In</span>
              </button>
            )}

            {/* My Wish List */}
            <button
              onClick={() => { navigateTo('wishlist'); setIsMobileMenuOpen(false); }}
              className="w-full text-left flex items-center justify-between text-xs uppercase tracking-wider font-medium text-[#151616] hover:text-[#bc9c85] transition-colors py-2"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <span>My Wish List</span>
              </div>
              {favorites.length > 0 && (
                <span className="bg-[#bc9c85] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {favorites.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Footer info at bottom of menu */}
        <div className="pt-6 mt-6 border-t border-[#e2ded9] text-xs uppercase tracking-wider text-gray-600 flex justify-between items-center">
          <button
            onClick={() => setLanguage(language === 'English' ? 'Arabic' : 'English')}
            className="hover:text-[#bc9c85] font-semibold"
          >
            Language: {language === 'English' ? 'English' : 'العربية'}
          </button>
          <span className="font-semibold bg-[#f3f0ec] px-2 py-0.5">Currency: EGY</span>
        </div>
      </div>
    </div>
  );
}
