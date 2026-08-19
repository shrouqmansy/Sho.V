import React, { useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="py-20 px-6 md:px-12 bg-[#f5f1eb] text-center border-t border-[#e2ded9]">
      <div className="max-w-xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-gray-500 mb-3 block font-semibold">
          Stay Connected
        </span>
        <h2 className="font-serif text-3xl md:text-4xl mb-4 text-[#151616]">Join the Sho.V Community</h2>
        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
          Subscribe to receive private collection previews, quiet luxury editorial notes, and exclusive events.
        </p>

        {subscribed ? (
          <div className="p-4 bg-[#2c2a29] text-white text-xs uppercase tracking-widest">
            Thank you for subscribing to Sho.V.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder="Enter your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border border-[#e2ded9] px-4 py-3 text-xs w-full focus:outline-none focus:border-[#151616]"
            />
            <button
              type="submit"
              className="bg-[#2c2a29] hover:bg-[#bc9c85] text-white uppercase text-xs tracking-widest px-8 py-3 transition-colors duration-300 whitespace-nowrap font-medium"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
