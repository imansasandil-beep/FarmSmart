import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, Keyboard, TouchableWithoutFeedback, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/expo';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [role, setRole] = useState('farmer');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCompleteProfile = async () => {
    if (!user) {
      Alert.alert("Error", "No active session found. Please try logging in again.");
      router.replace('/');
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      
      const payload = {
        fullName: user.firstName + (user.lastName ? ' ' + user.lastName : ''),
        email: user.emailAddresses[0]?.emailAddress || '',
        phone: phone.trim(),
        role: role,
      };

      const response = await axios.post(`${API_BASE_URL}/api/user/sync-profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.user) {
        // Cache the profile like we do in home.jsx
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Push user to the main app
        router.replace('/home');
      }
    } catch (err) {
      console.log('Onboarding sync error:', err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || err.message || "Failed to save profile.");
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={32} color="white" />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>Complete your profile to continue</Text>

          {/* Role Selector */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>I am a:</Text>
            <View style={styles.roleButtonRow}>
              {['farmer', 'buyer', 'expert'].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.roleButton,
                    role === r && styles.roleButtonActive
                  ]}
                  onPress={() => setRole(r)}
                >
                  <Text style={[
                    styles.roleButtonText,
                    role === r && styles.roleButtonTextActive
                  ]}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <View style={styles.iconBox}>
              <Ionicons name="call-outline" size={20} color="white" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Phone number (Optional)"
              placeholderTextColor="#ddd"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Complete Button */}
          <TouchableOpacity
            style={[styles.signupButton, loading && { opacity: 0.6 }]}
            onPress={handleCompleteProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text style={styles.signupButtonText}>Complete Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f1c',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#8aa6a3',
    marginBottom: 20,
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    color: 'white',
    marginBottom: 10,
    fontSize: 16,
  },
  roleButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#6fdfc4',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  roleButtonActive: {
    backgroundColor: '#6fdfc4',
  },
  roleButtonText: {
    color: '#6fdfc4',
    fontWeight: 'bold',
  },
  roleButtonTextActive: {
    color: '#0a1f1c',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(111, 223, 196, 0.3)',
    borderRadius: 10,
    marginBottom: 15,
    height: 55,
    overflow: 'hidden',
  },
  iconBox: {
    width: 50,
    height: '100%',
    backgroundColor: '#357a6e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: 'white',
    paddingHorizontal: 15,
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: '#6fdfc4',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
