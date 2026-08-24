import React, { useEffect, useState } from 'react';
import DotPatternBackground from '../components/DotPatternBackground';
import { CheckCircle2, ChevronRight, Package, ArrowRight } from 'lucide-react';
import { formatPrice } from '../utils/currency';

interface OrderConfirmationProps {
  onBackToHome: () => void;
  onViewProfile: () => void;
  summary: { totalItems: number; totalPrice: number };
}

export default function OrderConfirmation({ onBackToHome, onViewProfile, summary }: OrderConfirmationProps) {
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    // Generate a simple mock ID (e.g. "VC-" + random 5-digit number)
    setOrderId(`VC-${Math.floor(10000 + Math.random() * 90000)}`);
  }, []);

  return (
    <div className="h-full w-full relative overflow-hidden font-body-md text-on-surface bg-background">
      {/* Background Animation */}
      <div className="absolute inset-0 w-full h-full z-0">
        <DotPatternBackground />
      </div>

      {/* Top App Bar (Minimal) */}
      <header className="relative z-10 w-full bg-transparent p-container-margin md:px-section-gap flex justify-center md:justify-start items-center h-16">
        <div className="font-display text-display text-primary font-extrabold tracking-tight">
          VoxCart
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="relative z-10 w-full h-[calc(100vh-80px)] flex items-center justify-center px-container-margin">
        {/* Glassmorphism Card */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl border border-surface-variant rounded-xl p-section-gap max-w-md w-full flex flex-col items-center text-center animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 translate-y-5">
          
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-section-gap animate-[bounceIn_0.6s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards] opacity-0 scale-75 delay-100 fill-mode-forwards">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          
          {/* Headlines */}
          <h1 className="font-display text-display text-on-surface mb-stack-xs animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 translate-y-5 delay-200 fill-mode-forwards">
            Order placed!
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-section-gap animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 translate-y-5 delay-300 fill-mode-forwards">
            Your list has been saved to your order history.
          </p>
          
          {/* Summary */}
          <div className="w-full bg-surface-container rounded-lg p-stack-md flex justify-between items-center mb-stack-sm animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 translate-y-5 delay-[400ms] fill-mode-forwards border border-surface-variant">
            <span className="font-body-lg text-body-lg text-on-surface">{summary.totalItems} items</span>
            <span className="font-price-md text-price-md text-on-surface">Total: {formatPrice(summary.totalPrice)}</span>
          </div>
          
          {/* Order ID */}
          <div className="font-body-sm text-body-sm text-secondary mb-section-gap animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 translate-y-5 delay-[400ms] fill-mode-forwards">
            Order #{orderId}
          </div>
          
          {/* Actions */}
          <button 
            onClick={onBackToHome}
            className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-3 px-6 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,109,52,0.2)] transition-all duration-300 mb-stack-md animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 translate-y-5 delay-[500ms] fill-mode-forwards uppercase tracking-wider"
          >
            Back to shopping
          </button>
          
          <button 
            onClick={onViewProfile}
            className="font-body-sm text-body-sm text-primary hover:text-primary-fixed-dim transition-colors animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 translate-y-5 delay-[500ms] fill-mode-forwards"
          >
            View order history
          </button>
        </div>
      </main>
    </div>
  );
}
