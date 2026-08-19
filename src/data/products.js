import { fallbackProducts } from './fallbackProducts';

// Dynamic API client for PostgreSQL backend
export const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location?.hostname && window.location.hostname !== 'localhost') {
    return `${window.location.protocol}//${window.location.hostname}:3001/api`;
  }
  return 'http://localhost:3001/api';
};

// Fetch all products from PostgreSQL database with fallback dataset resilience
export async function fetchProductsFromDb(category = 'All') {
  try {
    const baseUrl = getApiBaseUrl();
    const url = category && category !== 'All'
      ? `${baseUrl}/products?category=${encodeURIComponent(category)}`
      : `${baseUrl}/products`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`API HTTP Error ${res.status}`);
    const data = await res.json();
    if (data.products && data.products.length > 0) {
      return data.products;
    }
  } catch (err) {
    console.warn('API fetch unavailable, using embedded fallback product dataset:', err.message);
  }

  // Client-side fallback if API is unreachable or DB is empty
  if (category && category !== 'All') {
    return fallbackProducts.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
  }
  return fallbackProducts;
}

// Search or discover products using PostgreSQL + Browser Agent API
export async function searchProductsApi(query) {
  if (!query || !query.trim()) return { products: [], isClothing: true, triggeredAgent: false };

  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/products/search?q=${encodeURIComponent(query.trim())}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API HTTP Error ${res.status}`);
    const data = await res.json();
    return {
      products: data.products || [],
      isClothing: data.isClothing !== undefined ? data.isClothing : true,
      triggeredAgent: Boolean(data.triggeredAgent),
      source: data.source || 'database',
      message: data.message || null
    };
  } catch (err) {
    console.warn('Failed to search products via API, using fallback search:', err.message);
    const qLower = query.trim().toLowerCase();
    const matched = fallbackProducts.filter(p => p.name.toLowerCase().includes(qLower) || p.category.toLowerCase().includes(qLower));
    return { products: matched, isClothing: true, triggeredAgent: false, error: err.message };
  }
}

// Collections categories mapping
export const collections = [
  { id: 'col-hoodies', name: 'Hoodies', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop' },
  { id: 'col-tshirts', name: 'T-shirts', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop' },
  { id: 'col-cargos', name: 'Cargos', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000&auto=format&fit=crop' },
  { id: 'col-knithoodies', name: 'Knit-Hoodies', image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop' },
  { id: 'col-denim', name: 'DENIM', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000&auto=format&fit=crop' }
];

// Fallback exported products array
export const products = fallbackProducts;
