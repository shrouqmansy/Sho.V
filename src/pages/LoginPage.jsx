import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';

export function LoginPage({ onNavigateRegister, onNavigateForgot, onLoginSuccess }) {
  const { login, authError } = useAuth();
  const { navigateTo } = useShop();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !password) {
      setFormError('Please enter both your email address and password');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigateTo('home');
      }
    }
  };

  return (
    <main className="w-full max-w-[1200px] mx-auto px-4 py-12 md:py-20 flex justify-center items-center flex-grow">
      <div className="w-full max-w-md bg-white border border-[#e2ded9] p-8 sm:p-12 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#bc9c85] font-semibold block mb-2">
            Sho.V Workspace Access
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#151616] tracking-wider uppercase font-light">
            Sign In
          </h1>
          <p className="text-xs text-gray-500 mt-2 font-light">
            Enter your credentials to access your isolated workspace.
          </p>
        </div>

        {/* Error Feedback */}
        {(formError || authError) && (
          <div className="mb-6 bg-[#93000a]/10 border border-[#93000a]/30 p-3 text-center text-xs text-[#93000a]">
            {formError || authError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#151616] font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-4 py-3 text-xs border border-[#e2ded9] focus:border-[#151616] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] uppercase tracking-widest text-[#151616] font-semibold">
                Password
              </label>
              {onNavigateForgot && (
                <button
                  type="button"
                  onClick={onNavigateForgot}
                  className="text-[10px] uppercase tracking-wider text-gray-500 hover:text-[#bc9c85] transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-xs border border-[#e2ded9] focus:border-[#151616] focus:outline-none transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-gray-400 hover:text-[#151616]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#151616]"
              />
              <span className="text-xs text-gray-600 font-light">Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#151616] hover:bg-[#bc9c85] text-white py-4 text-xs font-semibold uppercase tracking-[0.25em] transition-colors shadow-md disabled:opacity-50"
          >
            {isSubmitting ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-[#e2ded9] text-center">
          <p className="text-xs text-gray-500 font-light">
            Don't have a Sho.V workspace?{' '}
            <button
              onClick={onNavigateRegister}
              className="font-semibold text-[#151616] hover:text-[#bc9c85] underline transition-colors"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
