import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, StatusBar, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const CATEGORIES = ['Crops', 'Livestock', 'Soil', 'Pest Control', 'Irrigation', 'Export Support', 'General'];

export default function AskQuestion() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a question title');
      return;
    }
    if (!body.trim()) {
      Alert.alert('Error', 'Please describe your question');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      await axios.post(
        `${API_BASE_URL}/api/agrisup`,
        { title: title.trim(), body: body.trim(), category },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Your question has been posted!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('Post question error:', err);
      const msg = err.response?.data?.message || 'Failed to post question';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ask a Question</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.formContainer}>
          {/* Title Input */}
          <Text style={styles.label}>Question Title</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.titleInput}
              placeholder="What do you need help with?"
              placeholderTextColor="#4a7a70"
              value={title}
              onChangeText={setTitle}
              maxLength={150}
            />
          </View>
          <Text style={styles.charCount}>{title.length}/150</Text>

          {/* Body Input */}
          <Text style={styles.label}>Description</Text>
          <View style={[styles.inputBox, { height: 160 }]}>
            <TextInput
              style={[styles.titleInput, { height: 150, textAlignVertical: 'top' }]}
              placeholder="Provide more details about your question..."
              placeholderTextColor="#4a7a70"
              value={body}
              onChangeText={setBody}
              multiline
              maxLength={2000}
            />
          </View>
          <Text style={styles.charCount}>{body.length}/2000</Text>

          {/* Category Selector */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryWrap}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, category === cat && styles.catChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0a1f1c" />
            ) : (
              <Text style={styles.submitText}>Post Question</Text>
            )}
          </TouchableOpacity>

          {/* Info Note */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#6fdfc4" />
            <Text style={styles.infoText}>
              Your question will be visible to all users. Agricultural experts will be able to provide answers.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1f1c' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 55, paddingBottom: 15,
    backgroundColor: '#1a4d45', borderBottomWidth: 1, borderBottomColor: '#2a5d55',
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  formContainer: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#6fdfc4', marginBottom: 8, marginTop: 16 },
  inputBox: {
    backgroundColor: '#1a4d45', borderRadius: 12, borderWidth: 1, borderColor: '#2a5d55',
    paddingHorizontal: 14, justifyContent: 'center',
  },
  titleInput: { color: 'white', fontSize: 15, paddingVertical: 14 },
  charCount: { fontSize: 11, color: '#4a7a70', textAlign: 'right', marginTop: 4 },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#1a4d45', borderWidth: 1, borderColor: '#2a5d55',
  },
  catChipActive: { backgroundColor: '#6fdfc4', borderColor: '#6fdfc4' },
  catChipText: { fontSize: 13, color: '#8aa6a3', fontWeight: '600' },
  catChipTextActive: { color: '#0a1f1c' },
  submitBtn: {
    backgroundColor: '#6fdfc4', paddingVertical: 16, borderRadius: 25,
    alignItems: 'center', marginTop: 30,
  },
  submitText: { color: '#0a1f1c', fontSize: 16, fontWeight: 'bold' },
  infoCard: {
    flexDirection: 'row', backgroundColor: 'rgba(111,223,196,0.08)',
    borderRadius: 12, padding: 14, marginTop: 20, gap: 10, alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: 12, color: '#8aa6a3', lineHeight: 18 },
});