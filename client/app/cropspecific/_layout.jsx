import { Stack } from 'expo-router';

export default function CropSpecificLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="cropDetail" />
            <Stack.Screen name="fertilizerGuide" />
            <Stack.Screen name="pestGuide" />
            <Stack.Screen name="soilInfo" />
            <Stack.Screen name="bestPractices" />
        </Stack>
    );
}
