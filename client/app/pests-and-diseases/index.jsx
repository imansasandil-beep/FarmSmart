import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

export default function PestsAndDiseasesScreen() {
    const router = useRouter();

    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [activeFilter, setActiveFilter] = useState('සියල්ල');
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    const filters = ['සියල්ල', 'පළිබෝධ', 'රෝග'];

    // ─── Fetch all records on mount ───
    useEffect(() => {
        fetchAllRecords();
    }, []);

    const fetchAllRecords = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/pest-diseases`);
            setRecords(response.data);
            setFilteredRecords(response.data);
        } catch (err) {
            Alert.alert('දෝෂය', 'පළිබෝධ සහ රෝග දත්ත පැටවීම අසාර්ථක විය.');
            console.log('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // ─── Search with debounce ───
    useEffect(() => {
        const timeout = setTimeout(() => {
            applyFilters(searchText, activeFilter);
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchText, activeFilter]);

    const applyFilters = useCallback(
        async (query, typeFilter) => {
            try {
                let data = records;

                // If there's a search query, fetch from the search endpoint
                if (query.trim()) {
                    const response = await axios.get(
                        `${API_BASE_URL}/api/pest-diseases/search?q=${encodeURIComponent(query.trim())}`
                    );
                    data = response.data;
                }

                // Apply the type filter client-side
                if (typeFilter !== 'සියල්ල') {
                    data = data.filter((item) => item.type === typeFilter);
                }

                setFilteredRecords(data);
            } catch (err) {
                console.log('Search error:', err);
            }
        },
        [records]
    );

    // ─── Toggle card expansion ───
    const toggleExpand = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    // ─── Render a single card ───
    const renderCard = ({ item }) => {
        const isExpanded = expandedId === item._id;
        const isPest = item.type === 'පළිබෝධ';

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => toggleExpand(item._id)}
                activeOpacity={0.8}
            >
                {/* Header row */}
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardName}>{item.name}</Text>
                        <View style={styles.cropTagRow}>
                            {item.affectedCrops.map((crop, i) => (
                                <View key={i} style={styles.cropTag}>
                                    <Text style={styles.cropTagText}>{crop}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <View style={[styles.typeBadge, isPest ? styles.pestBadge : styles.diseaseBadge]}>
                        <Ionicons
                            name={isPest ? 'bug-outline' : 'medkit-outline'}
                            size={14}
                            color="white"
                            style={{ marginRight: 4 }}
                        />
                        <Text style={styles.typeBadgeText}>{item.type}</Text>
                    </View>
                </View>

                {/* Expanded details */}
                {isExpanded && (
                    <View style={styles.cardBody}>
                        <View style={styles.detailSection}>
                            <View style={styles.detailLabelRow}>
                                <Ionicons name="alert-circle-outline" size={16} color="#f9a825" />
                                <Text style={styles.detailLabel}>රෝග ලක්ෂණ</Text>
                            </View>
                            <Text style={styles.detailText}>{item.symptoms}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.detailSection}>
                            <View style={styles.detailLabelRow}>
                                <Ionicons name="medkit-outline" size={16} color="#6fdfc4" />
                                <Text style={[styles.detailLabel, { color: '#6fdfc4' }]}>ප්‍රතිකාර</Text>
                            </View>
                            <Text style={styles.detailText}>{item.treatment}</Text>
                        </View>
                    </View>
                )}

                {/* Expand hint */}
                <View style={styles.expandHint}>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#6fdfc4"
                    />
                </View>
            </TouchableOpacity>
        );
    };

    // ─── Main UI ───
    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#6fdfc4" />
                <Text style={styles.loadingText}>දත්ත පූරණය වෙමින් පවතී…</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>පළිබෝධ සහ රෝග</Text>
                <Ionicons name="bug" size={24} color="#6fdfc4" />
            </View>

            {/* ── Search bar ── */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#8aa6a3" style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="නම හෝ බෝගය අනුව සොයන්න…"
                    placeholderTextColor="#8aa6a3"
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                        <Ionicons name="close-circle" size={20} color="#8aa6a3" />
                    </TouchableOpacity>
                )}
            </View>

            {/* ── Filter chips ── */}
            <View style={styles.filterRow}>
                {filters.map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                        onPress={() => setActiveFilter(f)}
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                activeFilter === f && styles.filterChipTextActive,
                            ]}
                        >
                            {f}
                        </Text>
                    </TouchableOpacity>
                ))}
                <View style={styles.resultCount}>
                    <Text style={styles.resultCountText}>
                        ප්‍රතිඵල {filteredRecords.length} යි
                    </Text>
                </View>
            </View>

            {/* ── List ── */}
            <FlatList
                data={filteredRecords}
                keyExtractor={(item) => item._id}
                renderItem={renderCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="leaf-outline" size={60} color="#2a5d55" />
                        <Text style={styles.emptyText}>ප්‍රතිඵල හමු නොවීය</Text>
                        <Text style={styles.emptySubText}>වෙනත් සෙවුමක් හෝ පෙරහනක් උත්සාහ කරන්න</Text>
                    </View>
                }
            />
        </View>
    );
}

// ─── Styles ───
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a1f1c',
        paddingTop: 50,
        paddingHorizontal: 16,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#6fdfc4',
        marginTop: 12,
        fontSize: 14,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },

    // Search
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a4d45',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#2a5d55',
    },
    searchInput: {
        flex: 1,
        color: 'white',
        fontSize: 15,
    },

    // Filters
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#1a4d45',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#2a5d55',
    },
    filterChipActive: {
        backgroundColor: '#6fdfc4',
        borderColor: '#6fdfc4',
    },
    filterChipText: {
        color: '#8aa6a3',
        fontSize: 13,
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: '#0a1f1c',
    },
    resultCount: {
        marginLeft: 'auto',
    },
    resultCountText: {
        color: '#8aa6a3',
        fontSize: 12,
    },

    // List
    listContent: {
        paddingBottom: 40,
    },

    // Card
    card: {
        backgroundColor: '#1a4d45',
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#2a5d55',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardName: {
        color: 'white',
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 6,
    },

    // Type badge
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 10,
    },
    pestBadge: {
        backgroundColor: '#c0392b',
    },
    diseaseBadge: {
        backgroundColor: '#8e44ad',
    },
    typeBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    },

    // Crop tags
    cropTagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 2,
    },
    cropTag: {
        backgroundColor: 'rgba(111, 223, 196, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginRight: 6,
        marginBottom: 4,
    },
    cropTagText: {
        color: '#6fdfc4',
        fontSize: 11,
        fontWeight: '600',
    },

    // Expanded body
    cardBody: {
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(111, 223, 196, 0.15)',
    },
    detailSection: {
        marginBottom: 8,
    },
    detailLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailLabel: {
        color: '#f9a825',
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailText: {
        color: '#d0e8e3',
        fontSize: 13.5,
        lineHeight: 20,
        paddingLeft: 22,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(111, 223, 196, 0.1)',
        marginVertical: 10,
    },

    // Expand hint
    expandHint: {
        alignItems: 'center',
        marginTop: 8,
    },

    // Empty state
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        color: '#8aa6a3',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptySubText: {
        color: '#5a8a82',
        fontSize: 13,
        marginTop: 6,
    },
});
