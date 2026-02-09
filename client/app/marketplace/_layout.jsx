import { Stack } from 'expo-router';

/**
 * Marketplace Layout
 * This wraps all screens inside the /marketplace folder.
 * Using a simple Stack navigator for clean screen transitions.
 */
export default function MarketplaceLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // We'll handle our own headers in each screen
            }}
        />
    );
}
