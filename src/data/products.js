// Dynamic API client for PostgreSQL backend
const API_BASE_URL = 'http://localhost:3001/api';

// Fetch all products from PostgreSQL database
export async function fetchProductsFromDb(category = 'All') {
  try {
    const url = category && category !== 'All'
      ? `${API_BASE_URL}/products?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/products`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`API HTTP Error ${res.status}`);
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.error('Failed to fetch products from PostgreSQL backend API:', err);
    return [];
  }
}

// Search or discover products using PostgreSQL + Browser Agent API
export async function searchProductsApi(query) {
  if (!query || !query.trim()) return { products: [], isClothing: true, triggeredAgent: false };

  try {
    const url = `${API_BASE_URL}/products/search?q=${encodeURIComponent(query.trim())}`;
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
    console.error('Failed to search/discover products via API:', err);
    return { products: [], isClothing: true, triggeredAgent: false, error: err.message };
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

// Fallback exported products array (empty array to ensure legacy imports resolve safely)
export const products = [];
