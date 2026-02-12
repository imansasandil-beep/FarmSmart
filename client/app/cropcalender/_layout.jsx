import { Stack } from 'expo-router';

export default function CropCalendarLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="zone" />
            <Stack.Screen name="crops" />
            <Stack.Screen name="suggestions" />
        </Stack>
    );
}
