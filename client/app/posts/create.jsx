import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Image,
  Alert, ActivityIndicator, ScrollView, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/expo';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

export default function CreatePostScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera roll access is needed to upload photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something for your post.');
      return;
    }
    setUploading(true);
    try {
      const token = await getToken();
      let imageUrl = null;

      if (image) {
        const formData = new FormData();
        formData.append('image', {
          uri: image,
          type: 'image/jpeg',
          name: 'post_image.jpg',
        });
        const uploadRes = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadRes.data.url;
      }

      await axios.post(
        `${API_BASE_URL}/api/posts`,
        {
          content: content.trim(),
          image: imageUrl,
          authorName: user?.fullName || user?.firstName || 'Anonymous Farmer',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Your post has been shared!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Create post error:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          style={[styles.postBtn, !content.trim() && styles.postBtnDisabled]}
          onPress={handleSubmit}
          disabled={!content.trim() || uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#0a1f1c" />
          ) : (
            <Text style={styles.postBtnText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scrollContent}>
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#6fdfc4" />
            </View>
            <Text style={styles.authorName}>
              {user?.fullName || user?.firstName || 'You'}
            </Text>
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="Share farming tips, updates, or ask a question..."
            placeholderTextColor="#5a8a80"
            multiline
            maxLength={1000}
            value={content}
            onChangeText={setContent}
            autoFocus
          />

          {image && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImage(null)}>
                <Ionicons name="close-circle" size={28} color="#ff6b6b" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarBtn} onPress={pickImage}>
          <Ionicons name="image-outline" size={24} color="#6fdfc4" />
          <Text style={styles.toolbarText}>Photo</Text>
        </TouchableOpacity>
        <Text style={styles.charCount}>{content.length}/1000</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1f1c' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 55, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#1a3d38',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  postBtn: { backgroundColor: '#6fdfc4', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  postBtnDisabled: { opacity: 0.4 },
  postBtnText: { color: '#0a1f1c', fontWeight: 'bold', fontSize: 14 },
  scrollContent: { flex: 1, padding: 16 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#1a4d45',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
    borderWidth: 1, borderColor: '#2a5d55',
  },
  authorName: { fontSize: 16, fontWeight: '600', color: 'white' },
  textInput: { fontSize: 16, color: 'white', minHeight: 120, textAlignVertical: 'top', lineHeight: 24 },
  imagePreview: { marginTop: 16, borderRadius: 12, overflow: 'hidden' },
  previewImage: { width: '100%', height: 250, borderRadius: 12 },
  removeImageBtn: { position: 'absolute', top: 8, right: 8 },
  toolbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#1a3d38',
  },
  toolbarBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toolbarText: { color: '#6fdfc4', fontSize: 14, fontWeight: '500' },
  charCount: { color: '#5a8a80', fontSize: 12 },
});