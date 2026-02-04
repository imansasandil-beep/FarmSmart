import { Stack } from 'expo-router';

export default function MarketplaceLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="add" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="orders" />
        </Stack>
    );
}
