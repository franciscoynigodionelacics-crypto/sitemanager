'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PersonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

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

const IdCardIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <circle cx="8" cy="10" r="2"></circle>
    <path d="M15 8h4"></path>
    <path d="M15 12h4"></path>
    <path d="M7 16h10"></path>
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

export default function AuthScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid file (JPG, PNG, or PDF)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      setUploadedFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadPreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    if (activeTab === 'signup') {
      if (!uploadedFile) {
        alert('Please upload a valid ID');
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');
        
        setShowApprovalModal(true);
      } catch (err: any) {
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        
        handleNavigate('/home');
      } catch (err: any) {
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#F5EDE8',
      opacity: isMounted ? 1 : 0,
      transition: 'opacity 0.3s ease'
    }}>
      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
      {/* Main Container */}
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1400px',
        minHeight: '700px',
        backgroundColor: '#FFF',
        borderRadius: '40px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)'
      }}>
        {/* Left Brand Panel - 45% */}
        <div style={{
          width: '45%',
          background: 'linear-gradient(135deg, #C0675A 0%, #A85245 100%)',
          padding: '60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative heart shape */}
          <div style={{
            position: 'absolute',
            bottom: '-80px',
            right: '-80px',
            width: '300px',
            height: '300px',
            opacity: 0.1,
            transform: 'rotate(-15deg)'
          }}>
            <svg viewBox="0 0 100 100" fill="white">
              <path d="M50,90 C20,70 10,50 10,35 C10,20 20,10 30,10 C40,10 45,15 50,25 C55,15 60,10 70,10 C80,10 90,20 90,35 C90,50 80,70 50,90 Z"/>
            </svg>
          </div>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
            <div style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#FFF',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              fontSize: '26px',
              color: '#C0675A',
              fontFamily: 'serif'
            }}>
              H
            </div>
            <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#FFF', letterSpacing: '0.5px' }}>
              HOPECARD
            </span>
          </div>

          {/* Hero Content */}
          <div style={{ zIndex: 1, marginTop: '-40px' }}>
            <h1 style={{ 
              fontSize: '52px', 
              fontWeight: '600', 
              color: '#FFF', 
              lineHeight: '1.15',
              marginBottom: '0',
              marginTop: 0,
              fontFamily: 'Georgia, serif'
            }}>
              Choose a cause,
            </h1>
            <h2 style={{ 
              fontSize: '52px', 
              fontStyle: 'italic', 
              color: '#FFF', 
              lineHeight: '1.15',
              marginBottom: '28px',
              marginTop: '4px',
              fontWeight: '400',
              fontFamily: 'Georgia, serif'
            }}>
              give with purpose.
            </h2>
            
            <p style={{ 
              fontSize: '17px', 
              color: '#FFF', 
              lineHeight: '1.7',
              opacity: 0.95,
              margin: 0,
              maxWidth: '420px'
            }}>
              Join our community of intentional givers. Together, we move beyond transactions to transform lives through radical transparency and human connection.
            </p>
          </div>

          {/* Social Proof */}
          <div style={{ zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#E8A8A8',
                border: '3px solid #C0675A'
              }} />
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#D98686',
                border: '3px solid #C0675A',
                marginLeft: '-14px'
              }} />
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#C97474',
                border: '3px solid #C0675A',
                marginLeft: '-14px'
              }} />
              <div style={{
                paddingLeft: '12px',
                paddingRight: '12px',
                height: '32px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255,255,255,0.25)',
                marginLeft: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#FFF'
              }}>
                +2.4k
              </div>
            </div>
            <p style={{ fontSize: '15px', color: '#FFF', opacity: 0.95, margin: 0 }}>
              Join 2,400+ compassionate hearts this month.
            </p>
          </div>
        </div>

        {/* Right Auth Panel - 55% */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
          backgroundColor: '#F5EDE8'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '480px'
          }}>
            {/* Tab Switcher */}
            <div style={{ 
              display: 'flex', 
              backgroundColor: '#EFEFEF', 
              borderRadius: '50px', 
              padding: '6px',
              marginBottom: '32px'
            }}>
              <button
                onClick={() => setActiveTab('login')}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  textAlign: 'center',
                  borderRadius: '50px',
                  border: 'none',
                  backgroundColor: activeTab === 'login' ? '#FFF' : 'transparent',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: activeTab === 'login' ? '#1A1A1A' : '#999',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: activeTab === 'login' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  textAlign: 'center',
                  borderRadius: '50px',
                  border: 'none',
                  backgroundColor: activeTab === 'signup' ? '#FFF' : 'transparent',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: activeTab === 'signup' ? '#1A1A1A' : '#999',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: activeTab === 'signup' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Conditional Heading */}
              <h1 style={{ fontSize: '34px', fontWeight: 'bold', color: '#1A1A1A', marginBottom: '10px', marginTop: 0 }}>
                {activeTab === 'signup' ? 'Create Your Account' : 'Welcome Back'}
              </h1>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', marginBottom: '32px', marginTop: 0 }}>
                {activeTab === 'signup' 
                  ? 'Start your impact journey today and become part of a compassionate community.'
                  : 'Continue your journey of giving and transform lives today.'}
              </p>

              {/* Social Login Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
                <button type="button" style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '14px',
                  backgroundColor: '#EFEFEF',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <GoogleIcon />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>Google</span>
                </button>
                <button type="button" style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '14px',
                  backgroundColor: '#EFEFEF',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <AppleIcon />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>Apple</span>
                </button>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                marginBottom: '28px',
                color: '#999',
                fontSize: '13px'
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#DDD' }} />
                OR USE EMAIL
                <div style={{ flex: 1, height: '1px', backgroundColor: '#DDD' }} />
              </div>

              {/* Conditional Form Fields */}
              {activeTab === 'signup' && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#EFEFEF',
                    borderRadius: '12px',
                    padding: '0 16px'
                  }}>
                    <div style={{ marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                      <PersonIcon />
                    </div>
                    <input
                      type="text"
                      placeholder="Evelyn Harper"
                      style={{
                        flex: 1,
                        padding: '16px 0',
                        fontSize: '15px',
                        color: '#1A1A1A',
                        border: 'none',
                        backgroundColor: 'transparent',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#EFEFEF',
                  borderRadius: '12px',
                  padding: '0 16px'
                }}>
                  <div style={{ marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                    <MailIcon />
                  </div>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '16px 0',
                      fontSize: '15px',
                      color: '#1A1A1A',
                      border: 'none',
                      backgroundColor: 'transparent',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Address Fields - Sign Up Only */}
              {activeTab === 'signup' && (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#EFEFEF',
                      borderRadius: '12px',
                      padding: '0 16px'
                    }}>
                      <div style={{ marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                        <MapPinIcon />
                      </div>
                      <input
                        type="text"
                        placeholder="Barangay"
                        style={{
                          flex: 1,
                          padding: '16px 0',
                          fontSize: '15px',
                          color: '#1A1A1A',
                          border: 'none',
                          backgroundColor: 'transparent',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#EFEFEF',
                      borderRadius: '12px',
                      padding: '0 16px'
                    }}>
                      <div style={{ marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                        <MapPinIcon />
                      </div>
                      <input
                        type="text"
                        placeholder="Municipality"
                        style={{
                          flex: 1,
                          padding: '16px 0',
                          fontSize: '15px',
                          color: '#1A1A1A',
                          border: 'none',
                          backgroundColor: 'transparent',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#EFEFEF',
                      borderRadius: '12px',
                      padding: '0 16px'
                    }}>
                      <div style={{ marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                        <MapPinIcon />
                      </div>
                      <input
                        type="text"
                        placeholder="Province"
                        style={{
                          flex: 1,
                          padding: '16px 0',
                          fontSize: '15px',
                          color: '#1A1A1A',
                          border: 'none',
                          backgroundColor: 'transparent',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Password Field */}
              <div style={{ marginBottom: activeTab === 'login' ? '20px' : '24px' }}>
                {activeTab === 'login' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleNavigate('/forgot-password')}
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#D9695A',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#EFEFEF',
                  borderRadius: '12px',
                  padding: '0 16px'
                }}>
                  <div style={{ marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                    <LockIcon />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '16px 0',
                      fontSize: '15px',
                      color: '#1A1A1A',
                      border: 'none',
                      backgroundColor: 'transparent',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
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

              {/* ID Upload - Sign Up Only */}
              {activeTab === 'signup' && (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '10px' }}>
                      Valid ID
                    </label>
                    <input
                      type="file"
                      id="id-upload"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="id-upload"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: uploadedFile ? '#F0F9F0' : '#FAFAFA',
                        borderRadius: '12px',
                        padding: '32px',
                        border: uploadedFile ? '2px solid #4CAF50' : '2px dashed #DDD',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {uploadedFile ? (
                        <>
                          {uploadPreview ? (
                            <img
                              src={uploadPreview}
                              alt="ID Preview"
                              style={{
                                maxWidth: '200px',
                                maxHeight: '150px',
                                borderRadius: '8px',
                                marginBottom: '12px',
                                objectFit: 'contain'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '60px',
                              height: '60px',
                              backgroundColor: '#4CAF50',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '12px'
                            }}>
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                              </svg>
                            </div>
                          )}
                          <p style={{ fontSize: '14px', color: '#4CAF50', fontWeight: '600', marginTop: '8px', marginBottom: '4px' }}>
                            {uploadedFile.name}
                          </p>
                          <p style={{ fontSize: '12px', color: '#999', marginBottom: '12px' }}>
                            {(uploadedFile.size / 1024).toFixed(2)} KB
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveFile();
                            }}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#FF5252',
                              color: '#FFF',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            Remove File
                          </button>
                        </>
                      ) : (
                        <>
                          <IdCardIcon />
                          <p style={{ fontSize: '14px', color: '#999', marginTop: '12px', marginBottom: '4px' }}>
                            Upload ID (JPG, PNG, PDF)
                          </p>
                          <p style={{ fontSize: '12px', color: '#BBB', marginTop: '4px', marginBottom: 0 }}>
                            Max file size: 5MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Terms Checkbox */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '28px' }}>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginTop: '2px',
                        cursor: 'pointer'
                      }}
                    />
                    <label style={{ fontSize: '13px', color: '#666', lineHeight: '1.5', cursor: 'pointer' }}>
                      By continuing, you agree to Hopecard's{' '}
                      <span style={{ color: '#1A1A1A', textDecoration: 'underline' }}>Terms of Service</span>
                      {' '}and{' '}
                      <span style={{ color: '#1A1A1A', textDecoration: 'underline' }}>Privacy Policy</span>
                    </label>
                  </div>
                </>
              )}

              {/* Error Message */}
              {errorMessage ? (
                <p style={{ color: '#E74C3C', fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>
                  {errorMessage}
                </p>
              ) : null}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || (activeTab === 'signup' && !agreedToTerms)}
                style={{
                  width: '100%',
                  backgroundColor: (isLoading || (activeTab === 'signup' && !agreedToTerms)) ? '#CCC' : '#D9695A',
                  borderRadius: '50px',
                  padding: '16px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#FFF',
                  cursor: (isLoading || (activeTab === 'signup' && !agreedToTerms)) ? 'not-allowed' : 'pointer',
                  marginBottom: '24px',
                  transition: 'all 0.2s'
                }}
              >
                {isLoading 
                  ? (activeTab === 'signup' ? 'Signing Up...' : 'Signing In...') 
                  : (activeTab === 'signup' ? 'Sign Up' : 'Sign In')}
              </button>

              {/* Footer Text */}
              <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', margin: 0 }}>
                {activeTab === 'signup' ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      style={{
                        fontWeight: 'bold',
                        color: '#1A1A1A',
                        textDecoration: 'underline',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '14px'
                      }}
                    >
                      Log In
                    </button>
                  </>
                ) : (
                  <>
                    New to HOPECARD?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('signup')}
                      style={{
                        fontWeight: 'bold',
                        color: '#1A1A1A',
                        textDecoration: 'underline',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '14px'
                      }}
                    >
                      Create an account
                    </button>
                  </>
                )}
              </p>
            </form>
          </div>
        </div>
      </div>
      </div>

      {/* Help Button */}
      <button style={{
        position: 'fixed',
        bottom: '100px',
        right: '32px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#D9695A',
        border: 'none',
        fontSize: '26px',
        fontWeight: 'bold',
        color: '#FFF',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(217,105,90,0.4)',
        transition: 'all 0.2s',
        zIndex: 10
      }}>
        ?
      </button>

      {/* Footer */}
      <footer style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 60px',
        backgroundColor: '#F5EDE8',
        borderTop: '1px solid rgba(0,0,0,0.05)'
      }}>
        <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
          © 2024 HOPECARD. Every gift is a human embrace.
        </p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span style={{ fontSize: '13px', color: '#999', cursor: 'pointer' }}>Privacy Policy</span>
          <span style={{ fontSize: '13px', color: '#999' }}>·</span>
          <span style={{ fontSize: '13px', color: '#999', cursor: 'pointer' }}>Terms of Service</span>
          <span style={{ fontSize: '13px', color: '#999' }}>·</span>
          <span style={{ fontSize: '13px', color: '#999', cursor: 'pointer' }}>Donor Rights</span>
          <span style={{ fontSize: '13px', color: '#999' }}>·</span>
          <span style={{ fontSize: '13px', color: '#999', cursor: 'pointer' }}>Contact Support</span>
        </div>
      </footer>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '24px',
            padding: '50px 60px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.3s ease',
            position: 'relative'
          }}>
            {/* Animated Clock/Hourglass Icon */}
            <div style={{
              width: '100px',
              height: '100px',
              margin: '0 auto 30px',
              backgroundColor: '#FFF3E0',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>

            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1A1A1A',
              marginBottom: '16px',
              marginTop: 0
            }}>
              WAITING FOR APPROVAL
            </h2>

            <p style={{
              fontSize: '16px',
              color: '#666',
              lineHeight: '1.6',
              marginBottom: '32px',
              marginTop: 0
            }}>
              Thank you for signing up! Your account is currently under review. 
              We'll notify you via email once your account has been approved.
            </p>

            <button
              onClick={() => {
                setShowApprovalModal(false);
                handleNavigate('/landing');
              }}
              style={{
                backgroundColor: '#D9695A',
                color: '#FFF',
                border: 'none',
                borderRadius: '50px',
                padding: '16px 48px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(217, 105, 90, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(217, 105, 90, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 105, 90, 0.3)';
              }}
            >
              Got it!
            </button>
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { 
                opacity: 0;
                transform: translateY(30px);
              }
              to { 
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes pulse {
              0%, 100% { 
                transform: scale(1);
                opacity: 1;
              }
              50% { 
                transform: scale(1.05);
                opacity: 0.8;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
