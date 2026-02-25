import { Stack } from 'expo-router';

export default function AgriSupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="ask" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}