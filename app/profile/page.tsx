'use client';

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Image, ScrollView } from 'react-native';
import { useRouter } from 'next/navigation';

// ==========================================
// CLEAN SVG ICONS (Replaces Emojis)
// ==========================================
const MailIcon = ({ color = '#6A1B1B', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const PhoneIcon = ({ color = '#6A1B1B', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const HomeIcon = ({ color = '#6A1B1B', size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const LogoutIcon = ({ color = '#6A1B1B', size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const EditPencilIcon = ({ color = '#6A1B1B', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </svg>
);

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function ProfileScreen() {
  const router = useRouter();

  // Page transition states
  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNavigate = (path: string) => {
    setIsExiting(true);
    setTimeout(() => {
      router.push(path);
    }, 300);
  };

  return (
    <View style={[
      styles.container,
      { 
        opacity: isMounted && !isExiting ? 1 : 0,
        transform: [{ translateY: isMounted && !isExiting ? 0 : 15 }], 
      }
    ]}>
      
      {/* ========================================= */}
      {/* LEFT SIDEBAR (Summary Profile)            */}
      {/* ========================================= */}
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>Donor Profile</Text>

        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            {/* Swapped emoji for an empty grey state, you can put an Image here later! */}
            <View style={{ width: '100%', height: '100%', backgroundColor: '#D9D9D9' }} />
          </View>
          <Pressable style={styles.editAvatarButton}>
            <EditPencilIcon color="#6A1B1B" size={16} />
          </Pressable>
        </View>

        {/* User Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.username}>Juandelacruz123</Text>
          <Text style={styles.roleText}>Active Donor</Text>
          
          <View style={styles.line} />
          
          <View style={styles.contactRow}>
            <View style={styles.contactIconWrapper}><MailIcon color="#6A1B1B" /></View>
            <Text style={styles.contactText}>juandelacruz@example.com</Text>
          </View>
          <View style={styles.contactRow}>
            <View style={styles.contactIconWrapper}><PhoneIcon color="#6A1B1B" /></View>
            <Text style={styles.contactText}>+63 123 456 7891</Text>
          </View>
        </View>

        {/* Action Buttons (Home and Logout) */}
        <View style={styles.actionButtonsRow}>
          <Pressable 
            style={({ pressed }: { pressed: boolean }) => [styles.actionButton, pressed && { opacity: 0.7 }]}
            onPress={() => handleNavigate('/home')} 
          >
            <HomeIcon color="#6A1B1B" size={28} />
          </Pressable>
          <Pressable 
            style={({ pressed }: { pressed: boolean }) => [styles.actionButton, pressed && { opacity: 0.7 }]}
            onPress={() => handleNavigate('/login')} 
          >
            <LogoutIcon color="#6A1B1B" size={28} />
          </Pressable>
        </View>
      </View>

      {/* ========================================= */}
      {/* RIGHT CONTENT (Forms)                     */}
      {/* ========================================= */}
      <ScrollView style={styles.mainContent} contentContainerStyle={{ padding: 50 }}>
        
        {/* CARD 1: INFORMATION */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Information</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput style={styles.input} placeholder="Enter your name" placeholderTextColor="#A0A0A0" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput style={styles.input} placeholder="Enter your name" placeholderTextColor="#A0A0A0" />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput style={styles.input} placeholder="Enter your name" placeholderTextColor="#A0A0A0" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Middle Name</Text>
              <TextInput style={styles.input} placeholder="Enter your name" placeholderTextColor="#A0A0A0" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <View style={styles.selectWrapper}>
              <TextInput style={[styles.input, { marginBottom: 0 }]} placeholder="Select your date of birth" placeholderTextColor="#A0A0A0" />
              <Text style={styles.dropdownArrow}>▼</Text>
            </View>
          </View>
        </View>

        {/* CARD 2: UPDATE CONTACT & PASSWORD */}
        <View style={styles.formCard}>
          
          <Text style={styles.sectionTitle}>Update Contact</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.inputWithIconWrapper}>
                <TextInput style={styles.inputIconned} value="+63 123 456 7891" placeholderTextColor="#A0A0A0" />
                <View style={styles.editInputIcon}>
                   <EditPencilIcon color="#888" size={18} />
                </View>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWithIconWrapper}>
                <TextInput style={styles.inputIconned} value="juandelacruz@example.com" placeholderTextColor="#A0A0A0" />
                <View style={styles.editInputIcon}>
                   <EditPencilIcon color="#888" size={18} />
                </View>
              </View>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Update Password</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Old Password</Text>
              <TextInput style={styles.input} placeholder="Enter old password" secureTextEntry placeholderTextColor="#A0A0A0" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput style={styles.input} placeholder="Enter new password" secureTextEntry placeholderTextColor="#A0A0A0" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput style={styles.input} placeholder="Confirm new password" secureTextEntry placeholderTextColor="#A0A0A0" />
          </View>

          {/* Update Button */}
          <View style={styles.buttonContainer}>
            <Pressable 
              style={({ pressed }: { pressed: boolean }) => [
                styles.updateButton,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }
              ]}
              onPress={() => console.log('Profile Updated!')}
            >
              <Text style={styles.updateButtonText}>Update</Text>
            </Pressable>
          </View>

        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, flexDirection: 'row', backgroundColor: '#EFEFEF', height: '100vh',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', 
  } as any,
  
  // =========================================
  // SIDEBAR STYLES
  // =========================================
  sidebar: {
    width: 380, height: '100%', alignItems: 'center', paddingVertical: 50,
    backgroundImage: 'linear-gradient(to bottom, #E8A8A8, #A33A3A)', 
  } as any,
  sidebarTitle: { fontSize: 26, fontWeight: 'bold', color: '#6A1B1B', marginBottom: 40 },
  
  avatarContainer: { position: 'relative', marginBottom: 30 },
  avatarCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#8ED2D2', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 4, borderColor: '#D9898C' },
  
  // Avatar Edit Pencil
  editAvatarButton: { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(4px)', width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', boxShadow: '0px 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer' } as any,

  infoCard: { width: '80%', backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 40, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  username: { fontSize: 20, fontWeight: 'bold', color: '#6A1B1B', marginBottom: 5 },
  roleText: { fontSize: 13, color: '#6A1B1B', marginBottom: 15 },
  line: { width: '100%', height: 1, backgroundColor: 'rgba(106, 27, 27, 0.2)', marginBottom: 15 },
  
  contactRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 12 },
  contactIconWrapper: { width: 20, alignItems: 'center', marginRight: 10 },
  contactText: { fontSize: 13, color: '#6A1B1B', fontWeight: '500' },

  actionButtonsRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 } as any,
  actionButton: { width: 65, height: 65, backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)', cursor: 'pointer' } as any,

  // =========================================
  // MAIN CONTENT & FORM STYLES
  // =========================================
  mainContent: { flex: 1, backgroundColor: '#F5F6F8' },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 40, marginBottom: 30, boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.05)' } as any,
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#6A1B1B', marginBottom: 25 },
  
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 20, marginBottom: 5 } as any,
  inputGroup: { flex: 1, marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#8A1515', marginBottom: 8, marginLeft: 5 },
  
  input: { backgroundColor: '#EBEBEB', borderRadius: 12, padding: 18, fontSize: 14, color: '#333', outlineStyle: 'none', boxShadow: 'inset 0px 3px 5px rgba(0, 0, 0, 0.05)' } as any,

  selectWrapper: { position: 'relative', justifyContent: 'center' },
  dropdownArrow: { position: 'absolute', right: 20, color: '#888', fontSize: 12 },

  // Inputs with the little edit pencil SVG inside
  inputWithIconWrapper: { position: 'relative', justifyContent: 'center' },
  inputIconned: { backgroundColor: '#EBEBEB', borderRadius: 12, padding: 18, paddingRight: 45, fontSize: 14, color: '#333', outlineStyle: 'none', boxShadow: 'inset 0px 3px 5px rgba(0, 0, 0, 0.05)' } as any,
  editInputIcon: { position: 'absolute', right: 15, opacity: 0.7 },

  buttonContainer: { alignItems: 'center', marginTop: 10 },
  updateButton: { height: 50, paddingHorizontal: 60, borderRadius: 25, justifyContent: 'center', alignItems: 'center', backgroundImage: 'linear-gradient(to right, #D9898C, #B75658)', boxShadow: '0px 8px 15px rgba(183, 86, 88, 0.3)', cursor: 'pointer' } as any,
  updateButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});