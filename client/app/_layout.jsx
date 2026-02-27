import { Stack } from 'expo-router';
import { StripeProvider } from '@stripe/stripe-react-native';

export default function RootLayout() {
  return (
    <StripeProvider publishableKey="pk_test_51Sx2NN2ajHmtMsfwhPcB0K2HYT81aAgIaoHgi5Lx3BfzgZPKPGH4uSj3iZIohb59cifyrUZ56LZvCmMVdA5shMxt00uCccirof">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="success" />
        <Stack.Screen name="home" />
        <Stack.Screen name="tasks" />
        <Stack.Screen name="marketplace" />
        <Stack.Screen name="cropcalender" />
        <Stack.Screen name="cropspecific" />
      </Stack>
    </StripeProvider>
  );
}
