import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentSeason, getMonthlyTips, SEASONS } from './_data/seasons';
import { getCropsByZoneAndSeason } from './_data/crops';

export default function SuggestionsScreen() {
    const router = useRouter();
    const [zone, setZone] = useState(null);
    const currentSeason = getCurrentSeason();
    const now = new Date();

    useEffect(() => {
        const loadZone = async () => {
            try {
                const saved = await AsyncStorage.getItem('selectedZone');
                if (saved) setZone(JSON.parse(saved));
            } catch (e) {
                console.log('Error loading zone:', e);
            }
        };
        loadZone();
    }, []);

    const monthlyTip = zone ? getMonthlyTips(zone.id) : null;
    const seasonCrops = zone ? getCropsByZoneAndSeason(zone.id, currentSeason.id) : [];

    if (!zone) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Seasonal Advice</Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={styles.emptyState}>
                    <Ionicons name="location-outline" size={60} color="#2a5d55" />
                    <Text style={styles.emptyText}>No zone selected</Text>
                    <Text style={styles.emptySubtext}>
                        Set your agro-ecological zone to receive seasonal farming advice.
                    </Text>
                    <TouchableOpacity
                        style={styles.setupButton}
                        onPress={() => router.push('/cropcalender/zone')}
                    >
                        <Text style={styles.setupButtonText}>Set Up Zone</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

