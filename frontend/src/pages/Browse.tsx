import React, { useState, useEffect, useMemo } from 'react';
import { Package } from 'lucide-react';
import { formatPrice } from '../utils/currency';

import { apiClient, type BackendProduct } from '../api/client';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  desc: string;
}

interface BrowseProps {
  categories: string[];
  activeCategory: string;
  onSetCategory: (cat: string) => void;
  onAdd: (product: Product) => void;

  cartItems: any[];
}

export default function Browse({ categories, activeCategory, onSetCategory, onAdd, cartItems }: BrowseProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Relevance');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [realProducts, setRealProducts] = useState<BackendProduct[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce the search query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch when category OR debounced search changes
  useEffect(() => {
    const query = debouncedSearch.trim() !== ''
      ? debouncedSearch.trim()
      : activeCategory === 'All' ? 'grocery' : activeCategory;

    setIsLoading(true);
    setFetchError(null);

    apiClient.searchProducts(query)
      .then(data => setRealProducts(data))
      .catch(() => setFetchError('Failed to load products. Please try again.'))
      .finally(() => setIsLoading(false));
  }, [activeCategory, debouncedSearch]);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = realProducts.filter(p => {
      // the backend already filters by query/category somewhat, but we apply local text search if any
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const min = parseFloat(priceMin);
      const max = parseFloat(priceMax);
      // p.price could be null if it's not a BackendProduct from mock, but all BackendProduct's from products cache have price
      const matchesMin = isNaN(min) || (p.price != null && p.price >= min);
      const matchesMax = isNaN(max) || (p.price != null && p.price <= max);
      
      return matchesSearch && matchesMin && matchesMax;
    });

    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'Name: A to Z') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return result;
  }, [realProducts, searchQuery, priceMin, priceMax, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    onSetCategory('All');
    setPriceMin('');
    setPriceMax('');
    setSortBy('Relevance');
  };

  const renderProductImage = (url: string | null | undefined, name: string) => {
    if (url) {
      return <img src={url} alt={name} className="object-cover w-full h-full mix-blend-multiply p-4" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x400/E8F5E9/2E7D32?text=${encodeURIComponent(name.split(' ')[0])}`; }} />;
    }
    return (
      <div className="w-full h-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
        <Package className="w-8 h-8 opacity-60" />
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-section-gap w-full min-h-screen pb-24 md:pb-8 pt-4 md:pt-0 entrance-motion">
      
      {/* ══════════════════════════════════════════════════
          MOBILE HEADER & FILTER BAR (Sticky)
      ══════════════════════════════════════════════════ */}
      <div className="md:hidden sticky top-14 z-30 bg-surface/95 backdrop-blur-sm pt-2 pb-4 px-container-margin border-b border-surface-variant mb-4 -mx-container-margin px-container-margin">
        <div className="flex justify-between items-center mb-4 pt-2">
          <h1 className="font-display text-display text-primary tracking-tight">Marketplace</h1>
        </div>

      {/* Mobile Search */}
        <div className="relative mb-3">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-10 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-error">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 -mx-container-margin px-container-margin">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => onSetCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-label-bold transition-colors flex-shrink-0 ${
                activeCategory === cat 
                ? 'bg-primary text-on-primary border border-primary' 
                : 'bg-surface-container-lowest text-on-surface border border-outline-variant hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          DESKTOP LEFT SIDEBAR: CATEGORIES
      ══════════════════════════════════════════════════ */}
      <aside className="hidden md:block w-48 shrink-0 space-y-stack-sm p-4 rounded-xl sticky top-[100px] self-start h-fit bg-surface-container-lowest border border-outline-variant/30">
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-stack-md">Categories</h3>
        <ul className="space-y-stack-xs font-body-sm text-body-sm">
          {categories.map(cat => {
            const icons: Record<string, string> = {
              'All': 'apps',
              'Produce': 'local_florist',
              'Dairy': 'water_drop',
              'Bakery': 'bakery_dining',
              'Snacks': 'icecream',
              'Beverages': 'emoji_food_beverage',
              'Meat': 'kebab_dining',
              'Pantry': 'kitchen'
            };
            const icon = icons[cat] || 'category';
            const isActive = activeCategory === cat;
            
            return (
              <li key={cat}>
                <button 
                  onClick={() => onSetCategory(cat)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    isActive 
                    ? 'bg-primary-container text-on-primary-container font-medium' 
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  {cat}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* ══════════════════════════════════════════════════
          RIGHT COLUMN: RESULTS & GRID
      ══════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        
        {/* Page Header, Search & Filters (Desktop) */}
        <div className="mb-section-gap p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hidden md:block">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="font-display text-display text-on-surface">Marketplace</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {isLoading ? 'Loading...' : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            {/* Desktop Search Bar */}
            <div className="relative w-full max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search milk, dal, atta..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-surface border border-outline-variant rounded-xl text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                autoFocus={false}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-stack-sm border-t border-outline-variant/30 pt-4">
            <div className="flex items-center gap-2 bg-surface border border-outline-variant/50 rounded-lg px-3 py-1.5 focus-within:border-primary">
              <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Sort:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none outline-none font-body-sm text-body-sm text-on-surface p-0 pr-6 focus:ring-0 cursor-pointer"
              >
                <option>Relevance</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Name: A to Z</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 bg-surface border border-outline-variant/50 rounded-lg px-3 py-1.5">
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">payments</span>
              <input 
                type="number" 
                placeholder="Min" 
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-16 bg-transparent border-none p-0 text-body-sm focus:ring-0 text-center placeholder:text-on-surface-variant" 
              />
              <span className="text-on-surface-variant">-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-16 bg-transparent border-none p-0 text-body-sm focus:ring-0 text-center placeholder:text-on-surface-variant" 
              />
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden px-container-margin mb-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between py-2 px-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-body-sm text-on-surface font-medium"
          >
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">tune</span> Sort &amp; Filter</span>
            <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}>expand_more</span>
          </button>
          
          {showFilters && (
            <div className="mt-2 p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-lg shadow-sm">
              <div className="mb-4">
                <h4 className="text-label-bold text-on-surface-variant uppercase tracking-wide mb-2">Sort By</h4>
                <div className="flex flex-wrap gap-2">
                  {['Relevance', 'Price: Low to High', 'Price: High to Low'].map(sort => (
                    <button 
                      key={sort}
                      onClick={() => setSortBy(sort)}
                      className={`px-3 py-1 border rounded text-body-sm transition-colors ${sortBy === sort ? 'border-primary text-primary bg-primary/5' : 'border-outline-variant text-on-surface hover:border-primary'}`}
                    >
                      {sort}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-label-bold text-on-surface-variant uppercase tracking-wide mb-2">Price Range</h4>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-20 border border-outline-variant rounded px-2 py-1 text-body-sm bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                  <span className="text-on-surface-variant">-</span>
                  <input type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-20 border border-outline-variant rounded px-2 py-1 text-body-sm bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters (Mobile & Desktop) */}
        {(searchQuery || activeCategory !== 'All' || priceMin || priceMax || sortBy !== 'Relevance') && (
          <div className="flex flex-wrap gap-2 mb-4 px-container-margin md:px-0">
            {activeCategory !== 'All' && (
              <div className="flex items-center gap-1 bg-surface-container border border-outline-variant/30 rounded px-2 py-1">
                <span className="font-body-sm text-body-sm text-on-surface text-[11px]">{activeCategory}</span>
                <button onClick={() => onSetCategory('All')} className="material-symbols-outlined text-on-surface-variant hover:text-error text-[14px] cursor-pointer">close</button>
              </div>
            )}
            {searchQuery && (
              <div className="flex items-center gap-1 bg-surface-container border border-outline-variant/30 rounded px-2 py-1">
                <span className="font-body-sm text-body-sm text-on-surface text-[11px]">"{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="material-symbols-outlined text-on-surface-variant hover:text-error text-[14px] cursor-pointer">close</button>
              </div>
            )}
            {(priceMin || priceMax) && (
              <div className="flex items-center gap-1 bg-surface-container border border-outline-variant/30 rounded px-2 py-1">
                <span className="font-body-sm text-body-sm text-on-surface text-[11px]">{formatPrice(parseFloat(priceMin) || 0)} - {priceMax ? formatPrice(parseFloat(priceMax)) : 'Max'}</span>
                <button onClick={() => { setPriceMin(''); setPriceMax(''); }} className="material-symbols-outlined text-on-surface-variant hover:text-error text-[14px] cursor-pointer">close</button>
              </div>
            )}
            {sortBy !== 'Relevance' && (
              <div className="flex items-center gap-1 bg-surface-container border border-outline-variant/30 rounded px-2 py-1">
                <span className="font-body-sm text-body-sm text-on-surface text-[11px]">Sort: {sortBy}</span>
                <button onClick={() => setSortBy('Relevance')} className="material-symbols-outlined text-on-surface-variant hover:text-error text-[14px] cursor-pointer">close</button>
              </div>
            )}
            <button onClick={clearFilters} className="font-label-bold text-label-bold text-primary hover:underline text-[11px] px-2 py-1">Clear All</button>
          </div>
        )}

        {/* Product Grid */}
        <div className="px-container-margin md:px-0">
          {fetchError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-[48px] text-error mb-4">error_outline</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">{fetchError}</h3>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-bold mt-4 hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-gutter-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden flex flex-col relative skeleton">
                  <div className="aspect-square bg-surface-container-high w-full"></div>
                  <div className="p-3 md:p-4 flex flex-col flex-1">
                    <div className="h-2 bg-surface-container-high rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-surface-container-high rounded w-3/4 mb-4"></div>
                    <div className="mt-auto flex items-end justify-between">
                      <div className="h-5 bg-surface-container-high rounded w-16"></div>
                      <div className="w-8 h-8 rounded-full bg-surface-container-high"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-gutter-grid pb-24 md:pb-0">
              {filteredProducts.map((product) => {
                const inCart = cartItems.find(i => i.id === product.id);
                return (
                  <div key={product.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden flex flex-col relative group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                    <div className="aspect-square relative overflow-hidden bg-surface-container-low flex items-center justify-center">
                      {renderProductImage(product.imageUrl, product.name)}
                      
                      {/* Desktop Quick Add Hover Overlay */}
                      <div className="absolute inset-0 bg-surface/40 backdrop-blur-sm opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => onAdd(product as unknown as Product)}
                          className="bg-primary text-on-primary font-body-lg text-body-lg px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-surface-tint transition-colors"
                        >
                          {inCart ? 'Add More' : 'Quick Add'}
                        </button>
                      </div>
                    </div>
                    <div className="p-3 md:p-4 flex flex-col flex-1">
                      <span className="text-[10px] font-label-bold text-on-surface-variant uppercase tracking-wider mb-1">{product.category}</span>
                      <h3 className="font-body-sm md:font-body-md text-body-sm md:text-body-md text-on-surface font-medium leading-tight mb-2 line-clamp-2">{product.name}</h3>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="font-price-md text-price-md text-primary font-bold">{formatPrice(product.price)}</div>
                        
                        {/* Mobile Add Button (Visible on mobile, hidden on desktop hover overlay) */}
                        <div className="md:hidden">
                          {inCart ? (
                            <div className="bg-primary-container text-on-primary-container w-8 h-8 rounded-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-[18px]">check</span>
                            </div>
                          ) : (
                            <button 
                              onClick={() => onAdd(product as unknown as Product)}
                              className="bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                            >
                              <span className="material-symbols-outlined text-[18px]">add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-16 px-4">
              <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px]">search_off</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No results found</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">We couldn't find any products matching your search or filters.</p>
              <button 
                onClick={clearFilters} 
                className="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-surface-tint transition-colors shadow-sm"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
