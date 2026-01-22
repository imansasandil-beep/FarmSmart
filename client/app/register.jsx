import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function RegisterScreen() {
  const router = useRouter();
  
  // STATE variables
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('farmer'); // Default is farmer
  const [loading, setLoading] = useState(false); 

  // <--- DOUBLE CHECK THIS IP ADDRESS --->
  const API_URL = 'http://192.168.8.119:5000/api/user/register';


  const handleRegister = async () => {
    // 1. Basic Validation
    if (!name || !email || !password || !phone) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // 2. Send Data to Backend
      const response = await axios.post(API_URL, {
        fullName: name,
        email: email,
        password: password,
        role: role // Sending the selected role
      });

      // 3. Show success screen
      setLoading(false);
      router.replace('/success');

    } catch (error) { 
      setLoading(false);
      
      if (error.response) {
        // Server responded with an error (e.g., "Email already exists")
        Alert.alert("Registration Failed", error.response.data.message);
      } else if (error.request) {
        // Server didn't respond (Network error)
        Alert.alert("Network Error", "Could not connect to server. Check your IP address!");
      } else {
        // Other errors
        Alert.alert("Error", error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
         <Ionicons name="leaf" size={32} color="white" />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Hi !</Text>
        <Text style={styles.subtitle}>Create a new account</Text>

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

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <View style={styles.iconBox}>
             <Ionicons name="person" size={20} color="white" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#ddd"
            value={name}
            onChangeText={setName}
          />
        </View>

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
            keyboardType="email-address"
            autoCapitalize="none"
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

        {/* Phone Input */}
        <View style={styles.inputContainer}>
           <View style={styles.iconBox}>
             <Ionicons name="call-outline" size={20} color="white" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor="#ddd"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity 
          style={styles.signupButton} 
          onPress={handleRegister} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <Text style={styles.signupButtonText}>Sign up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
             <Text style={styles.loginLink}>Log in</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
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
  // Role Selector Styles
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
  // Input Styles
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  footerText: {
    color: 'white',
  },
  loginLink: {
    color: '#00e5ff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});