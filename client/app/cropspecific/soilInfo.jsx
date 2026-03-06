import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOIL_TYPES, getSoilsByZone } from './_data/soilTypes';

const ZONE_COLORS = { wet: '#2ecc71', dry: '#e67e22', intermediate: '#3498db' };
const ZONE_EMOJIS = { wet: '🌧️', dry: '☀️', intermediate: '🌤️' };
const ZONE_NAMES = { wet: 'Wet Zone', dry: 'Dry Zone', intermediate: 'Intermediate Zone' };

export default function SoilInfoScreen() {
    const router = useRouter();
    const [zone, setZone] = useState(null);
    const [activeZone, setActiveZone] = useState('wet');
    const [expandedSoil, setExpandedSoil] = useState(null);

    useEffect(() => {
        const loadZone = async () => {
            const savedZone = await AsyncStorage.getItem('selectedZone');
            if (savedZone) {
                const parsed = JSON.parse(savedZone);
                setZone(parsed);
                setActiveZone(parsed.id);
            }
        };
        loadZone();
    }, []);

    const soilList = getSoilsByZone(activeZone);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>🏔️ Soil Information</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Zone Selector */}
                <View style={styles.zoneTabs}>
                    {['wet', 'dry', 'intermediate'].map(z => (
                        <TouchableOpacity
                            key={z}
                            style={[styles.zoneTab, activeZone === z && { backgroundColor: ZONE_COLORS[z] + '30', borderColor: ZONE_COLORS[z] }]}
                            onPress={() => { setActiveZone(z); setExpandedSoil(null); }}
                        >
                            <Text style={styles.zoneTabEmoji}>{ZONE_EMOJIS[z]}</Text>
                            <Text style={[styles.zoneTabText, activeZone === z && { color: ZONE_COLORS[z] }]}>
                                {z.charAt(0).toUpperCase() + z.slice(1)}
                            </Text>
                            {zone && zone.id === z && <Text style={styles.yourZone}>★</Text>}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Zone Title */}
                <View style={[styles.zoneHeader, { borderColor: ZONE_COLORS[activeZone] }]}>
                    <Text style={styles.zoneHeaderTitle}>{ZONE_EMOJIS[activeZone]} {ZONE_NAMES[activeZone]} Soils</Text>
                    <Text style={styles.zoneHeaderCount}>{soilList.length} soil type{soilList.length !== 1 ? 's' : ''}</Text>
                </View>

                {/* Soil Cards */}
                {soilList.map((soil, i) => {
                    const isExpanded = expandedSoil === soil.id;
                    return (
                        <TouchableOpacity
                            key={soil.id}
                            style={styles.soilCard}
                            onPress={() => setExpandedSoil(isExpanded ? null : soil.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.soilHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.soilName}>{soil.name}</Text>
                                    <Text style={styles.soilSinhala}>{soil.sinhalaName}</Text>
                                </View>
                                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={22} color="#6fdfc4" />
                            </View>

                            <Text style={styles.soilDesc}>{soil.description}</Text>

                            {isExpanded && (
                                <View style={styles.expandedContent}>
                                    {/* Characteristics */}
                                    <Text style={styles.subTitle}>📋 Characteristics</Text>
                                    {soil.characteristics.map((char, j) => (
                                        <Text key={j} style={styles.charItem}>• {char}</Text>
                                    ))}

                                    {/* Suitable Crops */}
                                    <Text style={styles.subTitle}>🌱 Suitable Crops</Text>
                                    <View style={styles.cropChips}>
                                        {soil.suitableCrops.map((cropId, j) => (
                                            <View key={j} style={styles.cropChip}>
                                                <Text style={styles.cropChipText}>{cropId}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Improvement Tips */}
                                    <Text style={styles.subTitle}>🔧 Improvement Tips</Text>
                                    {soil.improvement.map((tip, j) => (
                                        <View key={j} style={styles.tipRow}>
                                            <View style={styles.tipDot} />
                                            <Text style={styles.tipText}>{tip}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}

                {/* General Tips */}
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>💡 General Soil Health Tips</Text>
                    <Text style={styles.tipGeneral}>• Test soil pH before every season using a simple kit (available from DOA)</Text>
                    <Text style={styles.tipGeneral}>• Add organic matter (compost, green manure) to improve soil structure</Text>
                    <Text style={styles.tipGeneral}>• Practice crop rotation to maintain soil fertility</Text>
                    <Text style={styles.tipGeneral}>• Use contour farming on slopes to prevent erosion</Text>
                    <Text style={styles.tipGeneral}>• Maintain ground cover during fallow periods</Text>
                    <Text style={styles.tipGeneral}>• Apply dolomite to correct acidic soils (based on soil test)</Text>
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

    zoneTabs: { flexDirection: 'row', gap: 8, marginBottom: 15 },
    zoneTab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: '#1a4d45', borderWidth: 1.5, borderColor: '#2a5d55' },
    zoneTabEmoji: { fontSize: 20, marginBottom: 4 },
    zoneTabText: { color: '#8aa6a3', fontSize: 12, fontWeight: '600' },
    yourZone: { color: '#f39c12', fontSize: 10, marginTop: 2 },

    zoneHeader: { padding: 14, borderRadius: 12, backgroundColor: '#1a4d45', borderWidth: 1, marginBottom: 15 },
    zoneHeaderTitle: { color: 'white', fontSize: 17, fontWeight: 'bold' },
    zoneHeaderCount: { color: '#8aa6a3', fontSize: 12, marginTop: 4 },

    soilCard: { backgroundColor: '#0d2b27', padding: 16, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a5d55' },
    soilHeader: { flexDirection: 'row', alignItems: 'center' },
    soilName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    soilSinhala: { color: '#6fdfc4', fontSize: 12, marginTop: 2 },
    soilDesc: { color: '#8aa6a3', fontSize: 13, marginTop: 8, lineHeight: 20 },

    expandedContent: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#2a5d55' },
    subTitle: { color: 'white', fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginTop: 10 },
    charItem: { color: '#b0d4cc', fontSize: 13, marginBottom: 4, marginLeft: 8, lineHeight: 20 },

    cropChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    cropChip: { backgroundColor: '#6fdfc420', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    cropChipText: { color: '#6fdfc4', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },

    tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6, marginLeft: 4 },
    tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2ecc71', marginTop: 7 },
    tipText: { color: '#b0d4cc', fontSize: 13, flex: 1, lineHeight: 20 },

    tipsCard: { backgroundColor: '#1a3a35', padding: 16, borderRadius: 14, marginTop: 10, borderWidth: 1, borderColor: '#2ecc7130' },
    tipsTitle: { color: '#2ecc71', fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
    tipGeneral: { color: '#b0d4cc', fontSize: 13, marginBottom: 6, lineHeight: 20 },
});
