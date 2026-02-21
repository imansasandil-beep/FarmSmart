import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ZONES } from './_data/zones';

export default function ZoneSelectionScreen() {
    const router = useRouter();
    const [selectedZone, setSelectedZone] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [step, setStep] = useState(1); // 1 = pick zone, 2 = pick district

    useEffect(() => {
        // Load previously saved selection
        const loadSaved = async () => {
            try {
                const savedZone = await AsyncStorage.getItem('selectedZone');
                const savedDistrict = await AsyncStorage.getItem('selectedDistrict');
                if (savedZone) setSelectedZone(JSON.parse(savedZone));
                if (savedDistrict) setSelectedDistrict(savedDistrict);
            } catch (e) {
                console.log('Error loading zone:', e);
            }
        };
        loadSaved();
    }, []);

    const handleZoneSelect = (zone) => {
        setSelectedZone(zone);
        setSelectedDistrict(null);
        setStep(2);
    };

    const handleDistrictSelect = async (district) => {
        setSelectedDistrict(district);
        try {
            await AsyncStorage.setItem('selectedZone', JSON.stringify(selectedZone));
            await AsyncStorage.setItem('selectedDistrict', district);
            Alert.alert(
                'Zone Set! Γ£à',
                `${selectedZone.name} ΓÇö ${district}\nYour crop calendar will now show personalized advice.`,
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (e) {
            Alert.alert('Error', 'Failed to save your zone selection.');
        }
    };

    const renderZoneCard = ({ item }) => (
        <TouchableOpacity
            style={[styles.zoneCard, { borderColor: item.color }]}
            onPress={() => handleZoneSelect(item)}
        >
            <Text style={styles.zoneEmoji}>{item.emoji}</Text>
            <View style={styles.zoneInfo}>
                <Text style={styles.zoneName}>{item.name}</Text>
                <Text style={styles.zoneSinhala}>{item.sinhalaName}</Text>
                <Text style={styles.zoneRainfall}>Rainfall: {item.rainfall}</Text>
                <Text style={styles.zoneDesc} numberOfLines={2}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={item.color} />
        </TouchableOpacity>
    );

    const renderDistrictItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.districtItem,
                selectedDistrict === item && styles.districtItemSelected,
            ]}
            onPress={() => handleDistrictSelect(item)}
        >
            <Ionicons
                name="location"
                size={20}
                color={selectedDistrict === item ? '#0a1f1c' : '#6fdfc4'}
            />
            <Text
                style={[
                    styles.districtText,
                    selectedDistrict === item && styles.districtTextSelected,
                ]}
            >
                {item}
            </Text>
        </TouchableOpacity>
    );

