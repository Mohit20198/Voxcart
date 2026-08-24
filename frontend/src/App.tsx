import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, Search, X, ShoppingCart, Loader2,
  Apple, Milk, Croissant, Cookie, CupSoda, LayoutGrid, Package, CheckCircle2,
  Bell, User, ShoppingBasket, ArrowRight, ReceiptText
} from 'lucide-react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import VoxPanel, { type VoxPanelRef, type VoxMessage } from './components/VoxPanel';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Home from './pages/Home';
import Browse from './pages/Browse';
import CartCheckout from './pages/CartCheckout';
import ProductDetail from './pages/ProductDetail';
import OrderConfirmation from './pages/OrderConfirmation';
import Profile, { type Order } from './pages/Profile';
import { useUserId } from './hooks/useUserId';
import { apiClient, type BackendListItem } from './api/client';
import { formatPrice } from './utils/currency';

// --- CATEGORY MAP ---
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'All': LayoutGrid,
  'Dairy': Milk,
  'Produce': Apple,
  'Bakery': Croissant,
  'Snacks': Cookie,
  'Beverages': CupSoda,
  'Meat': Package,
  'Frozen': Package,
  'Canned': Package,
  'Condiments': Package,
  'Household': Package,
};
const REAL_CATEGORIES = Object.keys(CATEGORY_ICONS);

const MOCK_PRODUCTS = [
  { id: '1', name: 'Organic Bananas, Bunch', price: 2.49, category: 'Produce', imageUrl: '', desc: 'Approx 1.5 lbs' },
  { id: '2', name: 'Whole Milk, 1 Gallon', price: 4.29, category: 'Dairy', imageUrl: '', desc: 'Farm Fresh' },
  { id: '3', name: 'Whole Wheat Bread, Sliced', price: 2.78, category: 'Bakery', imageUrl: '', desc: '24 oz loaf' },
  { id: '4', name: 'Potato Chips', price: 2.99, category: 'Snacks', imageUrl: '', desc: 'Family Size' },
  { id: '5', name: 'Orange Juice', price: 5.49, category: 'Beverages', imageUrl: '', desc: 'Not from concentrate' },
];

const MOCK_INITIAL_LIST: any[] = [
  { id: '1', name: 'Organic Bananas, Bunch', price: 2.49, category: 'Produce', imageUrl: '', desc: 'Approx 1.5 lbs', quantity: 1 },
  { id: '2', name: 'Whole Milk, 1 Gallon', price: 4.29, category: 'Dairy', imageUrl: '', desc: 'Farm Fresh', quantity: 1 },
  { id: '3', name: 'Whole Wheat Bread, Sliced', price: 2.78, category: 'Bakery', imageUrl: '', desc: '24 oz loaf', quantity: 1 }
];

type Tab = 'landing' | 'login' | 'home' | 'browse' | 'cart' | 'detail' | 'orderConfirmation' | 'profile';

const SIDE_NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'browse', label: 'Grocery', icon: 'shopping_basket' },
  { id: 'cart', label: 'Cart', icon: 'shopping_cart' },
  { id: 'profile', label: 'Profile', icon: 'person' },
];

