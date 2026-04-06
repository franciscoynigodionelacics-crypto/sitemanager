'use client';

import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { usePathname } from 'next/navigation'; 

const CAROUSEL_IMAGES = [
  '/img_1.png',
  '/img_2.png',
  '/img_3.png',
  '/img_4.png'
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const pathname = usePathname();
  
  // UPDATED: Now includes '/reset-password' for the 50/50 split
  const isSplitScreen = pathname === '/signup' || pathname === '/upload-id' || pathname === '/forgot-password' || pathname === '/otp' || pathname === '/reset-password'; 

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % CAROUSEL_IMAGES.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, []);

  const renderCarousel = () => (
    <>
      {CAROUSEL_IMAGES.map((img, index) => (
        <Image 
          key={img}
          source={{ uri: img }} 
          resizeMode="cover"
          style={[
            styles.carouselImage,
            { opacity: currentIndex === index ? 1 : 0 }
          ]} 
        />
      ))}
      <View style={styles.tintOverlay} />
    </>
  );

  if (isSplitScreen) {
    return (
      <View style={styles.splitContainer}>
        <View style={styles.splitLeftPane}>
          {renderCarousel()}
          <View style={styles.logoOverlay}>
             <Image source={{ uri: '/logo_h.png' }} resizeMode="contain" style={styles.logoImage} />
          </View>
        </View>
        <View style={styles.splitRightPane}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <View style={styles.fullBackgroundContainer}>
        {renderCarousel()}
      </View>
      <View style={styles.fullOverlay}>
        <View style={styles.fullLogoSide}>
           <Image source={{ uri: '/logo_h.png' }} resizeMode="contain" style={styles.logoImage} />
        </View>
        <View style={styles.fullFormSide}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carouselImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', transition: 'opacity 1s ease-in-out' } as any,
  tintOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#4A1111', opacity: 0.6 } as any,
  logoOverlay: { zIndex: 10 },
  logoImage: { width: 280, height: 280, filter: 'drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.4))' } as any,
  splitContainer: { flex: 1, flexDirection: 'row', height: '100vh' as any },
  splitLeftPane: { flex: 1, position: 'relative', justifyContent: 'center', alignItems: 'center', backgroundColor: '#6A1B1B', overflow: 'hidden' },
  splitRightPane: { flex: 1, backgroundImage: 'linear-gradient(to bottom, #FFD6D6 0%, #FFFFFF 100%)', justifyContent: 'center', alignItems: 'center' } as any,
  fullContainer: { flex: 1, height: '100vh' as any, position: 'relative' },
  fullBackgroundContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#6A1B1B' } as any,
  fullOverlay: { flex: 1, flexDirection: 'row', zIndex: 10 },
  fullLogoSide: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fullFormSide: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});