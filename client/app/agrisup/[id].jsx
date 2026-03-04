import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, TextInput, Alert,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

export default function QuestionDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getToken } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUserRole();
    fetchQuestion();
  }, [id]);

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

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      Alert.alert('Error', 'Please write your answer');
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      const res = await axios.post(
        `${API_BASE_URL}/api/agrisup/${id}/answer`,
        { body: answerText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestion(res.data.question);
      setAnswerText('');
      Alert.alert('Success', 'Your answer has been posted!');
    } catch (err) {
      console.error('Submit answer error:', err);
      const msg = err.response?.data?.message || 'Failed to submit answer';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
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

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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

          {/* Expert Answer Form */}
          {userRole === 'expert' && (
            <View style={styles.answerFormCard}>
              <View style={styles.answerFormHeader}>
                <Ionicons name="create-outline" size={18} color="#6fdfc4" />
                <Text style={styles.answerFormTitle}>Write Your Expert Answer</Text>
              </View>
              <TextInput
                style={styles.answerInput}
                placeholder="Share your expertise to help this farmer..."
                placeholderTextColor="#4a7a70"
                value={answerText}
                onChangeText={setAnswerText}
                multiline
                maxLength={3000}
              />
              <View style={styles.answerFormFooter}>
                <Text style={styles.charCount}>{answerText.length}/3000</Text>
                <TouchableOpacity
                  style={[styles.submitAnswerBtn, submitting && { opacity: 0.6 }]}
                  onPress={handleSubmitAnswer}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#0a1f1c" size="small" />
                  ) : (
                    <>
                      <Ionicons name="send" size={16} color="#0a1f1c" />
                      <Text style={styles.submitAnswerText}>Submit Answer</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  answerFormCard: {
    backgroundColor: '#1a4d45', borderRadius: 16, padding: 16,
    marginTop: 20, borderWidth: 1, borderColor: '#6fdfc4',
  },
  answerFormHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  answerFormTitle: { fontSize: 14, fontWeight: 'bold', color: '#6fdfc4' },
  answerInput: {
    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 14,
    color: 'white', fontSize: 14, minHeight: 120, textAlignVertical: 'top',
  },
  answerFormFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  charCount: { fontSize: 11, color: '#4a7a70' },
  submitAnswerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#6fdfc4', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20,
  },
  submitAnswerText: { color: '#0a1f1c', fontSize: 13, fontWeight: 'bold' },
});