import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCropById } from './_data/cropRecommendations';
import { getFertilizerGuide, getZoneFertilizer } from './_data/fertilizerGuides';
import { getPestDiseaseData } from './_data/pestDiseaseData';

const TABS = ['Overview', 'Growing', 'Fertilizer', 'Pests'];

export default function CropDetailScreen() {
    const router = useRouter();
    const { cropId } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState('Overview');
    const [zone, setZone] = useState(null);

    const crop = getCropById(cropId);
    const fertGuide = getFertilizerGuide(cropId);
    const pestData = getPestDiseaseData(cropId);

    useEffect(() => {
        const loadZone = async () => {
            const savedZone = await AsyncStorage.getItem('selectedZone');
            if (savedZone) setZone(JSON.parse(savedZone));
        };
        loadZone();
    }, []);

    if (!crop) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Crop not found</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backLink}>← Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const zoneFertilizer = zone ? getZoneFertilizer(cropId, zone.id) : null;

    const renderOverviewTab = () => (
        <View>
            {/* Description */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About This Crop</Text>
                <Text style={styles.sectionText}>{crop.overview}</Text>
            </View>

            {/* Economic Importance */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>💰 Economic Importance</Text>
                <Text style={styles.sectionText}>{crop.economicImportance}</Text>
            </View>

            {/* Zone Compatibility */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🗺️ Zone Compatibility</Text>
                <View style={styles.zoneGrid}>
                    {['wet', 'dry', 'intermediate'].map(z => {
                        const isCompatible = crop.zones.includes(z);
                        return (
                            <View key={z} style={[styles.zoneChip, { backgroundColor: isCompatible ? (z === 'wet' ? '#2ecc7130' : z === 'dry' ? '#e67e2230' : '#3498db30') : '#1a3d3a' }]}>
                                <Ionicons name={isCompatible ? 'checkmark-circle' : 'close-circle'} size={16} color={isCompatible ? '#2ecc71' : '#e74c3c'} />
                                <Text style={[styles.zoneChipText, { color: isCompatible ? 'white' : '#6a7a70' }]}>
                                    {z.charAt(0).toUpperCase() + z.slice(1)} Zone
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Recommended Varieties */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌱 Recommended Varieties</Text>
                {crop.varieties.map((v, i) => (
                    <View key={i} style={styles.varietyCard}>
                        <View style={styles.varietyHeader}>
                            <Text style={styles.varietyName}>{v.name}</Text>
                            <View style={styles.varietyTypeBadge}>
                                <Text style={styles.varietyType}>{v.type}</Text>
                            </View>
                        </View>
                        <View style={styles.varietyDetails}>
                            <Text style={styles.varietyDetail}>⏱ Duration: {v.duration}</Text>
                            <Text style={styles.varietyDetail}>📊 Yield: {v.yield}</Text>
                        </View>
                        <Text style={styles.varietyNotes}>{v.notes}</Text>
                    </View>
                ))}
            </View>

            {/* Market Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📈 Market Information</Text>
                <View style={styles.marketCard}>
                    <Text style={styles.marketItem}>📅 Peak Demand: {crop.marketInfo.peakDemand}</Text>
                    <Text style={styles.marketItem}>💵 Avg Price: {crop.marketInfo.avgPrice}</Text>
                    <Text style={styles.marketItem}>🌍 Export: {crop.marketInfo.exportPotential}</Text>
                </View>
            </View>
        </View>
    );

    const renderGrowingTab = () => (
        <View>
            {/* Soil Requirements */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏔️ Soil Requirements</Text>
                <View style={styles.infoCard}>
                    <Text style={styles.infoItem}>pH: {crop.soilRequirements.pH}</Text>
                    <Text style={styles.infoItem}>Type: {crop.soilRequirements.type}</Text>
                    <Text style={styles.infoItem}>Drainage: {crop.soilRequirements.drainage}</Text>
                    <Text style={styles.infoItem}>Prep: {crop.soilRequirements.preparation}</Text>
                </View>
            </View>

            {/* Water Requirements */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>💧 Water Requirements</Text>
                <Text style={styles.sectionText}>{crop.waterRequirements}</Text>
            </View>

            {/* Planting Guide */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌿 Planting Guide</Text>
                <View style={styles.infoCard}>
                    <Text style={styles.infoItem}>Spacing: {crop.plantingGuide.spacing}</Text>
                    <Text style={styles.infoItem}>Method: {crop.plantingGuide.method}</Text>
                    <Text style={styles.infoItem}>Depth: {crop.plantingGuide.depth}</Text>
                    <Text style={styles.infoItem}>Seed Rate: {crop.plantingGuide.seedRate}</Text>
                    <Text style={styles.infoItem}>Yala: {crop.plantingGuide.bestMonths.yala}</Text>
                    {crop.plantingGuide.bestMonths.maha ? (
                        <Text style={styles.infoItem}>Maha: {crop.plantingGuide.bestMonths.maha}</Text>
                    ) : null}
                </View>
            </View>

            {/* Growth Stages Timeline */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📆 Growth Stages</Text>
                {crop.growthStages.map((stage, i) => (
                    <View key={i} style={styles.stageCard}>
                        <View style={styles.stageIndicator}>
                            <View style={styles.stageDot} />
                            {i < crop.growthStages.length - 1 && <View style={styles.stageLine} />}
                        </View>
                        <View style={styles.stageContent}>
                            <Text style={styles.stageName}>{stage.stage}</Text>
                            <Text style={styles.stageDuration}>{stage.duration}</Text>
                            <Text style={styles.stageCare}>{stage.care}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Harvesting */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔪 Harvesting Tips</Text>
                <Text style={styles.sectionText}>{crop.harvestingTips}</Text>
            </View>

            {/* Navigation to best practices */}
            <TouchableOpacity
                style={styles.navButton}
                onPress={() => router.push({ pathname: '/cropspecific/bestPractices', params: { cropId } })}
            >
                <Ionicons name="bulb" size={22} color="#f39c12" />
                <Text style={styles.navButtonText}>View Best Practices & Tips</Text>
                <Ionicons name="chevron-forward" size={20} color="#4a7a70" />
            </TouchableOpacity>
        </View>
    );

    const renderFertilizerTab = () => (
        <View>
            {fertGuide ? (
                <>
                    {/* Organic Options */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🌿 Organic Fertilizers</Text>
                        {fertGuide.organic.map((org, i) => (
                            <View key={i} style={styles.fertCard}>
                                <Text style={styles.fertName}>{org.name}</Text>
                                <Text style={styles.fertDetail}>Quantity: {org.quantity}</Text>
                                <Text style={styles.fertDetail}>Timing: {org.timing}</Text>
                                <Text style={styles.fertNotes}>{org.notes}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Chemical Schedule */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⚗️ Chemical Fertilizer Schedule {zone ? `(${zone.name})` : ''}</Text>
                        <Text style={styles.unitText}>Unit: {fertGuide.unit}</Text>
                        {zoneFertilizer ? (
                            zoneFertilizer.map((item, i) => (
                                <View key={i} style={styles.chemCard}>
                                    <View style={styles.chemHeader}>
                                        <Text style={styles.chemStage}>{item.stage}</Text>
                                        <Text style={styles.chemTiming}>{item.timing}</Text>
                                    </View>
                                    <View style={styles.npkRow}>
                                        {item.urea && item.urea !== '-' && <View style={[styles.npkBadge, { backgroundColor: '#3498db30' }]}><Text style={styles.npkText}>Urea: {item.urea}</Text></View>}
                                        {item.tsp && item.tsp !== '-' && <View style={[styles.npkBadge, { backgroundColor: '#2ecc7130' }]}><Text style={styles.npkText}>TSP: {item.tsp}</Text></View>}
                                        {item.mop && item.mop !== '-' && <View style={[styles.npkBadge, { backgroundColor: '#e67e2230' }]}><Text style={styles.npkText}>MOP: {item.mop}</Text></View>}
                                    </View>
                                    <Text style={styles.chemNotes}>{item.notes}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noDataText}>Set your zone for zone-specific recommendations</Text>
                        )}
                    </View>
                </>
            ) : (
                <Text style={styles.noDataText}>Fertilizer data not available for this crop</Text>
            )}

            {/* Navigate to detailed guide */}
            <TouchableOpacity
                style={styles.navButton}
                onPress={() => router.push({ pathname: '/cropspecific/fertilizerGuide', params: { cropId } })}
            >
                <Ionicons name="flask" size={22} color="#3498db" />
                <Text style={styles.navButtonText}>Detailed Fertilizer Guide</Text>
                <Ionicons name="chevron-forward" size={20} color="#4a7a70" />
            </TouchableOpacity>
        </View>
    );

    const renderPestsTab = () => (
        <View>
            {pestData ? (
                <>
                    {/* Pests */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🐛 Common Pests</Text>
                        {pestData.pests.map((pest, i) => (
                            <View key={i} style={styles.pestCard}>
                                <Text style={styles.pestName}>{pest.name}</Text>
                                <Text style={styles.pestSinhala}>{pest.sinhalaName}</Text>
                                <Text style={styles.pestLabel}>Symptoms:</Text>
                                <Text style={styles.pestText}>{pest.symptoms}</Text>
                                <Text style={styles.pestLabel}>Affected: {pest.affectedParts}</Text>
                                <Text style={styles.pestLabel}>Control:</Text>
                                {pest.control.map((c, j) => (
                                    <Text key={j} style={styles.controlItem}>• {c}</Text>
                                ))}
                            </View>
                        ))}
                    </View>

                    {/* Diseases */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🦠 Common Diseases</Text>
                        {pestData.diseases.map((disease, i) => (
                            <View key={i} style={styles.pestCard}>
                                <Text style={styles.pestName}>{disease.name}</Text>
                                <Text style={styles.pestSinhala}>{disease.sinhalaName}</Text>
                                <Text style={styles.pestLabel}>Cause: {disease.cause}</Text>
                                <Text style={styles.pestLabel}>Symptoms:</Text>
                                <Text style={styles.pestText}>{disease.symptoms}</Text>
                                <Text style={styles.pestLabel}>Conditions:</Text>
                                <Text style={styles.pestText}>{disease.conditions}</Text>
                                <Text style={styles.pestLabel}>Control:</Text>
                                {disease.control.map((c, j) => (
                                    <Text key={j} style={styles.controlItem}>• {c}</Text>
                                ))}
                            </View>
                        ))}
                    </View>

                    {/* Prevention */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🛡️ Prevention Tips</Text>
                        {pestData.prevention.map((tip, i) => (
                            <Text key={i} style={styles.preventionItem}>✅ {tip}</Text>
                        ))}
                    </View>
                </>
            ) : (
                <Text style={styles.noDataText}>Pest data not available for this crop</Text>
            )}

            {/* Navigate to detailed guide */}
            <TouchableOpacity
                style={styles.navButton}
                onPress={() => router.push({ pathname: '/cropspecific/pestGuide', params: { cropId } })}
            >
                <Ionicons name="bug" size={22} color="#e74c3c" />
                <Text style={styles.navButtonText}>Detailed Pest & Disease Guide</Text>
                <Ionicons name="chevron-forward" size={20} color="#4a7a70" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{crop.emoji} {crop.name}</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Crop Name Card */}
            <View style={styles.nameCard}>
                <Text style={styles.cropEmoji}>{crop.emoji}</Text>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cropName}>{crop.name}</Text>
                    <Text style={styles.cropSinhala}>{crop.sinhalaName} | {crop.tamilName}</Text>
                </View>
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tab Content */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {activeTab === 'Overview' && renderOverviewTab()}
                {activeTab === 'Growing' && renderGrowingTab()}
                {activeTab === 'Fertilizer' && renderFertilizerTab()}
                {activeTab === 'Pests' && renderPestsTab()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a1f1c', padding: 20, paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', flex: 1, textAlign: 'center' },
    errorText: { color: '#e74c3c', fontSize: 18, textAlign: 'center', marginTop: 50 },
    backLink: { color: '#6fdfc4', fontSize: 16, textAlign: 'center', marginTop: 20 },

    // Name card
    nameCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a4d45', padding: 16, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: '#2a5d55' },
    cropEmoji: { fontSize: 40, marginRight: 14 },
    cropName: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    cropSinhala: { color: '#6fdfc4', fontSize: 13, marginTop: 3 },

    // Tabs
    tabBar: { flexDirection: 'row', backgroundColor: '#1a4d45', borderRadius: 12, padding: 4, marginBottom: 12 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    tabActive: { backgroundColor: '#6fdfc4' },
    tabText: { color: '#8aa6a3', fontSize: 13, fontWeight: '600' },
    tabTextActive: { color: '#0a1f1c' },

    scrollContent: { paddingBottom: 30 },

    // Sections
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: 'white', marginBottom: 10 },
    sectionText: { color: '#b0d4cc', fontSize: 14, lineHeight: 21 },

    // Zone chips
    zoneGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    zoneChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    zoneChipText: { fontSize: 13, fontWeight: '600' },

    // Variety cards
    varietyCard: { backgroundColor: '#0d2b27', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#2a5d55' },
    varietyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    varietyName: { color: 'white', fontSize: 15, fontWeight: 'bold' },
    varietyTypeBadge: { backgroundColor: '#6fdfc430', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    varietyType: { color: '#6fdfc4', fontSize: 11, fontWeight: 'bold' },
    varietyDetails: { flexDirection: 'row', gap: 16, marginTop: 6 },
    varietyDetail: { color: '#8aa6a3', fontSize: 12 },
    varietyNotes: { color: '#6a9a90', fontSize: 12, marginTop: 6, fontStyle: 'italic' },

    // Market card
    marketCard: { backgroundColor: '#0d2b27', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#2a5d55' },
    marketItem: { color: '#b0d4cc', fontSize: 13, marginBottom: 6, lineHeight: 20 },

    // Info card
    infoCard: { backgroundColor: '#0d2b27', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#2a5d55' },
    infoItem: { color: '#b0d4cc', fontSize: 13, marginBottom: 6, lineHeight: 20 },

    // Growth stages
    stageCard: { flexDirection: 'row', marginBottom: 4 },
    stageIndicator: { alignItems: 'center', marginRight: 14, width: 20 },
    stageDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#6fdfc4', borderWidth: 2, borderColor: '#0a1f1c' },
    stageLine: { width: 2, flex: 1, backgroundColor: '#2a5d55', marginVertical: 2 },
    stageContent: { flex: 1, backgroundColor: '#0d2b27', padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#2a5d55' },
    stageName: { color: 'white', fontSize: 15, fontWeight: 'bold' },
    stageDuration: { color: '#6fdfc4', fontSize: 12, marginTop: 2 },
    stageCare: { color: '#8aa6a3', fontSize: 12, marginTop: 6, lineHeight: 18 },

    // Nav button
    navButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a4d45', padding: 16, borderRadius: 14, marginTop: 10, borderWidth: 1, borderColor: '#2a5d55', gap: 10 },
    navButtonText: { flex: 1, color: 'white', fontSize: 15, fontWeight: '600' },

    // Fertilizer
    unitText: { color: '#6a9a90', fontSize: 12, marginBottom: 10, fontStyle: 'italic' },
    fertCard: { backgroundColor: '#0d2b27', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#2a5d55' },
    fertName: { color: '#2ecc71', fontSize: 15, fontWeight: 'bold' },
    fertDetail: { color: '#b0d4cc', fontSize: 13, marginTop: 4 },
    fertNotes: { color: '#6a9a90', fontSize: 12, marginTop: 6, fontStyle: 'italic' },
    chemCard: { backgroundColor: '#0d2b27', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#2a5d55' },
    chemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    chemStage: { color: 'white', fontSize: 14, fontWeight: 'bold' },
    chemTiming: { color: '#6fdfc4', fontSize: 12 },
    npkRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
    npkBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    npkText: { color: 'white', fontSize: 12, fontWeight: '600' },
    chemNotes: { color: '#6a9a90', fontSize: 12, marginTop: 8, fontStyle: 'italic' },
    noDataText: { color: '#6a9a90', fontSize: 14, textAlign: 'center', marginTop: 20 },

    // Pests
    pestCard: { backgroundColor: '#0d2b27', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#2a5d55' },
    pestName: { color: '#e74c3c', fontSize: 15, fontWeight: 'bold' },
    pestSinhala: { color: '#6fdfc4', fontSize: 12, marginTop: 2 },
    pestLabel: { color: '#8aa6a3', fontSize: 12, fontWeight: 'bold', marginTop: 8 },
    pestText: { color: '#b0d4cc', fontSize: 12, lineHeight: 18, marginTop: 2 },
    controlItem: { color: '#b0d4cc', fontSize: 12, marginLeft: 8, marginTop: 3, lineHeight: 18 },
    preventionItem: { color: '#b0d4cc', fontSize: 13, marginBottom: 8, lineHeight: 20 },
});
