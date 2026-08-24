export interface RawProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  categories?: string;
  image_url?: string;
}

let lastFetchTime = 0;

export const searchOpenFoodFacts = async (query: string, countryFilter = 'india'): Promise<RawProduct[]> => {
  const now = Date.now();
  // Basic rate limit: enforce 1 second between requests
  if (now - lastFetchTime < 1000) {
    await new Promise(resolve => setTimeout(resolve, 1000 - (now - lastFetchTime)));
  }
  lastFetchTime = Date.now();

  try {
    const url = new URL('https://world.openfoodfacts.org/cgi/search.pl');
    url.searchParams.append('search_terms', query);
    url.searchParams.append('search_simple', '1');
    url.searchParams.append('action', 'process');
    url.searchParams.append('json', '1');
    url.searchParams.append('page_size', '10');
    url.searchParams.append('fields', 'product_name,brands,categories,image_url,code');
    if (countryFilter) {
      url.searchParams.append('countries_tags', `en:${countryFilter}`);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'VoxCart/1.0 (Integration Test)'
      }
    });

    if (!response.ok) {
      console.error(`Open Food Facts API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return (data.products || []) as RawProduct[];
  } catch (error) {
    console.error('Network error calling Open Food Facts:', error);
    return []; // Return empty array on failure gracefully
  }
};
