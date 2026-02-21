import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CROP_RECOMMENDATIONS, getCropsByZone } from './_data/cropRecommendations';
import { getCurrentSeason } from '../cropcalender/_data/seasons';

const FILTER_OPTIONS = ['All', 'My Zone', 'Yala', 'Maha'];

export default function CropSpecificIndex() {
    const router = useRouter();
    const [zone, setZone] = useState(null);
    const [district, setDistrict] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const currentSeason = getCurrentSeason();

    useFocusEffect(
        useCallback(() => {
            const loadZone = async () => {
                try {
                    const savedZone = await AsyncStorage.getItem('selectedZone');
                    const savedDistrict = await AsyncStorage.getItem('selectedDistrict');
                    if (savedZone) setZone(JSON.parse(savedZone));
                    if (savedDistrict) setDistrict(savedDistrict);
                } catch (e) {
                    console.log('Error loading zone:', e);
                }
            };
            loadZone();
        }, [])
    );

    const getFilteredCrops = () => {
        let crops = [...CROP_RECOMMENDATIONS];

        // Apply filter
        if (activeFilter === 'My Zone' && zone) {
            crops = getCropsByZone(zone.id);
        } else if (activeFilter === 'Yala') {
            crops = crops.filter(c => c.seasons.includes('yala'));
        } else if (activeFilter === 'Maha') {
            crops = crops.filter(c => c.seasons.includes('maha'));
        }

        // Apply search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            crops = crops.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.sinhalaName.includes(q) ||
                c.tamilName.includes(q)
            );
        }

        return crops;
    };

    const getZoneBadgeColor = (cropZones) => {
        if (!zone) return '#4a7a70';
        return cropZones.includes(zone.id) ? '#2ecc71' : '#e74c3c';
    };

    const renderCropCard = ({ item }) => {
        const isRecommended = zone ? item.zones.includes(zone.id) : false;
        return (
            <TouchableOpacity
                style={styles.cropCard}
                onPress={() => router.push({ pathname: '/cropspecific/cropDetail', params: { cropId: item.id } })}
                activeOpacity={0.7}
            >
                <Text style={styles.cropEmoji}>{item.emoji}</Text>
                <View style={styles.cropInfo}>
                    <View style={styles.cropNameRow}>
                        <Text style={styles.cropName}>{item.name}</Text>
                        {isRecommended && (
                            <View style={styles.recommendedBadge}>
                                <Ionicons name="checkmark-circle" size={14} color="#2ecc71" />
                                <Text style={styles.recommendedText}>Recommended</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.cropSinhala}>{item.sinhalaName}</Text>
                    <Text style={styles.cropOverview} numberOfLines={2}>{item.overview}</Text>
                    <View style={styles.zoneDotsRow}>
                        {['wet', 'dry', 'intermediate'].map(z => (
                            <View key={z} style={styles.zoneDotWrap}>
                                <View style={[
                                    styles.zoneDot,
                                    { backgroundColor: item.zones.includes(z) ? (z === 'wet' ? '#2ecc71' : z === 'dry' ? '#e67e22' : '#3498db') : '#2a5d55' }
                                ]} />
                                <Text style={styles.zoneDotLabel}>{z.charAt(0).toUpperCase()}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#4a7a70" />
            </TouchableOpacity>
        );
    };

    const filteredCrops = getFilteredCrops();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Crop Recommendations</Text>
                <TouchableOpacity onPress={() => router.push('/cropspecific/soilInfo')}>
                    <Ionicons name="earth" size={26} color="#6fdfc4" />
                </TouchableOpacity>
            </View>

            {/* Zone Info Banner */}
            {zone ? (
                <View style={[styles.zoneBanner, { borderColor: zone.color }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.zoneTitle}>{zone.emoji} {zone.name}</Text>
                        <Text style={styles.zoneDistrict}>📍 {district || 'District not set'}</Text>
                    </View>
                    <View style={[styles.seasonBadge, { backgroundColor: currentSeason.color }]}>
                        <Text style={styles.seasonText}>{currentSeason.emoji} {currentSeason.name}</Text>
                    </View>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.setupBanner}
                    onPress={() => router.push('/cropcalender/zone')}
                >
                    <Ionicons name="location-outline" size={24} color="#6fdfc4" />
                    <Text style={styles.setupText}>Set your zone for personalized recommendations</Text>
                    <Ionicons name="chevron-forward" size={20} color="#6fdfc4" />
                </TouchableOpacity>
            )}

            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#8aa6a3" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search crops..."
                    placeholderTextColor="#8aa6a3"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color="#8aa6a3" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Filter Chips */}
            <View style={styles.filterRow}>
                {FILTER_OPTIONS.map(filter => (
                    <TouchableOpacity
                        key={filter}
                        style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                        onPress={() => setActiveFilter(filter)}
                    >
                        <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Results count */}
            <Text style={styles.resultsCount}>
                {filteredCrops.length} crop{filteredCrops.length !== 1 ? 's' : ''} found
            </Text>

            {/* Crop List */}
            <FlatList
                data={filteredCrops}
                keyExtractor={(item) => item.id}
                renderItem={renderCropCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="leaf-outline" size={48} color="#2a5d55" />
                        <Text style={styles.emptyTitle}>No crops found</Text>
                        <Text style={styles.emptySubtext}>Try a different search or filter</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a1f1c', padding: 20, paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },

    // Zone banner
    zoneBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a4d45', padding: 14, borderRadius: 14, marginBottom: 12, borderWidth: 1.5 },
    zoneTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    zoneDistrict: { color: '#8aa6a3', fontSize: 13, marginTop: 3 },
    seasonBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    seasonText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
    setupBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a4d45', padding: 14, borderRadius: 14, marginBottom: 12, borderWidth: 1.5, borderColor: '#6fdfc4', borderStyle: 'dashed', gap: 10 },
    setupText: { flex: 1, color: '#8aa6a3', fontSize: 13 },

    // Search
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a4d45', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12, borderWidth: 1, borderColor: '#2a5d55' },
    searchInput: { flex: 1, color: 'white', marginLeft: 10, fontSize: 15 },

    // Filters
    filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1a4d45', borderWidth: 1, borderColor: '#2a5d55' },
    filterChipActive: { backgroundColor: '#6fdfc4', borderColor: '#6fdfc4' },
    filterText: { color: '#8aa6a3', fontSize: 13, fontWeight: '600' },
    filterTextActive: { color: '#0a1f1c' },

    resultsCount: { color: '#6a9a90', fontSize: 12, marginBottom: 8 },

    // Crop cards
    cropCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a4d45', padding: 15, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a5d55' },
    cropEmoji: { fontSize: 36, marginRight: 14 },
    cropInfo: { flex: 1 },
    cropNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
    cropName: { fontSize: 16, fontWeight: 'bold', color: 'white' },
    recommendedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(46,204,113,0.15)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
    recommendedText: { color: '#2ecc71', fontSize: 10, fontWeight: 'bold' },
    cropSinhala: { color: '#6fdfc4', fontSize: 13, marginTop: 2 },
    cropOverview: { color: '#8aa6a3', fontSize: 12, marginTop: 4, lineHeight: 17 },
    zoneDotsRow: { flexDirection: 'row', marginTop: 6, gap: 10 },
    zoneDotWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    zoneDot: { width: 8, height: 8, borderRadius: 4 },
    zoneDotLabel: { color: '#6a9a90', fontSize: 10 },

    // Empty state
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyTitle: { color: '#6a9a90', fontSize: 16, fontWeight: 'bold', marginTop: 10 },
    emptySubtext: { color: '#4a7a70', fontSize: 13, marginTop: 4 },
    listContent: { paddingBottom: 30 },
});
