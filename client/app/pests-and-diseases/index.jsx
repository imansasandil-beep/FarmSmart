import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

export default function PestsAndDiseasesScreen() {
    const router = useRouter();
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAllRecords(); }, []);

    const fetchAllRecords = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/pest-diseases`);
            setRecords(response.data);
            setFilteredRecords(response.data);
        } catch (err) {
            console.log('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Search with debounce
    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (searchText.trim()) {
                try {
                    const response = await axios.get(
                        `${API_BASE_URL}/api/pest-diseases/search?q=${encodeURIComponent(searchText.trim())}`
                    );
                    setFilteredRecords(response.data);
                } catch (err) {
                    console.log('Search error:', err);
                }
            } else {
                setFilteredRecords(records);
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchText]);

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

            {/* Search bar */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#8aa6a3" style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or crop..."
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

            <FlatList
                data={filteredRecords}
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
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a4d45', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14, borderWidth: 1, borderColor: '#2a5d55' },
    searchInput: { flex: 1, color: 'white', fontSize: 15 },
    card: { backgroundColor: '#1a4d45', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#2a5d55' },
    cardName: { color: 'white', fontSize: 17, fontWeight: 'bold' },
    cardType: { color: '#6fdfc4', fontSize: 12, marginTop: 4 },
});