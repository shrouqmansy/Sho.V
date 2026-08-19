import React, { useState, useEffect } from 'react';
import { ProductCard } from '../ui/ProductCard';
import { useAuth } from '../../context/AuthContext';

export function RecommendationSection({
  title = "Recommended For You",
  subtitle = "Curated AI recommendations matching your style profile",
  type = "for_you", // 'for_you', 'similar', 'wishlist', 'history', 'trending'
  productId = null,
  limit = 8
}) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get or create persistent session_id from localStorage
  const getSessionId = () => {
    let sid = localStorage.getItem('shov_recommendation_session_id');
    if (!sid) {
      sid = `sess_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('shov_recommendation_session_id', sid);
    }
    return sid;
  };

  useEffect(() => {
    async function fetchRecommendations() {
      setIsLoading(true);
      const sessionId = getSessionId();
      const userId = user ? user.id : '';

      let endpoint = `http://localhost:3001/api/recommendations/for-you?sessionId=${sessionId}&limit=${limit}`;

      if (type === 'similar' && productId) {
        endpoint = `http://localhost:3001/api/recommendations/similar/${productId}?sessionId=${sessionId}&limit=${limit}`;
      } else if (type === 'wishlist') {
        endpoint = `http://localhost:3001/api/recommendations/from-wishlist?sessionId=${sessionId}&limit=${limit}`;
      } else if (type === 'history') {
        endpoint = `http://localhost:3001/api/recommendations/from-history?sessionId=${sessionId}&limit=${limit}`;
      } else if (type === 'trending') {
        endpoint = `http://localhost:3001/api/recommendations/trending?limit=${limit}`;
      }

      if (userId) {
        endpoint += `&userId=${userId}`;
      }

      try {
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.recommendations) {
            setRecommendations(data.recommendations);
          }
        }
      } catch (err) {
        console.warn(`[RecommendationSection Error] Type ${type}:`, err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, [type, productId, user, limit]);

  if (!isLoading && recommendations.length === 0) {
    return null;
  }

  return (
    <section className="w-full my-12 py-10 border-t border-[#e2ded9]">
      {/* Section Header */}
      <div className="text-center mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#bc9c85] font-semibold block mb-2">
          AI Personalized Selection
        </span>
        <h2 className="font-serif text-3xl md:text-4xl text-[#151616] tracking-wider uppercase font-light">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-2 font-light max-w-lg mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* Grid of Recommendation Items */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-100 aspect-[3/4] border border-gray-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-8 sm:gap-y-12">
          {recommendations.map(rec => (
            <div key={rec.product.id} className="relative group">
              {/* Optional AI Match Reason Badge */}
              {rec.reason && (
                <div className="absolute top-2 left-2 z-20 bg-[#151616]/90 text-white text-[9px] px-2 py-0.5 font-sans font-medium uppercase tracking-wider shadow-sm pointer-events-none">
                  {rec.reason}
                </div>
              )}

              {/* Standard Sho.V ProductCard Component */}
              <ProductCard product={rec.product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
