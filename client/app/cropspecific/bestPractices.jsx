import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCropById } from './_data/cropRecommendations';

// Best practices organized by crop category
const BEST_PRACTICES = {
    rice: [
        { title: 'Water Management', icon: '💧', tips: ['Maintain 5-7.5cm standing water during vegetative stage', 'Alternate wetting and drying (AWD) saves 20-30% water', 'Drain field 2 weeks before harvest for uniform maturity', 'Avoid continuous flooding - increases methane emissions'] },
        { title: 'Weed Management', icon: '🌿', tips: ['Pre-emergence herbicide (Pretilachlor) within 3 days of sowing', 'Hand weeding at 21 and 42 days after transplanting', 'Use rotary weeder in row-planted fields', 'Maintain proper water level - best natural weed suppressant'] },
        { title: 'Seed Selection', icon: '🌾', tips: ['Use certified seed from DOA or seed farms', 'Salt-water separation to remove empty/light seeds', 'Treat seeds with fungicide before sowing', 'Replace seed stock every 3-4 seasons'] },
        { title: 'Post-Harvest', icon: '📦', tips: ['Thresh within 24 hours of cutting to minimize losses', 'Dry paddy to 12-14% moisture content', 'Use hermetic storage bags for seed paddy', 'Grade and clean before storage/selling'] },
    ],
    tea: [
        { title: 'Plucking Standards', icon: '✂️', tips: ['Always pluck "two leaves and a bud" for quality', 'Pluck every 7-10 days during flush periods', 'Never squeeze leaves - use a clean plucking motion', 'Deliver to factory within 4-6 hours of plucking'] },
        { title: 'Shade Management', icon: '🌳', tips: ['Maintain 40% shade with Grevillea, Gliricidia, or Albizzia', 'Prune shade trees twice a year', 'Shade reduces temperature stress and improves quality', 'High-grown teas benefit from less shade'] },
        { title: 'Bush Management', icon: '🍃', tips: ['Prune every 3-5 years at correct heights', 'Infill vacancies promptly with same clone', 'Maintain 12,000-15,000 bushes/ha for optimal yield', 'Remove unproductive branches (clean pruning)'] },
    ],
    coconut: [
        { title: 'Moisture Conservation', icon: '💧', tips: ['Bury 25 coconut husks per palm (husk burial)', 'Mulch around palm base with leaves and organic matter', 'Maintain cover crops (Pueraria) between palms', 'Irrigation with drip system in dry zone increases yield 30%'] },
        { title: 'Intercropping', icon: '🌱', tips: ['Grow banana, pepper, cocoa, or pineapple between palms', 'Intercropping uses only 50% of available land area', 'Provides additional income of Rs. 50,000-100,000/ha/yr', 'Gliricidia as live fence provides green manure'] },
        { title: 'Palm Health', icon: '🌴', tips: ['Remove dead fronds and inflorescences regularly', 'Inspect crown for rhinoceros beetle damage monthly', 'Apply balanced fertilizer (CRI APM) annually', 'Remove severely diseased palms promptly'] },
    ],
    cinnamon: [
        { title: 'Peeling Quality', icon: '🪵', tips: ['Harvest when bark turns brown and detaches easily', 'Peel on the same day as cutting', 'Use brass rod to rub and loosen inner bark', 'Scrape outer bark completely for high-grade quills'] },
        { title: 'Stool Management', icon: '🌿', tips: ['Maintain 5-6 shoots per stool for best production', 'Cut stems at 45° angle, 2 inches above ground', 'Harvest twice per year (after each monsoon)', 'Allow new shoots to grow undisturbed for 18-24 months'] },
    ],
    chili: [
        { title: 'Disease Prevention', icon: '🛡️', tips: ['Use windbreaks (maize/finger millet) around chili fields', 'White polythene or straw mulch reduces soil splash', 'Treat seeds with Thiamethoxam before nursery sowing', 'Crop rotation with non-solanaceae for 2-3 seasons'] },
        { title: 'Yield Maximization', icon: '📈', tips: ['Transplant seedlings at 4-5 weeks (not older)', 'Apply complete fertilizer program in split doses', 'Pick green chili every 4-5 days to promote more fruiting', 'Adequate spacing (60×45cm) improves air circulation'] },
    ],
    maize: [
        { title: 'Fall Armyworm Management', icon: '🐛', tips: ['Scout fields twice weekly from emergence to tasseling', 'Apply Spinosad or Bt at early larval stages', 'Release Trichogramma parasitoid wasps preventively', 'Destroy crop residues immediately after harvest'] },
        { title: 'Yield Tips', icon: '📈', tips: ['Plant at correct density (53,000-66,000 plants/ha)', 'Critical irrigation at tasseling/silking if dry spell >5 days', 'Apply 2nd top dressing before tasseling', 'Harvest at 20-22% moisture for best quality'] },
    ],
    pepper: [
        { title: 'Support Tree Management', icon: '🌳', tips: ['Use Gliricidia, Erythrina, or Grevillea as support trees', 'Prune support trees twice yearly to regulate shade', 'Avoid Jak trees (compete for nutrients)', 'Train pepper vine spirally around support'] },
        { title: 'Drainage & Root Health', icon: '💧', tips: ['Plant on slopes or well-drained sites', 'Ensure no waterlogging at vine base', 'Apply Trichoderma + neem cake annually to prevent Quick Wilt', 'Mulch around vine base with organic matter'] },
    ],
    rubber: [
        { title: 'Tapping Practices', icon: '🔪', tips: ['Use S/2 d2 system (half-spiral, alternate days)', 'Tap at 5-7 AM before temperature rises', 'Maintain proper tapping angle (30-35°)', 'Do not tap during heavy rain or wintering period'] },
    ],
    onion: [
        { title: 'Storage Tips', icon: '📦', tips: ['Cure onions in shade for 7-10 days after harvest', 'Store in well-ventilated structures', 'Remove damaged or sprouted bulbs regularly', 'Properly cured onions store for 3-4 months'] },
    ],
    groundnut: [
        { title: 'Key Practices', icon: '🥜', tips: ['Apply gypsum at flowering for calcium supply', 'Do not disturb soil during pegging stage', 'Harvest when inner shell veins darken', 'Dry pods to <8% moisture for storage'] },
    ],
    mungbean: [
        { title: 'Quick Crop Tips', icon: '🫘', tips: ['Ideal as rotation crop between rice seasons', 'Harvest mature pods before shattering', 'Pick in 2-3 harvests as pods mature unevenly', 'Incorporate residues to improve soil nitrogen'] },
    ],
    cowpea: [
        { title: 'Dual Purpose Tips', icon: '🌱', tips: ['Pick green pods every 2-3 days for vegetable market', 'For grain, wait until pods turn fully brown', 'Excellent nitrogen fixer - follow with cereal crop', 'Very drought tolerant once established'] },
    ],
    vegetables: [
        { title: 'General Vegetable Tips', icon: '🥬', tips: ['Use raised beds for improved drainage', 'Practice crop rotation (3-year cycle)', 'Mulch heavily to conserve moisture and suppress weeds', 'Harvest in early morning for best quality', 'Grade and wash produce before marketing'] },
    ],
    cashew: [
        { title: 'Management Tips', icon: '🌰', tips: ['Prune annually to shape tree and improve light penetration', 'Collect fallen nuts daily during harvest season', 'Intercrop with short-term crops during early years', 'Sun-dry raw nuts for 2-3 days before storage'] },
    ],
    banana: [
        { title: 'Bunch Management', icon: '🍌', tips: ['Remove male bud after last hand opens', 'Cover bunch with blue polythene bag for quality', 'Prop fruit-bearing plants to prevent toppling', 'Harvest when fingers are well-rounded and light green'] },
        { title: 'Sucker Management', icon: '🌱', tips: ['Keep only 1 follower sucker per plant', 'Remove excess suckers regularly with spade', 'Select sword suckers (narrow leaves) as followers', 'Allow 3 generations maximum before replanting'] },
    ],
};

