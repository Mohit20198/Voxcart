import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingBasket, Check, Apple, Milk, Croissant, Cookie, CupSoda, Package, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../utils/currency';
import { useUserId } from '../hooks/useUserId';
import { apiClient } from '../api/client';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Produce': Apple,
  'Dairy': Milk,
  'Bakery': Croissant,
  'Snacks': Cookie,
  'Beverages': CupSoda,
  'Other': Package,
};

interface HomeProps {
  listItems: any[];
  onUpdateQuantity: (id: string, name: string, delta: number) => void;
  onRemove: (id: string, name: string) => void;
  onClearAll?: () => void;
  onGoToMarketplace?: () => void;
  onGoToCart?: () => void;
  onVoiceCommand?: (text: string) => void;
  onAdd?: (product: any) => void;
}

export default function Home({ listItems, onUpdateQuantity, onRemove, onGoToMarketplace, onGoToCart, onVoiceCommand, onAdd }: HomeProps) {
  const userId = useUserId();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [seasonalItems, setSeasonalItems] = useState<any[]>([]);
  const [householdCode, setHouseholdCode] = useState('');
  const [householdId, setHouseholdId] = useState<string | null>(() => localStorage.getItem('voxcart_household_id'));

  const joinHousehold = (code: string) => {
    localStorage.setItem('voxcart_household_id', code);
    setHouseholdId(code);
  };
  const leaveHousehold = () => {
    localStorage.removeItem('voxcart_household_id');
    setHouseholdId(null);
  };

  useEffect(() => {
    apiClient.searchProducts('grocery')
      .then(products => setPopularItems(products.slice(0, 5)))
      .catch(console.error);
    apiClient.getSeasonalRecommendations()
      .then(setSeasonalItems)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (userId) {
      apiClient.getRecommendations(userId)
        .then(setRecommendations)
        .catch(console.error);
    }
  }, [userId, listItems?.length]);

  const safeList = listItems || [];
  const totalItems = safeList.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const totalPrice = safeList.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);

  const groupedItems = safeList.reduce((acc: any, item: any) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const renderProductImage = (url: string) => {
    if (url) return <img src={url} alt="Product" className="w-full h-full object-cover" />;
    return (
      <div className="w-full h-full bg-surface-container flex items-center justify-center text-on-surface-variant">
        <Package className="w-6 h-6 opacity-50" />
      </div>
    );
  };

  // ── Shared Household Widget ──────────────────────────────────────────────
  const HouseholdPanel = () => (
    <div className="bg-primary-container text-on-primary-container rounded-2xl p-6 h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-[22px]">group</span>
        <h2 className="font-headline-sm text-headline-sm">Shared Household</h2>
      </div>
      <p className="font-body-sm text-body-sm opacity-80 mb-5">
        Multiple voices, one cart. Anyone in the family can add items from their device in real-time.
      </p>

      {householdId ? (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="font-label-bold text-label-bold opacity-70 mb-2 text-xs uppercase tracking-wide">Connected to</p>
            <div className="bg-on-primary-container/10 rounded-xl px-4 py-3 font-mono font-bold tracking-widest text-xl text-center mb-4 border border-on-primary-container/20">
              {householdId}
            </div>
            <div className="flex items-center gap-2 p-3 bg-on-primary-container/10 rounded-lg mb-4">
              <span className="material-symbols-outlined text-[16px] opacity-60">wifi</span>
              <span className="font-body-sm text-body-sm opacity-80">Syncing live with household members</span>
            </div>
          </div>
          <button
            onClick={leaveHousehold}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-label-bold bg-on-primary-container/10 hover:bg-on-primary-container/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Leave Household
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex flex-col gap-2 mb-2">
            {[
              { icon: 'record_voice_over', text: 'Any family member can add items by voice' },
              { icon: 'sync', text: 'Changes sync instantly across all devices' },
              { icon: 'shopping_cart', text: 'One shared cart, checkout together' },
            ].map(f => (
              <div key={f.icon} className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[16px] mt-0.5 opacity-70 shrink-0">{f.icon}</span>
                <span className="font-body-sm text-body-sm opacity-80">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter code (e.g. FAM-XYZW)"
                value={householdCode}
                onChange={e => setHouseholdCode(e.target.value.toUpperCase())}
                className="flex-1 bg-surface/80 text-on-surface px-3 py-2 rounded-lg border border-transparent focus:border-primary outline-none font-mono text-sm min-w-0"
              />
              <button
                onClick={() => { if (householdCode.trim()) { joinHousehold(householdCode.trim()); setHouseholdCode(''); } }}
                disabled={!householdCode.trim()}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-bold disabled:opacity-40 shrink-0"
              >
                Join
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-on-primary-container/20" />
              <span className="text-[11px] opacity-50">OR</span>
              <div className="flex-1 h-px bg-on-primary-container/20" />
            </div>
            <button
              onClick={() => joinHousehold('FAM-' + Math.random().toString(36).substring(2, 6).toUpperCase())}
              className="w-full py-2.5 rounded-lg font-label-bold bg-on-primary-container/10 hover:bg-on-primary-container/20 transition-colors"
            >
              Create New Household
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ── Seasonal Section ────────────────────────────────────────────────────
  const SeasonalSection = () => seasonalItems.length === 0 ? null : (
    <div>
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-3">In Season Right Now</h2>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {seasonalItems.map((item, idx) => (
          <div
            key={item.productId || idx}
            className="w-[148px] flex-shrink-0 bg-surface-container-lowest border border-outline-variant rounded-xl p-3 hover:bg-surface-container-low transition-colors cursor-pointer group flex flex-col relative overflow-hidden"
            onClick={() => onAdd?.({ id: item.productId || item.itemName, name: item.itemName, price: item.price, category: item.category, imageUrl: item.imageUrl })}
          >
            <div className="absolute top-0 right-0 bg-tertiary text-on-tertiary font-label-bold text-[10px] px-2 py-0.5 rounded-bl-lg z-10">Seasonal</div>
            <div className="aspect-[4/3] bg-surface-variant rounded-lg mb-2 overflow-hidden flex-shrink-0">
              {item.imageUrl
                ? <img alt={item.itemName} className="w-full h-full object-cover mix-blend-multiply" src={item.imageUrl} />
                : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 opacity-50 text-outline" /></div>
              }
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <p className="font-body-sm text-body-sm text-on-surface font-semibold truncate mb-1" title={item.itemName}>{item.itemName}</p>
              <p className="font-label-bold text-label-bold text-primary mb-2">{item.price != null ? formatPrice(item.price) : '\u2014'}</p>
              <button className="w-full mt-auto bg-surface border border-outline-variant text-on-surface font-label-bold text-label-bold py-1.5 rounded flex items-center justify-center gap-1 group-hover:border-primary group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[16px]">add</span> ADD
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-12 flex flex-col gap-8">

      {listItems.length === 0 ? (
        <>
          {/* ── Two-column: Household (left) + Empty list UI (right) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT: Shared Household */}
            <HouseholdPanel />

            {/* RIGHT: Empty list UI */}
            <div className="flex flex-col items-center justify-center text-center p-6 bg-surface-container-lowest border border-outline-variant rounded-2xl min-h-[340px]">
              <div className="mb-4 w-20 h-20 bg-surface-container rounded-full flex items-center justify-center">
                <svg className="w-9 h-9 text-primary opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
              </div>

              <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Your list is empty</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">Tap the mic or try an example</p>

              {/* Mic Button */}
              <button className="relative mb-6 group focus:outline-none" onClick={() => onVoiceCommand?.('')}>
                <div className="absolute inset-0 bg-primary-container rounded-xl pulse-glow opacity-30" />
                <div className="relative w-16 h-16 bg-primary text-on-primary rounded-xl flex items-center justify-center shadow-sm group-hover:bg-on-primary-fixed-variant transition-colors z-10 group-active:scale-95">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                </div>
              </button>

              {/* Command Chips */}
              <div className="flex flex-wrap justify-center gap-2 w-full max-w-sm">
                {['"Add milk"', '"I need bread and eggs"', '"What\'s on sale?"'].map(chip => (
                  <button
                    key={chip}
                    onClick={() => onVoiceCommand?.(chip.replace(/"/g, ''))}
                    className="px-3 py-1.5 bg-surface-container border border-outline-variant rounded-full hover:border-primary focus:outline-none transition-colors font-body-sm text-body-sm text-on-surface"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Seasonal Suggestions ── */}
          <SeasonalSection />

          {/* ── Popular Starting Points ── */}
          {popularItems.length > 0 && (
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-3">Popular starting points</h2>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {popularItems.map(item => (
                  <div key={item.id} className="w-[140px] flex-shrink-0 bg-surface-container-lowest border border-outline-variant rounded-xl p-3 hover:bg-surface-container-low transition-colors cursor-pointer group flex flex-col" onClick={() => onAdd?.(item)}>
                    <div className="aspect-[4/3] bg-surface-variant rounded-lg mb-2 overflow-hidden flex-shrink-0">
                      <img alt={item.name} className="w-full h-full object-cover mix-blend-multiply" src={item.imageUrl} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <p className="font-body-sm text-body-sm text-on-surface truncate mb-1" title={item.name}>{item.name}</p>
                      <p className="font-label-bold text-label-bold text-primary mb-2">{formatPrice(item.price)}</p>
                      <button className="w-full mt-auto bg-surface border border-outline-variant text-on-surface font-label-bold text-label-bold py-1.5 rounded flex items-center justify-center gap-1 group-hover:border-primary group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[16px]">add</span> ADD
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* ── Hero Banner ── */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-surface-container-low to-surface-container-high border border-surface-variant" style={{ minHeight: 200 }}>
            <div className="p-8 md:p-10 max-w-lg relative z-10">
              <h1 className="font-display-lg text-display-lg text-on-background leading-tight mb-3">
                <span className="text-primary">Shop by voice.</span><br />Fast &amp; Simple.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-5 max-w-xs">
                Simply speak your list, and VoxCart curates the freshest items directly to your door.
              </p>
              <button onClick={onGoToMarketplace} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-label-bold text-label-bold hover:scale-105 hover:shadow-lg active:scale-95 transition-all shadow-md">
                <ShoppingBasket className="w-4 h-4" />
                Get Started
              </button>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3 items-end pointer-events-none">
              <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-xl p-3 shadow-lg w-44 rotate-3">
                <div className="h-14 bg-surface-container rounded-lg mb-2 flex items-center justify-center text-3xl">🥛</div>
                <p className="font-body-md text-on-surface font-medium text-xs truncate">Experience Pure Indulgence</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-xl p-3 shadow-lg w-44 -rotate-2 -translate-x-4">
                <div className="h-12 bg-surface-container rounded-lg mb-2 flex items-center justify-center text-2xl">🍞🍎</div>
                <p className="font-body-md text-on-surface font-medium text-xs truncate">Artisan Fresh Daily</p>
              </div>
            </div>
          </div>

          {/* ── Seasonal Recommendations ── */}
          <SeasonalSection />

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* My List (2 cols) */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-background">My Shopping List</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">{totalItems} item{totalItems !== 1 ? 's' : ''} in your list</p>
                </div>
                {listItems.length > 0 && (
                  <button onClick={onGoToCart} className="flex items-center gap-1.5 text-primary font-label-bold text-label-bold hover:underline">
                    <ShoppingCart className="w-4 h-4" />
                    View Cart
                  </button>
                )}
              </div>

              {/* Mobile: grouped by category */}
              <div className="flex md:hidden flex-col gap-4">
                {Object.entries(groupedItems).map(([category, items]: [string, any]) => {
                  const Icon = CATEGORY_ICONS[category] || CATEGORY_ICONS['Other'];
                  return (
                    <div key={category} className="bg-[#fcfaf7] rounded-xl p-4 shadow-sm border border-surface-variant">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary" /> {category}
                      </h3>
                      <ul className="space-y-2">
                        {items.map((item: any) => (
                          <li key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container transition-colors">
                            <div className="flex items-center gap-3">
                              <button onClick={() => onRemove(item.id, item.name)} className="w-5 h-5 rounded border border-outline flex items-center justify-center text-transparent hover:border-primary hover:text-primary cursor-pointer transition-colors">
                                <Check className="w-4 h-4" />
                              </button>
                              <span className="font-body-md text-body-md text-on-surface">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-surface-container rounded-full px-2 py-1">
                              <button onClick={() => onUpdateQuantity(item.id, item.name, -1)} className="text-on-surface-variant hover:text-primary"><Minus className="w-4 h-4" /></button>
                              <span className="font-label-bold text-label-bold w-4 text-center">{item.quantity}</span>
                              <button onClick={() => onUpdateQuantity(item.id, item.name, 1)} className="text-on-surface-variant hover:text-primary"><Plus className="w-4 h-4" /></button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: high-density rows */}
              <div className="hidden md:flex flex-col gap-3">
                {listItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-surface-container-lowest border border-surface-variant rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all duration-200 entrance-motion"
                    style={{ animationDelay: `${0.05 * idx}s` }}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-lg bg-surface-container-high overflow-hidden shrink-0">
                        {renderProductImage(item.imageUrl)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-headline-sm text-headline-sm text-on-background truncate">{item.name}</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant">{item.category} • In Stock</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 shrink-0 ml-4">
                      <span className="font-price-lg text-price-lg text-primary">{formatPrice(item.price || 0)}</span>
                      <div className="flex items-center bg-surface-container-high rounded-full px-2 py-1 glass-card">
                        <button onClick={() => onUpdateQuantity(item.id, item.name, -1)} className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-highest transition-colors"><Minus className="w-4 h-4" /></button>
                        <span className="font-label-bold text-label-bold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, item.name, 1)} className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-highest transition-colors"><Plus className="w-4 h-4" /></button>
                      </div>
                      <button onClick={() => onRemove(item.id, item.name)} className="w-10 h-10 bg-surface-container text-on-surface-variant rounded-full flex items-center justify-center hover:bg-error/10 hover:text-error transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">

              {/* Household widget in populated state */}
              <HouseholdPanel />

              {/* List Summary */}
              {listItems.length > 0 && (
                <div className="glass-card rounded-xl p-6 flex flex-col gap-4 shadow-sm entrance-motion" style={{ animationDelay: '0.2s' }}>
                  <h3 className="font-headline-sm text-headline-sm text-on-background">List Summary</h3>
                  <div className="flex justify-between items-center py-2 border-b border-surface-variant">
                    <span className="font-body-md text-body-md text-on-surface-variant">Total Items</span>
                    <span className="font-label-bold text-label-bold">{totalItems}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-body-lg text-body-lg font-bold">Estimated Total</span>
                    <span className="font-price-lg text-price-lg text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                  <button onClick={onGoToCart} className="w-full py-3 bg-primary text-on-primary font-label-bold text-label-bold rounded-lg soft-glow hover:scale-[1.02] active:scale-[0.98] transition-all mt-1">
                    Proceed to Checkout
                  </button>
                </div>
              )}

              {/* Suggested Additions */}
              {recommendations.length > 0 && (
                <div className="glass-card rounded-xl p-5 flex flex-col gap-3 shadow-sm relative overflow-hidden entrance-motion" style={{ animationDelay: '0.3s' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                  <h3 className="font-headline-sm text-headline-sm text-on-background relative z-10">You might need</h3>
                  <div className="flex flex-col gap-2 relative z-10">
                    {recommendations.map(item => (
                      <div key={item.itemName} className="flex items-center gap-3 bg-surface rounded-lg p-2 shadow-sm border border-surface-variant group">
                        <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center shrink-0 overflow-hidden">
                          {item.imageUrl
                            ? <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover mix-blend-multiply" />
                            : <Package className="w-6 h-6 opacity-50" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-body-md text-body-md text-on-surface truncate">{item.itemName}</div>
                          <div className="flex items-center gap-2">
                            <div className="font-label-bold text-label-bold text-primary">{item.price != null ? formatPrice(item.price) : '\u2014'}</div>
                            <div className="font-label-sm text-label-sm text-on-surface-variant truncate border-l border-outline-variant pl-2 ml-2" title={item.reason}>{item.reason}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => onAdd?.({ id: item.productId || item.itemName, name: item.itemName, price: item.price, category: item.category || 'Other', imageUrl: item.imageUrl })}
                          className="w-8 h-8 rounded-full bg-primary-container/40 text-on-primary-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </>
      )}
    </div>
  );
}
