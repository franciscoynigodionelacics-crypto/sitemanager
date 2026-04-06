'use client';

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useRouter } from 'next/navigation';
import GradientButton from '../../../components/GradientButton';

export default function OTPScreen() {
  const router = useRouter();
  
  // State to hold the 6 digits (Updated)
  const [code, setCode] = useState(['', '', '', '', '', '']);

  // Helper to update a specific box
  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.headerText}>Forgot Password?</Text>
      
      <Text style={styles.subHeaderText}>
        Enter the OTP sent to your email or phone number
      </Text>

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
        title="Verify" 
        onPress={() => {
          console.log('Verifying code:', code.join(''));
          router.push('/reset-password');
        }} 
      />

      <View style={styles.footerContainer}>
        <View style={styles.line} />
        <Text style={styles.footerText}>Didn't receive the code? </Text>
        <Pressable onPress={() => console.log('Resending OTP...')}>
          <Text style={styles.resendText}> Resend</Text>
        </Pressable>
        <View style={styles.line} />
      </View>
    </View>
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