export default function BestPracticesScreen() {
    const router = useRouter();
    const { cropId } = useLocalSearchParams();
    const [zone, setZone] = useState(null);

    const crop = getCropById(cropId);
    const practices = BEST_PRACTICES[cropId] || [];

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
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Best Practices</Text>
                    <View style={{ width: 28 }} />
                </View>
                <Text style={styles.noDataText}>Best practices not available.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{crop.emoji} Best Practices</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header Card */}
                <View style={styles.titleCard}>
                    <Text style={styles.titleEmoji}>{crop.emoji}</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.titleName}>{crop.name} Best Practices</Text>
                        <Text style={styles.titleSub}>{practices.length} categories of expert tips</Text>
                    </View>
                </View>

                {/* Practice Categories */}
                {practices.map((practice, i) => (
                    <View key={i} style={styles.practiceCard}>
                        <View style={styles.practiceHeader}>
                            <Text style={styles.practiceIcon}>{practice.icon}</Text>
                            <Text style={styles.practiceTitle}>{practice.title}</Text>
                        </View>
                        {practice.tips.map((tip, j) => (
                            <View key={j} style={styles.tipRow}>
                                <View style={styles.tipBullet}>
                                    <Text style={styles.tipBulletText}>{j + 1}</Text>
                                </View>
                                <Text style={styles.tipText}>{tip}</Text>
                            </View>
                        ))}
                    </View>
                ))}

                {/* Zone-Specific Advisory */}
                {zone && (
                    <View style={[styles.zoneAdvisory, { borderColor: zone.color }]}>
                        <Text style={styles.advisoryTitle}>{zone.emoji} {zone.name} Advisory</Text>
                        <Text style={styles.advisoryText}>
                            {zone.id === 'wet' && 'Focus on drainage management, disease prevention during monsoons, and shade management for plantation crops. Your zone receives >2500mm rainfall annually.'}
                            {zone.id === 'dry' && 'Water conservation is critical. Use mulching, drip irrigation where possible, and select drought-tolerant varieties. Rainfall <1750mm requires careful irrigation planning.'}
                            {zone.id === 'intermediate' && 'Balance between moisture management and drought preparedness. Diversify crops for risk management. Rainfall is variable (1750-2500mm).'}
                        </Text>
                    </View>
                )}

                {/* General Best Practices */}
                <View style={styles.generalCard}>
                    <Text style={styles.generalTitle}>📋 Universal Farming Best Practices</Text>
                    <Text style={styles.generalTip}>🔄 Rotate crops every season to break pest cycles</Text>
                    <Text style={styles.generalTip}>🧪 Test soil before every cropping season</Text>
                    <Text style={styles.generalTip}>🌿 Incorporate organic matter at every opportunity</Text>
                    <Text style={styles.generalTip}>💧 Irrigate based on crop needs, not by calendar</Text>
                    <Text style={styles.generalTip}>📝 Keep records of inputs, yields, and costs</Text>
                    <Text style={styles.generalTip}>🤝 Join farmer organizations for knowledge sharing</Text>
                    <Text style={styles.generalTip}>📞 Contact your nearest DOA extension office for advice</Text>
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

    titleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a4d45', padding: 16, borderRadius: 14, marginBottom: 15, borderWidth: 1, borderColor: '#2a5d55' },
    titleEmoji: { fontSize: 40, marginRight: 14 },
    titleName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    titleSub: { color: '#8aa6a3', fontSize: 12, marginTop: 3 },

    practiceCard: { backgroundColor: '#0d2b27', padding: 16, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: '#2a5d55' },
    practiceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    practiceIcon: { fontSize: 22 },
    practiceTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
    tipBullet: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#6fdfc420', justifyContent: 'center', alignItems: 'center' },
    tipBulletText: { color: '#6fdfc4', fontSize: 11, fontWeight: 'bold' },
    tipText: { color: '#b0d4cc', fontSize: 13, flex: 1, lineHeight: 20 },

    zoneAdvisory: { padding: 16, borderRadius: 14, borderWidth: 1.5, backgroundColor: '#1a3a35', marginBottom: 12 },
    advisoryTitle: { color: 'white', fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
    advisoryText: { color: '#b0d4cc', fontSize: 13, lineHeight: 20 },

    generalCard: { backgroundColor: '#1a3a35', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#f39c1230' },
    generalTitle: { color: '#f39c12', fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
    generalTip: { color: '#b0d4cc', fontSize: 13, marginBottom: 8, lineHeight: 20 },
});
