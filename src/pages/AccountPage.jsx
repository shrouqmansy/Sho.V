import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { products } from '../data/products';
import { ProductCard } from '../components/ui/ProductCard';

export function AccountPage() {
  const { userAccount, loginUser, logoutUser, favorites, formatPrice, navigateTo, goBack } = useShop();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState(userAccount.email || '');
  const [password, setPassword] = useState(userAccount.savedPassword || '');
  const [name, setName] = useState(userAccount.name || '');
  const [rememberMe, setRememberMe] = useState(userAccount.rememberMe);

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(name || 'Sho.V Client', email, password, rememberMe);
  };

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  return (
    <main className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-8 md:py-16 flex-grow">
      {/* Stepback Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#e2ded9]">
        <button
          onClick={goBack}
          className="flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold text-[#151616] hover:text-[#bc9c85] transition-colors py-2 px-3 bg-[#f5f3f3] hover:bg-[#e9e8e7]"
        >
          <span>← Back</span>
        </button>
        <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
          Client Portal • Egypt
        </span>
      </div>

      {userAccount.isLoggedIn ? (
        /* Logged In Dashboard */
        <div className="space-y-12">
          {/* Header Summary */}
          <div className="bg-[#f7f4ee] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#bc9c85] font-semibold block mb-1">
                Welcome Back
              </span>
              <h1 className="font-serif text-3xl md:text-4xl text-[#151616]">{userAccount.name}</h1>
              <p className="text-sm text-gray-600 font-mono mt-1">{userAccount.email}</p>
            </div>
            <button
              onClick={logoutUser}
              className="bg-[#2c2a29] text-white uppercase text-xs tracking-widest py-3 px-8 hover:bg-[#93000a] transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Grid: Saved Info & Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Account Info */}
            <div className="bg-white border border-[#e2ded9] p-6 space-y-4">
              <h3 className="font-serif text-xl text-[#151616] pb-3 border-b border-[#e2ded9]">
                Saved Information
              </h3>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Client Name</p>
                <p className="text-sm font-medium text-[#151616] mt-0.5">{userAccount.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Email Address</p>
                <p className="text-sm font-medium text-[#151616] mt-0.5">{userAccount.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Default Shipping Address</p>
                <p className="text-sm text-gray-700 mt-0.5">15 El-Gezira St, Zamalek, Cairo, Egypt</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Auto Sign-in Preference</p>
                <p className="text-xs text-[#bc9c85] font-semibold mt-0.5">
                  {userAccount.rememberMe ? '✓ Saved for automatic direct login' : 'Disabled'}
                </p>
              </div>
            </div>

            {/* Order History Details */}
            <div className="lg:col-span-2 bg-white border border-[#e2ded9] p-6 space-y-6">
              <h3 className="font-serif text-xl text-[#151616] pb-3 border-b border-[#e2ded9]">
                Order Details & History (Egypt)
              </h3>
              {userAccount.orders.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">No orders placed yet.</p>
              ) : (
                <div className="space-y-4">
                  {userAccount.orders.map(order => (
                    <div key={order.id} className="border border-[#e2ded9] p-4 bg-[#fcfaf7]">
                      <div className="flex flex-wrap justify-between items-center pb-3 border-b border-[#e2ded9] mb-3 text-xs uppercase tracking-wider">
                        <span className="font-bold text-[#151616]">Order #{order.id}</span>
                        <span className="text-gray-500">{order.date}</span>
                        <span className="bg-[#bc9c85] text-white px-2 py-0.5 font-bold">{order.status}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{item.name} × {item.quantity}</span>
                            <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#e2ded9] flex justify-between items-center font-semibold text-sm">
                        <span>Total Paid</span>
                        <span className="text-[#151616]">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Saved Favorites List */}
          <div className="pt-8 border-t border-[#e2ded9]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-2xl text-[#151616]">Your Saved Wishlist ({favoriteProducts.length})</h3>
              <button
                onClick={() => navigateTo('wishlist')}
                className="text-xs uppercase tracking-widest text-[#bc9c85] font-semibold hover:underline"
              >
                View Full Wishlist →
              </button>
            </div>

            {favoriteProducts.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center bg-white border border-[#e2ded9]">
                You haven't saved any favorite items yet. Click the heart icon on any product to save it here.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {favoriteProducts.map(prod => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Sign In / Sign Up Form */
        <div className="max-w-md mx-auto py-12">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-widest text-[#bc9c85] font-semibold mb-2 block">
              Sho.V Client Account
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-[#151616] mb-3">
              {isSignUp ? 'Create Client Account' : 'Sign In'}
            </h1>
            <p className="text-sm text-gray-600">
              Save your credentials to sign in directly, track orders in Egypt, and save favorite pieces.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-[#e2ded9] p-8 space-y-6 shadow-sm">
            {isSignUp && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2 font-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#fcfaf7] border-b border-[#151616] py-3 px-2 text-sm focus:outline-none"
                  placeholder="e.g. Layla Ahmed"
                />
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2 font-semibold">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#fcfaf7] border-b border-[#151616] py-3 px-2 text-sm focus:outline-none"
                placeholder="name@domain.com"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2 font-semibold">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#fcfaf7] border-b border-[#151616] py-3 px-2 text-sm focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            {/* Requirement #5: Save password & mail to log in directly for next browsing */}
            <div className="flex items-center space-x-3 pt-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#151616] rounded-none border-gray-300"
              />
              <label htmlFor="rememberMe" className="text-xs text-gray-700 font-medium cursor-pointer">
                Save credentials for direct login next session
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#151616] hover:bg-[#bc9c85] text-white uppercase text-xs tracking-widest py-4 transition-colors font-medium"
            >
              {isSignUp ? 'Create Account & Sign In' : 'Sign In to Account'}
            </button>

            <div className="text-center pt-4 border-t border-[#e2ded9]">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs uppercase tracking-wider text-gray-600 hover:text-[#bc9c85] font-semibold"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create One"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
