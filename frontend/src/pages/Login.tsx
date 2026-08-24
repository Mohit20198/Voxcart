import React, { useState } from 'react';
import { ShoppingBasket, User, Loader2, Mic, Sparkles, Globe, TrendingUp, Bell } from 'lucide-react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import ShaderCanvas from '../components/ShaderCanvas';

interface LoginProps {
  onGuestEntry: () => void;
  onBackToLanding?: () => void;
}

export default function Login({ onGuestEntry, onBackToLanding }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Compute password strength 0 to 4
  const getPasswordStrength = (val: string) => {
    let score = 0;
    if (val.length > 0) score = 1;
    if (val.length > 5) score = 2;
    if (val.length > 8 && /[A-Z]/.test(val)) score = 3;
    if (val.length > 10 && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)) score = 4;
    return score;
  };
  const strength = getPasswordStrength(password);

  const handleAuth = async (e: React.FormEvent, type: 'signin' | 'signup') => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const pwdInput = form.elements.namedItem('password') as HTMLInputElement | null;
    const pwd = pwdInput ? pwdInput.value : password;

    if (!email.includes('@')) {
      setEmailError(true);
      setTimeout(() => setEmailError(false), 400); // shake duration
      return;
    }
    setEmailError(false);
    setAuthError(null);
    setLoading(true);

    try {
      if (type === 'signup') {
        await createUserWithEmailAndPassword(auth, email, pwd);
      } else {
        await signInWithEmailAndPassword(auth, email, pwd);
      }
      onGuestEntry(); // routes to Home
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onGuestEntry();
    } catch (err: any) {
      setAuthError(err.message || 'Google Sign-In failed');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    
    if (!email.includes('@')) {
      setEmailError(true);
      setTimeout(() => setEmailError(false), 400);
      return;
    }
    
    setLoading(true);
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen w-full flex flex-col relative font-body-md antialiased overflow-x-hidden">
      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .float-anim {
          animation: float 6s ease-in-out infinite;
        }
        .float-anim-delayed {
          animation: float 7s ease-in-out 1s infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
          40%, 60% { transform: translate3d(3px, 0, 0); }
        }
        .tab-transition {
          transition: all 0.3s ease;
        }
        
        .fade-slide-up {
          animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in-left {
          animation: fadeInLeft 0.8s ease-out forwards;
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .fade-in-right {
          animation: fadeInRight 0.8s ease-out forwards;
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
      `}</style>

      {/* Background Shader */}
      <div className="absolute inset-0 w-full h-full z-0">
        <ShaderCanvas />
      </div>

      <div className="flex w-full h-full min-h-screen max-w-[1440px] mx-auto z-10 flex-col md:flex-row">
        
        {/* ── LEFT PANEL (Desktop Branding) & MOBILE HEADER ── */}
        <div className="md:w-1/2 flex flex-col justify-center px-6 sm:px-16 pt-8 md:pt-0 relative">
          
          {/* Mobile Header (< md) */}
          <header className="md:hidden flex flex-col items-center justify-center pb-8 fade-slide-up">
            <button onClick={onBackToLanding} className="flex items-center gap-2 mb-2 focus:outline-none group">
              <ShoppingBasket className="text-primary w-8 h-8 group-hover:scale-105 transition-transform" />
              <h1 className="font-display text-display text-primary tracking-tight group-hover:text-primary-fixed-dim transition-colors">VoxCart</h1>
            </button>
            <p className="font-body-md text-body-md text-on-surface-variant text-center">Fast. Vocal. Efficient.</p>
          </header>

          {/* Desktop Branding (>= md) */}
          <div className="hidden md:flex flex-col mb-12 fade-in-left">
            <button onClick={onBackToLanding} className="text-left focus:outline-none w-max">
              <h1 className="font-display text-[48px] leading-tight text-primary mb-2 hover:text-primary-fixed-dim transition-colors">VoxCart</h1>
            </button>
            <p className="font-headline-md text-headline-md text-on-surface-variant max-w-sm mb-6">Your list, wherever you go.</p>
            
            {/* Feature Bullets */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Mic className="w-5 h-5 text-primary" />
                <span className="font-body-md text-body-md">Voice-first shopping</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-body-md text-body-md">Smart recommendations</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Globe className="w-5 h-5 text-primary" />
                <span className="font-body-md text-body-md">Works in your language</span>
              </div>
            </div>
          </div>
          
          {/* Desktop Floating Elements */}
          <div className="hidden md:block relative w-full h-64 mt-8 fade-in-left" style={{ animationDelay: '200ms' }}>
            <div className="absolute top-0 left-0 glass-panel rounded-xl p-4 w-48 float-anim shadow-sm z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary-container/20 rounded-full flex items-center justify-center">
                  <ShoppingBasket className="text-primary w-5 h-5" />
                </div>
                <div>
                  <p className="font-label-bold text-label-bold text-on-surface">Fresh Produce</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">2 items added</p>
                </div>
              </div>
            </div>
            
            <div className="absolute top-8 right-0 glass-panel rounded-xl p-3 w-40 float-anim shadow-sm z-0" style={{ animationDelay: '1.5s' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-secondary-container/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-secondary w-4 h-4" />
                </div>
                <div>
                  <p className="font-label-bold text-[11px] text-on-surface">Price Drop</p>
                  <p className="font-body-sm text-[10px] text-primary">-15% today</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-16 left-8 glass-panel rounded-xl p-3 w-44 float-anim-delayed shadow-sm z-0" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-tertiary-container/20 rounded-full flex items-center justify-center">
                  <Bell className="text-tertiary w-4 h-4" />
                </div>
                <div>
                  <p className="font-label-bold text-[11px] text-on-surface">Weekly Restock</p>
                  <p className="font-body-sm text-[10px] text-on-surface-variant">Ready to order</p>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-12 glass-panel rounded-xl p-4 w-52 float-anim-delayed shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded flex items-center justify-center border border-outline-variant">
                  <ShoppingBasket className="text-tertiary w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-label-bold text-label-bold text-on-surface">Pantry Staples</p>
                  <div className="h-1.5 w-full bg-surface-container mt-1 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (Auth Form) ── */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-8 md:fade-in-right fade-slide-up delay-100 flex-grow">
          <div className="w-full max-w-md bg-white/90 backdrop-blur-[20px] rounded-[24px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/50 relative overflow-hidden flex flex-col">
            
            {/* Tabs */}
            <div className="flex p-1 bg-surface-container-high rounded-full mb-5 relative z-10">
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-2 rounded-full font-label-bold text-label-bold transition-colors duration-200 ${
                  activeTab === 'signin' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2 rounded-full font-label-bold text-label-bold transition-colors duration-200 ${
                  activeTab === 'signup' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form Container */}
            <div className="flex-grow flex flex-col">
              
              {/* Sign In Form */}
              <div className={`tab-transition flex flex-col flex-grow ${activeTab === 'signin' ? 'opacity-100 translate-y-0 pointer-events-auto z-10' : 'hidden opacity-0 translate-y-4 pointer-events-none z-0'}`}>
                {isForgotPassword ? (
                  <form className="flex flex-col gap-3 flex-grow" onSubmit={handleForgotPassword}>
                    <div>
                      <h2 className="font-display text-xl text-primary mb-2">Reset Password</h2>
                      <p className="font-body-sm text-on-surface-variant mb-4">Enter your email and we'll send you a link to reset your password.</p>
                      <label className="block font-label-bold text-label-bold text-on-surface mb-1">Email Address</label>
                      <input
                        name="email"
                        type="email"
                        className={`w-full bg-surface-bright border rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow ${emailError ? 'border-error shake' : 'border-outline-variant'}`}
                        placeholder="name@example.com"
                        required
                      />
                      {emailError && <p className="text-error font-body-sm text-xs mt-1">Please enter a valid email.</p>}
                    </div>
                    {resetSent && <p className="text-primary font-body-sm mt-2">Check your email for a reset link.</p>}
                    {authError && <p className="text-error font-body-sm mt-2">{authError}</p>}
                    <div className="mt-auto pt-3 flex flex-col gap-2.5">
                      <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-surface-tint text-on-primary font-label-bold text-label-bold py-2.5 rounded-lg transition-all duration-200">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send Reset Link'}
                      </button>
                      <button type="button" onClick={() => {setIsForgotPassword(false); setAuthError(null); setResetSent(false);}} className="w-full text-on-surface-variant font-label-bold py-2.5 hover:bg-surface-container rounded-lg transition-colors">
                        Back to Sign In
                      </button>
                    </div>
                  </form>
                ) : (
                  <form className="flex flex-col gap-3 flex-grow" onSubmit={(e) => handleAuth(e, 'signin')}>
                    <div>
                      <label className="block font-label-bold text-label-bold text-on-surface mb-1">Email Address</label>
                      <input name="email" type="email" className={`w-full bg-surface-bright border rounded-lg px-4 py-2.5 font-body-md text-on-surface focus:outline-none focus:border-primary transition-shadow ${emailError ? 'border-error shake' : 'border-outline-variant'}`} placeholder="name@example.com" required />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-label-bold text-label-bold text-on-surface">Password</label>
                        <button type="button" onClick={() => setIsForgotPassword(true)} className="font-body-sm text-body-sm text-primary hover:underline">Forgot password?</button>
                      </div>
                      <input name="password" type="password" className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-2.5 font-body-md text-on-surface focus:outline-none focus:border-primary transition-shadow" placeholder="••••••••" required />
                    </div>
                    {authError && <p className="text-error font-body-sm mt-1">{authError}</p>}
                    <div className="mt-auto pt-3 flex flex-col gap-2.5">
                      <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-surface-tint text-on-primary font-label-bold text-label-bold py-2.5 rounded-lg transition-all flex items-center justify-center">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                      </button>
                      <div className="relative flex items-center py-1">
                        <div className="flex-grow border-t border-outline-variant"></div>
                        <span className="flex-shrink-0 mx-4 text-on-surface-variant font-body-sm">or</span>
                        <div className="flex-grow border-t border-outline-variant"></div>
                      </div>
                      <button type="button" onClick={handleGoogleSignIn} className="w-full border border-outline hover:bg-surface-container font-label-bold text-on-surface py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        Continue with Google
                      </button>
                      <button type="button" onClick={onGuestEntry} className="w-full bg-transparent text-on-surface-variant hover:text-on-surface font-label-bold py-2 transition-colors flex justify-center items-center gap-2">
                        <User className="w-[18px] h-[18px]" /> Continue as guest
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Sign Up Form */}
              <div className={`tab-transition flex flex-col flex-grow ${activeTab === 'signup' ? 'opacity-100 translate-y-0 pointer-events-auto z-10' : 'hidden opacity-0 translate-y-4 pointer-events-none z-0'}`}>
                <form className="flex flex-col gap-3 flex-grow" onSubmit={(e) => handleAuth(e, 'signup')}>
                  <div>
                    <label className="block font-label-bold text-label-bold text-on-surface mb-1">Full Name</label>
                    <input type="text" className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-2.5 font-body-md text-on-surface focus:outline-none focus:border-primary" placeholder="Jane Doe" required />
                  </div>
                  <div>
                    <label className="block font-label-bold text-label-bold text-on-surface mb-1">Email Address</label>
                    <input name="email" type="email" className={`w-full bg-surface-bright border rounded-lg px-4 py-2.5 font-body-md text-on-surface focus:outline-none focus:border-primary transition-shadow ${emailError ? 'border-error shake' : 'border-outline-variant'}`} placeholder="name@example.com" required />
                  </div>
                  <div>
                    <label className="block font-label-bold text-label-bold text-on-surface mb-1">Password</label>
                    <input type="password" name="password" className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-2.5 font-body-md text-on-surface focus:outline-none focus:border-primary" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                    <div className="flex gap-1 mt-2 h-1.5 w-full">
                      <div className={`flex-1 rounded-full transition-colors ${strength >= 1 ? (strength === 1 ? 'bg-error' : strength === 2 ? 'bg-tertiary-container' : strength === 3 ? 'bg-primary-fixed-dim' : 'bg-primary-container') : 'bg-surface-container'}`}></div>
                      <div className={`flex-1 rounded-full transition-colors ${strength >= 2 ? (strength === 2 ? 'bg-tertiary-container' : strength === 3 ? 'bg-primary-fixed-dim' : 'bg-primary-container') : 'bg-surface-container'}`}></div>
                      <div className={`flex-1 rounded-full transition-colors ${strength >= 3 ? (strength === 3 ? 'bg-primary-fixed-dim' : 'bg-primary-container') : 'bg-surface-container'}`}></div>
                      <div className={`flex-1 rounded-full transition-colors ${strength >= 4 ? 'bg-primary-container' : 'bg-surface-container'}`}></div>
                    </div>
                  </div>
                  {authError && <p className="text-error font-body-sm mt-1">{authError}</p>}
                  
                  <div className="mt-auto pt-2 flex flex-col gap-2.5">
                    <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-surface-tint text-on-primary font-label-bold text-label-bold py-2.5 rounded-lg transition-all flex items-center justify-center">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                    </button>
                    <div className="relative flex items-center py-0.5">
                      <div className="flex-grow border-t border-outline-variant"></div>
                      <span className="flex-shrink-0 mx-4 text-on-surface-variant font-body-sm">or</span>
                      <div className="flex-grow border-t border-outline-variant"></div>
                    </div>
                    <button type="button" onClick={handleGoogleSignIn} className="w-full border border-outline hover:bg-surface-container font-label-bold text-on-surface py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      Continue with Google
                    </button>
                    <p className="text-center font-body-sm text-on-surface-variant mt-1.5">
                      By signing up, you agree to our <a href="#" className="text-primary hover:underline">Terms</a>.
                    </p>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
