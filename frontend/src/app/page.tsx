"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { User, Mail, Lock, Eye } from 'lucide-react';

export default function Home() {
  const wheelRef = useRef<HTMLDivElement>(null);
  const signUpRef = useRef<HTMLDivElement>(null);
  const signInRef = useRef<HTMLDivElement>(null);
  
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');

  const calculateAngle = (e: PointerEvent | React.PointerEvent) => {
    if (!wheelRef.current) return 0;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    const radian = Math.atan2(clientY - centerY, clientX - centerX);
    return radian * (180 / Math.PI);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const angle = calculateAngle(e);
    setStartAngle(angle - rotation);
  };

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return;
    const newAngle = calculateAngle(e);
    let newRotation = newAngle - startAngle;
    
    // Normalize and limit rotation to -90 to 90 degrees
    if (newRotation > 180) newRotation -= 360;
    if (newRotation < -180) newRotation += 360;
    
    if (newRotation > 90) newRotation = 90;
    if (newRotation < -90) newRotation = -90;
    
    setRotation(newRotation);
  }, [isDragging, startAngle]);

  const onPointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (rotation <= -40) {
      // Turned Left -> Sign Up
      setAuthMode('signup');
      if (window.innerWidth > 768) {
        signUpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else if (rotation >= 40) {
      // Turned Right -> Sign In
      setAuthMode('signin');
      if (window.innerWidth > 768) {
        signInRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
    // Snap back
    setRotation(0);
  }, [isDragging, rotation]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [isDragging, onPointerMove, onPointerUp]);

  return (
    <main>
      <img src="/vyrolls_background_1789170713473.jpg" alt="Background" className="background-image" />
      
      {/* Mobile Top Logo & Text */}
      <div className="mobile-only" style={{ position: 'fixed', top: 0, left: 0, width: '100%', textAlign: 'center', zIndex: 50, padding: '1.5rem 0 1rem 0', background: 'var(--dark-bg)' }}>
        <h3 className="serif gold-text animate-text" style={{ fontSize: '1.8rem', letterSpacing: '3px', animationDelay: '0.1s', marginBottom: '0.2rem' }}>VYROLLS</h3>
        <p className="gold-text animate-text" style={{ fontSize: '0.6rem', letterSpacing: '3px', animationDelay: '0.2s', textTransform: 'uppercase' }}>Drive Your World</p>
      </div>

      <div className="app-container">
        
        {/* Left Panel: Sign Up (Desktop Only) */}
        <div className="panel-container desktop-only" ref={signUpRef}>
          <div className="glass-panel animate-text" style={{ padding: '2.5rem', animationDelay: '0.1s', transition: 'box-shadow 0.3s' }}>
            <h5 className="animate-text" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '2px', color: 'var(--gold-primary)', marginBottom: '0.5rem', animationDelay: '0.2s' }}>Join the Ecosystem</h5>
            <h2 className="serif animate-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', animationDelay: '0.3s' }}>Sign Up</h2>
            <p className="animate-text" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '1px', animationDelay: '0.4s' }}>Create Your Account</p>
            
            <form>
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input type="text" placeholder="Full Name" className="input-field" />
              </div>
              
              <div className="input-group">
                <Mail size={18} className="input-icon" />
                <input type="email" placeholder="Email" className="input-field" />
              </div>
              
              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input type="password" placeholder="Password" className="input-field" />
                <Eye size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', cursor: 'pointer' }} />
              </div>
              
              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input type="password" placeholder="Confirm Password" className="input-field" />
                <Eye size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', cursor: 'pointer' }} />
              </div>
              
              <button type="button" className="btn-primary" style={{ marginTop: '1rem' }}>
                Join VyRolls &rarr;
              </button>
            </form>
            
            <div className="divider">or continue with</div>
            
            <button type="button" className="btn-outline">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
              Continue with Apple
            </button>
            <button type="button" className="btn-outline">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44-3.95 0-7.14-3.18-7.14-7.13 0-3.95 3.19-7.14 7.14-7.14 1.9 0 3.62.72 4.93 1.92l2.09-2.09C17.38 2.8 14.88 1.7 12.18 1.7 6.56 1.7 2 6.27 2 11.89c0 5.63 4.56 10.19 10.18 10.19 5.25 0 9.5-3.88 9.5-9.35 0-.58-.08-1.11-.23-1.63z"/></svg>
              Continue with Google
            </button>
            
            <p className="footer-text">
              By creating an account you agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>

        {/* Center: Showcase */}
        <div className="center-showcase">
          <div className="desktop-only" style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 10 }}>
             <h3 className="serif gold-text animate-text" style={{ fontSize: '1.5rem', letterSpacing: '2px', animationDelay: '0.1s' }}>VYROLLS</h3>
          </div>
          
          <h4 className="animate-text desktop-only" style={{ textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)', animationDelay: '0.5s' }}>One Ecosystem. A Higher Standard.</h4>
          <h1 className="serif gold-text typing-text desktop-only" style={{ fontSize: '3.5rem', margin: '1rem 0' }}>Start Your Royal Life-Drive.</h1>
          <p className="animate-text desktop-only" style={{ color: 'var(--text-secondary)', animationDelay: '0.7s' }}>Turn the wheel to choose your journey.</p>
          
          {/* Mobile Specific Header Text */}
          <h1 className="serif gold-text animate-text mobile-only" style={{ fontSize: '2rem', margin: '6rem 0 1rem 0', animationDelay: '0.3s' }}>Welcome to the Royal Life-Drive.</h1>
          <h4 className="animate-text mobile-only" style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.6rem', color: 'var(--text-secondary)', animationDelay: '0.4s', lineHeight: '1.5' }}>People. Places. Possibilities.<br/>A Higher Standard.</h4>

          <div className="steering-wheel-wrapper">
             <div 
               ref={wheelRef}
               onPointerDown={onPointerDown}
               style={{ 
                 transform: `rotate(${rotation}deg)`, 
                 transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                 cursor: isDragging ? 'grabbing' : 'grab',
                 width: '100%', 
                 height: '100%',
                 touchAction: 'none',
                 display: 'flex',
                 justifyContent: 'center',
                 alignItems: 'center'
               }}
             >
               <img src="/vyrolls_steering_wheel.png" alt="Vyrolls Steering Wheel" className="steering-wheel-img" draggable={false} />
               {/* Center Horn Button */}
               <div 
                 onPointerDown={(e) => {
                   e.stopPropagation();
                 }}
                 onClick={() => {
                   const audio = new Audio('/horn.wav');
                   audio.play();
                 }}
                 style={{
                   position: 'absolute',
                   width: '24%',
                   height: '24%',
                   top: '38%',
                   left: '38%',
                   borderRadius: '50%',
                   cursor: 'pointer',
                   zIndex: 20
                 }}
                 title="Honk the Horn!"
               />
             </div>
             <div className="animate-text steer-label-left" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold-primary)', textAlign: 'right', animationDelay: '1.1s', pointerEvents: 'none', opacity: rotation < -10 ? 1 : 0.5, transition: 'opacity 0.3s' }}>
               <p style={{ marginBottom: '0.5rem', whiteSpace: 'nowrap' }}>TURN LEFT</p>
               <h4 className="serif" style={{ whiteSpace: 'nowrap' }}>SIGN UP</h4>
             </div>
             <div className="animate-text steer-label-right" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold-primary)', textAlign: 'left', animationDelay: '1.2s', pointerEvents: 'none', opacity: rotation > 10 ? 1 : 0.5, transition: 'opacity 0.3s' }}>
               <p style={{ marginBottom: '0.5rem', whiteSpace: 'nowrap' }}>TURN RIGHT</p>
               <h4 className="serif" style={{ whiteSpace: 'nowrap' }}>SIGN IN</h4>
             </div>
          </div>
          
          <p className="animate-text mobile-only" style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Steer left for Sign up &bull; Steer right for Sign In</p>

          <div className="desktop-only" style={{ marginTop: 'auto', marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '3rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>
             <span>People</span>
             <span>Cars</span>
             <span>Technology</span>
             <span>Experiences</span>
          </div>
        </div>

        {/* Right Panel: Sign In (Desktop Only) */}
        <div className="panel-container desktop-only" ref={signInRef}>
          <div className="glass-panel animate-text" style={{ padding: '2.5rem', animationDelay: '0.1s', transition: 'box-shadow 0.3s' }}>
            <h5 className="animate-text" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '2px', color: 'var(--gold-primary)', marginBottom: '0.5rem', animationDelay: '0.2s' }}>Welcome Back</h5>
            <h2 className="serif animate-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', animationDelay: '0.3s' }}>Sign In</h2>
            <p className="animate-text" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '1px', animationDelay: '0.4s' }}>Access Your World</p>
            
            <form>
              <div className="input-group">
                <Mail size={18} className="input-icon" />
                <input type="email" placeholder="Email" className="input-field" />
              </div>
              
              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input type="password" placeholder="Password" className="input-field" />
                <Eye size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', cursor: 'pointer' }} />
              </div>
              
              <div className="checkbox-group">
                <label className="checkbox-wrapper">
                  <input type="checkbox" className="custom-checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#">Forgot password?</a>
              </div>
              
              <button type="button" className="btn-primary" style={{ marginTop: '1rem' }}>
                Sign In &rarr;
              </button>
            </form>
            
            <div className="divider">or continue with</div>
            
            <button type="button" className="btn-outline">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
              Continue with Apple
            </button>
            <button type="button" className="btn-outline">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44-3.95 0-7.14-3.18-7.14-7.13 0-3.95 3.19-7.14 7.14-7.14 1.9 0 3.62.72 4.93 1.92l2.09-2.09C17.38 2.8 14.88 1.7 12.18 1.7 6.56 1.7 2 6.27 2 11.89c0 5.63 4.56 10.19 10.18 10.19 5.25 0 9.5-3.88 9.5-9.35 0-.58-.08-1.11-.23-1.63z"/></svg>
              Continue with Google
            </button>
            
            <p className="footer-text">
              By continuing you agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>

        {/* Unified Auth Panel (Mobile Only) */}
        <div className="panel-container mobile-only">
          <div className="glass-panel animate-text" style={{ padding: '1.5rem', animationDelay: '0.1s' }}>
             <div className="auth-toggle">
               <button type="button" className={`auth-toggle-btn ${authMode === 'signup' ? 'active' : ''}`} onClick={() => setAuthMode('signup')}>Sign Up</button>
               <button type="button" className={`auth-toggle-btn ${authMode === 'signin' ? 'active' : ''}`} onClick={() => setAuthMode('signin')}>Sign In</button>
             </div>
             
             {authMode === 'signup' ? (
               <>
                 <h5 className="serif animate-text" style={{ fontSize: '1.2rem', color: 'var(--gold-primary)', textAlign: 'center', marginBottom: '0.2rem' }}>Join the VyRolls Ecosystem</h5>
                 <p className="animate-text" style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>More than a drive. A higher standard.</p>
                 <form>
                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                      <User size={16} className="input-icon" />
                      <input type="text" placeholder="Full Name" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem' }} />
                    </div>
                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                      <Mail size={16} className="input-icon" />
                      <input type="email" placeholder="Email Address" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem' }} />
                    </div>
                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                      <Lock size={16} className="input-icon" />
                      <input type="password" placeholder="Password" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem' }} />
                      <Eye size={14} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', cursor: 'pointer' }} />
                    </div>
                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                      <Lock size={16} className="input-icon" />
                      <input type="password" placeholder="Confirm Password" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem' }} />
                      <Eye size={14} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', cursor: 'pointer' }} />
                    </div>
                    <button type="button" className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.7rem' }}>
                      Join VyRolls &rarr;
                    </button>
                 </form>
               </>
             ) : (
               <>
                 <h5 className="serif animate-text" style={{ fontSize: '1.2rem', color: 'var(--gold-primary)', textAlign: 'center', marginBottom: '0.2rem' }}>Welcome Back</h5>
                 <p className="animate-text" style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Access Your World.</p>
                 <form>
                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                      <Mail size={16} className="input-icon" />
                      <input type="email" placeholder="Email Address" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem' }} />
                    </div>
                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                      <Lock size={16} className="input-icon" />
                      <input type="password" placeholder="Password" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem' }} />
                      <Eye size={14} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', cursor: 'pointer' }} />
                    </div>
                    <button type="button" className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.7rem' }}>
                      Sign In &rarr;
                    </button>
                 </form>
               </>
             )}
             
             <div className="divider">OR CONTINUE WITH</div>
             
             <div style={{ display: 'flex', gap: '0.5rem' }}>
               <button type="button" className="btn-outline" style={{ flex: 1, padding: '0.6rem', fontSize: '0.75rem', marginBottom: '0' }}>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
                 Apple
               </button>
               <button type="button" className="btn-outline" style={{ flex: 1, padding: '0.6rem', fontSize: '0.75rem', marginBottom: '0' }}>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44-3.95 0-7.14-3.18-7.14-7.13 0-3.95 3.19-7.14 7.14-7.14 1.9 0 3.62.72 4.93 1.92l2.09-2.09C17.38 2.8 14.88 1.7 12.18 1.7 6.56 1.7 2 6.27 2 11.89c0 5.63 4.56 10.19 10.18 10.19 5.25 0 9.5-3.88 9.5-9.35 0-.58-.08-1.11-.23-1.63z"/></svg>
                 Google
               </button>
             </div>
             
             {authMode === 'signup' && (
               <p style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '1rem', color: 'var(--text-secondary)' }}>
                 Already have an account? <span style={{ color: 'var(--gold-primary)', cursor: 'pointer' }} onClick={() => setAuthMode('signin')}>Sign In &rarr;</span>
               </p>
             )}
             
             <p className="footer-text" style={{ fontSize: '0.6rem', marginTop: '1rem' }}>
               By continuing, you agree to our <a href="#">Terms of Service</a><br/>and <a href="#">Privacy Policy</a>.
             </p>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.6rem', marginTop: '1.5rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>Drive a higher tomorrow.</p>
        </div>
        
      </div>
    </main>
  );
}
