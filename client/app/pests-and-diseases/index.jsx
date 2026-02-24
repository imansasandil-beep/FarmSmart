import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

export default function PestsAndDiseasesScreen() {
    const router = useRouter();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAllRecords(); }, []);

    const fetchAllRecords = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/pest-diseases`);
            setRecords(response.data);
        } catch (err) {
            console.log('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#6fdfc4" />
                <Text style={styles.loadingText}>Loading data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Pests & Diseases</Text>
                <Ionicons name="bug" size={24} color="#6fdfc4" />
            </View>
            <FlatList
                data={records}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.cardName}>{item.name}</Text>
                        <Text style={styles.cardType}>{item.type}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a1f1c', paddingTop: 50, paddingHorizontal: 16 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#6fdfc4', marginTop: 12, fontSize: 14 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 22, fontWeight: 'bold', color: 'white' },
    card: { backgroundColor: '#1a4d45', borderRadius: 14, padding: 16, marginBottom: 14 },
    cardName: { color: 'white', fontSize: 17, fontWeight: 'bold' },
    cardType: { color: '#6fdfc4', fontSize: 12, marginTop: 4 },
});