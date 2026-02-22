import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Built-in icons in Expo
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // 1. Add Loading State
  const [loading, setLoading] = useState(false);

  // 2. The Login Function
  const handleLogin = async () => {
    // Basic Validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // Send Data to Backend
      const response = await axios.post(`${API_BASE_URL}/api/user/login`, {
        email: trimmedEmail,
        password: password
      });

      // Success! Save user data to AsyncStorage
      if (response.data.user) {
        try {
          await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (storageError) {
          console.error('Error saving user data:', storageError);
          // Still navigate even if storage fails, but log the error
        }
      } else {
        Alert.alert("Error", "Login successful but user data not received");
        setLoading(false);
        return;
      }

      setLoading(false);
      // Navigate to Home
      router.replace('/home');

    } catch (error) {
      setLoading(false);

      if (error.response) {
        // Server error (e.g., "Invalid credentials")
        Alert.alert("Login Failed", error.response.data.message);
      } else if (error.request) {
        // Network error
        Alert.alert("Network Error", "Could not connect to server. Check your IP.");
      } else {
        Alert.alert("Error", "Something went wrong.");
      }
    }
  };

  return (
    // Replaces the cloud background image. 
    // Once you have the image file, use: source={require('../../assets/clouds.png')}
    <View style={styles.container}>

      {/* Top Right Logo Placeholder */}
      <View style={styles.logoContainer}>
        <Ionicons name="leaf" size={32} color="white" />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome !</Text>
        <Text style={styles.subtitle}>Log in to continue</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <View style={styles.iconBox}>
            <Ionicons name="mail-outline" size={20} color="white" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#ddd"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <View style={styles.iconBox}>
            <Ionicons name="lock-closed-outline" size={20} color="white" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#ddd"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}   // <--- Connects the click
          disabled={loading}      // <--- Stops double-clicks
        >
          {loading ? (
            <ActivityIndicator color="white" /> // <--- Shows spinner
          ) : (
            <Text style={styles.loginButtonText}>Log in</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.forgotText}>Forgot Password?</Text>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>

        <Text style={styles.socialText}>Social Media Login</Text>

        {/* Social Icons */}
        <View style={styles.socialIconsContainer}>
          <Ionicons name="logo-apple" size={30} color="white" style={styles.socialIcon} />
          <Ionicons name="logo-facebook" size={30} color="white" style={styles.socialIcon} />
          <Ionicons name="logo-google" size={30} color="white" style={styles.socialIcon} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.signupText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f1c', // Deep Dark Green background (matches prototype)
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#8aa6a3', // Muted bluish-green text
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(111, 223, 196, 0.3)', // Semi-transparent Mint Green
    borderRadius: 10,
    marginBottom: 20,
    height: 55,
    overflow: 'hidden',
  },
  iconBox: {
    width: 50,
    height: '100%',
    backgroundColor: '#357a6e', // Darker shade for icon box
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: 'white',
    paddingHorizontal: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#0f4c3a', // Dark Green Button
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#6fdfc4', // Thin mint border
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotText: {
    color: '#00bfff', // Bright blue
    textAlign: 'center',
    marginTop: 15,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'white',
  },
  orText: {
    color: 'white',
    marginHorizontal: 10,
  },
  socialText: {
    color: '#00e5ff', // Cyan color
    textAlign: 'center',
    marginBottom: 15,
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialIcon: {
    marginHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: 'white',
  },
  signupText: {
    color: '#00e5ff',
    fontWeight: 'bold',
  },
});

