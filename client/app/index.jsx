import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSignIn, useAuth, useOAuth } from '@clerk/expo';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Ensure WebBrowser is warmed up for OAuth flow on some platforms
WebBrowser.maybeCompleteAuthSession();
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isSignedIn } = useAuth();

  // Setup Google OAuth
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  // If already signed in, redirect (in useEffect to avoid render-time state update)
  useEffect(() => {
    if (isSignedIn) {
      router.replace('/home');
    }
  }, [isSignedIn]);

  if (isSignedIn) return null;

  // ---- SIGN-IN HANDLER (Clerk v3 API) ----
  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      // Step 1: Sign in with email and password
      const { error } = await signIn.password({
        emailAddress: trimmedEmail,
        password: password,
      });

      if (error) {
        console.error('SignIn error:', JSON.stringify(error, null, 2));
        Alert.alert("Login Failed", error.message || "Something went wrong.");
        return;
      }

      // Step 2: Check status and finalize
      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: ({ session }) => {
            router.replace('/home');
          },
        });
      } else if (signIn.status === 'needs_second_factor') {
        // User has 2FA enabled, navigate to the MFA verification screen
        router.push('/mfa');
      } else {
        console.log('Sign-in status:', signIn.status);
        Alert.alert("Info", "Sign-in status: " + signIn.status);
      }
    } catch (error) {
      const msg = error?.errors?.[0]?.message || error?.message || "Something went wrong.";
      Alert.alert("Login Failed", msg);
    }
  };

  // ---- GOOGLE OAUTH HANDLER ----
  const handleGoogleLogin = async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/home'),
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

  return (
    <View style={styles.container}>

      {/* Top Right Logo */}
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
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {errors?.fields?.identifier && (
          <Text style={styles.errorText}>{errors.fields.identifier.message}</Text>
        )}

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

        {errors?.fields?.password && (
          <Text style={styles.errorText}>{errors.fields.password.message}</Text>
        )}

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, fetchStatus === 'fetching' && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={fetchStatus === 'fetching'}
        >
          {fetchStatus === 'fetching' ? (
            <ActivityIndicator color="white" />
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
          <TouchableOpacity onPress={handleGoogleLogin}>
            <Ionicons name="logo-google" size={30} color="white" style={styles.socialIcon} />
          </TouchableOpacity>
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
    marginBottom: 40,
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
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#0f4c3a',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#6fdfc4',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotText: {
    color: '#00bfff',
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
    color: '#00e5ff',
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
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: -15,
    marginBottom: 10,
    marginLeft: 10,
  },
});
