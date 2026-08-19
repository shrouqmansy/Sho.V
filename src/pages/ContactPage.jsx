import React, { useState } from 'react';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-12 md:py-20 flex-grow">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-[#bc9c85] font-semibold mb-2 block">
          Get in Touch
        </span>
        <h1 className="font-serif text-4xl md:text-5xl text-[#151616] mb-4">Contact Sho.V</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Our client advisory team is available to assist you with styling recommendations, order details, or bespoke inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
        {/* Contact Information */}
        <div className="space-y-8">
          <div>
            <h3 className="font-serif text-xl text-[#151616] mb-2">Atelier & Showroom</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Zamalek Island, 15 El-Gezira St.<br />
              Cairo, Egypt
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl text-[#151616] mb-2">Client Concierge</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Email: concierge@shov-fashion.com<br />
              Phone: +20 (2) 2736-9000<br />
              Hours: Mon – Sat, 10:00 – 18:00 (EET)
            </p>
          </div>

          <div className="pt-6 border-t border-[#e2ded9]">
            <h4 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">Press & Buyers</h4>
            <p className="text-sm text-gray-600">press@shov-fashion.com</p>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          {submitted ? (
            <div className="p-8 bg-[#f5f1eb] border border-[#e2ded9] text-center">
              <h3 className="font-serif text-2xl text-[#151616] mb-3">Thank You</h3>
              <p className="text-sm text-gray-600">
                Your message has been received by our client concierge team. We will respond within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2 font-semibold">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#fcfaf7] border-b border-[#151616] py-3 text-sm focus:outline-none"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2 font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#fcfaf7] border-b border-[#151616] py-3 text-sm focus:outline-none"
                  placeholder="name@domain.com"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2 font-semibold">Message</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#fcfaf7] border border-[#e2ded9] p-3 text-sm focus:outline-none focus:border-[#151616]"
                  placeholder="How may we assist you?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#151616] hover:bg-[#bc9c85] text-white uppercase text-xs tracking-widest py-4 transition-colors font-medium"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
