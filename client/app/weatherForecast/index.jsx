import React from 'react';
import { View, Text } from 'react-native';

// ── Farming recommendation engine ──────────────────────
function getFarmingRecommendation(weather) {
    if (!weather) return null;

    const temp = weather.main?.temp;
    const humidity = weather.main?.humidity;
    const wind = weather.wind?.speed;
    const condition = weather.weather?.[0]?.main?.toLowerCase();
    const description = weather.weather?.[0]?.description?.toLowerCase() || '';

    // Priority-ordered recommendations
    if (condition === 'thunderstorm') {
        return {
            icon: 'thunderstorm-outline',
            text: 'Thunderstorms expected! Stay indoors and avoid open fields. Do not operate heavy machinery.',
            severity: 'danger',
        };
    }
    if (condition === 'rain' || condition === 'drizzle') {
        return {
            icon: 'rainy-outline',
            text: 'Rain detected — do not spray pesticides or fertilizers. Good time to check drainage systems.',
            severity: 'warning',
        };
    }
    if (temp > 38) {
        return {
            icon: 'sunny-outline',
            text: 'Extreme heat! Water crops early morning or evening. Provide shade for sensitive plants.',
            severity: 'danger',
        };
    }
    if (temp > 32) {
        return {
            icon: 'sunny-outline',
            text: 'Hot weather — increase irrigation frequency. Best to work in early morning or late afternoon.',
            severity: 'warning',
        };
    }
    if (temp < 5) {
        return {
            icon: 'snow-outline',
            text: 'Frost risk! Protect tender crops with mulch or frost covers overnight.',
            severity: 'danger',
        };
    }
    if (wind > 10) {
        return {
            icon: 'flag-outline',
            text: 'Strong winds — avoid spraying chemicals. Secure any loose structures or coverings.',
            severity: 'warning',
        };
    }
    if (humidity > 85) {
        return {
            icon: 'water-outline',
            text: 'Very high humidity — watch for fungal diseases. Ensure good air circulation around crops.',
            severity: 'warning',
        };
    }
    if (humidity < 30) {
        return {
            icon: 'water-outline',
            text: 'Low humidity — crops may dehydrate faster. Consider additional watering.',
            severity: 'info',
        };
    }
    if (condition === 'clouds' && description.includes('overcast')) {
        return {
            icon: 'cloudy-outline',
            text: 'Overcast skies — great conditions for transplanting seedlings or applying fertilizer.',
            severity: 'good',
        };
    }

    return {
        icon: 'checkmark-circle-outline',
        text: 'Good farming conditions! Ideal time for fieldwork, planting, and spraying.',
        severity: 'good',
    };
}

// ── Helpers ─────────────────────────────────────────────
function getWeatherIcon(condition) {
    const map = {
        thunderstorm: 'thunderstorm',
        drizzle: 'rainy-outline',
        rain: 'rainy',
        snow: 'snow',
        clear: 'sunny',
        clouds: 'cloudy',
        mist: 'cloudy-outline',
        haze: 'cloudy-outline',
        fog: 'cloudy-outline',
    };
    return map[condition?.toLowerCase()] || 'partly-sunny';
}

function formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getDayName(timestamp) {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ── Severity color mapping ──────────────────────────────
const severityColors = {
    danger: { bg: 'rgba(255, 71, 87, 0.15)', border: '#ff4757', text: '#ff6b81' },
    warning: { bg: 'rgba(255, 165, 2, 0.15)', border: '#ffa502', text: '#ffbe76' },
    info: { bg: 'rgba(116, 185, 255, 0.15)', border: '#74b9ff', text: '#a3d1ff' },
    good: { bg: 'rgba(111, 223, 196, 0.15)', border: '#6fdfc4', text: '#6fdfc4' },
};

// Placeholder — full screen component coming in next commits
export default function WeatherForecastScreen() {
    return (
        <View style={{ flex: 1, backgroundColor: '#0a1f1c', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 18 }}>Weather Forecast (Building UI...)</Text>
        </View>
    );
}
