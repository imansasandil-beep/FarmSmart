import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getCropById } from './_data/cropRecommendations';
import { getPestDiseaseData } from './_data/pestDiseaseData';

export default function PestGuideScreen() {
    const router = useRouter();
    const { cropId } = useLocalSearchParams();
    const crop = getCropById(cropId);
    const pestData = getPestDiseaseData(cropId);

    if (!crop || !pestData) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Pest & Disease Guide</Text>
                    <View style={{ width: 28 }} />
                </View>
                <Text style={styles.noDataText}>Pest & disease guide not available.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{crop.emoji} Pest & Disease Guide</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>{crop.name} Protection Guide</Text>
                    <View style={styles.summaryStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNum}>{pestData.pests.length}</Text>
                            <Text style={styles.statLabel}>Pests</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNum}>{pestData.diseases.length}</Text>
                            <Text style={styles.statLabel}>Diseases</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNum}>{pestData.prevention.length}</Text>
                            <Text style={styles.statLabel}>Tips</Text>
                        </View>
                    </View>
                </View>

                {/* IPM Approach */}
                <View style={styles.ipmCard}>
                    <Text style={styles.ipmTitle}>🧪 Integrated Pest Management (IPM)</Text>
                    <Text style={styles.ipmText}>Follow this priority order:</Text>
                    <View style={styles.ipmSteps}>
                        <Text style={styles.ipmStep}><Text style={styles.ipmNum}>1.</Text> Cultural Practices (prevention)</Text>
                        <Text style={styles.ipmStep}><Text style={styles.ipmNum}>2.</Text> Biological Control (natural enemies)</Text>
                        <Text style={styles.ipmStep}><Text style={styles.ipmNum}>3.</Text> Botanical (neem, garlic extracts)</Text>
                        <Text style={styles.ipmStep}><Text style={styles.ipmNum}>4.</Text> Chemical (last resort, DOA recommended)</Text>
                    </View>
                </View>

                {/* Pests Section */}
                <Text style={styles.sectionTitle}>🐛 Pest Threats</Text>
                {pestData.pests.map((pest, i) => (
                    <View key={i} style={styles.threatCard}>
                        <View style={styles.threatHeader}>
                            <View style={[styles.threatBadge, { backgroundColor: '#e74c3c30' }]}>
                                <Text style={styles.threatBadgeText}>PEST</Text>
                            </View>
                            <Text style={styles.threatName}>{pest.name}</Text>
                        </View>
                        <Text style={styles.sinhalaText}>{pest.sinhalaName}</Text>

                        <View style={styles.detailBlock}>
                            <Text style={styles.detailLabel}>🔍 Symptoms</Text>
                            <Text style={styles.detailText}>{pest.symptoms}</Text>
                        </View>
                        <View style={styles.detailBlock}>
                            <Text style={styles.detailLabel}>🎯 Affected Parts</Text>
                            <Text style={styles.detailText}>{pest.affectedParts}</Text>
                        </View>
                        <View style={styles.detailBlock}>
                            <Text style={styles.detailLabel}>🛡️ Control Measures</Text>
                            {pest.control.map((c, j) => (
                                <View key={j} style={styles.controlRow}>
                                    <View style={[styles.controlDot, { backgroundColor: j === pest.control.length - 1 ? '#e67e22' : '#2ecc71' }]} />
                                    <Text style={styles.controlText}>{c}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Diseases Section */}
                <Text style={styles.sectionTitle}>🦠 Disease Threats</Text>
                {pestData.diseases.map((disease, i) => (
                    <View key={i} style={styles.threatCard}>
                        <View style={styles.threatHeader}>
                            <View style={[styles.threatBadge, { backgroundColor: '#9b59b630' }]}>
                                <Text style={[styles.threatBadgeText, { color: '#9b59b6' }]}>DISEASE</Text>
                            </View>
                            <Text style={styles.threatName}>{disease.name}</Text>
                        </View>
                        <Text style={styles.sinhalaText}>{disease.sinhalaName}</Text>

                        <View style={styles.detailBlock}>
                            <Text style={styles.detailLabel}>🧬 Cause</Text>
                            <Text style={styles.detailText}>{disease.cause}</Text>
                        </View>
                        <View style={styles.detailBlock}>
                            <Text style={styles.detailLabel}>🔍 Symptoms</Text>
                            <Text style={styles.detailText}>{disease.symptoms}</Text>
                        </View>
                        <View style={styles.detailBlock}>
                            <Text style={styles.detailLabel}>🌡️ Favorable Conditions</Text>
                            <Text style={styles.detailText}>{disease.conditions}</Text>
                        </View>
                        <View style={styles.detailBlock}>
                            <Text style={styles.detailLabel}>🛡️ Control Measures</Text>
                            {disease.control.map((c, j) => (
                                <View key={j} style={styles.controlRow}>
                                    <View style={[styles.controlDot, { backgroundColor: j === disease.control.length - 1 ? '#e67e22' : '#2ecc71' }]} />
                                    <Text style={styles.controlText}>{c}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Prevention Tips */}
                <View style={styles.preventionSection}>
                    <Text style={styles.sectionTitle}>✅ Prevention Best Practices</Text>
                    <Text style={styles.preventionSubtext}>Follow these practices to minimize pest and disease pressure:</Text>
                    {pestData.prevention.map((tip, i) => (
                        <View key={i} style={styles.preventionRow}>
                            <View style={styles.preventionNum}>
                                <Text style={styles.preventionNumText}>{i + 1}</Text>
                            </View>
                            <Text style={styles.preventionText}>{tip}</Text>
                        </View>
                    ))}
                </View>

                {/* Disclaimer */}
                <View style={styles.disclaimer}>
                    <Ionicons name="information-circle" size={18} color="#6a9a90" />
                    <Text style={styles.disclaimerText}>
                        Always consult your local DOA extension officer before applying any chemical pesticide. Follow safety precautions on product labels.
                    </Text>
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

    summaryCard: { backgroundColor: '#1a4d45', padding: 16, borderRadius: 14, marginBottom: 15, borderWidth: 1, borderColor: '#2a5d55' },
    summaryTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
    summaryStats: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    statItem: { alignItems: 'center', paddingHorizontal: 20 },
    statNum: { color: '#6fdfc4', fontSize: 24, fontWeight: 'bold' },
    statLabel: { color: '#8aa6a3', fontSize: 12, marginTop: 2 },
    statDivider: { width: 1, height: 30, backgroundColor: '#2a5d55' },

    ipmCard: { backgroundColor: '#1a3a35', padding: 16, borderRadius: 14, marginBottom: 20, borderWidth: 1, borderColor: '#3498db40' },
    ipmTitle: { color: '#3498db', fontSize: 15, fontWeight: 'bold', marginBottom: 6 },
    ipmText: { color: '#8aa6a3', fontSize: 13, marginBottom: 8 },
    ipmSteps: { gap: 4 },
    ipmStep: { color: '#b0d4cc', fontSize: 13, lineHeight: 20 },
    ipmNum: { color: '#6fdfc4', fontWeight: 'bold' },

    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: 'white', marginBottom: 12, marginTop: 4 },

    threatCard: { backgroundColor: '#0d2b27', padding: 16, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: '#2a5d55' },
    threatHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    threatBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    threatBadgeText: { color: '#e74c3c', fontSize: 10, fontWeight: 'bold' },
    threatName: { color: 'white', fontSize: 16, fontWeight: 'bold', flex: 1 },
    sinhalaText: { color: '#6fdfc4', fontSize: 12, marginBottom: 10 },

    detailBlock: { marginBottom: 10 },
    detailLabel: { color: '#8aa6a3', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
    detailText: { color: '#b0d4cc', fontSize: 13, lineHeight: 20 },

    controlRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4, marginLeft: 4 },
    controlDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
    controlText: { color: '#b0d4cc', fontSize: 13, flex: 1, lineHeight: 20 },

    preventionSection: { marginTop: 10 },
    preventionSubtext: { color: '#6a9a90', fontSize: 12, marginBottom: 12 },
    preventionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
    preventionNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2ecc71', justifyContent: 'center', alignItems: 'center' },
    preventionNumText: { color: '#0a1f1c', fontSize: 12, fontWeight: 'bold' },
    preventionText: { color: '#b0d4cc', fontSize: 13, flex: 1, lineHeight: 20 },

    disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 20, padding: 14, backgroundColor: '#1a3a35', borderRadius: 12, borderWidth: 1, borderColor: '#4a7a70' },
    disclaimerText: { color: '#6a9a90', fontSize: 12, flex: 1, lineHeight: 18 },
});
