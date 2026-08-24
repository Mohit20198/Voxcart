import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBasket, Star, Heart, Minus, Plus, Package } from 'lucide-react';
import { formatPrice } from '../utils/currency';
import { apiClient } from '../api/client';

interface Product {
  id: string;
  name: string;
  price: number | null;
  category: string;
  imageUrl: string | null;
  desc: string;
}

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  substitutes?: Product[]; // mock data to pass in
  boughtWith?: Product[]; // mock data to pass in
}

export default function ProductDetail({ product, onBack, onAddToCart, substitutes = [], boughtWith = [] }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [substitutesList, setSubstitutesList] = useState<any[]>([]);

  useEffect(() => {
    if (product?.name) {
      apiClient.getSubstitutes(product.name)
        .then(setSubstitutesList)
        .catch(console.error);
    }
  }, [product.name]);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };
  
  const handleIncrease = () => {
    setQuantity(q => q + 1);
  };

  const renderProductImage = (url: string | null | undefined) => {
    if (url) {
      return <img src={url} alt="Product" className="w-full h-full object-cover md:object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x400/E8F5E9/2E7D32?text=${encodeURIComponent(product?.name?.split(' ')[0] || 'Product')}`; }} />;
    }
    return (
      <div className="w-full h-full bg-surface-variant flex items-center justify-center text-on-surface-variant group-hover:scale-105 transition-transform duration-500">
        <Package className="w-16 h-16 opacity-60" />
      </div>
    );
  };

  return (
    <div className="bg-background text-on-background min-h-screen pb-safe flex flex-col md:flex-row w-full entrance-motion">
      
      {/* Mobile Top App Bar */}
      <header className="md:hidden w-full sticky top-0 backdrop-blur-xl border-b border-glass-outline shadow-sm flex items-center justify-between px-glass-padding h-16 z-50 bg-glass-surface transition-all">
        <button onClick={onBack} className="text-on-surface-variant hover:bg-primary-container/10 transition-colors active:scale-95 duration-200 p-2 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="font-headline-md text-headline-md text-on-surface font-bold">
          VoxCart
        </div>
        <button className="text-on-surface-variant hover:bg-primary-container/10 transition-colors active:scale-95 duration-200 p-2 rounded-full relative">
          <ShoppingBasket className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-0 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-8 min-h-screen animate-[fadeInUp_0.3s_ease-out_forwards]">
        
        {/* Left Column: Product Image & Basic Info (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-0 md:space-y-6 flex flex-col">
          
          {/* Product Image Section */}
          <section className="w-full h-80 md:h-auto md:aspect-square relative bg-surface-container-lowest md:glass-card flex items-center justify-center mb-4 md:mb-0 rounded-b-xl md:rounded-xl shadow-sm overflow-hidden group p-0 md:p-8">
            <div className="absolute inset-0 p-0 md:p-8 flex items-center justify-center">
               {renderProductImage(product.imageUrl)}
            </div>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className={`hidden md:flex absolute top-4 right-4 p-3 rounded-full bg-surface-bright/80 backdrop-blur-md transition-colors hover:scale-110 active:scale-95 shadow-sm ${isFavorite ? 'text-tertiary' : 'text-on-surface-variant hover:text-tertiary'}`}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-tertiary' : ''}`} />
            </button>
          </section>

          {/* Product Info & Actions */}
          <section className="px-margin-page md:px-6 md:glass-card md:rounded-xl md:py-6 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{product.category}</span>
                  <span className="text-secondary text-sm flex items-center gap-1">
                    <Star className="w-4 h-4 fill-secondary" /> 4.8 (124)
                  </span>
                </div>
                <h1 className="font-display-lg text-display-lg text-on-surface mb-stack-xs md:mb-1 leading-tight">{product.name}</h1>
                <p className="font-body-md md:font-body-lg text-body-md md:text-body-lg text-on-surface-variant mt-1">Fresh Farms Inc.</p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-price-lg text-price-lg text-primary block">
                  {product.price != null ? formatPrice(product.price) : '—'}
                </span>
                <span className="font-body-md text-body-md text-on-surface-variant">/ ea</span>
              </div>
            </div>

            <div className="flex items-center gap-gutter my-stack-md md:hidden">
              <div className="flex items-center justify-between glass-panel rounded-full px-2 py-1 w-32 shadow-sm border border-glass-outline">
                <button onClick={handleDecrease} className="p-2 text-primary hover:bg-surface-container-high rounded-full transition-colors active:scale-95 flex items-center justify-center">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-body-lg text-body-lg font-bold">{quantity}</span>
                <button onClick={handleIncrease} className="p-2 text-primary hover:bg-surface-container-high rounded-full transition-colors active:scale-95 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button onClick={() => { onAddToCart(product, quantity); onBack(); }} className="flex-1 bg-primary text-on-primary font-label-bold text-label-bold py-3 px-6 rounded-full shadow-md hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all flex items-center justify-center gap-2">
                <ShoppingBasket className="w-5 h-5" />
                Add to List
              </button>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6 md:mb-0">
              {product.desc || "Creamy, rich, and perfectly ripe. These organic items are hand-selected for optimal freshness. Perfect for your daily needs."}
            </p>

            {/* Desktop Add to Cart Actions */}
            <div className="hidden md:flex pt-4 items-center gap-4 border-t border-glass-outline">
              <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-full h-12 px-2 shadow-sm">
                <button onClick={handleDecrease} className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors active:scale-90">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-body-lg text-body-lg w-8 text-center font-bold">{quantity}</span>
                <button onClick={handleIncrease} className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors active:scale-90">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button onClick={() => { onAddToCart(product, quantity); onBack(); }} className="flex-1 bg-primary text-on-primary h-12 rounded-full font-label-bold text-label-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-md soft-glow">
                <ShoppingBasket className="w-5 h-5" />
                ADD TO CART
              </button>
            </div>
          </section>

          <hr className="md:hidden border-outline-variant my-stack-md mx-margin-page" />
        </div>

        {/* Right Column: Substitutes & Frequently Bought With (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6 md:space-y-8 pb-8 px-0 md:px-4 flex flex-col min-w-0 animate-[fadeInUp_0.4s_ease-out_forwards]">
          
          {substitutesList.length > 0 && (
            <section>
              <h2 className="font-headline-sm text-headline-sm text-on-background mb-4 px-4 md:px-0">Substitutes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 md:px-0">
                {substitutesList.map(sub => (
                  <div key={sub.id} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-surface-container rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      {sub.imageUrl ? (
                        <img src={sub.imageUrl} alt={sub.name} className="w-full h-full object-cover mix-blend-multiply" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x400/E8F5E9/2E7D32?text=${encodeURIComponent(sub.name.split(' ')[0])}`; }} />
                      ) : (
                        <Package className="w-6 h-6 opacity-50 text-on-surface-variant" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-body-md text-body-md font-medium text-on-surface truncate">{sub.name}</div>
                      <div className="font-label-bold text-label-bold text-primary">{sub.price != null ? formatPrice(sub.price) : '—'}</div>
                    </div>
                    <button onClick={() => { onAddToCart(sub, 1); onBack(); }} className="w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center shrink-0">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

    </div>
  );
}
