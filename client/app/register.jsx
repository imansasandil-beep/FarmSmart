import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Keyboard, TouchableWithoutFeedback,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSignUp, useAuth, useOAuth } from '@clerk/expo';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import axios from 'axios';

// Ensure WebBrowser is warmed up for OAuth flow on some platforms
WebBrowser.maybeCompleteAuthSession();
import { API_BASE_URL } from '../config';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  
  // Setup Google OAuth
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  // STATE variables
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('farmer');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Manual state for showing verification screen
  const [showVerification, setShowVerification] = useState(false);

  // ---- SIGN-UP HANDLER (Clerk v3 API) ----
  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create sign-up with ALL required fields
      const result = await signUp.password({
        emailAddress: email.trim().toLowerCase(),
        password: password,
        firstName: name.trim().split(' ')[0],
        lastName: name.trim().split(' ').slice(1).join(' ') || name.trim(),
      });

      if (result?.error) {
        Alert.alert("Registration Failed", result.error.message || "Something went wrong.");
        setLoading(false);
        return;
      }

      console.log('After signUp.password - status:', signUp.status);
      console.log('Missing fields:', JSON.stringify(signUp.missingFields));
      console.log('Unverified fields:', JSON.stringify(signUp.unverifiedFields));

      // Step 2: Send email verification code
      await signUp.verifications.sendEmailCode();
      console.log('Verification email sent! Status:', signUp.status);

      setLoading(false);
      // Show verification screen
      setShowVerification(true);

    } catch (error) {
      setLoading(false);
      console.error('Register error:', JSON.stringify(error, null, 2));
      const msg = error?.errors?.[0]?.message || error?.message || "Something went wrong.";
      Alert.alert("Error", msg);
    }
  };

  // ---- GOOGLE OAUTH HANDLER ----
  const handleGoogleLogin = async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/home', { scheme: 'myapp' }),
      });

      if (createdSessionId) {
        setActive({ session: createdSessionId });
        router.replace('/home');
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error('OAuth error', err);
      Alert.alert("Google Login Failed", err.message || "Could not authenticate with Google");
    }
  };

  // ---- VERIFY EMAIL HANDLER (Clerk v3 API) ----
  const handleVerifyEmail = async () => {
    Keyboard.dismiss();

    if (!code || code.length < 4) {
      Alert.alert("Error", "Please enter the full verification code");
      return;
    }

    setLoading(true);
    console.log('Verifying code:', code);

    try {
      // Step 1: Verify the email code
      await signUp.verifications.verifyEmailCode({ code });
      console.log('After verify - status:', signUp.status);
      console.log('Missing fields:', JSON.stringify(signUp.missingFields));
      console.log('Unverified fields:', JSON.stringify(signUp.unverifiedFields));

      // Step 2: If still missing_requirements, try updating name fields
      if (signUp.status === 'missing_requirements' && signUp.missingFields?.length > 0) {
        console.log('Updating missing fields:', signUp.missingFields);
        try {
          await signUp.update({
            firstName: name.trim().split(' ')[0],
            lastName: name.trim().split(' ').slice(1).join(' ') || name.trim(),
          });
          console.log('After update - status:', signUp.status);
        } catch (updateErr) {
          console.log('Update error:', updateErr.message);
        }
      }

      // Step 3: If complete, finalize
      if (signUp.status === 'complete') {
        try {
          await signUp.finalize({
            navigate: ({ session }) => {
              syncProfileToBackend();
              router.replace('/home');
            },
          });
          return;
        } catch (e) {
          console.log('Finalize error:', e.message);
        }
      }

      // Step 4: Fallback — check what's still missing
      setLoading(false);
      if (signUp.status === 'complete') {
        syncProfileToBackend();
        Alert.alert(
          "Account Created! ✅",
          "Your account is ready! Please log in.",
          [{ text: "Go to Login", onPress: () => router.replace('/') }]
        );
      } else {
        const missing = signUp.missingFields?.join(', ') || 'unknown';
        console.log('Sign-up still not complete. Missing:', missing);
        Alert.alert(
          "Almost there!",
          `Sign-up requires: ${missing}. Please try again.`,
          [{ text: "OK" }]
        );
      }

    } catch (error) {
      setLoading(false);
      console.error('Verify error:', JSON.stringify(error, null, 2));
      const msg = error?.errors?.[0]?.message || error?.message || "Verification failed.";
      Alert.alert("Verification Failed", msg);
    }
  };

  // ---- Sync profile to our MongoDB backend ----
  const syncProfileToBackend = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      await axios.post(`${API_BASE_URL}/api/user/sync-profile`, {
        fullName: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone,
        role: role,
      });
      console.log('Profile synced to backend');
    } catch (err) {
      console.log('Profile sync error (will retry):', err.message);
    }
  };

  // If already signed in, go home
  if (isSignedIn) {
    router.replace('/home');
    return null;
  }

  // ========================================
  // VERIFICATION CODE SCREEN
  // ========================================
  if (showVerification) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={32} color="white" />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Verify Email</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to {email}
            </Text>

            <View style={styles.inputContainer}>
              <View style={styles.iconBox}>
                <Ionicons name="key-outline" size={20} color="white" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter verification code"
                placeholderTextColor="#ddd"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            {errors?.fields?.code && (
              <Text style={styles.errorText}>{errors.fields.code.message}</Text>
            )}

            <TouchableOpacity
              style={[styles.signupButton, loading && { opacity: 0.6 }]}
              onPress={handleVerifyEmail}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="black" />
              ) : (
                <Text style={styles.signupButtonText}>Verify Email</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 15, alignItems: 'center' }}
              onPress={async () => {
                try {
                  await signUp.verifications.sendEmailCode();
                  Alert.alert("Success", "A new code has been sent!");
                } catch (e) {
                  Alert.alert("Error", e?.message || "Could not resend code");
                }
              }}
            >
              <Text style={styles.loginLink}>Resend code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 10, alignItems: 'center' }}
              onPress={() => setShowVerification(false)}
            >
              <Text style={styles.loginLink}>← Go back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  // ========================================
  // REGISTRATION FORM SCREEN
  // ========================================
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

          {errors?.fields?.emailAddress && (
            <Text style={styles.errorText}>{errors.fields.emailAddress.message}</Text>
          )}

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.iconBox}>
              <Ionicons name="lock-closed-outline" size={20} color="white" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Password (min 8 characters)"
              placeholderTextColor="#ddd"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {errors?.fields?.password && (
            <Text style={styles.errorText}>{errors.fields.password.message}</Text>
          )}

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
            style={[styles.signupButton, loading && { opacity: 0.6 }]}
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

          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>or sign up with</Text>
            <View style={styles.line} />
          </View>

          {/* Google Icon */}
          <View style={styles.socialIconsContainer}>
            <TouchableOpacity onPress={handleGoogleLogin}>
              <Ionicons name="logo-google" size={30} color="white" style={styles.socialIcon} />
            </TouchableOpacity>
          </View>

          {/* Required for Clerk's bot protection */}
          <View nativeID="clerk-captcha" />
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
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#2a5d55',
  },
  orText: {
    color: '#8aa6a3',
    marginHorizontal: 10,
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 20,
  },
  socialIcon: {
    marginHorizontal: 10,
  },
});