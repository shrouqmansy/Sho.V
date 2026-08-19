import React from 'react';
import { HeroSection } from '../components/sections/HeroSection';
import { CategoryCarousel } from '../components/sections/CategoryCarousel';
import { EditorialBanner } from '../components/sections/EditorialBanner';
import { BestSellers } from '../components/sections/BestSellers';
import { RecommendationSection } from '../components/common/RecommendationSection';
import { Newsletter } from '../components/sections/Newsletter';

export function HomePage() {
  return (
    <main className="flex-grow bg-[#fcfaf7]">
      {/* Hero Section */}
      <HeroSection />

      {/* 1. Category Carousel (Revolves in a circle with category names and arrows) */}
      <CategoryCarousel />

      {/* 2. Permanent Unique Attention-Grabbing Editorial Photos */}
      <EditorialBanner />

      {/* 3. OUR BEST SELLERS */}
      <BestSellers />

      {/* 4. AI PERSONALIZED RECOMMENDATIONS FOR YOU */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-12">
        <RecommendationSection
          title="Recommended For You"
          subtitle="Curated AI selections tailored to your browsing style and wishlist"
          type="for_you"
          limit={8}
        />
      </div>

      {/* 5. Community Newsletter */}
      <Newsletter />
    </main>
  );
}
