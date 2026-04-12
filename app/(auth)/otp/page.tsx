'use client';

import React, { useState, Suspense } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useRouter, useSearchParams } from 'next/navigation';
import GradientButton from '../../../components/GradientButton';

function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  // State to hold the 6 digits (Updated)
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Helper to update a specific box
  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setErrorMessage('Please enter the full 6-digit code');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/verify-numeric-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      router.push(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(data.sessionToken)}`);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      await fetch('/api/auth/generate-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      alert('OTP resent!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.headerText}>Forgot Password?</Text>
      
      <Text style={styles.subHeaderText}>
        Enter the OTP sent to your email
      </Text>

      {errorMessage ? (
        <Text style={{ color: '#E74C3C', textAlign: 'center', marginBottom: 15, fontSize: 13 }}>
          {errorMessage}
        </Text>
      ) : null}

      {/* The 6 OTP Boxes (Updated array mapping) */}
      <View style={styles.otpContainer}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <TextInput
            key={index}
            style={styles.otpBox}
            keyboardType="number-pad"
            maxLength={1}
            value={code[index]}
            onChangeText={(text) => handleCodeChange(text, index)}
          />
        ))}
      </View>

      <GradientButton 
        title={isLoading ? 'Verifying...' : 'Verify'} 
        onPress={handleVerify} 
      />

      <View style={styles.footerContainer}>
        <View style={styles.line} />
        <Text style={styles.footerText}>Didn't receive the code? </Text>
        <Pressable onPress={handleResend}>
          <Text style={styles.resendText}> Resend</Text>
        </Pressable>
        <View style={styles.line} />
      </View>
    </View>
  );
}

export default function OTPScreen() {
  return (
    <Suspense fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>}>
      <OTPForm />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: '100%', 
    maxWidth: 480,       
    padding: 40,         
    alignItems: 'stretch', 
  } as any,
  headerText: { 
    fontSize: 42,        
    fontWeight: 'bold', 
    color: '#6A1B1B', 
    marginBottom: 20,    
    textAlign: 'center' 
  },
  subHeaderText: { 
    fontSize: 18, 
    fontWeight: '500', 
    color: '#6A1B1B', 
    textAlign: 'center', 
    marginBottom: 40,    
    paddingHorizontal: 10,
    lineHeight: 26,
  },
  
  // OTP Box Styles (Updated width to fit 6 boxes nicely)
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    // Removed paddingHorizontal here to give the 6 boxes more room
  },
  otpBox: {
    width: 50, // Reduced from 60
    height: 60, // Reduced from 65 to keep proportions
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#6A1B1B',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2,
    outlineStyle: 'none', 
  } as any,

  footerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 50,       
    width: '100%' 
  },
  line: { flex: 1, height: 1, backgroundColor: '#D9B3B3' },
  footerText: { fontSize: 14, color: '#888', marginLeft: 10, textAlign: 'center' },
  resendText: { fontSize: 14, fontWeight: 'bold', color: '#6A1B1B', marginRight: 10 },
});