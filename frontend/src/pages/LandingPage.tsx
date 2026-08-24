import { useEffect, useRef, useState } from 'react';
import ShaderCanvas from '../components/ShaderCanvas';
import { Zap, ClipboardList, Users, TrendingUp } from 'lucide-react';

/* ─────────────────────────────────────────────
   Type references for the dynamically-imported 3d module.
   Three.js is NOT included in the main bundle.
───────────────────────────────────────────── */
type Landing3DMod = typeof import('../lib/landing3d');

interface LandingPageProps {
  onGetStarted: () => void;
}


/* ─── Product images from Stitch design ─── */
const MILK_IMG  = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHDOqP5gRY1GPZL5LR8Zqff_53x1v6ClUFzqDymhUwyBiVzwTOqOKNO8xCnkl8vg61oCA_-sm9utsro7huFrh1wKjF5SlNP48Y0_5QAkeklnqpG4hMbPKB3jYkooG0OQXIesDdhZHQtNQV8R5orT_AzHlANmy0HsXOosWxYFO9W7RneR4hT26VPtLAGpt4iBB1BAWifqnZHSAiFwgydgoaGa6Em-pcHzp2rdwo4gPQsvdn6_gZdr25';
const BREAD_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdxNq02lG3nOrXc3wfDMcngSiZ_2ZJKRz8rzfguAa4nesp81Z-ExUZewRaZ2w-A77oL8nMCHL8oTUjX6K6X-kd7f22vNqLVIXx1KT7HLKWiSprqALAN0SQc11WLWxNPbJ1vNxFpvNnpGzl2-ONdFF5vhWPHIYs98EhA5PF6KKYWjMHR_yfwWJ6O9dbCjlBFn_8bXc3ls2uvItObLWhbdrIsGIbwNw5i62qf-TxXhnNUoIgEpxHTgI6';
const BROC_IMG  = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZETrng5rB3fWycy9pKwXOpuCRXEbzcYSQnCBet5hdniqVhk2AWa4eTG6S0X4-kJi8IdEK-vc253X7vfca7kajJ2jnNNxG771XwReNH-5-fL29Pg2vR6FbNOMud0jutr0CmXIkzUC_4OhpXNii6RYh4KCx4mgUN_U17Xe2yHIbJIqEkKHb-X7QqqB1FQFzTlCgcTv83Vt67ofePB5pLVAQkeTYL4fu2Zn6B7-Stn1kESWMRrdGIm2E';

