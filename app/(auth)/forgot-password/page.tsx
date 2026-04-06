'use client';

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'next/navigation';
import CustomInput from '../../../components/CustomInput';
import GradientButton from '../../../components/GradientButton';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <View style={styles.formContainer}>
      <Text style={styles.headerText}>Forgot Password?</Text>
      
      <Text style={styles.subHeaderText}>Find your account</Text>

      <CustomInput 
        placeholder="Enter your email or phone number" 
        keyboardType="email-address"
        autoCapitalize="none"
        icon={<Text style={styles.icon}>✉️</Text>} 
      />

      <GradientButton 
        title="Continue" 
        onPress={() => router.push('/otp')} 
      />

      {/* Footer updated to match the mockup */}
      <View style={styles.footerContainer}>
        <View style={styles.line} />
        <Text style={styles.footerText}>Dont have an account? </Text>
        <Pressable onPress={() => router.push('/signup')}>
          <Text style={styles.signupText}> Sign up here!</Text>
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
    marginBottom: 50, // Pushed down slightly to give the top more breathing room    
    textAlign: 'center' 
  },
  subHeaderText: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#6A1B1B', 
    alignSelf: 'flex-start', // Left aligned to match mockup
    marginBottom: 20,    
    marginLeft: 5,
  },
  icon: { fontSize: 16, color: '#888' },
  footerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 50,       
    width: '100%' 
  },
  line: { flex: 1, height: 1, backgroundColor: '#D9B3B3' },
  footerText: { fontSize: 14, color: '#888', marginLeft: 10, textAlign: 'center' },
  signupText: { fontSize: 14, fontWeight: 'bold', color: '#6A1B1B', marginRight: 10 },
});