import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCropsByZone, getCropsByZoneAndSeason } from './_data/crops';
import { getCurrentSeason } from './_data/seasons';

export default function CropsScreen() {
    const router = useRouter();
    const [zone, setZone] = useState(null);
    const [crops, setCrops] = useState([]);
    const [filterSeason, setFilterSeason] = useState('all'); // 'all', 'yala', 'maha'
    const [expandedCrop, setExpandedCrop] = useState(null);

    const currentSeason = getCurrentSeason();

    useEffect(() => {
        const loadZone = async () => {
            try {
                const savedZone = await AsyncStorage.getItem('selectedZone');
                if (savedZone) {
                    const parsed = JSON.parse(savedZone);
                    setZone(parsed);
                    setCrops(getCropsByZone(parsed.id));
                }
            } catch (e) {
                console.log('Error loading zone:', e);
            }
        };
        loadZone();
    }, []);

    const getFilteredCrops = () => {
        if (!zone) return [];
        if (filterSeason === 'all') return getCropsByZone(zone.id);
        return getCropsByZoneAndSeason(zone.id, filterSeason);
    };

    const handleCreateReminder = async (crop) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const plantingStr = crop.plantingMonths.map(m => monthNames[m - 1]).join(', ');

        Alert.alert(
            `Create Reminder for ${crop.name}?`,
            `Best planting months: ${plantingStr}\nGrowth period: ${crop.growthDays} days`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Create Reminder',
                    onPress: async () => {
                        try {
                            // Load existing reminders
                            const stored = await AsyncStorage.getItem('farmReminders');
                            const reminders = stored ? JSON.parse(stored) : [];

                            // Create a new reminder for the next planting month
                            const now = new Date();
                            const currentMonth = now.getMonth() + 1;
                            let nextPlantMonth = crop.plantingMonths.find(m => m >= currentMonth);
                            if (!nextPlantMonth) nextPlantMonth = crop.plantingMonths[0]; // Next year

                            const plantDate = new Date();
                            if (nextPlantMonth < currentMonth) {
                                plantDate.setFullYear(plantDate.getFullYear() + 1);
                            }
                            plantDate.setMonth(nextPlantMonth - 1);
                            plantDate.setDate(1);

                            const newReminder = {
                                id: `crop_${crop.id}_${Date.now()}`,
                                title: `🌱 Plant ${crop.name} (${crop.sinhalaName})`,
                                time: plantDate.toLocaleString(),
                                category: 'planting',
                                cropId: crop.id,
                            };

                            const updatedReminders = [...reminders, newReminder];
                            await AsyncStorage.setItem('farmReminders', JSON.stringify(updatedReminders));

                            Alert.alert('✅ Reminder Created!', `Planting reminder for ${crop.name} added to your calendar.`);
                        } catch (e) {
                            Alert.alert('Error', 'Failed to create reminder.');
                        }
                    },
                },
            ]
        );
    };

    const renderCropCard = ({ item }) => {
        const isExpanded = expandedCrop === item.id;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const plantingStr = item.plantingMonths.map(m => monthNames[m - 1]).join(', ');
        const harvestStr = item.harvestMonths.map(m => monthNames[m - 1]).join(', ');

        return (
            <TouchableOpacity
                style={styles.cropCard}
                onPress={() => setExpandedCrop(isExpanded ? null : item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.cropHeader}>
                    <Text style={styles.cropEmoji}>{item.emoji}</Text>
                    <View style={styles.cropNameWrap}>
                        <Text style={styles.cropName}>{item.name}</Text>
                        <Text style={styles.cropSinhala}>{item.sinhalaName}</Text>
                    </View>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={22}
                        color="#6fdfc4"
                    />
                </View>

                {isExpanded && (
                    <View style={styles.cropDetails}>
                        <View style={styles.detailRow}>
                            <Ionicons name="leaf" size={16} color="#6fdfc4" />
                            <Text style={styles.detailLabel}>Plant:</Text>
                            <Text style={styles.detailValue}>{plantingStr}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="basket" size={16} color="#f9a825" />
                            <Text style={styles.detailLabel}>Harvest:</Text>
                            <Text style={styles.detailValue}>{harvestStr}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="time" size={16} color="#3498db" />
                            <Text style={styles.detailLabel}>Growth:</Text>
                            <Text style={styles.detailValue}>{item.growthDays} days</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="sunny" size={16} color="#f39c12" />
                            <Text style={styles.detailLabel}>Seasons:</Text>
                            <Text style={styles.detailValue}>
                                {item.seasons.map(s => s === 'yala' ? 'Yala (යල)' : 'Maha (මහ)').join(', ')}
                            </Text>
                        </View>

                        <Text style={styles.tipText}>💡 {item.tips}</Text>

                        <TouchableOpacity
                            style={styles.reminderButton}
                            onPress={() => handleCreateReminder(item)}
                        >
                            <Ionicons name="alarm" size={18} color="#0a1f1c" />
                            <Text style={styles.reminderButtonText}>Add Planting Reminder</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (!zone) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Recommended Crops</Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={styles.emptyState}>
                    <Ionicons name="location-outline" size={60} color="#2a5d55" />
                    <Text style={styles.emptyText}>No zone selected</Text>
                    <Text style={styles.emptySubtext}>
                        Please set your agro-ecological zone first to see crop recommendations.
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

    const filteredCrops = getFilteredCrops();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Recommended Crops</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Zone badge */}
            <View style={[styles.zoneBadge, { borderColor: zone.color }]}>
                <Text style={styles.zoneBadgeText}>
                    {zone.emoji} {zone.name} — {zone.sinhalaName}
                </Text>
            </View>

            {/* Season filter */}
            <View style={styles.filterRow}>
                {['all', 'yala', 'maha'].map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterButton, filterSeason === f && styles.filterButtonActive]}
                        onPress={() => setFilterSeason(f)}
                    >
                        <Text style={[styles.filterText, filterSeason === f && styles.filterTextActive]}>
                            {f === 'all' ? 'All' : f === 'yala' ? 'Yala (යල)' : 'Maha (මහ)'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.cropCount}>
                {filteredCrops.length} crops recommended for your zone
            </Text>

            {/* Crop list */}
            <FlatList
                data={filteredCrops}
                keyExtractor={(item) => item.id}
                renderItem={renderCropCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
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

    // Zone badge
    zoneBadge: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
    },
    zoneBadgeText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },

    // Season filter
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 15,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
        backgroundColor: '#1a4d45',
        borderWidth: 1,
        borderColor: '#2a5d55',
    },
    filterButtonActive: {
        backgroundColor: '#6fdfc4',
        borderColor: '#6fdfc4',
    },
    filterText: {
        color: '#8aa6a3',
        fontSize: 13,
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#0a1f1c',
    },
    cropCount: {
        color: '#8aa6a3',
        fontSize: 12,
        marginBottom: 10,
        textAlign: 'center',
    },

    // Crop cards
    cropCard: {
        backgroundColor: '#1a4d45',
        borderRadius: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2a5d55',
        overflow: 'hidden',
    },
    cropHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    cropEmoji: {
        fontSize: 32,
        marginRight: 14,
    },
    cropNameWrap: {
        flex: 1,
    },
    cropName: {
        color: 'white',
        fontSize: 17,
        fontWeight: 'bold',
    },
    cropSinhala: {
        color: '#6fdfc4',
        fontSize: 13,
        marginTop: 2,
    },

    // Expanded details
    cropDetails: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#2a5d55',
        paddingTop: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabel: {
        color: '#8aa6a3',
        fontSize: 13,
        marginLeft: 8,
        width: 60,
    },
    detailValue: {
        color: 'white',
        fontSize: 13,
        flex: 1,
    },
    tipText: {
        color: '#b0d4cc',
        fontSize: 13,
        fontStyle: 'italic',
        marginTop: 8,
        marginBottom: 12,
        lineHeight: 18,
    },
    reminderButton: {
        flexDirection: 'row',
        backgroundColor: '#6fdfc4',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    reminderButtonText: {
        color: '#0a1f1c',
        fontWeight: 'bold',
        fontSize: 14,
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
    listContent: {
        paddingBottom: 30,
    },
});
