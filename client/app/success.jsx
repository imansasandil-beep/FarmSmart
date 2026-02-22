import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo Circle */}
      <View style={styles.logoCircle}>
        <Ionicons name="leaf" size={60} color="white" />
      </View>

      <Text style={styles.title}>Success !</Text>
      
      <Text style={styles.subtitle}>
        You have successfully created your new account. Now login to your account.
      </Text>

      {/* Log In Button */}
      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={() => router.replace('/')} // Goes to Login and clears history
      >
        <Text style={styles.loginButtonText}>Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f1c', // Deep Dark Green
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60, // Makes it a perfect circle
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#b0c4c1', // Light grey-green
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 50,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#1a4d45', // Darker green fill
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6fdfc4', // Mint Green border (matches prototype)
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});