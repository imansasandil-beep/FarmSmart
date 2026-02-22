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

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => (step === 2 ? setStep(1) : router.back())}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>
                    {step === 1 ? 'Select Your Zone' : 'Select District'}
                </Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Step indicator */}
            <View style={styles.stepRow}>
                <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
                <View style={styles.stepLine} />
                <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
            </View>
            <View style={styles.stepLabelRow}>
                <Text style={styles.stepLabel}>Zone</Text>
                <Text style={styles.stepLabel}>District</Text>
            </View>

            {step === 1 ? (
                <>
                    <Text style={styles.subtitle}>
                        Choose your agro-ecological zone to get personalized crop advice
                    </Text>
                    <FlatList
                        data={ZONES}
                        keyExtractor={(item) => item.id}
                        renderItem={renderZoneCard}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            ) : (
                <>
                    <View style={[styles.selectedZoneBanner, { backgroundColor: selectedZone?.color + '30' }]}>
                        <Text style={styles.selectedZoneText}>
                            {selectedZone?.emoji} {selectedZone?.name} ΓÇö {selectedZone?.sinhalaName}
                        </Text>
                    </View>
                    <Text style={styles.subtitle}>Select your district</Text>
                    <FlatList
                        data={selectedZone?.districts || []}
                        keyExtractor={(item) => item}
                        renderItem={renderDistrictItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            )}
        </View>
    );
}
