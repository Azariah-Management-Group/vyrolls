"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Eye, EyeOff, Power } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const wheelRef = useRef<HTMLDivElement>(null);
  const signUpRef = useRef<HTMLDivElement>(null);
  const signInRef = useRef<HTMLDivElement>(null);
  const ignitionAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      ignitionAudioRef.current = new Audio('/ignition.wav');
      ignitionAudioRef.current.preload = 'auto';
    }
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('user_id');
      const expiry = localStorage.getItem('session_expiry');
      if (userId && expiry) {
        if (new Date().getTime() < parseInt(expiry)) {
          router.push('/dashboard');
        } else {
          localStorage.removeItem('user_id');
          localStorage.removeItem('session_expiry');
        }
      }
    }
  }, [router]);

  const [startAngle, setStartAngle] = useState(0);
  const [authMode, setAuthMode] = useState<'signup' | 'signin' | 'verify' | 'forgot' | 'verify_reset' | 'reset'>('signup');
  const [verifyOrigin, setVerifyOrigin] = useState<'signup' | 'signin' | null>(null);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState('');

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);
  
  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [signUpMessage, setSignUpMessage] = useState('');
  const [signInMessage, setSignInMessage] = useState('');
  const [verifyMessage, setVerifyMessage] = useState('');
  
  // Forgot Password Form State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  // Reset Password Form State
  const [resetMessage, setResetMessage] = useState('');
  const [verifyResetMessage, setVerifyResetMessage] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'; // PHP Backend URL

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpMessage('Passwords do not match');
      return;
    }
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPasswordRegex.test(signUpPassword)) {
      setSignUpMessage('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number');
      return;
    }
    setLoading(true);
    setSignUpMessage('');
    try {
      const res = await fetch(`${API_URL}/signup.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: signUpName, email: signUpEmail, password: signUpPassword })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.requireOtp) {
          setVerifyMessage(data.message);
          setPendingEmail(data.email);
          setVerifyOrigin('signup');
          setTimeout(() => setAuthMode('verify'), 1500);
        } else {
          setSignInMessage('Sign up successful! Please check your email.');
          setTimeout(() => setAuthMode('signin'), 2000);
        }
      } else {
        setSignUpMessage(data.message || 'Sign up failed');
      }
    } catch (err) {
      setSignUpMessage('Error connecting to server');
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignInMessage('');
    try {
      const res = await fetch(`${API_URL}/signin.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signInEmail, password: signInPassword })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.requireOtp) {
          setVerifyMessage(data.message);
          setPendingEmail(data.email);
          setVerifyOrigin('signin');
          setTimeout(() => setAuthMode('verify'), 1500);
        } else {
          setSignInMessage('Sign in successful! Welcome back.');
          localStorage.setItem('user_id', data.user.id);
          const expiry = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
          localStorage.setItem('session_expiry', expiry.toString());
          router.push('/dashboard');
        }
      } else {
        setSignInMessage(data.message || 'Sign in failed');
      }
    } catch (err) {
      setSignInMessage('Error connecting to server');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setVerifyMessage('');
    try {
      const res = await fetch(`${API_URL}/verify_otp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp })
      });
      const data = await res.json();
      if (res.ok) {
        setVerifyMessage('Verification successful!');
        localStorage.setItem('user_id', data.user.id);
        const expiry = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem('session_expiry', expiry.toString());
        router.push('/dashboard');
      } else {
        setVerifyMessage(data.message || 'Verification failed');
      }
    } catch (err) {
      setVerifyMessage('Error connecting to server');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setForgotMessage('');
    try {
      const res = await fetch(`${API_URL}/forgot_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMessage(data.message);
        setPendingEmail(forgotEmail);
        setTimeout(() => setAuthMode('verify_reset'), 1500);
      } else {
        setForgotMessage(data.message || 'Failed to send request');
      }
    } catch (err) {
      setForgotMessage('Error connecting to server');
    }
    setLoading(false);
  };

  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setVerifyResetMessage('');
    try {
      const res = await fetch(`${API_URL}/verify_reset_otp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp: resetOtp })
      });
      const data = await res.json();
      if (res.ok) {
        setVerifyResetMessage(data.message);
        setTimeout(() => setAuthMode('reset'), 1500);
      } else {
        setVerifyResetMessage(data.message || 'Verification failed');
      }
    } catch (err) {
      setVerifyResetMessage('Error connecting to server');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setResetMessage('Passwords do not match');
      return;
    }
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      setResetMessage('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number');
      return;
    }
    setLoading(true);
    setResetMessage('');
    try {
      const res = await fetch(`${API_URL}/reset_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp: resetOtp, new_password: newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setResetMessage('Password successfully reset! You can now sign in.');
        setTimeout(() => {
            setAuthMode('signin');
            setSignInMessage('Password reset successfully. Please sign in with your new password.');
        }, 2000);
      } else {
        setResetMessage(data.message || 'Password reset failed');
      }
    } catch (err) {
      setResetMessage('Error connecting to server');
    }
    setLoading(false);
  };

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
            <h5 className="animate-text" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '2px', color: 'var(--gold-primary)', marginBottom: '0.5rem', animationDelay: '0.2s' }}>{authMode === 'verify' && verifyOrigin === 'signup' ? 'Verification' : 'Join the Ecosystem'}</h5>
            <h2 className="serif animate-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', animationDelay: '0.3s' }}>{authMode === 'verify' && verifyOrigin === 'signup' ? 'Verify Email' : 'Sign Up'}</h2>
            <p className="animate-text" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '1px', animationDelay: '0.4s' }}>{authMode === 'verify' && verifyOrigin === 'signup' ? 'Check your inbox' : 'Create Your Account'}</p>
            
            {authMode === 'verify' && verifyOrigin === 'signup' ? (
              <form onSubmit={handleVerifyOTP}>
                {verifyMessage && <p style={{color: verifyMessage.includes('failed') || verifyMessage.includes('Error') || verifyMessage.includes('Invalid') ? '#ff4b4b' : '#4bff4b', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center'}}>{verifyMessage}</p>}
                <div className="input-group">
                  <Lock size={18} className="input-icon" />
                  <input type="text" placeholder="6-Digit Verification Code" className="input-field" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required style={{ letterSpacing: '2px', fontWeight: 'bold' }} />
                </div>
                
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                  {loading ? 'Verifying...' : <>Verify Account &rarr;</>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp}>
                {signUpMessage && <p style={{color: signUpMessage.includes('failed') || signUpMessage.includes('match') || signUpMessage.includes('Error') || signUpMessage.includes('already') || signUpMessage.includes('must') || signUpMessage.includes('Invalid') ? '#ff4b4b' : '#4bff4b', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center'}}>{signUpMessage}</p>}
                <div className="input-group">
                  <User size={18} className="input-icon" />
                  <input type="text" placeholder="Full Name" className="input-field" value={signUpName} onChange={e => setSignUpName(e.target.value)} required />
                </div>
                
                <div className="input-group">
                  <Mail size={18} className="input-icon" />
                  <input type="email" placeholder="Email" className="input-field" value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} required />
                </div>
                
                <div className="input-group">
                  <Lock size={18} className="input-icon" />
                  <input type={showSignUpPassword ? "text" : "password"} placeholder="Password" className="input-field" value={signUpPassword} onChange={e => setSignUpPassword(e.target.value)} required />
                  <div onClick={() => setShowSignUpPassword(!showSignUpPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex' }}>
                    {showSignUpPassword ? <EyeOff size={16} color="var(--text-secondary)" /> : <Eye size={16} color="var(--text-secondary)" />}
                  </div>
                </div>
                
                <div className="input-group">
                  <Lock size={18} className="input-icon" />
                  <input type={showSignUpConfirmPassword ? "text" : "password"} placeholder="Confirm Password" className="input-field" value={signUpConfirmPassword} onChange={e => setSignUpConfirmPassword(e.target.value)} required />
                  <div onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex' }}>
                    {showSignUpConfirmPassword ? <EyeOff size={16} color="var(--text-secondary)" /> : <Eye size={16} color="var(--text-secondary)" />}
                  </div>
                </div>
                
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                  {loading ? 'Processing...' : <>Join VyRolls &rarr;</>}
                </button>
              </form>
            )}
            
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
                   audio.play().catch(e => console.warn('Horn audio play failed:', e));
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
             
             {/* Engine Start Button */}
             <button
               onClick={() => {
                 if (ignitionAudioRef.current) {
                   ignitionAudioRef.current.currentTime = 0;
                   ignitionAudioRef.current.play().catch(e => console.warn('Audio play failed:', e));
                 }
               }}
               style={{
                 position: 'absolute',
                 right: '-60px',
                 top: '50%',
                 transform: 'translateY(-50%)',
                 background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                 border: '2px solid var(--gold-primary)',
                 borderRadius: '50%',
                 width: '60px',
                 height: '60px',
                 display: 'flex',
                 flexDirection: 'column',
                 justifyContent: 'center',
                 alignItems: 'center',
                 cursor: 'pointer',
                 boxShadow: '0 0 15px rgba(212, 175, 55, 0.3), inset 0 0 10px rgba(0,0,0,0.8)',
                 color: 'var(--gold-primary)',
                 zIndex: 30,
                 transition: 'all 0.2s ease',
               }}
               onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(0.95)'}
               onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
               title="Engine Start/Stop"
             >
               <Power size={20} style={{ marginBottom: '2px' }} />
               <span style={{ fontSize: '0.4rem', fontWeight: 'bold', letterSpacing: '1px' }}>START</span>
               <span style={{ fontSize: '0.4rem', fontWeight: 'bold', letterSpacing: '1px' }}>ENGINE</span>
             </button>
          </div>
          
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
            <h5 className="animate-text" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '2px', color: 'var(--gold-primary)', marginBottom: '0.5rem', animationDelay: '0.2s' }}>{authMode === 'verify' && verifyOrigin === 'signin' ? 'Verification' : authMode === 'forgot' ? 'Account Recovery' : authMode === 'verify_reset' ? 'Verify Code' : authMode === 'reset' ? 'New Password' : 'Welcome Back'}</h5>
            <h2 className="serif animate-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', animationDelay: '0.3s' }}>{authMode === 'verify' && verifyOrigin === 'signin' ? 'Verify Email' : authMode === 'forgot' ? 'Forgot Password' : authMode === 'verify_reset' ? 'Verify Reset Code' : authMode === 'reset' ? 'Reset Password' : 'Sign In'}</h2>
            <p className="animate-text" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '1px', animationDelay: '0.4s' }}>{authMode === 'verify' && verifyOrigin === 'signin' ? 'Check your inbox' : authMode === 'forgot' ? 'Enter your email' : authMode === 'verify_reset' ? 'Enter the 6-digit code' : authMode === 'reset' ? 'Create new password' : 'Access Your World'}</p>
            
            {authMode === 'verify' && verifyOrigin === 'signin' ? (
              <form onSubmit={handleVerifyOTP}>
                {verifyMessage && <p style={{color: verifyMessage.includes('failed') || verifyMessage.includes('Error') || verifyMessage.includes('Invalid') ? '#ff4b4b' : '#4bff4b', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center'}}>{verifyMessage}</p>}
                <div className="input-group">
                  <Lock size={18} className="input-icon" />
                  <input type="text" placeholder="6-Digit Verification Code" className="input-field" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required style={{ letterSpacing: '2px', fontWeight: 'bold' }} />
                </div>
                
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                  {loading ? 'Verifying...' : <>Verify Sign In &rarr;</>}
                </button>
              </form>
            ) : authMode === 'forgot' ? (
              <form onSubmit={handleForgotPassword}>
                {forgotMessage && <p style={{color: forgotMessage.includes('failed') || forgotMessage.includes('Error') || forgotMessage.includes('not found') ? '#ff4b4b' : '#4bff4b', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center'}}>{forgotMessage}</p>}
                <div className="input-group">
                  <Mail size={18} className="input-icon" />
                  <input type="email" placeholder="Enter your email" className="input-field" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                </div>
                
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                  {loading ? 'Sending...' : <>Send Reset Code &rarr;</>}
                </button>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('signin'); }} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>Back to Sign In</a>
                </div>
              </form>
            ) : authMode === 'verify_reset' ? (
              <form onSubmit={handleVerifyResetOtp}>
                {verifyResetMessage && <p style={{color: verifyResetMessage.includes('failed') || verifyResetMessage.includes('Error') || verifyResetMessage.includes('Invalid') ? '#ff4b4b' : '#4bff4b', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center'}}>{verifyResetMessage}</p>}
                <div className="input-group">
                  <Lock size={18} className="input-icon" />
                  <input type="text" placeholder="6-Digit Reset Code" className="input-field" value={resetOtp} onChange={e => setResetOtp(e.target.value)} maxLength={6} required style={{ letterSpacing: '2px', fontWeight: 'bold' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                  {loading ? 'Verifying...' : <>Verify Code &rarr;</>}
                </button>
              </form>
            ) : authMode === 'reset' ? (
              <form onSubmit={handleResetPassword}>
                {resetMessage && <p style={{color: resetMessage.includes('failed') || resetMessage.includes('Error') || resetMessage.includes('match') || resetMessage.includes('must') || resetMessage.includes('Invalid') ? '#ff4b4b' : '#4bff4b', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center'}}>{resetMessage}</p>}

                <div className="input-group">
                  <Lock size={18} className="input-icon" />
                  <input type={showNewPassword ? "text" : "password"} placeholder="New Password" className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                  <div onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex' }}>
                    {showNewPassword ? <EyeOff size={16} color="var(--text-secondary)" /> : <Eye size={16} color="var(--text-secondary)" />}
                  </div>
                </div>

                <div className="input-group">
                  <Lock size={18} className="input-icon" />
                  <input type={showConfirmNewPassword ? "text" : "password"} placeholder="Confirm New Password" className="input-field" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
                  <div onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex' }}>
                    {showConfirmNewPassword ? <EyeOff size={16} color="var(--text-secondary)" /> : <Eye size={16} color="var(--text-secondary)" />}
                  </div>
                </div>
                
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                  {loading ? 'Resetting...' : <>Reset Password &rarr;</>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignIn}>
                {signInMessage && <p style={{color: signInMessage.includes('failed') || signInMessage.includes('Error') || signInMessage.includes('Invalid') || signInMessage.includes('unverified') ? '#ff4b4b' : '#4bff4b', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center'}}>{signInMessage}</p>}
                <div className="input-group">
                  <Mail size={18} className="input-icon" />
                  <input type="email" placeholder="Email" className="input-field" value={signInEmail} onChange={e => setSignInEmail(e.target.value)} required />
                </div>
                
                <div className="input-group">
                  <Lock size={18} className="input-icon" />
                  <input type={showSignInPassword ? "text" : "password"} placeholder="Password" className="input-field" value={signInPassword} onChange={e => setSignInPassword(e.target.value)} required />
                  <div onClick={() => setShowSignInPassword(!showSignInPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex' }}>
                    {showSignInPassword ? <EyeOff size={16} color="var(--text-secondary)" /> : <Eye size={16} color="var(--text-secondary)" />}
                  </div>
                </div>
                
                <div className="checkbox-group">
                  <label className="checkbox-wrapper">
                    <input type="checkbox" className="custom-checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('forgot'); }} style={{ color: 'var(--gold-primary)', fontSize: '0.75rem', textDecoration: 'none' }}>Forgot password?</a>
                </div>
                
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                  {loading ? 'Processing...' : <>Sign In &rarr;</>}
                </button>
              </form>
            )}
            
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
             
             {authMode === 'signup' && (
               <>
                 <h5 className="serif animate-text" style={{ fontSize: '1.2rem', color: 'var(--gold-primary)', textAlign: 'center', marginBottom: '0.2rem' }}>Join the VyRolls Ecosystem</h5>
                 <p className="animate-text" style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>More than a drive. A higher standard.</p>
                 <form onSubmit={handleSignUp}>
                    {signUpMessage && <p style={{color: signUpMessage.includes('failed') || signUpMessage.includes('match') || signUpMessage.includes('Error') || signUpMessage.includes('already') || signUpMessage.includes('must') || signUpMessage.includes('Invalid') ? '#ff4b4b' : '#4bff4b', fontSize: '0.75rem', marginBottom: '1rem', textAlign: 'center'}}>{signUpMessage}</p>}
                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                      <User size={16} className="input-icon" />
                      <input type="text" placeholder="Full Name" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem' }} value={signUpName} onChange={e => setSignUpName(e.target.value)} required />
                    </div>
                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                      <Mail size={16} className="input-icon" />
                      <input type="email" placeholder="Email Address" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem' }} value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} required />
                    </div>
                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                      <Lock size={16} className="input-icon" />
                      <input type={showSignUpPassword ? "text" : "password"} placeholder="Password" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem' }} value={signUpPassword} onChange={e => setSignUpPassword(e.target.value)} required />
                      <div onClick={() => setShowSignUpPassword(!showSignUpPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex' }}>
                        {showSignUpPassword ? <EyeOff size={14} color="var(--text-secondary)" /> : <Eye size={14} color="var(--text-secondary)" />}
                      </div>
                    </div>
                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                      <Lock size={16} className="input-icon" />
                      <input type={showSignUpConfirmPassword ? "text" : "password"} placeholder="Confirm Password" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem' }} value={signUpConfirmPassword} onChange={e => setSignUpConfirmPassword(e.target.value)} required />
                      <div onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex' }}>
                        {showSignUpConfirmPassword ? <EyeOff size={14} color="var(--text-secondary)" /> : <Eye size={14} color="var(--text-secondary)" />}
                      </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.7rem' }} disabled={loading}>
                      {loading ? 'Processing...' : <>Join VyRolls &rarr;</>}
                    </button>
                 </form>
               </>
             )}
             
             {authMode === 'signin' && (
               <>
                 <h5 className="serif animate-text" style={{ fontSize: '1.2rem', color: 'var(--gold-primary)', textAlign: 'center', marginBottom: '0.2rem' }}>Welcome Back</h5>
                 <p className="animate-text" style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Access Your World.</p>
                 <form onSubmit={handleSignIn}>
                    {signInMessage && <p style={{color: signInMessage.includes('failed') || signInMessage.includes('Error') || signInMessage.includes('Invalid') || signInMessage.includes('unverified') ? '#ff4b4b' : '#4bff4b', fontSize: '0.75rem', marginBottom: '1rem', textAlign: 'center'}}>{signInMessage}</p>}
                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                      <Mail size={16} className="input-icon" />
                      <input type="email" placeholder="Email Address" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem' }} value={signInEmail} onChange={e => setSignInEmail(e.target.value)} required />
                    </div>
                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                      <Lock size={16} className="input-icon" />
                      <input type={showSignInPassword ? "text" : "password"} placeholder="Password" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem' }} value={signInPassword} onChange={e => setSignInPassword(e.target.value)} required />
                      <div onClick={() => setShowSignInPassword(!showSignInPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex' }}>
                        {showSignInPassword ? <EyeOff size={14} color="var(--text-secondary)" /> : <Eye size={14} color="var(--text-secondary)" />}
                      </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.7rem' }} disabled={loading}>
                      {loading ? 'Processing...' : <>Sign In &rarr;</>}
                    </button>
                 </form>
               </>
             )}
             
             {['verify', 'forgot', 'verify_reset', 'reset'].includes(authMode) && (
               <>
                 <h5 className="serif animate-text" style={{ fontSize: '1.2rem', color: 'var(--gold-primary)', textAlign: 'center', marginBottom: '0.2rem' }}>{authMode === 'verify' && verifyOrigin === 'signin' ? 'Verification Required' : authMode === 'forgot' ? 'Account Recovery' : authMode === 'verify_reset' ? 'Verify Code' : authMode === 'reset' ? 'New Password' : 'Welcome Back'}</h5>
                 <p className="animate-text" style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>{authMode === 'verify' && verifyOrigin === 'signin' ? 'Check your email for the code.' : authMode === 'forgot' ? 'Enter your email' : authMode === 'verify_reset' ? 'Enter the 6-digit code' : authMode === 'reset' ? 'Create new password' : 'Access Your World.'}</p>
                 
                 {authMode === 'verify' && verifyOrigin === 'signin' ? (
                   <form onSubmit={handleVerifyOTP}>
                     {verifyMessage && <p style={{color: verifyMessage.includes('failed') || verifyMessage.includes('Error') || verifyMessage.includes('Invalid') ? '#ff4b4b' : '#4bff4b', fontSize: '0.75rem', marginBottom: '1rem', textAlign: 'center'}}>{verifyMessage}</p>}
                     <div className="input-group" style={{ marginBottom: '1rem' }}>
                       <Lock size={16} className="input-icon" />
                       <input type="text" placeholder="6-Digit Code" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem', letterSpacing: '2px', fontWeight: 'bold', textAlign: 'center' }} value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required />
                     </div>
                     <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.7rem' }} disabled={loading}>
                       {loading ? 'Verifying...' : <>Verify Sign In &rarr;</>}
                     </button>
                   </form>
                 ) : authMode === 'forgot' ? (
                   <form onSubmit={handleForgotPassword}>
                     {forgotMessage && <p style={{color: forgotMessage.includes('failed') || forgotMessage.includes('Error') || forgotMessage.includes('not found') ? '#ff4b4b' : '#4bff4b', fontSize: '0.75rem', marginBottom: '1rem', textAlign: 'center'}}>{forgotMessage}</p>}
                     <div className="input-group" style={{ marginBottom: '1rem' }}>
                       <Mail size={16} className="input-icon" />
                       <input type="email" placeholder="Email Address" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem' }} value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                     </div>
                     <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.7rem' }} disabled={loading}>
                       {loading ? 'Sending...' : <>Send Reset Code &rarr;</>}
                     </button>
                     <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                       <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('signin'); }} style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textDecoration: 'none' }}>Back to Sign In</a>
                     </div>
                   </form>
                  ) : authMode === 'verify_reset' ? (
                   <form onSubmit={handleVerifyResetOtp}>
                     {verifyResetMessage && <p style={{color: verifyResetMessage.includes('failed') || verifyResetMessage.includes('Error') || verifyResetMessage.includes('Invalid') ? '#ff4b4b' : '#4bff4b', fontSize: '0.75rem', marginBottom: '1rem', textAlign: 'center'}}>{verifyResetMessage}</p>}
                     <div className="input-group" style={{ marginBottom: '1rem' }}>
                       <Lock size={16} className="input-icon" />
                       <input type="text" placeholder="6-Digit Reset Code" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem', letterSpacing: '2px', fontWeight: 'bold', textAlign: 'center' }} value={resetOtp} onChange={e => setResetOtp(e.target.value)} maxLength={6} required />
                     </div>
                     <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.7rem' }} disabled={loading}>
                       {loading ? 'Verifying...' : <>Verify Code &rarr;</>}
                     </button>
                   </form>
                 ) : authMode === 'reset' ? (
                   <form onSubmit={handleResetPassword}>
                     {resetMessage && <p style={{color: resetMessage.includes('failed') || resetMessage.includes('Error') || resetMessage.includes('match') || resetMessage.includes('must') || resetMessage.includes('Invalid') ? '#ff4b4b' : '#4bff4b', fontSize: '0.75rem', marginBottom: '1rem', textAlign: 'center'}}>{resetMessage}</p>}

                     <div className="input-group" style={{ marginBottom: '1rem' }}>
                       <Lock size={16} className="input-icon" />
                       <input type={showNewPassword ? "text" : "password"} placeholder="New Password" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem' }} value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                       <div onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex' }}>
                         {showNewPassword ? <EyeOff size={14} color="var(--text-secondary)" /> : <Eye size={14} color="var(--text-secondary)" />}
                       </div>
                     </div>

                     <div className="input-group" style={{ marginBottom: '1rem' }}>
                       <Lock size={16} className="input-icon" />
                       <input type={showConfirmNewPassword ? "text" : "password"} placeholder="Confirm New Password" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem' }} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
                       <div onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex' }}>
                         {showConfirmNewPassword ? <EyeOff size={14} color="var(--text-secondary)" /> : <Eye size={14} color="var(--text-secondary)" />}
                       </div>
                     </div>
                     <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.7rem' }} disabled={loading}>
                       {loading ? 'Resetting...' : <>Reset Password &rarr;</>}
                     </button>
                   </form>
                 ) : (
                   <form onSubmit={handleSignIn}>
                     {signInMessage && <p style={{color: signInMessage.includes('failed') || signInMessage.includes('Error') || signInMessage.includes('Invalid') || signInMessage.includes('unverified') ? '#ff4b4b' : '#4bff4b', fontSize: '0.75rem', marginBottom: '1rem', textAlign: 'center'}}>{signInMessage}</p>}
                     <div className="input-group" style={{ marginBottom: '1rem' }}>
                       <Mail size={16} className="input-icon" />
                       <input type="email" placeholder="Email Address" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem' }} value={signInEmail} onChange={e => setSignInEmail(e.target.value)} required />
                     </div>
                     <div className="input-group" style={{ marginBottom: '1rem' }}>
                       <Lock size={16} className="input-icon" />
                       <input type={showSignInPassword ? "text" : "password"} placeholder="Password" className="input-field" style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', fontSize: '0.85rem' }} value={signInPassword} onChange={e => setSignInPassword(e.target.value)} required />
                       <div onClick={() => setShowSignInPassword(!showSignInPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex' }}>
                         {showSignInPassword ? <EyeOff size={14} color="var(--text-secondary)" /> : <Eye size={14} color="var(--text-secondary)" />}
                       </div>
                     </div>
                     <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.7rem' }} disabled={loading}>
                       {loading ? 'Processing...' : <>Sign In &rarr;</>}
                     </button>
                   </form>
                 )}
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
