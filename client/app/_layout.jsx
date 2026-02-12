import { Stack } from 'expo-router';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '../config';

export default function RootLayout() {
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.farmsmart"
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="success" />
        <Stack.Screen name="home" />
        <Stack.Screen name="tasks" />
        <Stack.Screen name="marketplace" />
        <Stack.Screen name="cropcalender" />
      </Stack>
    </StripeProvider>
  );
}
