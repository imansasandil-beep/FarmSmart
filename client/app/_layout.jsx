import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
      <Stack.Screen name="success" /> 
      <Stack.Screen name="home" /> 
      <Stack.Screen name="tasks" /> 
    </Stack>
  );
}

