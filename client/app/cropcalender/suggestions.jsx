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

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Seasonal Advice</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Current Season Card */}
                <View style={[styles.seasonCard, { borderColor: currentSeason.color }]}>
                    <View style={styles.seasonHeader}>
                        <Text style={styles.seasonEmoji}>{currentSeason.emoji}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.seasonName}>{currentSeason.name}</Text>
                            <Text style={styles.seasonSinhala}>{currentSeason.sinhalaName}</Text>
                        </View>
                        <View style={[styles.activeBadge, { backgroundColor: currentSeason.color }]}>
                            <Text style={styles.activeBadgeText}>ACTIVE</Text>
                        </View>
                    </View>
                    <Text style={styles.seasonMonsoon}>{currentSeason.monsoon}</Text>
                    <Text style={styles.seasonDesc}>{currentSeason.description}</Text>
                </View>

                {/* Season Timeline */}
                <Text style={styles.sectionTitle}>Season Calendar</Text>
                <View style={styles.timelineCard}>
                    <View style={styles.timelineRow}>
                        <View style={[styles.timelineBlock, { backgroundColor: SEASONS.maha.color + '40' }]}>
                            <Text style={styles.timelineText}>≡ƒîº Maha</Text>
                            <Text style={styles.timelineMonths}>Oct ΓÇô Feb</Text>
                        </View>
                        <View style={[styles.timelineBlock, { backgroundColor: '#95a5a620' }]}>
                            <Text style={styles.timelineText}>≡ƒöä Inter</Text>
                            <Text style={styles.timelineMonths}>Mar</Text>
                        </View>
                        <View style={[styles.timelineBlock, { backgroundColor: SEASONS.yala.color + '40' }]}>
                            <Text style={styles.timelineText}>ΓÿÇ∩╕Å Yala</Text>
                            <Text style={styles.timelineMonths}>Apr ΓÇô Aug</Text>
                        </View>
                        <View style={[styles.timelineBlock, { backgroundColor: '#95a5a620' }]}>
                            <Text style={styles.timelineText}>≡ƒöä Inter</Text>
                            <Text style={styles.timelineMonths}>Sep</Text>
                        </View>
                    </View>
                </View>

                {/* Monthly Tip Card */}
                {monthlyTip && (
                    <>
                        <Text style={styles.sectionTitle}>
                            ≡ƒôà This Month ΓÇö {monthlyTip.month} ({monthlyTip.sinhalaName})
                        </Text>
                        <View style={styles.tipCard}>
                            <View style={styles.tipRow}>
                                <Ionicons name="globe" size={18} color="#8aa6a3" />
                                <Text style={styles.tipLabel}>General:</Text>
                            </View>
                            <Text style={styles.tipText}>{monthlyTip.general}</Text>

                            <View style={[styles.tipDivider]} />

                            <View style={styles.tipRow}>
                                <Ionicons name="location" size={18} color="#6fdfc4" />
                                <Text style={styles.tipLabelZone}>For your zone ({zone.name}):</Text>
                            </View>
                            <Text style={styles.tipTextZone}>{monthlyTip.zoneTip}</Text>
                        </View>
                    </>
                )}

                {/* What to Plant Now */}
                {seasonCrops.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>≡ƒî▒ What to Grow This Season</Text>
                        <View style={styles.cropsGrid}>
                            {seasonCrops.slice(0, 8).map((crop) => (
                                <View key={crop.id} style={styles.cropChip}>
                                    <Text style={styles.cropChipEmoji}>{crop.emoji}</Text>
                                    <Text style={styles.cropChipName}>{crop.name}</Text>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={() => router.push('/cropcalender/crops')}
                        >
                            <Text style={styles.viewAllText}>View All Crop Details</Text>
                            <Ionicons name="arrow-forward" size={18} color="#6fdfc4" />
                        </TouchableOpacity>
                    </>
                )}

                {/* Zone Info */}
                <Text style={styles.sectionTitle}>≡ƒù║∩╕Å Your Zone</Text>
                <View style={[styles.zoneInfoCard, { borderColor: zone.color }]}>
                    <Text style={styles.zoneInfoTitle}>{zone.emoji} {zone.name}</Text>
                    <Text style={styles.zoneInfoSinhala}>{zone.sinhalaName}</Text>
                    <Text style={styles.zoneInfoDetail}>Rainfall: {zone.rainfall}</Text>
                    <Text style={styles.zoneInfoDesc}>{zone.description}</Text>
                    <TouchableOpacity
                        style={styles.changeZoneButton}
                        onPress={() => router.push('/cropcalender/zone')}
                    >
                        <Text style={styles.changeZoneText}>Change Zone</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
