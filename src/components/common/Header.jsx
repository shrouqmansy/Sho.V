import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { ShoVLogo } from './ShoVLogo';

export function Header() {
  const {
    activePage,
    navigateTo,
    cartCount,
    setIsCartOpen,
    setIsSearchOpen,
    setIsMobileMenuOpen,
    language,
    setLanguage,
    userAccount,
    favorites
  } = useShop();

  const { isAuthenticated, user, tenant } = useAuth();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const isHome = activePage === 'home';

  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigateTo('workspace');
    } else {
      navigateTo('login');
    }
  };

  return (
    <header
      className={`transition-all duration-300 py-3.5 px-3 sm:px-6 md:px-12 flex items-center justify-between w-full ${
        isHome
          ? 'absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/70 via-black/30 to-transparent text-white border-none'
          : 'sticky top-0 z-40 bg-[#fcfaf7] border-b border-[#e2ded9] text-[#151616]'
      }`}
    >
      {/* =================================================== */}
      {/* MOBILE / TABLET HEADER (lg:hidden)                  */}
      {/* =================================================== */}
      <div className="flex lg:hidden items-center justify-between w-full relative h-10 select-none">
        {/* LEFT: Hamburger Menu Button + Search Icon */}
        <div className="flex items-center space-x-1 sm:space-x-2 z-10 flex-shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1 sm:p-1.5 hover:opacity-70 transition-opacity focus:outline-none"
            aria-label="Open Navigation Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Search Icon on the left beside Hamburger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-1 hover:opacity-70 transition-opacity"
            title="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
        </div>

        {/* CENTER: Officially Centered Sho.V Brand Logo */}
        <button
          onClick={() => navigateTo('home')}
          className="absolute left-1/2 -translate-x-1/2 hover:opacity-80 transition-opacity focus:outline-none z-10 max-w-[45%] sm:max-w-none truncate"
        >
          <ShoVLogo isWhite={isHome} className="h-6 sm:h-7" />
        </button>

        {/* RIGHT: Action Icons (Account, Wishlist, Cart) */}
        <div className="flex items-center space-x-2 sm:space-x-3 z-10 flex-shrink-0">
          {/* Account Icon */}
          <button
            onClick={handleAccountClick}
            className={`hover:opacity-70 transition-opacity p-1 ${isAuthenticated ? 'text-[#bc9c85]' : ''}`}
            title={isAuthenticated ? `Workspace (${user?.name})` : "Sign In / Register"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </button>

          {/* Wishlist Heart Icon */}
          <button
            onClick={() => navigateTo('wishlist')}
            className="hover:opacity-70 transition-opacity relative p-1 text-[#151616]"
            title="Wishlist"
          >
            <svg className="w-5 h-5" fill={favorites.length > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold bg-[#93000a]">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="hover:opacity-70 transition-opacity relative p-1"
            title="Cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span className={`absolute -top-1 -right-1 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold ${isHome ? 'bg-[#bc9c85]' : 'bg-[#2c2a29]'}`}>
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* =================================================== */}
      {/* DESKTOP HEADER (hidden lg:flex)                     */}
      {/* =================================================== */}
      <div className="hidden lg:flex items-center justify-between w-full">
        {/* Brand Logo with Mountain Icon */}
        <div className="flex-shrink-0">
          <button
            onClick={() => navigateTo('home')}
            className="hover:opacity-80 transition-opacity focus:outline-none"
          >
            <ShoVLogo isWhite={isHome} />
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          className={`flex items-center space-x-6 xl:space-x-8 text-xs font-semibold uppercase tracking-widest ${
            isHome ? 'text-white' : 'text-[#151616]'
          }`}
        >
          <button
            onClick={() => navigateTo('shop')}
            className="hover-underline flex items-center relative group py-1"
          >
            Shop <span className="ml-1 text-[9px]">▼</span>
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2c2a29] text-white text-[8px] px-1.5 py-0.5 font-sans font-bold uppercase shadow-sm">
              NEW
            </span>
          </button>

          <button
            onClick={() => navigateTo('newin')}
            className="hover-underline flex items-center py-1"
          >
            New in <span className="ml-1 text-[9px]">▼</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => navigateTo('workspace')}
              className="hover-underline flex items-center py-1 text-[#bc9c85] font-bold"
            >
              Workspace <span className="ml-1 text-[9px]">▼</span>
            </button>
          )}

          <button
            onClick={() => navigateTo('about')}
            className="hover-underline flex items-center py-1"
          >
            About <span className="ml-1 text-[9px]">▼</span>
          </button>

          <button
            onClick={() => navigateTo('contact')}
            className="hover-underline flex items-center py-1"
          >
            Contact <span className="ml-1 text-[9px]">▼</span>
          </button>
        </nav>

        {/* Right Controls */}
        <div
          className={`flex items-center space-x-6 text-xs uppercase tracking-wider ${
            isHome ? 'text-white' : 'text-[#151616]'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="hover-underline flex items-center py-1 font-semibold focus:outline-none"
              >
                {language === 'English' ? 'English' : 'العربية'} <span className="ml-1 text-[9px]">▼</span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white text-[#151616] border border-[#e2ded9] shadow-lg py-1 z-50">
                  <button
                    onClick={() => { setLanguage('English'); setIsLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#f3f0ec] ${language === 'English' ? 'text-[#bc9c85]' : ''}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => { setLanguage('Arabic'); setIsLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#f3f0ec] ${language === 'Arabic' ? 'text-[#bc9c85]' : ''}`}
                  >
                    العربية
                  </button>
                </div>
              )}
            </div>

            <span
              className={`font-semibold tracking-widest px-2 py-0.5 border ${
                isHome
                  ? 'bg-white/10 border-white/20 text-white backdrop-blur-sm'
                  : 'bg-[#f3f0ec] border-transparent text-[#151616]'
              }`}
            >
              EGY
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleAccountClick}
              className={`hover:text-[#bc9c85] transition-colors p-1 flex items-center space-x-1.5 ${isAuthenticated ? 'text-[#bc9c85]' : ''}`}
              title={isAuthenticated ? `Workspace (${user?.name})` : "Sign In / Register"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              {isAuthenticated && (
                <span className="text-[10px] uppercase font-bold tracking-wider hidden xl:inline">
                  {user?.name?.split(' ')[0]}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="hover:text-[#bc9c85] transition-colors p-1"
              title="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>

            {/* Heart Wishlist Icon beside Search Icon */}
            <button
              onClick={() => navigateTo('wishlist')}
              className="hover:text-[#bc9c85] transition-colors relative p-1"
              title="Wishlist"
            >
              <svg className="w-5 h-5" fill={favorites.length > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold bg-[#93000a]">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="hover:text-[#bc9c85] transition-colors relative p-1"
              title="Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <span className={`absolute -top-1 -right-1.5 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ${isHome ? 'bg-[#bc9c85]' : 'bg-[#2c2a29]'}`}>
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