/* ════════════════════════════════════════════════════════
   LANDING PAGE COMPONENT
════════════════════════════════════════════════════════ */
type CardPhase = 'floating' | 'traveling' | 'hidden' | 'appearing';
const CARDS_DATA = [
  { id: 0, img: MILK_IMG, title: 'Organic Whole Milk', price: '₹49.90', startX: -180, startY: -150, delay: 0 },
  { id: 1, img: BREAD_IMG, title: 'Artisan Sourdough', price: '₹120.00', startX: 0, startY: -220, delay: 2000 },
  { id: 2, img: BROC_IMG, title: 'Fresh Broccoli', price: '₹40.00/kg', startX: 180, startY: -130, delay: 4000 },
];

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [threeReady, setThreeReady] = useState(false);
  const [count, setCount] = useState(0);
  const [bounce, setBounce] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const countRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(3);
      return;
    }

    const startTime = Date.now();
    let lastCycle = -1;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const cycle = Math.floor(elapsed / 6000);
      const timeInCycle = elapsed % 6000;

      if (cycle > lastCycle) {
        setCount(0);
        countRef.current = 0;
        lastCycle = cycle;
      }

      let nextCount = countRef.current;
      let shouldBounce = false;

      // Card 0 arrives at 600ms
      if (timeInCycle >= 600 && timeInCycle < 2600 && countRef.current < 1) { nextCount = 1; shouldBounce = true; }
      // Card 1 arrives at 2600ms
      else if (timeInCycle >= 2600 && timeInCycle < 4600 && countRef.current < 2) { nextCount = 2; shouldBounce = true; }
      // Card 2 arrives at 4600ms
      else if (timeInCycle >= 4600 && countRef.current < 3) { nextCount = 3; shouldBounce = true; }

      if (shouldBounce) {
        countRef.current = nextCount;
        setCount(nextCount);
        setBounce(true);
        setTimeout(() => setBounce(false), 250);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  /* Canvas refs */
  const orbCanvasRef      = useRef<HTMLCanvasElement>(null);
  const stepsBgRef        = useRef<HTMLCanvasElement>(null);
  const stepsSectionRef   = useRef<HTMLElement>(null);
  const cardRefs          = useRef<(HTMLDivElement | null)[]>([]);
  const stepsSceneRef     = useRef<{ cleanup: () => void; triggerReveal: () => void; onScroll: (progress: number) => void } | null>(null);

  /* Three.js cleanup refs */
  const cleanupOrb      = useRef<(() => void) | null>(null);

  /* Unified Scroll & Resize listener */
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);

    let rafId: number;
    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        const sy = window.scrollY;
        setScrollY(sy);
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(maxScroll > 0 ? (sy / maxScroll) * 100 : 0);

        if (stepsSectionRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          const rect = stepsSectionRef.current.getBoundingClientRect();
          const vh = window.innerHeight;
          const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
          
          if (stepsSceneRef.current) stepsSceneRef.current.onScroll(progress);

          const isMobile = window.innerWidth < 768;
          cardRefs.current.forEach((card, i) => {
            if (!card) return;
            const cardRect = card.getBoundingClientRect();
            const cardCenterY = cardRect.top + cardRect.height / 2;
            const distFromCenter = Math.abs(vh / 2 - cardCenterY);
            
            const scale = Math.max(1, 1.08 - (distFromCenter / (vh / 2)) * 0.08);
            const icon = card.querySelector('.step-icon') as HTMLElement;
            if (icon) icon.style.transform = `scale(${scale})`;

            if (!isMobile) {
              const offset = (progress - 0.5) * 100; 
              const multipliers = [0.5, 0, -0.5]; 
              card.style.transform = `translateY(${offset * multipliers[i]}px)`;
            } else {
              card.style.transform = 'none';
            }
          });
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Initialize immediately
    onScroll();
    
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  /* ── Scroll-reveal observer ── */
  useEffect(() => {
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lp-visible'); o.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.lp-fade').forEach(el => obs.observe(el));
    
    const stepsObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        window.dispatchEvent(new CustomEvent('stepsReveal'));
        stepsObs.disconnect();
      }
    }, { threshold: 0.2 });
    if(stepsSectionRef.current) stepsObs.observe(stepsSectionRef.current);

    return () => { obs.disconnect(); stepsObs.disconnect(); };
  }, []);

  /* ── Three.js: desktop-only, dynamic import ── */
  useEffect(() => {
    /* Guardrail 1: mobile skip */
    if (typeof window === 'undefined' || window.innerWidth < 768) return;

    /* Guardrail 2: prefers-reduced-motion */
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let cancelled = false;
    let cleanupSteps: (() => void) | null = null;

    (import('../lib/landing3d') as Promise<Landing3DMod>).then((mod) => {
      if (cancelled) return;

      /* Orb */
      if (orbCanvasRef.current) {
        cleanupOrb.current = mod.initOrbScene(orbCanvasRef.current, reducedMotion);
      }
      
      /* Steps 3D */
      if (stepsBgRef.current) {
        const steps = mod.initStepsScene(stepsBgRef.current, reducedMotion);
        stepsSceneRef.current = steps;
        
        const onReveal = () => steps.triggerReveal();
        window.addEventListener('stepsReveal', onReveal);
        
        if (stepsSectionRef.current && stepsSectionRef.current.getBoundingClientRect().top < window.innerHeight) {
          onReveal();
        }
        
        cleanupSteps = () => { steps.cleanup(); window.removeEventListener('stepsReveal', onReveal); };
      }

      setThreeReady(true);
    });

    return () => {
      cancelled = true;
      cleanupOrb.current?.();
      cleanupSteps?.();
    };
  }, []);



  return (
    <div className="bg-[#f6faff] text-on-surface font-body-md overflow-x-hidden">
      <style>{`
        .lp-fade { opacity:0; transform:translateY(20px); transition:opacity .6s ease-out, transform .6s ease-out; }
        .lp-fade.lp-visible { opacity:1; transform:translateY(0); }
        .lp-float { animation: lp-float 6s ease-in-out infinite; }
        .lp-float:nth-child(2){ animation-delay:2s; }
        .lp-float:nth-child(3){ animation-delay:4s; }
        @keyframes lp-float {
          0%,100%{ transform:translateY(0) rotate(0deg); }
          50%    { transform:translateY(-18px) rotate(5deg); }
        }
        .lp-lift:hover{ transform:translateY(-2px); box-shadow:0 10px 20px -10px rgba(0,109,52,0.5); transition:all .2s ease; }
        .lp-tilt{ transition:transform .3s ease; }
        .lp-tilt:hover{ transform:perspective(1000px) rotateX(5deg) rotateY(-5deg) translateZ(10px); }
        .lp-glass{
          background:rgba(255,255,255,0.70);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
          border:1px solid rgba(255,255,255,0.50);
          box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);
        }
        
        /* ── Feature Icon Hover ── */
        @keyframes icon-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .feature-card:hover .feature-icon { animation: icon-bounce 0.4s ease-out; }
        
        /* ── Animated Cart Sequence Keyframes ── */
        @keyframes item-fly-x {
          0% { transform: translateX(var(--start-x)) scale(1); opacity: 1; animation-timing-function: cubic-bezier(0.2, 0, 0.2, 1); }
          10% { transform: translateX(-38px) scale(0.15); opacity: 0; }
          33.3% { transform: translateX(var(--start-x)) scale(0.15); opacity: 0; animation-timing-function: ease-out; }
          40%, 100% { transform: translateX(var(--start-x)) scale(1); opacity: 1; }
        }
        @keyframes item-fly-y {
          0% { transform: translateY(var(--start-y)); animation-timing-function: cubic-bezier(0.4, 0, 1, 1); }
          10% { transform: translateY(90px); }
          10.1%, 100% { transform: translateY(var(--start-y)); }
        }
        .cart-item-outer { animation: item-fly-x 6s infinite both; }
        .cart-item-inner { animation: item-fly-y 6s infinite both; }
        
        @keyframes squash-stretch {
          0%   { transform: scaleY(1) scaleX(1); }
          30%  { transform: scaleY(0.85) scaleX(1.15); } 
          60%  { transform: scaleY(1.15) scaleX(0.85); } 
          100% { transform: scaleY(1) scaleX(1); }
        }
        .animate-squash {
          animation: squash-stretch 250ms ease-out forwards;
        }
        
        @keyframes pulse-glow {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 0.2; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }
        .mic-glow {
          transform-origin: 25px 25px;
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .cart-item-outer, .cart-item-inner, .lp-float { animation: none !important; }
          .cart-item-outer { transform: translateX(var(--start-x)) !important; }
          .cart-item-inner { transform: translateY(var(--start-y)) !important; }
        }
      `}</style>

      {/* Scroll Progress Indicator */}
      <div 
        className="absolute top-0 left-0 h-1 bg-primary z-[60] transition-all duration-150 ease-out" 
        style={{ width: `${scrollProgress}%` }} 
      />

      {/* ════ NAVBAR (Floating Pill) ════ */}
      <nav
        className="absolute top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50 py-2 px-3 flex justify-between items-center rounded-full transition-all duration-300 shadow-xl"
        style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.6)' }}
      >
        {/* Left: Logo */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-4 focus:outline-none group">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
             <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
          </div>
          <span className="text-[20px] font-bold text-primary tracking-tight hidden sm:block group-hover:text-primary-fixed-dim transition-colors" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>VoxCart</span>
        </button>

        {/* Center: Links */}
        <div className="hidden md:flex gap-8 absolute left-1/2 -translate-x-1/2">
          <a href="#how-it-works" className="text-on-surface-variant hover:text-primary font-body-sm text-sm font-medium transition-colors">How it works</a>
          <a href="#features"     className="text-on-surface-variant hover:text-primary font-body-sm text-sm font-medium transition-colors">Features</a>
        </div>

        {/* Right: CTA */}
        <div className="flex items-center gap-4 pl-4">
          <button onClick={onGetStarted} className="hidden sm:block text-on-surface-variant hover:text-primary font-body-sm text-sm font-medium transition-colors">Sign in</button>
          <button onClick={onGetStarted} className="bg-primary text-white font-body-sm text-sm font-bold py-2.5 px-6 rounded-full hover:scale-105 transition-transform shadow-md">
            Get started
          </button>
        </div>
      </nav>

      {/* ════ SECTION 1: HERO ════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* WebGL shader background (Parallax) */}
        <div 
          className="absolute inset-0 z-0"
          style={{ transform: !isMobile && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? `translateY(${scrollY * 0.3}px)` : 'none' }}
        >
          <ShaderCanvas className="w-full h-full" />
        </div>

        <div 
          className="container mx-auto px-8 relative z-10 grid md:grid-cols-2 gap-12 items-center"
          style={{ 
            transform: !isMobile && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? `scale(${Math.max(0.9, 1 - scrollY * 0.0005)}) translateY(${scrollY * 0.4}px)` : 'none',
            opacity: !isMobile && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? Math.max(0, 1 - scrollY * 0.0015) : 1
          }}
        >
          {/* ── LEFT: copy + orb ── */}
          <div className="max-w-2xl">
            <h1 className="text-[48px] leading-[56px] tracking-[-0.02em] font-bold text-on-surface mb-6" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
              Shop by voice. <br />
              <span className="text-primary">Fast, hands-free,</span> always organized.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
              Build your grocery list effortlessly while you cook, clean, or commute. VoxCart listens, categorizes, and preps your cart in seconds.
            </p>

            {/* Orb + CTA row */}
            <div className="flex items-center gap-6">
              <button
                onClick={onGetStarted}
                className="inline-flex bg-primary text-on-primary font-body-lg text-body-lg font-bold py-4 px-8 rounded-xl lp-lift transition-all items-center gap-2 shadow-md"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                </svg>
                Start shopping now
              </button>

              {/* THREE.JS ORB – desktop only */}
              <div className="hidden md:block relative" style={{ width: 100, height: 100 }}>
                <canvas
                  ref={orbCanvasRef}
                  style={{ width: 100, height: 100, borderRadius: '50%' }}
                />
                {/* Faint label underneath */}
                <p className="text-center font-label-bold text-label-bold text-primary/60 mt-1 tracking-wide text-[10px]">
                  AI CORE
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Animated Cart Sequence ── */}
          <div className="relative h-[600px] flex items-center justify-center">
             {/* The focal cart */}
             <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 z-20 ${bounce ? 'animate-squash' : ''}`}>
                <svg viewBox="0 0 200 200" width="300" height="300" className="drop-shadow-2xl">
                  {/* Shopping Cart Icon */}
                  <path d="M55,60 L75,60 L85,120 L155,120 L165,80 L80,80" fill="none" stroke="#00b259" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="95" cy="145" r="8" fill="#00b259" />
                  <circle cx="145" cy="145" r="8" fill="#00b259" />
                  
                  {/* Microphone Badge Overlay */}
                  <g transform="translate(135, 45)">
                    <circle cx="25" cy="25" r="28" fill="rgba(0, 178, 89, 0.2)" className="mic-glow" /> 
                    <circle cx="25" cy="25" r="22" fill="#00b259" />
                    <path d="M25,12 C21.7,12 19,14.7 19,18 L19,25 C19,28.3 21.7,31 25,31 C28.3,31 31,28.3 31,25 L31,18 C31,14.7 28.3,12 25,12 Z M35,25 C35,30.5 30.5,35 25,35 C19.5,35 15,30.5 15,25 L13,25 C13,31.1 17.8,36.1 23.8,36.9 L23.8,42 L26.2,42 L26.2,36.9 C32.2,36.1 37,31.1 37,25 L35,25 Z" fill="white" />
                  </g>
                </svg>
                {/* Counter badge */}
                {count > 0 && (
                  <div className="absolute top-8 left-8 bg-primary text-white font-bold text-lg w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                    {count}
                  </div>
                )}
             </div>

             {/* Cards */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               {CARDS_DATA.map((card) => (
                 <div key={card.id} className="absolute z-10 cart-item-outer" style={{ animationDelay: `${card.delay}ms`, '--start-x': `${card.startX}px` } as React.CSSProperties}>
                   <div className="cart-item-inner" style={{ animationDelay: `${card.delay}ms`, '--start-y': `${card.startY}px` } as React.CSSProperties}>
                     <div className="lp-float lp-glass p-4 rounded-xl w-48 shadow-lg pointer-events-auto" style={{ animationDelay: `${card.delay}ms` }}>
                       <img className="w-full h-32 object-contain mb-3" src={card.img} alt={card.title} />
                       <p className="font-headline-sm text-headline-sm text-on-surface">{card.title}</p>
                       <p className="font-body-md text-body-md text-primary font-bold mt-1">{card.price}</p>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </section>

      {/* ════ SECTION 2: HOW IT WORKS ════ */}
      <section id="how-it-works" ref={stepsSectionRef} className="py-24 bg-[#f6faff] relative overflow-hidden">
        {/* Background Thread Canvas */}
        <canvas ref={stepsBgRef} className="hidden md:block absolute inset-0 w-full h-full z-0 pointer-events-none" />

        <div className="container mx-auto px-8 relative z-10">
          <h2 className="text-[36px] font-bold text-center text-on-surface mb-16 lp-fade" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
            Effortless Shopping in 3 Steps
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                svg: <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />,
                title: '1. Speak your list',
                body: 'Just say what you need. "Add milk, eggs, and bread." VoxCart understands natural language instantly.',
                delay: '0ms',
              },
              {
                svg: <path d="M12 2l-1.5 3h-4l3.5 2.5L8.5 11l3.5-2.5L15.5 11l-1.5-3.5L17.5 5h-4z" />,
                title: '2. Auto-Categorized',
                body: 'Items are magically sorted into aisles. Dairy, Produce, Bakery—organized for a faster trip or quick checkout.',
                delay: '100ms',
              },
              {
                svg: <path d="M17.21 9l-4.38-6.56c-.36-.54-1.08-.54-1.44 0L7.01 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27.03-.27c0-.55-.45-1-1-1h-4.79zm-5.21 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm1-9H8l3-4.4L15 10h-2z" />,
                title: '3. Review & Checkout',
                body: 'Confirm your items, adjust quantities with a tap, and proceed to seamless checkout or delivery.',
                delay: '200ms',
              },
            ].map(({ svg, title, body, delay }, index) => (
              <div key={title} className="lp-fade" style={{ transitionDelay: delay }}>
                <div ref={el => { cardRefs.current[index] = el; }} className="lp-glass p-8 rounded-xl flex flex-col items-center text-center">
                  <div className="step-icon w-16 h-16 bg-primary-container/25 text-primary rounded-full flex items-center justify-center mb-6 transition-transform duration-75 ease-out">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">{svg}</svg>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-3">{title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ SECTION 3: FEATURES ════ */}
      <section id="features" className="py-24 bg-surface-container-low">
        <div className="container mx-auto px-8">
          <h2 className="text-[36px] font-bold text-center text-on-surface mb-16 lp-fade" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
            Built for Speed and Accuracy
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Zap, title: 'Lightning Fast Parsing',   body: 'Our advanced NLP processes your speech in milliseconds, converting casual phrases into exact product matches.' },
              { icon: ClipboardList, title: 'Smart History',            body: 'VoxCart learns your preferences. "Add my usual coffee" knows exactly which brand and size you prefer.' },
              { icon: Users, title: 'Shared Household Lists', body: 'Multiple voices, one cart. Anyone in the family can add items from their device in real-time.' },
              { icon: TrendingUp, title: 'Live Price Tracking',      body: 'See your cart total update instantly as you speak, with smart alerts for sales and bulk discounts.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="lp-glass lp-tilt feature-card p-10 rounded-xl bg-white border border-outline-variant/30 lp-fade">
                <div className="text-4xl mb-4 text-primary feature-icon inline-block">
                  <Icon className="w-10 h-10" />
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3">{title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ SECTION 5: CTA ════ */}
      <section className="relative py-32 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0"><ShaderCanvas className="w-full h-full" /></div>
        <div className="container mx-auto px-8 relative z-10 text-center">
          <div className="lp-glass p-12 rounded-2xl max-w-3xl mx-auto lp-fade">
            <h2 className="text-[40px] font-bold text-on-surface mb-6 leading-tight" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
              Ready to talk to your cart?
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10">
              Join thousands of users who have cut their grocery planning time in half.
            </p>
            <button
              onClick={onGetStarted}
              className="inline-flex bg-primary text-on-primary font-body-lg text-body-lg font-bold py-4 px-10 rounded-xl lp-lift transition-all shadow-md"
            >
              Get started for free
            </button>
          </div>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer className="bg-surface-container-high py-12">
        <div className="container mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-outline-variant/30 pb-8 mb-8">
            <span className="text-[24px] font-bold text-primary mb-4 md:mb-0" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>VoxCart</span>
            <div className="flex gap-6">
              {['About', 'Privacy', 'Terms', 'Contact'].map(l => (
                <a key={l} href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <p className="text-center md:text-left font-body-sm text-body-sm text-on-surface-variant">
            © 2026 VoxCart Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
