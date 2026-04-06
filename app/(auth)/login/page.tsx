'use client';

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'next/navigation';
import CustomInput from '../../../components/CustomInput';
import GradientButton from '../../../components/GradientButton';

export default function LoginScreen() {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    router.prefetch('/home');
    router.prefetch('/signup');
    router.prefetch('/forgot-password');
  }, [router]);

  const handleNavigate = (path: string, delayMs = 300) => {
    setIsExiting(true);
    setTimeout(() => {
      router.push(path);
    }, delayMs);
  };

  return (
    // THIS is the wrapper that gives you the pink gradient on the right side
    <View style={[
      styles.gradientBackground,
      {
        opacity: isMounted && !isExiting ? 1 : 0,
        transform: [{ translateY: isMounted && !isExiting ? 0 : 15 }],
      }
    ]}>
      
      {/* THIS is your exact form centered inside it */}
      <View style={styles.formContainer}>
        <Text style={styles.headerText}>Log in</Text>
        <Text style={styles.subHeaderText}>Welcome Back</Text>

        <CustomInput 
          placeholder="Enter your email" 
          keyboardType="email-address" 
          autoCapitalize="none" 
          icon={<Text style={styles.icon}>✉️</Text>} 
          style={styles.inputText} // Added black text color here
        />
        <CustomInput 
          placeholder="Enter your password" 
          secureTextEntry={true} 
          icon={<Text style={styles.icon}>🔑</Text>} 
          style={styles.inputText} // Added black text color here
        />

        <Pressable onPress={() => handleNavigate('/forgot-password', 150)} style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </Pressable>

        <GradientButton title="Login" onPress={() => handleNavigate('/home', 0)} />

        <View style={styles.footerContainer}>
          <View style={styles.line} />
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={() => handleNavigate('/signup', 150)}>
            <Text style={styles.signupText}> Sign up here!</Text>
          </Pressable>
          <View style={styles.line} />
        </View>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  // 1. The full-height gradient background for the right side
 gradientBackground: {
    flex: 1,
    width: '100%',
    minHeight: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage: 'linear-gradient(to bottom, #ffd7d7 0%, #FFFFFF 100%)', // <--- Exact color match
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  } as any,

  // 2. Your original raw form container
  formContainer: {
    width: '100%', 
    maxWidth: 480,       
    padding: 40, 
    alignItems: 'stretch',
  } as any,
  
  headerText: { fontSize: 42, fontWeight: 'bold', color: '#6A1B1B', marginBottom: 40, textAlign: 'center' },
  subHeaderText: { fontSize: 22, fontWeight: '700', color: '#6A1B1B', alignSelf: 'flex-start', marginBottom: 20, marginLeft: 5 },
  icon: { fontSize: 16, color: '#888' },
  
  // 3. Fix text color inside the input
  inputText: { color: '#333' } as any,
  
  forgotPasswordContainer: { alignSelf: 'flex-end', marginBottom: 30, marginTop: -5, marginRight: 5 },
  forgotText: { fontSize: 13, fontWeight: 'bold', color: '#8A1515', cursor: 'pointer' } as any,

  footerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 40, width: '100%' },
  line: { flex: 1, height: 1, backgroundColor: '#D9B3B3' },
  footerText: { fontSize: 13, color: '#888', marginLeft: 10, textAlign: 'center' },
  signupText: { fontSize: 13, fontWeight: 'bold', color: '#6A1B1B', marginRight: 10, cursor: 'pointer' } as any,
});
