import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentSeason, getMonthlyTips, SEASONS } from './data/seasons';
import { getCropsByZoneAndSeason } from './data/crops';

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
                            <Text style={styles.timelineText}>🌧 Maha</Text>
                            <Text style={styles.timelineMonths}>Oct – Feb</Text>
                        </View>
                        <View style={[styles.timelineBlock, { backgroundColor: '#95a5a620' }]}>
                            <Text style={styles.timelineText}>🔄 Inter</Text>
                            <Text style={styles.timelineMonths}>Mar</Text>
                        </View>
                        <View style={[styles.timelineBlock, { backgroundColor: SEASONS.yala.color + '40' }]}>
                            <Text style={styles.timelineText}>☀️ Yala</Text>
                            <Text style={styles.timelineMonths}>Apr – Aug</Text>
                        </View>
                        <View style={[styles.timelineBlock, { backgroundColor: '#95a5a620' }]}>
                            <Text style={styles.timelineText}>🔄 Inter</Text>
                            <Text style={styles.timelineMonths}>Sep</Text>
                        </View>
                    </View>
                </View>

                {/* Monthly Tip Card */}
                {monthlyTip && (
                    <>
                        <Text style={styles.sectionTitle}>
                            📅 This Month — {monthlyTip.month} ({monthlyTip.sinhalaName})
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
                        <Text style={styles.sectionTitle}>🌱 What to Grow This Season</Text>
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
                <Text style={styles.sectionTitle}>🗺️ Your Zone</Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a1f1c',
        padding: 20,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    scrollContent: {
        paddingBottom: 40,
    },

    // Season card
    seasonCard: {
        backgroundColor: '#1a4d45',
        padding: 18,
        borderRadius: 15,
        marginBottom: 20,
        borderWidth: 1.5,
    },
    seasonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    seasonEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    seasonName: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    seasonSinhala: {
        color: '#6fdfc4',
        fontSize: 14,
        marginTop: 2,
    },
    activeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activeBadgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
    },
    seasonMonsoon: {
        color: '#8aa6a3',
        fontSize: 13,
        marginBottom: 4,
    },
    seasonDesc: {
        color: '#b0d4cc',
        fontSize: 13,
        lineHeight: 18,
    },

    // Timeline
    timelineCard: {
        backgroundColor: '#1a4d45',
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
    },
    timelineRow: {
        flexDirection: 'row',
        gap: 4,
    },
    timelineBlock: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    timelineText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
    },
    timelineMonths: {
        color: '#8aa6a3',
        fontSize: 10,
        marginTop: 3,
    },

    // Section title
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },

    // Tip card
    tipCard: {
        backgroundColor: '#1a4d45',
        padding: 18,
        borderRadius: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#2a5d55',
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    tipLabel: {
        color: '#8aa6a3',
        fontSize: 13,
        marginLeft: 8,
        fontWeight: '600',
    },
    tipText: {
        color: '#b0d4cc',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 4,
    },
    tipDivider: {
        height: 1,
        backgroundColor: '#2a5d55',
        marginVertical: 12,
    },
    tipLabelZone: {
        color: '#6fdfc4',
        fontSize: 13,
        marginLeft: 8,
        fontWeight: '600',
    },
    tipTextZone: {
        color: 'white',
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
    },

    // Crops grid
    cropsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    cropChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a4d45',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#2a5d55',
    },
    cropChipEmoji: {
        fontSize: 16,
        marginRight: 6,
    },
    cropChipName: {
        color: 'white',
        fontSize: 13,
        fontWeight: '500',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 20,
    },
    viewAllText: {
        color: '#6fdfc4',
        fontSize: 14,
        fontWeight: '600',
    },

    // Zone info
    zoneInfoCard: {
        backgroundColor: '#1a4d45',
        padding: 18,
        borderRadius: 15,
        borderWidth: 1,
    },
    zoneInfoTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    zoneInfoSinhala: {
        color: '#6fdfc4',
        fontSize: 14,
        marginTop: 2,
    },
    zoneInfoDetail: {
        color: '#8aa6a3',
        fontSize: 13,
        marginTop: 6,
    },
    zoneInfoDesc: {
        color: '#b0d4cc',
        fontSize: 13,
        marginTop: 4,
        lineHeight: 18,
    },
    changeZoneButton: {
        marginTop: 12,
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#6fdfc4',
    },
    changeZoneText: {
        color: '#6fdfc4',
        fontWeight: 'bold',
        fontSize: 13,
    },

    // Empty state
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
    },
    emptySubtext: {
        color: '#8aa6a3',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    setupButton: {
        backgroundColor: '#6fdfc4',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginTop: 20,
    },
    setupButtonText: {
        color: '#0a1f1c',
        fontWeight: 'bold',
        fontSize: 15,
    },
});
