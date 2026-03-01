import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

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

// ── Main Component ──────────────────────────────────────
export default function WeatherForecastScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [currentWeather, setCurrentWeather] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [locationName, setLocationName] = useState('');

    const fetchWeather = async () => {
        try {
            setError(null);

            // 1. Request location permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Location permission is required to show weather data.');
                setLoading(false);
                return;
            }

            // 2. Get current GPS coordinates
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const { latitude, longitude } = location.coords;

            // 3. Call our backend proxy
            const response = await axios.get(`${API_BASE_URL}/api/weather`, {
                params: { lat: latitude, lon: longitude },
            });

            // 4. Set current weather
            setCurrentWeather(response.data.current);
            setLocationName(response.data.current?.name || 'Your Location');

            // 5. Process 5-day forecast (pick one entry per day — noon)
            const forecastList = response.data.forecast?.list || [];
            const dailyMap = {};
            forecastList.forEach((item) => {
                const date = new Date(item.dt * 1000).toDateString();
                const hour = new Date(item.dt * 1000).getHours();
                // Pick the entry closest to noon for each day
                if (!dailyMap[date] || Math.abs(hour - 12) < Math.abs(new Date(dailyMap[date].dt * 1000).getHours() - 12)) {
                    dailyMap[date] = item;
                }
            });
            setForecast(Object.values(dailyMap).slice(0, 5));
        } catch (err) {
            console.error('Weather fetch error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch weather data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWeather();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchWeather();
    };

    const recommendation = getFarmingRecommendation(currentWeather);
    const sevColor = severityColors[recommendation?.severity] || severityColors.info;

    // ── Loading State ──
    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0a1f1c', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6fdfc4" />
                <Text style={{ color: '#6fdfc4', fontSize: 16, marginTop: 15 }}>Fetching weather data...</Text>
            </View>
        );
    }

    // ── Error State ──
    if (error) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0a1f1c', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }}>
                <Ionicons name="cloud-offline-outline" size={64} color="#ff6b81" />
                <Text style={{ color: '#ff6b81', fontSize: 16, textAlign: 'center', marginTop: 15 }}>{error}</Text>
                <TouchableOpacity style={{ marginTop: 20, backgroundColor: '#1a4d45', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12, borderWidth: 1, borderColor: '#6fdfc4' }} onPress={() => { setLoading(true); fetchWeather(); }}>
                    <Text style={{ color: '#6fdfc4', fontSize: 16, fontWeight: '600' }}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const weather = currentWeather;
    const conditionMain = weather?.weather?.[0]?.main;
    const conditionDesc = weather?.weather?.[0]?.description;

    return (
        <View style={{ flex: 1, backgroundColor: '#0a1f1c', paddingTop: 55 }}>
            {/* ── Header ── */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Weather Forecast</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh" size={22} color="#6fdfc4" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6fdfc4" />}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            >
                {/* ── Current Weather Card ── */}
                <View style={{ backgroundColor: '#1a4d45', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(111, 223, 196, 0.3)', marginBottom: 15 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                        <Ionicons name="location-outline" size={16} color="#6fdfc4" />
                        <Text style={{ color: '#6fdfc4', fontSize: 14, marginLeft: 5, fontWeight: '500' }}>{locationName}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                        <Ionicons name={getWeatherIcon(conditionMain)} size={64} color="#6fdfc4" />
                        <View style={{ marginLeft: 20 }}>
                            <Text style={{ color: 'white', fontSize: 52, fontWeight: 'bold', lineHeight: 58 }}>{Math.round(weather?.main?.temp)}°C</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, textTransform: 'capitalize', marginTop: 2 }}>{conditionDesc}</Text>
                        </View>
                    </View>

                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 18, marginLeft: 85 }}>
                        Feels like {Math.round(weather?.main?.feels_like)}°C
                    </Text>

                    {/* ── Detail Grid ── */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 15, marginBottom: 15 }}>
                        <View style={{ alignItems: 'center', flex: 1 }}>
                            <Ionicons name="water-outline" size={20} color="#74b9ff" />
                            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600', marginTop: 6 }}>{weather?.main?.humidity}%</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>Humidity</Text>
                        </View>
                        <View style={{ alignItems: 'center', flex: 1 }}>
                            <Ionicons name="speedometer-outline" size={20} color="#ffa502" />
                            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600', marginTop: 6 }}>{weather?.wind?.speed} m/s</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>Wind</Text>
                        </View>
                        <View style={{ alignItems: 'center', flex: 1 }}>
                            <Ionicons name="eye-outline" size={20} color="#a29bfe" />
                            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600', marginTop: 6 }}>{(weather?.visibility / 1000).toFixed(1)} km</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>Visibility</Text>
                        </View>
                        <View style={{ alignItems: 'center', flex: 1 }}>
                            <Ionicons name="push-outline" size={20} color="#fd79a8" />
                            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600', marginTop: 6 }}>{weather?.main?.pressure} hPa</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>Pressure</Text>
                        </View>
                    </View>

                    {/* ── Sunrise / Sunset ── */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="sunny-outline" size={18} color="#ffa502" />
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginLeft: 6 }}>Sunrise {formatTime(weather?.sys?.sunrise)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="moon-outline" size={18} color="#a29bfe" />
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginLeft: 6 }}>Sunset {formatTime(weather?.sys?.sunset)}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Farming Recommendation ── */}
                {recommendation && (
                    <View style={{ borderRadius: 15, padding: 16, borderWidth: 1, marginBottom: 20, backgroundColor: sevColor.bg, borderColor: sevColor.border }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <Ionicons name={recommendation.icon} size={22} color={sevColor.text} />
                            <Text style={{ fontSize: 15, fontWeight: 'bold', marginLeft: 8, color: sevColor.text }}>Farming Advice</Text>
                        </View>
                        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 21 }}>{recommendation.text}</Text>
                    </View>
                )}

                {/* ── 5-Day Forecast ── */}
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>5-Day Forecast</Text>
                {forecast.map((day, index) => {
                    const dayCondition = day.weather?.[0]?.main;
                    return (
                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a4d45', borderRadius: 12, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(111, 223, 196, 0.15)' }}>
                            <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', width: 100 }}>{getDayName(day.dt)}</Text>
                            <Ionicons name={getWeatherIcon(dayCondition)} size={24} color="#6fdfc4" />
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, flex: 1, marginLeft: 10 }}>{dayCondition}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginRight: 8 }}>{Math.round(day.main?.temp_max)}°</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{Math.round(day.main?.temp_min)}°</Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}
