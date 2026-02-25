import React, { useState, useEffect, useCallback } from 'react';
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
    const [activeFilter, setActiveFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    const filters = ['All', 'Pest', 'Disease'];

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

    // Search and filter with debounce
    useEffect(() => {
        const timeout = setTimeout(() => {
            applyFilters(searchText, activeFilter);
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchText, activeFilter]);

    const applyFilters = useCallback(async (query, typeFilter) => {
        try {
            let data = records;
            if (query.trim()) {
                const response = await axios.get(
                    `${API_BASE_URL}/api/pest-diseases/search?q=${encodeURIComponent(query.trim())}`
                );
                data = response.data;
            }
            if (typeFilter !== 'All') {
                data = data.filter((item) => item.type === typeFilter);
            }
            setFilteredRecords(data);
        } catch (err) {
            console.log('Search error:', err);
        }
    }, [records]);

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

            {/* Filter chips */}
            <View style={styles.filterRow}>
                {filters.map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                        onPress={() => setActiveFilter(f)}
                    >
                        <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
                            {f}
                        </Text>
                    </TouchableOpacity>
                ))}
                <View style={styles.resultCount}>
                    <Text style={styles.resultCountText}>
                        {filteredRecords.length} result{filteredRecords.length !== 1 ? 's' : ''}
                    </Text>
                </View>
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
    filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1a4d45', marginRight: 10, borderWidth: 1, borderColor: '#2a5d55' },
    filterChipActive: { backgroundColor: '#6fdfc4', borderColor: '#6fdfc4' },
    filterChipText: { color: '#8aa6a3', fontSize: 13, fontWeight: '600' },
    filterChipTextActive: { color: '#0a1f1c' },
    resultCount: { marginLeft: 'auto' },
    resultCountText: { color: '#8aa6a3', fontSize: 12 },
    card: { backgroundColor: '#1a4d45', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#2a5d55' },
    cardName: { color: 'white', fontSize: 17, fontWeight: 'bold' },
    cardType: { color: '#6fdfc4', fontSize: 12, marginTop: 4 },
});