export default function App() {
  const userId = useUserId();
  const [activeTab, setActiveTab] = useState<Tab>('landing');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [listItems, setListItems] = useState<BackendListItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [language, setLanguage] = useState('en-IN');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isVoxOpen, setIsVoxOpen] = useState(false);
  const voxPanelRef = useRef<VoxPanelRef>(null);

  // Note: This is a simple local flag for demo purposes, not tied to real user accounts (no backend auth exists yet)
  const [hasSeenVoxTooltip, setHasSeenVoxTooltip] = useState(() => {
    return localStorage.getItem('hasSeenVoxTooltip') === 'true';
  });

  const { transcript, state, errorMessage, startListening, stopListening, resetState } = useSpeechRecognition(language);

  const [conversationLog, setConversationLog] = useState<VoxMessage[]>([]);
  const [isProcessingVox, setIsProcessingVox] = useState(false);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchList = async () => {
    if (!userId) return;
    try {
      setIsLoadingList(true);
      setListError(null);
      const items = await apiClient.getListItems(userId);
      setListItems(items);
    } catch (err) {
      setListError('Failed to load list. Please try again.');
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchList();
    }
  }, [userId]);

  const showToast = (message: string) => setToastMessage(message);

  const handleVoxCommand = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessingVox(true);
    const userMsg: VoxMessage = { id: Date.now().toString(), role: 'user', text };
    setConversationLog(prev => [...prev, userMsg]);
    
    try {
      if (!userId) throw new Error('User not identified');
      const data = await apiClient.postVoiceCommand(userId, text);
      
      let quickReplies: string[] = [];
      let productCards: any[] = [];
      let actions = data.actionsPerformed || [];
      let voxText = data.reply || 'Done';
      let productCard = null;

      if (data.handledBy === 'fastpath') {
        actions = [{ tool: data.action, result: data.item }];
        fetchList();
      } else {
        if (data.needsClarification && data.actionsPerformed) {
          const substituteAction = data.actionsPerformed.find((a: any) => a.tool === 'find_substitutes');
          if (substituteAction && Array.isArray(substituteAction.result)) {
            quickReplies = substituteAction.result;
          }
        }
        
        if (data.actionsPerformed) {
          const searchAction = data.actionsPerformed.find((a: any) => a.tool === 'search_products');
          if (searchAction && searchAction.result?.products) {
            productCards = searchAction.result.products.slice(0, 5).map((p: any) => ({ name: p.name, price: p.price, image: p.imageUrl }));
          }

          const recAction = data.actionsPerformed.find((a: any) => a.tool === 'get_recommendations');
          if (recAction && Array.isArray(recAction.result)) {
            productCards = recAction.result.slice(0, 5).map((r: any) => ({ name: r.itemName, price: r.price || 0, image: r.imageUrl || null }));
          }

          const listAction = data.actionsPerformed.find((a: any) => a.tool === 'list_cart_items');
          if (listAction && Array.isArray(listAction.result?.items)) {
            productCards = listAction.result.items.slice(0, 5).map((i: any) => ({ name: i.itemName, price: i.price || 0, image: i.imageUrl || null }));
          }

          data.actionsPerformed.forEach((action: any) => {
             if (action.tool === 'add_item' && action.result && !action.result.error) {
                fetchList();
                productCard = {
                  name: action.result.itemName,
                  price: action.result.price ?? 0,
                  image: action.result.imageUrl
                };
             } else if ((action.tool === 'remove_item' || action.tool === 'modify_item') && action.result && !action.result.error) {
                fetchList();
             }
          });
        }
      }
      
      const voxMsg: VoxMessage = {
        id: (Date.now() + 1).toString(),
        role: 'vox',
        text: voxText,
        actions: actions.length > 0 ? actions : undefined,
        quickReplies,
        productCard,
        productCards,
      };
      setConversationLog(prev => [...prev, voxMsg]);
      
      if (!isVoxOpen) {
         if (data.needsClarification) {
            showToast('Vox needs clarification. Tap the mic to continue.');
         } else {
            showToast('Command processed.');
         }
      }
    } catch (err) {
      console.error(err);
      const errMsg: VoxMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'vox', 
        text: 'Sorry, I am having trouble reaching the server right now. Something went wrong, try again.',
        isError: true,
        retryText: text
      };
      setConversationLog(prev => [...prev, errMsg]);
      if (!isVoxOpen) showToast('Network error, please try again.');
    } finally {
      setIsProcessingVox(false);
    }
  };

  useEffect(() => {
    if (state === 'processing' && transcript && !isProcessingVox) {
      handleVoxCommand(transcript);
      resetState();
    }
  }, [state, transcript, isProcessingVox, resetState]);

  const handleAddToList = async (name: string, quantity: number = 1, unit: string = '') => {
    if (!userId) return;
    try {
      const newItem = await apiClient.addListItem(userId, name, quantity, unit);
      setListItems(prev => {
        // If it already exists, replace it, else append
        const exists = prev.find(i => i.id === newItem.id);
        if (exists) return prev.map(i => i.id === newItem.id ? newItem : i);
        return [newItem, ...prev];
      });
      showToast(`Added ${name} to list`);
    } catch (err) {
      showToast(`Failed to add ${name}`);
    }
  };

  const handleRemoveItem = async (id: string, name: string) => {
    const prevItems = [...listItems];
    setListItems(prev => prev.filter(item => item.id !== id));
    showToast(`Removed ${name}`);
    try {
      await apiClient.removeListItem(id);
    } catch (err) {
      showToast(`Failed to remove ${name}`);
      setListItems(prevItems);
    }
  };

  const handleUpdateQuantity = async (id: string, name: string, delta: number) => {
    const item = listItems.find(i => i.id === id);
    if (!item) return;
    const newQ = item.quantity + delta;

    if (newQ <= 0) {
      handleRemoveItem(id, name);
      return;
    }

    const prevItems = [...listItems];
    setListItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQ } : i));

    try {
      await apiClient.updateListItemQuantity(id, newQ);
    } catch (err) {
      showToast('Failed to update quantity');
      setListItems(prevItems);
    }
  };

  const totalItems = listItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = listItems.reduce((acc, item) => acc + ((item.price ?? 0) * item.quantity), 0);

  if (activeTab === 'landing') {
    return <LandingPage onGetStarted={() => setActiveTab('login')} />;
  }

  if (activeTab === 'login') {
    return <Login onGuestEntry={() => setActiveTab('home')} onBackToLanding={() => setActiveTab('landing')} />;
  }

  return (
    /* Root — mint-green background from design system */
    <div className="bg-[#f4fcf0] text-on-background font-body-md min-h-screen flex flex-col relative overflow-x-hidden">

      {/* ── TOAST ── */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
          <div className="bg-inverse-surface text-inverse-on-surface px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 font-body-md text-body-md">
            <CheckCircle2 className="w-4 h-4 text-primary-fixed-dim shrink-0" />
            {toastMessage}
          </div>
        </div>
      )}

      {/* ── VOICE FEEDBACK BAR (shown when mic is active) ── */}
      {(state !== 'idle' || errorMessage) && (
        <div className="fixed top-16 left-0 right-0 z-40 flex items-center justify-between bg-surface-container-low border-b border-outline-variant px-4 py-2 text-[12px]">
          <div className="flex items-center gap-2">
            {state === 'listening' && <span className="w-2 h-2 rounded-full bg-error animate-ping" />}
            {state === 'processing' && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
            <span className="text-on-surface font-semibold">
              {state === 'listening' && 'Listening...'}
              {state === 'processing' && 'Thinking...'}
              {state === 'error' && <span className="text-error">{errorMessage}</span>}
            </span>
            {transcript && <span className="text-on-surface-variant truncate max-w-[200px] italic">"{transcript}"</span>}
          </div>
          <button onClick={resetState} className="text-on-surface-variant hover:text-on-surface ml-4">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          SIDE NAV BAR (Desktop)
      ══════════════════════════════════════════════════ */}
      <nav className={`hidden md:flex h-screen fixed left-0 top-0 bg-surface border-r border-outline-variant flex-col py-section-gap z-40 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`flex items-center px-4 mb-8 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isSidebarCollapsed && (
            <div>
              <button onClick={() => setActiveTab('landing')} className="text-left focus:outline-none">
                <h1 className="font-headline-md text-headline-md text-primary mb-1 hover:text-primary-fixed-dim transition-colors">VoxCart</h1>
              </button>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Premium Shopping</p>
            </div>
          )}
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-[24px]">{isSidebarCollapsed ? 'menu' : 'menu_open'}</span>
          </button>
        </div>
        <div className="flex-1 flex flex-col gap-1 px-2">
          {SIDE_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex items-center gap-stack-md rounded-lg py-3 transition-colors duration-200 ease-in-out ${
                isSidebarCollapsed ? 'px-0 justify-center' : 'px-4'
              } ${activeTab === item.id
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'text-on-surface-variant hover:bg-surface-container hover:bg-surface-container-high'
                }`}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <span className="material-symbols-outlined text-[24px]" style={activeTab === item.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
              {!isSidebarCollapsed && <span className="font-label-bold text-label-bold whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </div>

      </nav>

      {/* ══════════════════════════════════════════════════
          TOP NAV BAR (Desktop)
      ══════════════════════════════════════════════════ */}
      <header className={`hidden md:flex fixed top-0 right-0 h-16 bg-surface border-b border-outline-variant justify-between items-center px-container-margin z-30 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-16rem)]'}`}>
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 pl-10 pr-4 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Search VoxCart..."
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={startListening} className={`text-on-surface-variant hover:text-primary transition-colors scale-95 active:scale-100 ${state === 'listening' ? 'text-error animate-pulse' : ''}`}>
            <span className="material-symbols-outlined text-[20px]">mic</span>
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-colors scale-95 active:scale-100">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <button onClick={() => setActiveTab('cart')} className="relative text-on-surface-variant hover:text-primary transition-colors scale-95 active:scale-100">
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-on-primary rounded-full text-[10px] font-bold flex items-center justify-center leading-none">
                {totalItems}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('profile')} className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-outline-variant hover:border-primary transition-colors">
            <img alt="User Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmpxi4qTQFeam-2cFLbc1nILWFUVOaDxryDOR9QwUwPKNgbS9opS0Q7QJglH2uQREEgJ4ZKzUme8y9JUM2O4gf3NHoLPzL67TYvMro707S1-G8MKovuLTSYBBZvd0d-JSLyzc1Byu5sGm8IJOZ5KTZU5QkhP0VUAeOlCX_mBUMmjAm-1WS-9qENOsTs-ncGrtXDgW2XIYJ2WZOuMnwwu6BoC64RYvS4Ny7SQ7DfD3oOoRGoyEpKtATmw" />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════
          MOBILE TOP BAR (< md)
      ══════════════════════════════════════════════════ */}
      <header className="md:hidden flex items-center justify-between h-14 px-4 bg-white/70 backdrop-blur-[20px] border-b border-white/40 shadow-sm fixed top-0 left-0 right-0 z-50">
        <button onClick={() => setActiveTab('landing')} className="focus:outline-none">
          <span className="font-display-lg text-display-lg text-primary hover:text-primary-fixed-dim transition-colors">VoxCart</span>
        </button>
        <div className="flex items-center gap-0.5">
          {SIDE_NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`p-2 rounded-full transition-all relative ${activeTab === item.id ? 'text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
            >
              <span className="material-symbols-outlined text-[22px]" style={activeTab === item.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
              {item.id === 'cart' && totalItems > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-on-primary rounded-full text-[9px] font-bold flex items-center justify-center leading-none">{totalItems}</span>
              )}
            </button>
          ))}
          <button
            onClick={startListening}
            className={`p-2 rounded-full transition-all ml-1 ${state === 'listening' ? 'bg-error text-on-error animate-pulse' : 'bg-primary text-on-primary'}`}
          >
            <span className="material-symbols-outlined text-[20px]">mic</span>
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════ */}
      <main className={`flex-1 pt-16 min-h-screen bg-surface-bright flex flex-col transition-all duration-300 ease-in-out overflow-x-hidden ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>

        {/* Mobile category chips — only on browse */}
        {activeTab === 'browse' && (
          <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-3 bg-white/60 border-b border-white/30 no-scrollbar">
            {REAL_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full font-label-bold text-label-bold transition-colors border ${activeCategory === cat
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-white/70 text-on-surface border-outline-variant'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'home' ? (
          <Home 
            listItems={listItems} 
            onUpdateQuantity={handleUpdateQuantity} 
            onRemove={handleRemoveItem}
            onGoToMarketplace={() => setActiveTab('browse')}
            onGoToCart={() => setActiveTab('cart')}
            onVoiceCommand={(text) => {
              if (text === '') setIsVoxOpen(true);
              else handleVoxCommand(text);
            }}
            onAdd={(product) => handleAddToList(product.name, 1, '')}
          />
        ) : activeTab === 'browse' ? (
          <Browse
            products={MOCK_PRODUCTS}
            categories={REAL_CATEGORIES}
            activeCategory={activeCategory}
            onSetCategory={cat => setActiveCategory(cat)}
            onVoiceCommand={(text) => {
              setIsVoxOpen(true);
              setTimeout(() => {
                voxPanelRef.current?.sendCommand(text);
              }, 100);
            }}
            onAdd={product => handleAddToList(product.name, 1, '')}
            cartItems={listItems}
          />
        ) : activeTab === 'cart' ? (
          <CartCheckout
            cartItems={listItems as any}
            onUpdateQuantity={(id: string, qty: number) => {
              const item = listItems.find(i => i.id === id);
              if (item) handleUpdateQuantity(id, item.name, qty - (item.quantity || 1));
            }}
            onRemove={(id: string) => {
              const item = listItems.find(i => i.id === id);
              if (item) handleRemoveItem(id, item.name);
            }}
            onBack={() => setActiveTab('home')}
            onPlaceOrder={() => {
              const totalItems = listItems.reduce((acc, item) => acc + item.quantity, 0);
              const subtotal = listItems.reduce((acc, item) => acc + ((item.price ?? 0) * item.quantity), 0);
              const totalPrice = subtotal * 1.08;
              const newOrder: Order = {
                id: `VC-${Math.floor(10000 + Math.random() * 90000)}`,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                totalItems,
                totalPrice,
                items: listItems.map(i => ({ name: i.name ?? i.itemName ?? '', price: i.price ?? 0, quantity: i.quantity }))
              };
              setOrderHistory(prev => [newOrder, ...prev]);
              setActiveTab('orderConfirmation');
            }}
            onVoiceCommand={(text) => {
              setIsVoxOpen(true);
              setTimeout(() => { voxPanelRef.current?.sendCommand(text); }, 100);
            }}
          />
        ) : activeTab === 'detail' && selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            substitutes={MOCK_PRODUCTS.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 3)}
            boughtWith={MOCK_PRODUCTS.filter(p => p.category !== selectedProduct.category).slice(0, 3)}
            onBack={() => setActiveTab('browse')}
            onAddToCart={(prod, qty) => handleAddToList(prod.name, qty, '')}
          />
        ) : activeTab === 'orderConfirmation' ? (
          <OrderConfirmation 
            onBackToHome={() => { setListItems([]); setActiveTab('home'); }}
            onViewProfile={() => { setListItems([]); setActiveTab('profile'); }}
            summary={{ totalItems, totalPrice: totalPrice * 1.08 }} // total + 8% tax approximation for display since it's just a summary snapshot
          />
        ) : activeTab === 'profile' ? (
          <Profile 
            orders={orderHistory} 
            onStartShopping={() => setActiveTab('home')} 
            showToast={showToast} 
            language={language}
            onLanguageChange={setLanguage}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="w-16 h-16 text-outline-variant mb-4" />
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Coming Soon</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">This section is under construction.</p>
          </div>
        )}
      </main>


      {/* ══════════════════════════════════════════════════
          VOX PANEL + FAB
      ══════════════════════════════════════════════════ */}
      <VoxPanel
        ref={voxPanelRef}
        isOpen={isVoxOpen}
        onClose={() => setIsVoxOpen(false)}
        conversationLog={conversationLog}
        isProcessing={isProcessingVox}
        speechState={state}
        transcript={transcript}
        startListening={startListening}
        stopListening={stopListening}
        onQuickReply={(text) => handleVoxCommand(text)}
      />

      <div className="fixed bottom-8 right-8 z-40 flex items-center group">
        {/* Hover Tooltip (Desktop Only) */}
        <div className="hidden md:flex absolute right-[calc(100%+16px)] bg-inverse-surface text-inverse-on-surface text-sm font-label-bold px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none items-center">
          How can I help you?
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-inverse-surface rotate-45"></div>
        </div>
        
        <button
          onClick={() => setIsVoxOpen(true)}
          className="w-14 h-14 bg-primary text-on-primary rounded-xl shadow-lg flex items-center justify-center hover:bg-on-primary-fixed-variant transition-transform transform group-hover:scale-105 active:scale-95 focus:outline-none"
        >
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
        </button>
      </div>

      {/* Contextual FAB Tooltip (Dismissible) */}
      {listItems.length === 0 && !hasSeenVoxTooltip && (
        <div className="fixed bottom-24 right-8 z-50 bg-inverse-surface text-inverse-on-surface p-4 rounded-lg shadow-lg flex flex-col gap-2 max-w-xs transform transition-all duration-300" id="fab-tooltip">
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-inverse-surface rotate-45"></div>
          <div className="flex justify-between items-start gap-4">
            <p className="font-body-md text-body-md">Ask Vox anything, anytime.</p>
            <button
              className="text-inverse-on-surface hover:text-white"
              onClick={() => {
                setHasSeenVoxTooltip(true);
                localStorage.setItem('hasSeenVoxTooltip', 'true');
              }}
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <button
            className="self-end text-primary-fixed font-label-bold text-label-bold hover:underline mt-1"
            onClick={() => {
              setHasSeenVoxTooltip(true);
              localStorage.setItem('hasSeenVoxTooltip', 'true');
            }}
          >
            Got it
          </button>
        </div>
      )}

    </div>
  );
}
