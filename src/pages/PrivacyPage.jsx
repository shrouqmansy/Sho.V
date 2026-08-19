import React from 'react';
import { useShop } from '../context/ShopContext';

export function PrivacyPage() {
  const { goBack } = useShop();

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
          Legal & Compliance
        </span>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center">
          <span className="text-xs uppercase tracking-widest text-[#bc9c85] font-semibold mb-2 block">
            Data Protection
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-[#151616] mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            Sho.V is committed to safeguarding your personal information and respecting your privacy rights across all interactions.
          </p>
        </div>

        <div className="bg-white border border-[#e2ded9] p-8 md:p-12 space-y-8 shadow-sm text-sm text-gray-600 leading-relaxed">
          <section>
            <h2 className="font-serif text-xl text-[#151616] mb-3">1. Information We Collect</h2>
            <p>
              When you browse or interact with Sho.V, we collect information necessary to fulfill your orders and personalize your luxury experience:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Contact details (Name, email address, phone number, delivery address in Egypt).</li>
              <li>Account credentials (if you choose to save login info for seamless browsing).</li>
              <li>Wishlist preferences and browsing history on Sho.V.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#151616] mb-3">2. How We Use Your Data</h2>
            <p>
              Your personal data is strictly used for order dispatch within Egypt, account authentication, customer concierge support, and opted-in newsletter updates. We do not sell or rent your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#151616] mb-3">3. Data Security & Storage</h2>
            <p>
              We implement industry-standard encryption protocols to protect your personal details against unauthorized access. Account credentials saved for automatic direct login are stored securely on your client device.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#151616] mb-3">4. Client Rights & Contacts</h2>
            <p>
              You have the right to request access to, correction of, or deletion of your personal data at any time. For privacy inquiries, please contact our Legal Concierge at <strong>legal@shov-fashion.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
