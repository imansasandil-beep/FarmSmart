import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

export default function QuestionDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getToken } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API_BASE_URL}/api/agrisup/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestion(res.data.question);
    } catch (err) {
      console.error('Fetch question error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getCategoryColor = (cat) => {
    const colors = {
      'Crops': '#2ecc71', 'Livestock': '#e67e22', 'Soil': '#9b59b6',
      'Pest Control': '#e74c3c', 'Irrigation': '#3498db', 'General': '#95a5a6',
    };
    return colors[cat] || '#95a5a6';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6fdfc4" />
      </View>
    );
  }

  if (!question) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
        <Text style={styles.errorText}>Question not found</Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => router.back()}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Question</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.qMeta}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(question.category) + '25' }]}>
              <Text style={[styles.categoryText, { color: getCategoryColor(question.category) }]}>
                {question.category}
              </Text>
            </View>
            <View style={[styles.statusBadge, {
              backgroundColor: question.status === 'answered' ? '#2ecc7125' : '#e67e2225'
            }]}>
              <Text style={[styles.statusText, {
                color: question.status === 'answered' ? '#2ecc71' : '#e67e22'
              }]}>
                {question.status === 'answered' ? 'Answered' : 'Open'}
              </Text>
            </View>
          </View>

          <Text style={styles.qTitle}>{question.title}</Text>
          <Text style={styles.qBody}>{question.body}</Text>

          <View style={styles.qFooter}>
            <View style={styles.authorRow}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={14} color="#6fdfc4" />
              </View>
              <View>
                <Text style={styles.authorName}>{question.authorName}</Text>
                <Text style={styles.authorRole}>Farmer</Text>
              </View>
            </View>
            <Text style={styles.qDate}>{formatDate(question.createdAt)}</Text>
          </View>
        </View>

        {/* Answers Section */}
        <View style={styles.answersHeader}>
          <Ionicons name="chatbubbles" size={20} color="#6fdfc4" />
          <Text style={styles.answersTitle}>
            Answers ({question.answers?.length || 0})
          </Text>
        </View>

        {question.answers && question.answers.length > 0 ? (
          question.answers.map((answer, index) => (
            <View key={index} style={styles.answerCard}>
              <View style={styles.answerHeader}>
                <View style={styles.expertRow}>
                  <View style={styles.expertAvatar}>
                    <Ionicons name="shield-checkmark" size={14} color="#6fdfc4" />
                  </View>
                  <View>
                    <Text style={styles.expertName}>{answer.expertName}</Text>
                    <Text style={styles.expertLabel}>Agricultural Expert</Text>
                  </View>
                </View>
                <Text style={styles.answerDate}>{formatDate(answer.createdAt)}</Text>
              </View>
              <Text style={styles.answerBody}>{answer.body}</Text>
            </View>
          ))
        ) : (
          <View style={styles.noAnswers}>
            <Ionicons name="time-outline" size={40} color="#4a7a70" />
            <Text style={styles.noAnswersTitle}>No Answers Yet</Text>
            <Text style={styles.noAnswersText}>
              An agricultural expert will respond soon.
            </Text>
          </View>
        )}
      </ScrollView>
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  errorText: { fontSize: 16, color: '#ff6b6b', marginTop: 12 },
  goBackBtn: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#1a4d45', borderRadius: 10 },
  goBackText: { color: '#6fdfc4', fontWeight: 'bold' },
  questionCard: {
    backgroundColor: '#1a4d45', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#2a5d55', marginBottom: 20,
  },
  qMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 11, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  qTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 12 },
  qBody: { fontSize: 14, color: '#c0d8d3', lineHeight: 22, marginBottom: 16 },
  qFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2a5d55', paddingTop: 14 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(111,223,196,0.15)', alignItems: 'center', justifyContent: 'center' },
  authorName: { fontSize: 13, color: 'white', fontWeight: '600' },
  authorRole: { fontSize: 11, color: '#8aa6a3' },
  qDate: { fontSize: 11, color: '#4a7a70' },
  answersHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  answersTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  answerCard: {
    backgroundColor: '#1a4d45', borderRadius: 14, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: '#2a5d55',
    borderLeftWidth: 3, borderLeftColor: '#6fdfc4',
  },
  answerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  expertRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expertAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(111,223,196,0.15)', alignItems: 'center', justifyContent: 'center' },
  expertName: { fontSize: 13, color: 'white', fontWeight: '600' },
  expertLabel: { fontSize: 10, color: '#6fdfc4', fontWeight: '500' },
  answerDate: { fontSize: 11, color: '#4a7a70' },
  answerBody: { fontSize: 14, color: '#c0d8d3', lineHeight: 22 },
  noAnswers: { alignItems: 'center', paddingVertical: 40 },
  noAnswersTitle: { fontSize: 16, fontWeight: 'bold', color: 'white', marginTop: 12 },
  noAnswersText: { fontSize: 13, color: '#8aa6a3', marginTop: 6, textAlign: 'center' },
});