import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env file');
}

// This component handles redirecting based on auth state
function AuthGate({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // Check if user is on an auth screen (login/register/success)
    const onAuthScreen = segments[0] === undefined || // index (login)
      segments[0] === 'index' ||
      segments[0] === 'register' ||
      segments[0] === 'success';

    // Allow signed-in users to access onboarding without being redirected to /home
    const onOnboardingScreen = segments[0] === 'onboarding';

    if (isSignedIn && onAuthScreen) {
      router.replace('/home');
    } else if (!isSignedIn && !onAuthScreen && !onOnboardingScreen) {
      router.replace('/');
    }
  }, [isSignedIn, isLoaded, segments]);

  return children;
}

export default function RootLayout() {
  return (
    <StripeProvider publishableKey="pk_test_51Sx2NN2ajHmtMsfwhPcB0K2HYT81aAgIaoHgi5Lx3BfzgZPKPGH4uSj3iZIohb59cifyrUZ56LZvCmMVdA5shMxt00uCccirof">
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="register" />
            <Stack.Screen name="success" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="home" />
            <Stack.Screen name="tasks" />
            <Stack.Screen name="marketplace" />
            <Stack.Screen name="cropcalender" />
            <Stack.Screen name="pests-and-diseases" />
            <Stack.Screen name="cropspecific" />
            <Stack.Screen name="weatherForecast" />
          </Stack>
        </AuthGate>
      </ClerkProvider>
    </StripeProvider>
  );
}
