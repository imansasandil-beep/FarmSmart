import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ZONES } from './data/zones';

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
                'Zone Set! ✅',
                `${selectedZone.name} — ${district}\nYour crop calendar will now show personalized advice.`,
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
                            {selectedZone?.emoji} {selectedZone?.name} — {selectedZone?.sinhalaName}
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
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    subtitle: {
        color: '#8aa6a3',
        fontSize: 14,
        marginBottom: 20,
        textAlign: 'center',
    },

    // Step indicator
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    stepDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#2a5d55',
        borderWidth: 2,
        borderColor: '#3a7d6d',
    },
    stepDotActive: {
        backgroundColor: '#6fdfc4',
        borderColor: '#6fdfc4',
    },
    stepLine: {
        width: 80,
        height: 2,
        backgroundColor: '#2a5d55',
        marginHorizontal: 8,
    },
    stepLabelRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 75,
        marginBottom: 20,
    },
    stepLabel: {
        color: '#8aa6a3',
        fontSize: 12,
    },

    // Zone cards
    zoneCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a4d45',
        padding: 18,
        borderRadius: 15,
        marginBottom: 15,
        borderWidth: 1.5,
    },
    zoneEmoji: {
        fontSize: 36,
        marginRight: 15,
    },
    zoneInfo: {
        flex: 1,
    },
    zoneName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    zoneSinhala: {
        fontSize: 14,
        color: '#6fdfc4',
        marginTop: 2,
    },
    zoneRainfall: {
        fontSize: 12,
        color: '#8aa6a3',
        marginTop: 4,
    },
    zoneDesc: {
        fontSize: 12,
        color: '#6a9a90',
        marginTop: 4,
    },

    // Selected zone banner
    selectedZoneBanner: {
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: 'center',
    },
    selectedZoneText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // District items
    districtItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a4d45',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#2a5d55',
    },
    districtItemSelected: {
        backgroundColor: '#6fdfc4',
        borderColor: '#6fdfc4',
    },
    districtText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 12,
        fontWeight: '500',
    },
    districtTextSelected: {
        color: '#0a1f1c',
        fontWeight: 'bold',
    },
    listContent: {
        paddingBottom: 30,
    },
});
