import React, { useState } from 'react';
import { Settings, Receipt, ChevronDown, Check, Save } from 'lucide-react';
import { formatPrice } from '../utils/currency';

export interface Order {
  id: string;
  date: string;
  totalItems: number;
  totalPrice: number;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface ProfileProps {
  orders: Order[];
  onStartShopping: () => void;
  showToast: (msg: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Dairy-free', 'Gluten-free', 'None'];

export default function Profile({ orders, onStartShopping, showToast, language, onLanguageChange }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'prefs'>('orders');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);
  const [substituteStyle, setSubstituteStyle] = useState<'strict' | 'flexible'>('strict');

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const toggleDietaryPref = (pref: string) => {
    setDietaryPrefs(prev => {
      if (pref === 'None') return ['None'];
      const filtered = prev.filter(p => p !== 'None');
      if (filtered.includes(pref)) {
        return filtered.filter(p => p !== pref);
      }
      return [...filtered, pref];
    });
  };

  const handleSavePreferences = () => {
    showToast('Preferences saved');
  };

  const renderPreferences = () => (
    <div className="flex flex-col gap-6 animate-[fadeUp_0.3s_ease-out_forwards]">
      <div className="glass-panel p-6 rounded-2xl border border-surface-variant">
        <div className="hidden lg:flex items-center gap-3 mb-6">
          <Settings className="text-primary w-6 h-6" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Preferences</h2>
        </div>

        <div className="space-y-6">
          {/* Dietary Preferences */}
          <div>
            <label className="block font-label-bold text-label-bold text-on-surface-variant mb-3 uppercase tracking-wider">
              Dietary Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(opt => {
                const isActive = dietaryPrefs.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleDietaryPref(opt)}
                    className={`px-4 py-2 rounded-lg font-body-sm transition-colors flex items-center gap-1 ${
                      isActive 
                        ? 'bg-primary/10 border-2 border-primary text-primary font-semibold' 
                        : 'bg-surface-container-high border border-outline-variant/50 text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    {isActive && <Check className="w-4 h-4" />} {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Substitute Style */}
          <div>
            <label className="block font-label-bold text-label-bold text-on-surface-variant mb-3 uppercase tracking-wider">
              Substitute Style
            </label>
            <div 
              onClick={() => setSubstituteStyle('strict')}
              className={`p-4 rounded-xl border relative overflow-hidden group cursor-pointer transition-colors mb-3 ${
                substituteStyle === 'strict' ? 'border-primary bg-primary/5' : 'border-outline-variant/30 bg-surface/50 hover:border-primary/50'
              }`}
            >
              {substituteStyle === 'strict' && <div className="absolute left-0 top-0 w-1 h-full bg-primary" />}
              <h3 className="font-body-md font-semibold text-on-surface mb-1">Strict Match</h3>
              <p className="font-body-sm text-on-surface-variant">Only replace with exact brand alternatives or refund item if unavailable.</p>
            </div>
            
            <div 
              onClick={() => setSubstituteStyle('flexible')}
              className={`p-4 rounded-xl border relative overflow-hidden group cursor-pointer transition-colors ${
                substituteStyle === 'flexible' ? 'border-primary bg-primary/5' : 'border-outline-variant/30 bg-surface/50 hover:border-primary/50'
              }`}
            >
              {substituteStyle === 'flexible' && <div className="absolute left-0 top-0 w-1 h-full bg-primary" />}
              <h3 className="font-body-md font-semibold text-on-surface mb-1">Flexible Match</h3>
              <p className="font-body-sm text-on-surface-variant">Allow similar brand substitutions to ensure you get your items.</p>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block font-label-bold text-label-bold text-on-surface-variant mb-3 uppercase tracking-wider">
              Language
            </label>
            <div className="relative">
              <select 
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="w-full appearance-none bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              >
                <option value="en-IN">English (India)</option>
                <option value="hi-IN">Hindi</option>
                <option value="es-ES">Spanish</option>
                <option value="ta-IN">Tamil</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-outline-variant/20">
          <button 
            onClick={handleSavePreferences}
            className="w-full py-3 px-6 bg-primary text-on-primary font-headline-sm rounded-xl hover:bg-primary/90 hover:shadow-[0_4px_14px_0_rgba(0,109,52,0.39)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Save Preferences
              <Save className="w-5 h-5" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderOrderHistory = () => (
    <div className="flex flex-col gap-6 animate-[fadeUp_0.3s_ease-out_forwards]">
      <div className="glass-panel rounded-2xl border border-surface-variant overflow-hidden">
        <div className="hidden lg:flex p-6 border-b border-surface-variant justify-between items-center bg-surface-bright/50">
          <div className="flex items-center gap-3">
            <Receipt className="text-primary w-6 h-6" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Order History</h2>
          </div>
        </div>
        
        {orders.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-6 text-on-surface-variant">
              <span className="material-symbols-outlined text-[40px]">receipt_long</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No orders yet</h3>
            <p className="font-body-md text-on-surface-variant mb-6 max-w-sm">
              When you place an order, your receipt and items will appear here.
            </p>
            <button 
              onClick={onStartShopping}
              className="bg-primary text-on-primary font-label-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start shopping
            </button>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/30">
            {orders.map((order) => {
              const isExpanded = expandedOrders[order.id];
              return (
                <article key={order.id} className="bg-surface-container-lowest transition-colors">
                  <div 
                    className="p-4 md:p-6 flex justify-between items-center cursor-pointer hover:bg-surface-container-low transition-colors"
                    onClick={() => toggleOrder(order.id)}
                  >
                    <div>
                      <h3 className="font-label-bold text-label-bold text-on-surface">Order {order.id}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        {order.date} • {order.totalItems} items
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-price-md text-price-md text-primary">{formatPrice(order.totalPrice)}</span>
                      <ChevronDown className={`text-on-surface-variant transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t border-outline-variant/30 bg-surface px-4 md:px-6 py-4 space-y-2 animate-[slideUpFade_0.2s_ease-out_forwards]">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between font-body-sm text-body-sm">
                          <span>{item.name} ({item.quantity})</span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-12 flex flex-col gap-6 entrance-motion relative">
      {/* Decorative Background Blob (Desktop) */}
      <div className="hidden lg:block absolute top-0 right-0 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl -z-10 opacity-50 translate-x-1/3 -translate-y-1/3"></div>

      {/* Profile Header */}
      <header className="flex items-center gap-4 md:gap-6 glass-panel p-4 md:p-6 rounded-2xl border border-surface-variant">
        <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-display text-2xl md:text-display shadow-inner border-2 border-primary/20">
          JD
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-display text-primary mb-1">Jane Doe</h1>
          <p className="text-on-surface-variant font-body-sm md:font-body-md">Member since 2022 • Premium Tier</p>
        </div>
      </header>

      {/* Mobile Tabs */}
      <nav aria-label="Profile Tabs" className="flex border-b border-outline-variant/30 lg:hidden mb-2">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-3 font-label-bold text-label-bold text-center transition-all border-b-2 ${
            activeTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
          }`}
        >
          Order History
        </button>
        <button 
          onClick={() => setActiveTab('prefs')}
          className={`flex-1 py-3 font-label-bold text-label-bold text-center transition-all border-b-2 ${
            activeTab === 'prefs' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
          }`}
        >
          Preferences
        </button>
      </nav>

      {/* Grid Layout (Desktop uses both, Mobile uses tabs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className={`lg:col-span-5 flex flex-col gap-6 ${activeTab === 'prefs' ? 'block' : 'hidden lg:flex'}`}>
          <h3 className="font-label-bold text-label-bold text-on-surface mb-2 lg:hidden">Preferences</h3>
          {renderPreferences()}
        </section>

        <section className={`lg:col-span-7 flex flex-col gap-6 ${activeTab === 'orders' ? 'block' : 'hidden lg:flex'}`}>
          <h3 className="font-label-bold text-label-bold text-on-surface mb-2 lg:hidden">Order History</h3>
          {renderOrderHistory()}
        </section>
      </div>
    </div>
  );
}
