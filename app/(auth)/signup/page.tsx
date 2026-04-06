'use client';

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'next/navigation';
import CustomInput from '../../../components/CustomInput';
import GradientButton from '../../../components/GradientButton';

export default function SignUpScreen() {
  const router = useRouter();

  return (
    <View style={styles.formContainer}>
      <Text style={styles.headerText}>Sign up</Text>
      <Text style={styles.subHeaderText}>Create Account</Text>

      <CustomInput placeholder="Create a username" icon={<Text style={styles.icon}>👤</Text>} />
      <CustomInput placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" icon={<Text style={styles.icon}>✉️</Text>} />
      <CustomInput placeholder="Enter your phone number" keyboardType="phone-pad" icon={<Text style={styles.icon}>📞</Text>} />
      <CustomInput placeholder="Create a Password" secureTextEntry={true} icon={<Text style={styles.icon}>🔑</Text>} />
      <CustomInput placeholder="Confirm your Password" secureTextEntry={true} icon={<Text style={styles.icon}>🛡️</Text>} />

      <GradientButton title="Next" onPress={() => router.push('/upload-id')} />

      <View style={styles.footerContainer}>
        <View style={styles.line} />
        <Text style={styles.footerText}>Already have an account? </Text>
        <Pressable onPress={() => router.push('/login')}>
          <Text style={styles.loginText}> Login here!</Text>
        </Pressable>
        <View style={styles.line} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: '100%', 
    maxWidth: 480,       // Allows the form to stretch wider to reduce white space
    padding: 40, 
    alignItems: 'stretch',
  } as any,
  headerText: { fontSize: 42, fontWeight: 'bold', color: '#6A1B1B', marginBottom: 40, textAlign: 'center' },
  subHeaderText: { fontSize: 22, fontWeight: '700', color: '#6A1B1B', alignSelf: 'flex-start', marginBottom: 20, marginLeft: 5 },
  icon: { fontSize: 16, color: '#888' },
  footerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 40, width: '100%' },
  line: { flex: 1, height: 1, backgroundColor: '#D9B3B3' },
  footerText: { fontSize: 14, color: '#888', marginLeft: 10, textAlign: 'center' },
  loginText: { fontSize: 14, fontWeight: 'bold', color: '#6A1B1B', marginRight: 10 },
});