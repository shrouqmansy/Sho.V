import React from 'react';
import { useShop } from '../context/ShopContext';

export function ShippingPage() {
  const { goBack, navigateTo } = useShop();

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
          Customer Care • Egypt
        </span>
      </div>

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Page Title */}
        <div className="text-center">
          <span className="text-xs uppercase tracking-widest text-[#bc9c85] font-semibold mb-2 block">
            Delivery & Policy
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-[#151616] mb-4">Shipping & Returns</h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            Sho.V delivers exclusively within Egypt. We adhere to Egyptian Consumer Protection standards for seamless nationwide delivery and easy returns.
          </p>
        </div>

        {/* Shipping Table & Details */}
        <div className="bg-white border border-[#e2ded9] p-8 space-y-6 shadow-sm">
          <h2 className="font-serif text-2xl text-[#151616] border-b border-[#e2ded9] pb-4">
            Egypt Shipping Destinations & Delivery Times
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#e2ded9] bg-[#f7f4ee]">
                  <th className="py-3 px-4 uppercase text-xs tracking-wider text-gray-700">Region in Egypt</th>
                  <th className="py-3 px-4 uppercase text-xs tracking-wider text-gray-700">Delivery Time</th>
                  <th className="py-3 px-4 uppercase text-xs tracking-wider text-gray-700">Shipping Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2ded9]">
                <tr>
                  <td className="py-3 px-4 font-medium">Cairo & Giza Metropolis</td>
                  <td className="py-3 px-4 text-gray-600">2 – 3 Business Days</td>
                  <td className="py-3 px-4 text-gray-600">EGY 120 (Complimentary over EGY 4,000)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Alexandria & Delta Governorates</td>
                  <td className="py-3 px-4 text-gray-600">3 – 4 Business Days</td>
                  <td className="py-3 px-4 text-gray-600">EGY 150</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Red Sea, Sinai & Upper Egypt</td>
                  <td className="py-3 px-4 text-gray-600">4 – 5 Business Days</td>
                  <td className="py-3 px-4 text-gray-600">EGY 180</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[#fcfaf7] border-l-4 border-[#bc9c85] text-xs text-gray-600 leading-relaxed">
            <strong>Note:</strong> All shipments are dispatched via tracked courier partners in Egypt. You will receive an SMS confirmation with delivery driver details on the day of delivery.
          </div>
        </div>

        {/* Return & Exchange Policy */}
        <div className="bg-white border border-[#e2ded9] p-8 space-y-6 shadow-sm">
          <h2 className="font-serif text-2xl text-[#151616] border-b border-[#e2ded9] pb-4">
            14-Day Returns & Exchanges Standard
          </h2>

          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>
              We want you to be completely delighted with your Sho.V piece. In accordance with Egyptian Consumer Protection Law No. 181 of 2018, you may return or exchange eligible items within <strong>14 days of delivery</strong>.
            </p>

            <h3 className="font-serif text-lg text-[#151616] font-semibold pt-2">Return Conditions</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Garments must be unworn, unwashed, and undamaged with all original Sho.V security tags intact.</li>
              <li>Items must be returned in their original luxury box or packaging.</li>
              <li>Sale or promotional items are eligible for exchange or store credit within 7 days.</li>
            </ul>

            <h3 className="font-serif text-lg text-[#151616] font-semibold pt-2">How to Initiate a Return</h3>
            <p>
              Contact our Client Concierge at <strong>concierge@shov-fashion.com</strong> or call <strong>+20 (2) 2736-9000</strong>. Our courier will schedule a doorstep collection at your address anywhere in Egypt.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
