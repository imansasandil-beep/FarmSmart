import React from 'react';
import { View, Text } from 'react-native';

// ── Helpers ─────────────────────────────────────────────
export function getWeatherIcon(condition) {
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

export function formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function getDayName(timestamp) {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ── Severity color mapping ──────────────────────────────
export const severityColors = {
    danger: { bg: 'rgba(255, 71, 87, 0.15)', border: '#ff4757', text: '#ff6b81' },
    warning: { bg: 'rgba(255, 165, 2, 0.15)', border: '#ffa502', text: '#ffbe76' },
    info: { bg: 'rgba(116, 185, 255, 0.15)', border: '#74b9ff', text: '#a3d1ff' },
    good: { bg: 'rgba(111, 223, 196, 0.15)', border: '#6fdfc4', text: '#6fdfc4' },
};

// Placeholder — screen will be built in upcoming commits
export default function WeatherForecastScreen() {
    return (
        <View style={{ flex: 1, backgroundColor: '#0a1f1c', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 18 }}>Weather Forecast (Coming Soon)</Text>
        </View>
    );
}
