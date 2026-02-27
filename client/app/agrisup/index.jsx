import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar, TextInput, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const CATEGORIES = ['All', 'Crops', 'Livestock', 'Soil', 'Pest Control', 'Irrigation', 'General'];

export default function AgriSupHome() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadUserRole();
    fetchQuestions();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory]);

  const loadUserRole = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const userData = JSON.parse(stored);
        setUserRole(userData.role || '');
      }
    } catch (e) {
      console.log('Error loading user role:', e);
    }
  };

  const fetchQuestions = async () => {
    try {
      const token = await getToken();
      let url = `${API_BASE_URL}/api/agrisup?`;
      if (selectedCategory !== 'All') url += `category=${selectedCategory}&`;
      if (searchQuery.trim()) url += `search=${encodeURIComponent(searchQuery.trim())}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error('Fetch questions error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchQuestions();
  }, [selectedCategory, searchQuery]);

  const handleSearch = () => {
    setLoading(true);
    fetchQuestions();
  };

  const getCategoryColor = (cat) => {
    const colors = {
      'Crops': '#2ecc71', 'Livestock': '#e67e22', 'Soil': '#9b59b6',
      'Pest Control': '#e74c3c', 'Irrigation': '#3498db', 'General': '#95a5a6',
    };
    return colors[cat] || '#95a5a6';
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderQuestion = ({ item }) => (
    <TouchableOpacity
      style={styles.questionCard}
      onPress={() => router.push(`/agrisup/${item._id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + '25' }]}>
          <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
            {item.category}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'answered' ? '#2ecc7125' : '#e67e2225' }]}>
          <Text style={[styles.statusText, { color: item.status === 'answered' ? '#2ecc71' : '#e67e22' }]}>
            {item.status === 'answered' ? 'Answered' : 'Open'}
          </Text>
        </View>
      </View>
      <Text style={styles.questionTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.questionBody} numberOfLines={2}>{item.body}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.authorRow}>
          <Ionicons name="person-circle-outline" size={16} color="#8aa6a3" />
          <Text style={styles.authorText}>{item.authorName}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="chatbubble-outline" size={14} color="#8aa6a3" />
          <Text style={styles.metaText}>{item.answers?.length || 0}</Text>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6fdfc4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>AgriSup</Text>
          <Text style={styles.headerSub}>Community Q&A</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#8aa6a3" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions..."
            placeholderTextColor="#4a7a70"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setTimeout(fetchQuestions, 100); }}>
              <Ionicons name="close-circle" size={18} color="#8aa6a3" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={questions}
        keyExtractor={(item) => item._id}
        renderItem={renderQuestion}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6fdfc4" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="help-circle-outline" size={64} color="#4a7a70" />
            <Text style={styles.emptyTitle}>No Questions Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search or filter'
                : 'Be the first to ask a question!'}
            </Text>
          </View>
        }
      />

      {userRole === 'farmer' && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/agrisup/ask')} activeOpacity={0.8}>
          <Ionicons name="add" size={28} color="#0a1f1c" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1f1c' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 55, paddingBottom: 15,
    backgroundColor: '#1a4d45', borderBottomWidth: 1, borderBottomColor: '#2a5d55',
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  headerSub: { fontSize: 12, color: '#8aa6a3', textAlign: 'center' },
  searchContainer: { paddingHorizontal: 16, paddingTop: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a4d45',
    borderRadius: 12, paddingHorizontal: 14, height: 44, borderWidth: 1, borderColor: '#2a5d55',
  },
  searchInput: { flex: 1, color: 'white', fontSize: 14, marginLeft: 10 },
  chipScroll: { maxHeight: 50, marginTop: 10 },
  chipContainer: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#1a4d45', borderWidth: 1, borderColor: '#2a5d55',
  },
  chipActive: { backgroundColor: '#6fdfc4', borderColor: '#6fdfc4' },
  chipText: { fontSize: 12, color: '#8aa6a3', fontWeight: '600' },
  chipTextActive: { color: '#0a1f1c' },
  listContent: { padding: 16, paddingBottom: 100 },
  questionCard: {
    backgroundColor: '#1a4d45', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#2a5d55',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 11, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  questionTitle: { fontSize: 16, fontWeight: 'bold', color: 'white', marginBottom: 6 },
  questionBody: { fontSize: 13, color: '#8aa6a3', lineHeight: 18, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  authorText: { fontSize: 12, color: '#8aa6a3' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: '#8aa6a3' },
  dateText: { fontSize: 11, color: '#4a7a70' },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#8aa6a3', marginTop: 8, textAlign: 'center' },
  fab: {
    position: 'absolute', bottom: 30, right: 20, width: 56, height: 56,
    borderRadius: 28, backgroundColor: '#6fdfc4', alignItems: 'center',
    justifyContent: 'center', elevation: 8,
    shadowColor: '#6fdfc4', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
});