import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCropById } from './_data/cropRecommendations';
import { getFertilizerGuide, getZoneFertilizer } from './_data/fertilizerGuides';

export default function FertilizerGuideScreen() {
    const router = useRouter();
    const { cropId } = useLocalSearchParams();
    const [zone, setZone] = useState(null);
    const [showOrganic, setShowOrganic] = useState(true);

    const crop = getCropById(cropId);
    const fertGuide = getFertilizerGuide(cropId);

    useEffect(() => {
        const loadZone = async () => {
            const savedZone = await AsyncStorage.getItem('selectedZone');
            if (savedZone) setZone(JSON.parse(savedZone));
        };
        loadZone();
    }, []);

    if (!crop || !fertGuide) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Fertilizer Guide</Text>
                    <View style={{ width: 28 }} />
                </View>
                <Text style={styles.noDataText}>Fertilizer guide not available.</Text>
            </View>
        );
    }

    const zoneFertilizer = zone ? getZoneFertilizer(cropId, zone.id) : null;
    const availableZones = fertGuide.chemical ? Object.keys(fertGuide.chemical) : [];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{crop.emoji} Fertilizer Guide</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Title Card */}
                <View style={styles.titleCard}>
                    <Text style={styles.titleText}>{fertGuide.title}</Text>
                    <Text style={styles.unitText}>Measurements: {fertGuide.unit}</Text>
                    {zone && <Text style={styles.zoneLabel}>Your Zone: {zone.emoji} {zone.name}</Text>}
                </View>

                {/* Toggle between Organic and Chemical */}
                <View style={styles.toggleRow}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, showOrganic && styles.toggleActive]}
                        onPress={() => setShowOrganic(true)}
                    >
                        <Text style={[styles.toggleText, showOrganic && styles.toggleTextActive]}>🌿 Organic</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, !showOrganic && styles.toggleActive]}
                        onPress={() => setShowOrganic(false)}
                    >
                        <Text style={[styles.toggleText, !showOrganic && styles.toggleTextActive]}>⚗️ Chemical</Text>
                    </TouchableOpacity>
                </View>

                {showOrganic ? (
                    /* Organic Section */
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Organic Fertilizer Options</Text>
                        <Text style={styles.sectionSubtext}>Sustainable alternatives for better soil health</Text>
                        {fertGuide.organic.map((org, i) => (
                            <View key={i} style={styles.orgCard}>
                                <View style={styles.orgHeader}>
                                    <Ionicons name="leaf" size={20} color="#2ecc71" />
                                    <Text style={styles.orgName}>{org.name}</Text>
                                </View>
                                <View style={styles.orgDetails}>
                                    <View style={styles.orgRow}>
                                        <Text style={styles.orgLabel}>📏 Quantity:</Text>
                                        <Text style={styles.orgValue}>{org.quantity}</Text>
                                    </View>
                                    <View style={styles.orgRow}>
                                        <Text style={styles.orgLabel}>📅 Timing:</Text>
                                        <Text style={styles.orgValue}>{org.timing}</Text>
                                    </View>
                                </View>
                                <Text style={styles.orgNotes}>💡 {org.notes}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    /* Chemical Section */
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Chemical Fertilizer Schedule</Text>

                        {/* Zone selector for chemical */}
                        {availableZones.length > 1 && (
                            <View style={styles.zoneSelector}>
                                <Text style={styles.zoneSelectorLabel}>Available zone schedules:</Text>
                                <View style={styles.zoneChips}>
                                    {availableZones.map(z => (
                                        <View key={z} style={[styles.zoneChip, zone && zone.id === z && styles.zoneChipHighlight]}>
                                            <Text style={styles.zoneChipText}>
                                                {z.charAt(0).toUpperCase() + z.slice(1)} {zone && zone.id === z ? '✓' : ''}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* NPK Legend */}
                        <View style={styles.legend}>
                            <View style={[styles.legendItem, { backgroundColor: '#3498db30' }]}>
                                <Text style={styles.legendText}>Urea (N)</Text>
                            </View>
                            <View style={[styles.legendItem, { backgroundColor: '#2ecc7130' }]}>
                                <Text style={styles.legendText}>TSP (P)</Text>
                            </View>
                            <View style={[styles.legendItem, { backgroundColor: '#e67e2230' }]}>
                                <Text style={styles.legendText}>MOP (K)</Text>
                            </View>
                        </View>

                        {zoneFertilizer ? (
                            zoneFertilizer.map((item, i) => (
                                <View key={i} style={styles.chemCard}>
                                    <View style={styles.chemHeader}>
                                        <View style={styles.stageNumber}>
                                            <Text style={styles.stageNumText}>{i + 1}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.chemStage}>{item.stage}</Text>
                                            <Text style={styles.chemTiming}>🕐 {item.timing}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.npkRow}>
                                        {item.urea && item.urea !== '-' && (
                                            <View style={[styles.npkBadge, { backgroundColor: '#3498db30', borderColor: '#3498db' }]}>
                                                <Text style={styles.npkLabel}>Urea</Text>
                                                <Text style={styles.npkValue}>{item.urea}</Text>
                                            </View>
                                        )}
                                        {item.tsp && item.tsp !== '-' && (
                                            <View style={[styles.npkBadge, { backgroundColor: '#2ecc7130', borderColor: '#2ecc71' }]}>
                                                <Text style={styles.npkLabel}>TSP</Text>
                                                <Text style={styles.npkValue}>{item.tsp}</Text>
                                            </View>
                                        )}
                                        {item.mop && item.mop !== '-' && (
                                            <View style={[styles.npkBadge, { backgroundColor: '#e67e2230', borderColor: '#e67e22' }]}>
                                                <Text style={styles.npkLabel}>MOP</Text>
                                                <Text style={styles.npkValue}>{item.mop}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.chemNotes}>📝 {item.notes}</Text>
                                </View>
                            ))
                        ) : (
                            <View style={styles.noZoneCard}>
                                <Ionicons name="location-outline" size={32} color="#6a9a90" />
                                <Text style={styles.noZoneText}>Set your zone in Crop Calendar to get zone-specific fertilizer schedules</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Important Notes */}
                <View style={styles.notesSection}>
                    <Text style={styles.notesTitle}>⚠️ Important Notes</Text>
                    <Text style={styles.noteItem}>• Always do a soil test before applying fertilizer</Text>
                    <Text style={styles.noteItem}>• Apply fertilizer when soil is moist</Text>
                    <Text style={styles.noteItem}>• Do not apply during heavy rain (causes runoff)</Text>
                    <Text style={styles.noteItem}>• Organic + chemical integration gives best results</Text>
                    <Text style={styles.noteItem}>• Follow DOA recommended quantities strictly</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a1f1c', padding: 20, paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', flex: 1, textAlign: 'center' },
    scrollContent: { paddingBottom: 30 },
    noDataText: { color: '#6a9a90', fontSize: 16, textAlign: 'center', marginTop: 40 },

    titleCard: { backgroundColor: '#1a4d45', padding: 16, borderRadius: 14, marginBottom: 15, borderWidth: 1, borderColor: '#2a5d55' },
    titleText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    unitText: { color: '#6fdfc4', fontSize: 13, marginTop: 4 },
    zoneLabel: { color: '#8aa6a3', fontSize: 13, marginTop: 4 },

    toggleRow: { flexDirection: 'row', backgroundColor: '#1a4d45', borderRadius: 12, padding: 4, marginBottom: 15 },
    toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
    toggleActive: { backgroundColor: '#6fdfc4' },
    toggleText: { color: '#8aa6a3', fontSize: 14, fontWeight: '600' },
    toggleTextActive: { color: '#0a1f1c' },

    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: 'white', marginBottom: 4 },
    sectionSubtext: { color: '#6a9a90', fontSize: 12, marginBottom: 12 },

    orgCard: { backgroundColor: '#0d2b27', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#2a5d55' },
    orgHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    orgName: { color: '#2ecc71', fontSize: 16, fontWeight: 'bold' },
    orgDetails: { gap: 4 },
    orgRow: { flexDirection: 'row', gap: 8 },
    orgLabel: { color: '#8aa6a3', fontSize: 13, width: 90 },
    orgValue: { color: '#b0d4cc', fontSize: 13, flex: 1 },
    orgNotes: { color: '#6a9a90', fontSize: 12, marginTop: 8, fontStyle: 'italic', lineHeight: 18 },

    zoneSelector: { marginBottom: 12 },
    zoneSelectorLabel: { color: '#8aa6a3', fontSize: 12, marginBottom: 6 },
    zoneChips: { flexDirection: 'row', gap: 8 },
    zoneChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#1a4d45', borderWidth: 1, borderColor: '#2a5d55' },
    zoneChipHighlight: { borderColor: '#6fdfc4', backgroundColor: '#6fdfc420' },
    zoneChipText: { color: '#8aa6a3', fontSize: 12 },

    legend: { flexDirection: 'row', gap: 8, marginBottom: 14 },
    legendItem: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    legendText: { color: 'white', fontSize: 11, fontWeight: '600' },

    chemCard: { backgroundColor: '#0d2b27', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#2a5d55' },
    chemHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    stageNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#6fdfc4', justifyContent: 'center', alignItems: 'center' },
    stageNumText: { color: '#0a1f1c', fontSize: 14, fontWeight: 'bold' },
    chemStage: { color: 'white', fontSize: 15, fontWeight: 'bold' },
    chemTiming: { color: '#6fdfc4', fontSize: 12, marginTop: 2 },
    npkRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
    npkBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: 'center', minWidth: 80 },
    npkLabel: { color: '#8aa6a3', fontSize: 10 },
    npkValue: { color: 'white', fontSize: 14, fontWeight: 'bold', marginTop: 2 },
    chemNotes: { color: '#6a9a90', fontSize: 12, fontStyle: 'italic', lineHeight: 18 },

    noZoneCard: { alignItems: 'center', padding: 24, backgroundColor: '#0d2b27', borderRadius: 12, borderWidth: 1, borderColor: '#2a5d55' },
    noZoneText: { color: '#6a9a90', fontSize: 13, textAlign: 'center', marginTop: 10, lineHeight: 20 },

    notesSection: { backgroundColor: '#1a3a35', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#e67e2240' },
    notesTitle: { color: '#f39c12', fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
    noteItem: { color: '#b0d4cc', fontSize: 13, marginBottom: 6, lineHeight: 20 },
});
