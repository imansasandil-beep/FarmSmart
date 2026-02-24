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
                                title: `≡ƒî▒ Plant ${crop.name} (${crop.sinhalaName})`,
                                time: plantDate.toLocaleString(),
                                category: 'planting',
                                cropId: crop.id,
                            };

                            const updatedReminders = [...reminders, newReminder];
                            await AsyncStorage.setItem('farmReminders', JSON.stringify(updatedReminders));

                            Alert.alert('Γ£à Reminder Created!', `Planting reminder for ${crop.name} added to your calendar.`);
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
                                {item.seasons.map(s => s === 'yala' ? 'Yala (α╢║α╢╜)' : 'Maha (α╢╕α╖ä)').join(', ')}
                            </Text>
                        </View>

                        <Text style={styles.tipText}>≡ƒÆí {item.tips}</Text>

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

