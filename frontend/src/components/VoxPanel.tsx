import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { X, Mic, Send, Bot, User, Check, Package, Sparkles, Loader2, Plus, Mic2, AudioLines, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../utils/currency';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

import { apiClient } from '../api/client';

export type VoxMessage = {
  id: string;
  role: 'user' | 'vox';
  text: string;
  actions?: any[];
  quickReplies?: string[];
  productCard?: any;
  productCards?: any[];
  isError?: boolean;
  retryText?: string;
};

interface VoxPanelProps {
  isOpen: boolean;
  onClose: () => void;
  conversationLog: VoxMessage[];
  isProcessing: boolean;
  speechState: string;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  onQuickReply: (text: string) => void;
}

export interface VoxPanelRef {
  sendCommand: (text: string) => void;
}

const VoxPanel = forwardRef<VoxPanelRef, VoxPanelProps>(({ 
  isOpen, onClose, conversationLog, isProcessing, speechState: state, transcript, startListening, stopListening, onQuickReply 
}, ref) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationLog, transcript, state]);

  useImperativeHandle(ref, () => ({
    sendCommand: (text: string) => {
      onQuickReply(text);
    }
  }));

  const handleQuickReply = (reply: string) => {
    onQuickReply(reply);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .vox-glass {
            background-color: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
        .pulse-ring {
            animation: pulse 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 178, 89, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(0, 178, 89, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 178, 89, 0); }
        }
        .slide-up {
            animation: slideUp 0.4s ease-out forwards;
        }
        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
      `}</style>

      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-[5px] transition-opacity"
        onClick={onClose}
      />

      {/* Panel Container */}
      <div className={`fixed z-[70] vox-glass flex flex-col overflow-hidden shadow-2xl pointer-events-auto slide-up transition-all duration-300 ease-in-out ${
        isFullscreen
          ? 'inset-0 rounded-none'
          : 'bottom-0 left-0 w-full md:bottom-[84px] md:right-6 md:left-auto md:w-[420px] md:rounded-[32px] h-[80vh] md:h-[calc(100vh-100px)] md:max-h-[751px] rounded-t-[32px] pb-safe'
      }`}>
        
        {/* Handle — hidden in fullscreen */}
        {!isFullscreen && (
          <div className="w-full flex justify-center py-4">
            <div className="w-12 h-1.5 bg-outline-variant/50 rounded-full"></div>
          </div>
        )}

        {/* Header */}
        <div className="px-6 pb-4 flex items-center justify-between border-b border-[rgba(255,255,255,0.4)] shrink-0">
          <div className="flex items-center gap-2">
            <AudioLines className="text-primary w-7 h-7" />
            <div>
              <h2 className="font-display font-bold text-[18px] text-on-surface leading-tight">Vox Voice Agent</h2>
              <p className="font-body text-[12px] font-bold text-on-surface-variant">{state === 'listening' ? 'Listening...' : 'Ready'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(f => !f)}
              className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isFullscreen ? 'close_fullscreen' : 'open_in_full'}
              </span>
            </button>
            <button onClick={onClose} className="p-3 -mr-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conversation Log */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-12 flex flex-col gap-6 no-scrollbar">
          {conversationLog.length === 0 ? (
            <div className="flex gap-3 max-w-[85%] fade-in-up">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <Bot className="text-on-primary-container w-4 h-4" />
              </div>
              <div className="vox-glass px-4 py-3 rounded-2xl rounded-tl-sm text-on-surface font-body text-[14px] shadow-sm">
                Hi there! What can I help you find today? I can add items to your cart or track an order.
              </div>
            </div>
          ) : (
            conversationLog.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'self-end flex-row-reverse max-w-[85%]' : 'max-w-[90%]'}`}>
                
                {msg.role === 'vox' && (
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 mt-1">
                    <Bot className="text-on-primary-container w-4 h-4" />
                  </div>
                )}
                
                <div className={`flex flex-col gap-2 w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl text-[14px] font-body shadow-sm w-fit ${msg.role === 'user' ? 'bg-primary text-on-primary rounded-tr-sm' : 'vox-glass rounded-tl-sm text-on-surface'}`}>
                    {msg.text}
                    
                    {/* Action Confirmations inline (for fastpath/etc) */}
                    {msg.actions && msg.actions.map((action, idx) => (
                      <div key={idx} className={`flex items-center gap-1.5 mt-2 text-[12px] font-bold px-2 py-1 rounded w-fit ${action.result?.error ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                        {action.result?.error ? (
                          <X className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>{action.tool.replace('_', ' ')}: {action.result?.error || action.result?.name || action.result?.itemName || 'done'}</span>
                      </div>
                    ))}
                    
                    {/* Retry button for errors */}
                    {msg.isError && msg.retryText && (
                      <button 
                        onClick={() => onQuickReply(msg.retryText!)}
                        className="mt-2 text-[12px] bg-error text-on-error px-3 py-1.5 rounded-full font-bold shadow-sm hover:scale-105 active:scale-95 transition-transform"
                      >
                        Retry
                      </button>
                    )}
                  </div>

                  {/* Product Card Rendering */}
                  {msg.productCard && (
                    <div className="vox-glass p-3 rounded-xl flex items-center gap-3 w-full border-l-4 border-l-primary shadow-sm mt-2">
                      <div className="w-12 h-12 rounded-lg bg-surface-container-high overflow-hidden shrink-0">
                        {msg.productCard.image ? (
                           <img src={msg.productCard.image} alt={msg.productCard.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x400/E8F5E9/2E7D32?text=${encodeURIComponent(msg.productCard?.name?.split(' ')[0] || 'Product')}`; }} />
                        ) : (
                           <div className="w-full h-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                             <Package className="w-6 h-6 text-on-surface-variant" />
                           </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-body text-[14px] text-on-surface font-medium line-clamp-1">{msg.productCard.name}</h4>
                        <p className="font-body text-[12px] font-bold text-primary">{formatPrice(msg.productCard.price)}</p>
                      </div>
                    </div>
                  )}

                  {/* Multiple Product Cards Rendering (Carousel) */}
                  {msg.productCards && msg.productCards.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto no-scrollbar w-full py-1 mt-1 -mx-2 px-2 snap-x">
                      {msg.productCards.map((card, idx) => (
                        <div key={idx} className="vox-glass p-3 rounded-xl flex flex-col gap-2 min-w-[140px] max-w-[140px] shadow-sm snap-start">
                          <div className="w-full h-[100px] rounded-lg bg-surface-container-high overflow-hidden shrink-0">
                            {card.image ? (
                               <img src={card.image} alt={card.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x400/E8F5E9/2E7D32?text=${encodeURIComponent(card.name.split(' ')[0])}`; }} />
                            ) : (
                               <div className="w-full h-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                                 <Package className="w-8 h-8 text-on-surface-variant opacity-50" />
                               </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <h4 className="font-body text-[13px] text-on-surface font-medium line-clamp-2 leading-tight">{card.name}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <p className="font-body text-[13px] font-bold text-primary">{formatPrice(card.price || 0)}</p>
                              <button onClick={() => onQuickReply(`Add ${card.name}`)} className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform shrink-0">
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Live Transcript Bubble (User speaking/processing) */}
          {(state === 'listening' || state === 'processing') && (
            <div className="flex gap-3 max-w-[85%] self-end flex-row-reverse opacity-80">
              <div className="bg-primary text-on-primary px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm flex items-center gap-2">
                {state === 'listening' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-error animate-ping shrink-0" />
                    <span className="text-[14px] italic break-words">{transcript || 'Listening...'}</span>
                  </>
                )}
                {state === 'processing' && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span className="text-[14px] italic break-words">{transcript || 'Processing...'}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Thinking Bubble (Vox waiting for backend) */}
          {isProcessing && (
            <div className="flex gap-3 max-w-[90%]">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 mt-1">
                <Bot className="text-on-primary-container w-4 h-4" />
              </div>
              <div className="vox-glass px-4 py-3 rounded-2xl rounded-tl-sm text-on-surface shadow-sm flex items-center h-[44px]">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={logEndRef} className="h-2" />
        </div>

        {/* Quick Replies (Only if we have them) */}
        {conversationLog.length > 0 && conversationLog[conversationLog.length - 1].quickReplies && conversationLog[conversationLog.length - 1].quickReplies!.length > 0 && (
          <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar border-t border-[rgba(255,255,255,0.4)] shrink-0">
             {conversationLog[conversationLog.length - 1].quickReplies!.map((reply, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleQuickReply(reply)}
                  className="vox-glass px-4 py-2 rounded-full whitespace-nowrap font-body text-[12px] font-bold text-on-surface hover:bg-[rgba(255,255,255,0.9)] transition-colors shadow-sm"
                >
                  {reply}
                </button>
             ))}
          </div>
        )}
        
        {/* Empty state examples (only when log is empty) */}
        {conversationLog.length === 0 && !isProcessing && (
          <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar border-t border-[rgba(255,255,255,0.4)] shrink-0">
            <button onClick={() => onQuickReply("Add milk and eggs, remove bread")} className="vox-glass px-4 py-2 rounded-full whitespace-nowrap font-body text-[12px] font-bold text-on-surface hover:bg-[rgba(255,255,255,0.9)] transition-colors shadow-sm">
                Add milk and eggs, remove bread
            </button>
            <button onClick={() => onQuickReply("Show substitute for whole milk")} className="vox-glass px-4 py-2 rounded-full whitespace-nowrap font-body text-[12px] font-bold text-on-surface hover:bg-[rgba(255,255,255,0.9)] transition-colors shadow-sm">
                Show substitute for whole milk
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 pb-6 pt-3 shrink-0 relative bg-surface/50 backdrop-blur-md border-t border-white/40">
          <div className="flex items-end gap-2 bg-surface-container-highest/80 rounded-[28px] p-1.5 shadow-inner">
            <div className="flex-1 flex items-center min-h-[48px] px-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputText.trim()) {
                    onQuickReply(inputText);
                    setInputText('');
                  }
                }}
                placeholder="Ask Vox or type here..."
                className="w-full bg-transparent border-none outline-none font-body text-[15px] text-on-surface placeholder:text-on-surface-variant focus:ring-0"
              />
            </div>
            
            {inputText.trim() ? (
              <button 
                onClick={() => {
                  onQuickReply(inputText);
                  setInputText('');
                }}
                className="w-[48px] h-[48px] shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            ) : (
              <div className="relative">
                {state === 'listening' && (
                  <div className="absolute inset-0 rounded-full bg-primary-container/80 pulse-ring"></div>
                )}
                <button 
                  onClick={state === 'listening' ? stopListening : startListening}
                  className={`relative w-[48px] h-[48px] shrink-0 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-10 shadow-md ${state === 'listening' ? 'bg-error text-on-error' : 'bg-primary text-on-primary'}`}
                >
                  {state === 'listening' ? <X className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
          {state === 'listening' && (
            <p className="absolute -top-6 left-0 w-full text-center font-body text-[12px] font-bold text-primary animate-pulse">Listening...</p>
          )}
        </div>

      </div>
    </>
  );
});

export default VoxPanel;
