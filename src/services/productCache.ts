import { db } from '../config/firebase';
import { Product } from '../models/types';

const PRODUCTS_COLLECTION = 'products';

export interface GetProductsResponse {
  products: Product[];
  fromCache: boolean;
}

export const getOrFetchProducts = async (query: string): Promise<GetProductsResponse> => {
  const normalizedQuery = query.toLowerCase().trim();

  // 1. Check local cache (Firestore 'products' collection)
  // Fetching all products to filter in-memory since Firestore doesn't have native case-insensitive substring search.
  const snapshot = await db.collection(PRODUCTS_COLLECTION).get();
  const cachedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  
  let matchedCached = cachedProducts;
  
  // If query is "grocery" (the default for 'All') or empty, we just return a mix of items
  if (normalizedQuery && normalizedQuery !== 'grocery') {
    const queryWords = normalizedQuery.split(/\s+/);
    matchedCached = cachedProducts.filter(p => {
      const name = p.name.toLowerCase();
      const cat = p.category.toLowerCase();
      return queryWords.every(word => name.includes(word) || cat.includes(word));
    });
  }

  // Shuffle the results slightly for variety if it's the "All" category
  if (normalizedQuery === 'grocery') {
    matchedCached = matchedCached.sort(() => Math.random() - 0.5);
  }

  // SCOPE DECISION: 
  // We are completely disabling the Open Food Facts (external API) fallback here.
  // The app will now ONLY serve products from our deterministic, hand-curated Indian grocery catalog.
  // This ensures consistently high-quality imagery (via Unsplash), exact realistic pricing in INR, 
  // and prevents the UI from degrading with low-quality or missing metadata from live external results.
  return {
    products: matchedCached.slice(0, 30), // Return up to 30 items for the marketplace
    fromCache: true
  };
};
