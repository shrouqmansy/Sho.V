import React from 'react';

export function EditorialBanner() {
  return (
    <section className="w-full p-0 m-0 overflow-hidden border-b border-[#e2ded9]">
      {/* 1. First Provided Image: Cream Embroidered Blouse (Full Width, Complete Face & Composition Visible) */}
      <div className="w-full relative p-0 m-0 overflow-hidden bg-[#fafafa]">
        <img
          src="/hero-lookbook-1.jpg"
          alt="Sho.V Quiet Luxury Editorial Lookbook 1"
          className="w-full h-auto block border-0 p-0 m-0 object-contain object-top"
        />
      </div>

      {/* 2. Second Provided Image: Cream Knit Bench Lookbook (Full Width, Complete Face & Composition Visible) */}
      <div className="w-full relative p-0 m-0 overflow-hidden bg-[#2d2825]">
        <img
          src="/hero-lookbook-2.jpg"
          alt="Sho.V Quiet Luxury Editorial Lookbook 2"
          className="w-full h-auto block border-0 p-0 m-0 object-contain object-top"
        />
      </div>
    </section>
  );
}
