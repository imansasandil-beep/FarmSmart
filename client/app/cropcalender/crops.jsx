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

