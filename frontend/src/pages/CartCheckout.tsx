import { useState, useMemo } from 'react';
import { Package } from 'lucide-react';
import { formatPrice } from '../utils/currency';

interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  desc: string;
  quantity?: number;
}

interface CartCheckoutProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onPlaceOrder: () => void;
  onBack: () => void;

}

export default function CartCheckout({ cartItems, onUpdateQuantity, onRemove, onPlaceOrder, onBack }: CartCheckoutProps) {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Group items by category
  const groupedItems = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      let cat = item.category || 'General';
      if (cat.toLowerCase() === 'other') cat = 'General';
      
      const displayCat = cat.charAt(0).toUpperCase() + cat.slice(1);
      if (!acc[displayCat]) acc[displayCat] = [];
      acc[displayCat].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);
  }, [cartItems]);

  // Calculate totals
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  }, [cartItems]);

  const tax = subtotal * 0.08; // Assuming 8% tax
  const total = subtotal + tax;

  const handlePlaceOrder = () => {
    setIsPlacingOrder(true);
    // Simulate network request
    setTimeout(() => {
      setIsPlacingOrder(false);
      setOrderSuccess(true);
      setTimeout(() => {
        onPlaceOrder();
      }, 500);
    }, 1500);
  };

  const renderProductImage = (url: string | null | undefined, name: string) => {
    if (url) {
      return <img src={url} alt={name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x400/E8F5E9/2E7D32?text=${encodeURIComponent(name.split(' ')[0])}`; }} />;
    }
    return (
      <div className="w-full h-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
        <Package className="w-8 h-8 opacity-60" />
      </div>
    );
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 entrance-motion">
        <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-6 text-on-surface-variant">
          <span className="material-symbols-outlined text-[40px]">shopping_cart</span>
        </div>
        <h2 className="font-display text-headline-md text-on-surface mb-2">Your cart is empty</h2>
        <p className="font-body-md text-on-surface-variant mb-6 max-w-sm">
          Looks like you haven't added anything yet. Start exploring our marketplace!
        </p>
        <button 
          onClick={onBack}
          className="bg-primary text-on-primary font-label-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Browse Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pb-24 md:pb-8 pt-4 md:pt-0 entrance-motion relative">
      <div className="max-w-7xl mx-auto px-container-margin md:px-6">
        
        {/* Page Header */}
        <div className="mb-section-gap">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-primary font-body-lg hover:underline mb-4 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </button>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-4xl font-bold text-on-background mb-1">Your Cart</h1>
              <p className="font-body-lg text-on-surface-variant">{cartItems.length} items</p>
            </div>
            <div className="hidden md:flex glass-panel px-4 py-2 rounded-full items-center gap-2 text-primary-container text-sm font-medium animate-pulse border-primary-container/30">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
              Say "remove milk" or "add 2 more bread"
            </div>
          </div>
        </div>

        {/* Two Column Layout (Desktop) / Stacked (Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="glass-panel rounded-xl overflow-hidden shadow-sm">
                <div className="bg-surface-container-low px-4 md:px-6 py-3 border-b border-outline-variant/30">
                  <h3 className="font-headline-sm text-headline-sm text-on-background">{category}</h3>
                </div>
                <div className="p-3 md:p-4 flex flex-col gap-4">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-surface rounded-lg border border-outline-variant/20 hover:border-outline-variant/50 transition-colors">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden bg-surface-variant shrink-0 relative">
                        {renderProductImage(item.imageUrl, item.name)}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-body-sm md:font-body-lg text-on-background font-semibold">{item.name || (item as any).itemName}</h4>
                          <button 
                            onClick={() => onRemove(item.id)}
                            aria-label="Remove item" 
                            className="text-on-surface-variant hover:text-error transition-colors p-1"
                          >
                            <span className="material-symbols-outlined text-lg">close</span>
                          </button>
                        </div>
                        <div className="text-body-sm text-on-surface-variant mb-3">
                          {item.price != null ? `${formatPrice(item.price)}/ea` : '—'}
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div className="flex items-center border border-outline-variant rounded-md bg-white">
                            <button 
                              onClick={() => {
                                const newQty = (item.quantity || 1) - 1;
                                if (newQty > 0) {
                                  onUpdateQuantity(item.id, newQty);
                                } else {
                                  onRemove(item.id);
                                }
                              }}
                              className="px-3 py-1 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-l-md active:bg-surface-variant"
                            >
                              <span className="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <span className="px-3 font-body-md font-medium text-on-background w-10 text-center">
                              {item.quantity || 1}
                            </span>
                            <button 
                              onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                              className="px-3 py-1 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-r-md active:bg-surface-variant"
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                          </div>
                          <div className="font-price-md text-on-background font-bold text-right w-16">
                            {item.price != null ? formatPrice(item.price * (item.quantity || 1)) : '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {cartItems.length > 0 && (
              <button 
                onClick={onBack}
                className="w-full py-4 border-2 border-dashed border-primary/30 rounded-xl text-primary font-headline-sm hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Add more items
              </button>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 w-full z-40 bg-surface md:bg-transparent border-t border-outline-variant/30 md:border-none p-4 md:p-0 mt-4 md:mt-0 pb-[100px] md:pb-0">
            <div className="md:glass-panel md:rounded-xl md:p-6 md:sticky md:top-24 md:shadow-md">
              <h2 className="hidden md:block font-headline-md text-headline-md text-on-background mb-6 border-b border-outline-variant/30 pb-4">Order Summary</h2>
              
              <div className="flex flex-col gap-2 md:gap-4 mb-4 md:mb-6">
                <div className="flex justify-between items-center text-on-surface-variant font-body-md text-body-md">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant font-body-md text-body-md">
                  <span>Tax (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                  <span className="font-headline-md text-headline-md text-on-background">Total</span>
                  <span className="font-display font-bold text-[24px] text-on-surface">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || orderSuccess}
                className={`w-full py-4 rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-2 transition-all ${
                  orderSuccess ? 'bg-primary text-on-primary' : 
                  isPlacingOrder ? 'bg-surface-variant text-on-surface-variant' : 
                  'bg-primary-container text-white hover-lift-glow shadow-sm'
                }`}
              >
                {isPlacingOrder ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Processing...
                  </>
                ) : orderSuccess ? (
                  <>
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Success!
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Place order
                  </>
                )}
              </button>
              <p className="hidden md:flex text-center text-body-sm text-on-surface-variant items-center justify-center gap-1 opacity-80 mt-4">
                <span className="material-symbols-outlined text-xs">info</span>
                No payment required — this is a demo checkout
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Place Order Bar */}
      {cartItems.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-outline-variant/30 px-4 py-3 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide">Total</p>
            <p className="text-lg font-bold text-on-surface">{formatPrice(total)}</p>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || orderSuccess}
            className={`px-6 py-3 rounded-xl font-headline-sm flex items-center gap-2 transition-all ${
              orderSuccess ? 'bg-primary text-on-primary' :
              isPlacingOrder ? 'bg-surface-variant text-on-surface-variant' :
              'bg-primary-container text-white shadow-sm active:scale-95'
            }`}
          >
            {isPlacingOrder ? (
              <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Processing...</>
            ) : orderSuccess ? (
              <><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Done!</>
            ) : (
              <><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Place Order</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
