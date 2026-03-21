import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSignIn } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';

export default function MFAScreen() {
  const router = useRouter();
  const { signIn } = useSignIn();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prepareVerification = async () => {
      try {
        await signIn.prepareSecondFactor({ strategy: 'email_code' });
      } catch (err) {
        console.error('Failed to send email verification code:', err);
      }
    };
    prepareVerification();
  }, []);

  const handleVerify = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code: code.trim(),
      });

      if (result.status === 'complete') {
        await signIn.finalize({
          navigate: ({ session }) => {
            router.replace('/home');
          },
        });
      } else {
        Alert.alert('Info', 'Verification status: ' + result.status);
      }
    } catch (error) {
      const msg = error?.errors?.[0]?.message || error?.message || 'Verification failed';
      Alert.alert('Verification Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark" size={48} color="#6fdfc4" />
        </View>

        <Text style={styles.title}>Two-Step Verification</Text>
        <Text style={styles.subtitle}>
          Enter the verification code sent to your email to continue signing in.
        </Text>

        {/* Code Input */}
        <View style={styles.inputContainer}>
          <View style={styles.iconBox}>
            <Ionicons name="key-outline" size={20} color="white" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter verification code"
            placeholderTextColor="#4a7a70"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyBtn, loading && { opacity: 0.6 }]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0a1f1c" />
          ) : (
            <Text style={styles.verifyText}>Verify & Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Info Note */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#6fdfc4" />
          <Text style={styles.infoText}>
            Check your email inbox for a message with your verification code. If you didn't receive it, go back and try again.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f1c',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 55,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(111,223,196,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#8aa6a3',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(111, 223, 196, 0.3)',
    borderRadius: 10,
    marginBottom: 20,
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
    fontSize: 20,
    letterSpacing: 8,
    fontWeight: 'bold',
  },
  verifyBtn: {
    backgroundColor: '#6fdfc4',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  verifyText: {
    color: '#0a1f1c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(111,223,196,0.08)',
    borderRadius: 12,
    padding: 14,
    marginTop: 24,
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#8aa6a3',
    lineHeight: 18,
  },
});
