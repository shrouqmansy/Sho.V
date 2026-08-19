import React, { useState } from 'react';

export function ForgotPasswordPage({ onNavigateLogin }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <main className="w-full max-w-[1200px] mx-auto px-4 py-12 md:py-20 flex justify-center items-center flex-grow">
      <div className="w-full max-w-md bg-white border border-[#e2ded9] p-8 sm:p-12 shadow-sm">
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#bc9c85] font-semibold block mb-2">
            Account Recovery
          </span>
          <h1 className="font-serif text-3xl text-[#151616] tracking-wider uppercase font-light">
            Reset Password
          </h1>
          <p className="text-xs text-gray-500 mt-2 font-light">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <p className="text-xs text-gray-700 font-light">
              Recovery instructions have been dispatched to <strong className="font-semibold text-[#151616]">{email}</strong>.
            </p>
            <button
              onClick={onNavigateLogin}
              className="mt-4 bg-[#151616] text-white px-6 py-3 uppercase text-xs tracking-widest font-semibold hover:bg-[#bc9c85] transition-colors"
            >
              Return to Login
            </button>
          </div>
        ) : (
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

            <button
              type="submit"
              className="w-full bg-[#151616] hover:bg-[#bc9c85] text-white py-4 text-xs font-semibold uppercase tracking-[0.25em] transition-colors shadow-md"
            >
              Send Reset Instructions
            </button>

            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={onNavigateLogin}
                className="text-xs text-gray-500 hover:text-[#151616] underline transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
