'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const CameraIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

export default function SignupScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleSignup = async () => {
    if (!email || !password) {
      setErrorMessage('Email and password are required');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }
      
      // Success - normally we'd show an approval modal per mockup, 
      // but let's just push them directly to /home for now 
      router.push('/home');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#F5F3F0',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      opacity: isMounted ? 1 : 0,
      transition: 'opacity 0.3s ease'
    }}>
      {/* Main Container */}
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1400px',
        minHeight: '700px',
        backgroundColor: '#F5F3F0',
        borderRadius: '40px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Left Panel - 40% */}
        <div style={{
          width: '40%',
          background: 'linear-gradient(135deg, #C85F5F 0%, #D88080 100%)',
          padding: '60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
        {/* Decorative gradient overlay */}
        <div style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#FFF',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: '24px',
            color: '#C85F5F'
          }}>
            H
          </div>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFF', letterSpacing: '1px' }}>
            HOPECARD
          </span>
        </div>

        {/* Hero Content */}
        <div style={{ zIndex: 1 }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: '#FFF', 
            lineHeight: '1.2',
            marginBottom: '8px',
            marginTop: 0
          }}>
            Choose a cause,
          </h1>
          <h2 style={{ 
            fontSize: '48px', 
            fontStyle: 'italic', 
            color: '#FFF', 
            lineHeight: '1.2',
            marginBottom: '24px',
            marginTop: 0,
            fontWeight: 'normal'
          }}>
            give with purpose.
          </h2>
          
          <p style={{ 
            fontSize: '16px', 
            color: '#FFF', 
            lineHeight: '1.6',
            opacity: 0.95,
            margin: 0
          }}>
            Transform your transactions into meaningful donations for causes you care about. Every purchase becomes an opportunity to make a difference.
          </p>
        </div>

        {/* Social Proof */}
        <div style={{ zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#E8A8A8',
              border: '3px solid #C85F5F'
            }} />
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#D98686',
              border: '3px solid #C85F5F',
              marginLeft: '-12px'
            }} />
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#C97474',
              border: '3px solid #C85F5F',
              marginLeft: '-12px'
            }} />
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#B86565',
              border: '3px solid #C85F5F',
              marginLeft: '-12px'
            }} />
          </div>
          <p style={{ fontSize: '14px', color: '#FFF', opacity: 0.95, margin: 0 }}>
            Trusted by 500+ nonprofit leaders
          </p>
        </div>
      </div>

        {/* Right Panel - 60% */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
          position: 'relative',
          backgroundColor: '#F5F3F0'
        }}>
        <div style={{
          width: '100%',
          maxWidth: '520px'
        }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1A1A1A', marginBottom: '8px', marginTop: 0 }}>
            Create Your Account
          </h1>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '32px', marginTop: 0 }}>
            Input your important journey details and ensures you get a professional user community.
          </p>

          {/* Tab Switcher */}
          <div style={{ 
            display: 'flex', 
            backgroundColor: '#E8E6E3', 
            borderRadius: '12px', 
            padding: '4px',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => handleNavigate('/login')}
              style={{
                flex: 1,
                padding: '10px',
                textAlign: 'center',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'login' ? '#FFF' : 'transparent',
                fontSize: '14px',
                fontWeight: '600',
                color: activeTab === 'login' ? '#1A1A1A' : '#999',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              style={{
                flex: 1,
                padding: '10px',
                textAlign: 'center',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'signup' ? '#FFF' : 'transparent',
                fontSize: '14px',
                fontWeight: '600',
                color: activeTab === 'signup' ? '#1A1A1A' : '#999',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Sign up
            </button>
          </div>

          {/* Social Login Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              backgroundColor: '#FFF',
              borderRadius: '10px',
              border: '1px solid #E0E0E0',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <GoogleIcon />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>Google</span>
            </button>
            <button style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              backgroundColor: '#FFF',
              borderRadius: '10px',
              border: '1px solid #E0E0E0',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <AppleIcon />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>Apple</span>
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginBottom: '24px' }}>
            Or sign up with
          </p>

          {/* Email Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A', display: 'block', marginBottom: '8px' }}>
              Email Address
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFF',
              borderRadius: '10px',
              padding: '0 14px',
              border: '1px solid #E0E0E0'
            }}>
              <div style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}>
                <MailIcon />
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  fontSize: '14px',
                  color: '#1A1A1A',
                  border: 'none',
                  backgroundColor: 'transparent',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A', display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFF',
              borderRadius: '10px',
              padding: '0 14px',
              border: '1px solid #E0E0E0'
            }}>
              <div style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}>
                <LockIcon />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  fontSize: '14px',
                  color: '#1A1A1A',
                  border: 'none',
                  backgroundColor: 'transparent',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  padding: '4px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <EyeIcon />
              </button>
            </div>
          </div>

          {/* Date of Birth Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A', display: 'block', marginBottom: '8px' }}>
              Date of Birth
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFF',
              borderRadius: '10px',
              padding: '0 14px',
              border: '1px solid #E0E0E0'
            }}>
              <div style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}>
                <CalendarIcon />
              </div>
              <input
                type="date"
                style={{
                  flex: 1,
                  padding: '14px 0',
                  fontSize: '14px',
                  color: '#1A1A1A',
                  border: 'none',
                  backgroundColor: 'transparent',
                  outline: 'none'
                }}
              />
            </div>
            <p style={{ fontSize: '11px', color: '#999', marginTop: '6px', marginBottom: 0 }}>
              By continuing, you confirm 18+ age limits
            </p>
          </div>

          {/* Profile Picture Upload */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A', display: 'block', marginBottom: '8px' }}>
              Profile Picture
            </label>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFF',
              borderRadius: '10px',
              padding: '32px',
              border: '2px dashed #E0E0E0',
              cursor: 'pointer'
            }}>
              <div style={{ textAlign: 'center' }}>
                <CameraIcon />
                <p style={{ fontSize: '13px', color: '#999', marginTop: '8px', marginBottom: 0 }}>
                  Upload profile picture
                </p>
              </div>
              {/* Red notification badge */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#E74C3C',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#FFF'
              }}>
                !
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage ? (
            <p style={{ color: '#E74C3C', fontSize: '13px', textAlign: 'center', marginBottom: '16px', marginTop: '-8px' }}>
              {errorMessage}
            </p>
          ) : null}

          {/* Submit Button */}
          <button
            onClick={handleSignup}
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: isLoading ? '#E8A8A8' : '#C85F5F',
              borderRadius: '10px',
              padding: '14px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#FFF',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
              transition: 'all 0.2s'
            }}
          >
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </button>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#666', margin: 0 }}>
            Already have an account?{' '}
            <button
              onClick={() => handleNavigate('/login')}
              style={{
                fontWeight: 'bold',
                color: '#1A1A1A',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontSize: '13px'
              }}
            >
              Log In
            </button>
          </p>
        </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        backgroundColor: 'transparent'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#999', cursor: 'pointer' }}>Privacy Policy</span>
          <span style={{ fontSize: '12px', color: '#999' }}>|</span>
          <span style={{ fontSize: '12px', color: '#999', cursor: 'pointer' }}>Terms of Service</span>
          <span style={{ fontSize: '12px', color: '#999' }}>|</span>
          <span style={{ fontSize: '12px', color: '#999', cursor: 'pointer' }}>Cookie Policy</span>
          <span style={{ fontSize: '12px', color: '#999' }}>|</span>
          <span style={{ fontSize: '12px', color: '#999', cursor: 'pointer' }}>Contact Support</span>
        </div>
      </div>
    </div>
  );
}
