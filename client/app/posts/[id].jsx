import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  TextInput, ActivityIndicator, Alert, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/expo';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = async () => {
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [postRes, commentsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/posts/${id}`, { headers }),
        axios.get(`${API_BASE_URL}/api/posts/${id}/comments`, { headers }),
      ]);
      setPost(postRes.data);
      setComments(commentsRes.data);
    } catch (error) {
      console.error('Fetch post error:', error);
      Alert.alert('Error', 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPost(); }, [id]);

  const handleLike = async () => {
    try {
      const token = await getToken();
      const res = await axios.post(
        `${API_BASE_URL}/api/posts/${id}/like`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost(prev => ({
        ...prev,
        likesCount: res.data.likesCount,
        likes: res.data.liked
          ? [...(prev.likes || []), user?.id]
          : (prev.likes || []).filter(uid => uid !== user?.id),
      }));
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const token = await getToken();
      const res = await axios.post(
        `${API_BASE_URL}/api/posts/${id}/comments`,
        {
          content: commentText.trim(),
          authorName: user?.fullName || user?.firstName || 'Anonymous',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(prev => [res.data, ...prev]);
      setPost(prev => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }));
      setCommentText('');
    } catch (error) {
      console.error('Add comment error:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    Alert.alert('Delete Comment', 'Remove this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            await axios.delete(`${API_BASE_URL}/api/posts/${id}/comments/${commentId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setComments(prev => prev.filter(c => c._id !== commentId));
            setPost(prev => ({ ...prev, commentsCount: Math.max(0, (prev.commentsCount || 1) - 1) }));
          } catch (error) {
            console.error('Delete comment error:', error);
          }
        },
      },
    ]);
  };

  const handleDeletePost = async () => {
    Alert.alert('Delete Post', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            await axios.delete(`${API_BASE_URL}/api/posts/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            router.back();
          } catch (error) {
            console.error('Delete post error:', error);
            Alert.alert('Error', 'Failed to delete post');
          }
        },
      },
    ]);
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6fdfc4" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.goBackText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLiked = post.likes?.includes(user?.id);
  const isAuthor = post.author === user?.id;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        {isAuthor && (
          <TouchableOpacity onPress={handleDeletePost}>
            <Ionicons name="trash-outline" size={22} color="#ff6b6b" />
          </TouchableOpacity>
        )}
        {!isAuthor && <View style={{ width: 32 }} />}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Post content */}
          <View style={styles.postSection}>
            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={18} color="#6fdfc4" />
              </View>
              <View>
                <Text style={styles.authorName}>{post.authorName}</Text>
                <Text style={styles.postTime}>{getTimeAgo(post.createdAt)}</Text>
              </View>
            </View>

            <Text style={styles.postContent}>{post.content}</Text>

            {post.image && (
              <Image source={{ uri: post.image }} style={styles.postImage} />
            )}

            {/* Like and comment stats */}
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.likeBtn} onPress={handleLike}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isLiked ? '#ff6b6b' : '#8aa6a3'}
                />
                <Text style={[styles.statText, isLiked && { color: '#ff6b6b' }]}>
                  {post.likesCount || 0} {post.likesCount === 1 ? 'like' : 'likes'}
                </Text>
              </TouchableOpacity>
              <View style={styles.commentStat}>
                <Ionicons name="chatbubble-outline" size={18} color="#8aa6a3" />
                <Text style={styles.statText}>
                  {post.commentsCount || 0} {post.commentsCount === 1 ? 'comment' : 'comments'}
                </Text>
              </View>
            </View>
          </View>

          {/* Comments section */}
          <Text style={styles.commentsTitle}>Comments</Text>
          {comments.length === 0 ? (
            <View style={styles.noComments}>
              <Text style={styles.noCommentsText}>No comments yet. Be the first!</Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View key={comment._id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAvatar}>
                    <Ionicons name="person" size={12} color="#6fdfc4" />
                  </View>
                  <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                  <Text style={styles.commentTime}>{getTimeAgo(comment.createdAt)}</Text>
                  {comment.author === user?.id && (
                    <TouchableOpacity
                      style={styles.deleteCommentBtn}
                      onPress={() => handleDeleteComment(comment._id)}
                    >
                      <Ionicons name="close" size={16} color="#ff6b6b" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
            ))
          )}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Comment input */}
        <View style={styles.commentInputRow}>
          <TextInput
            style={styles.commentInput}
            placeholder="Share your thoughts..."
            placeholderTextColor="#5a8a80"
            value={commentText}
            onChangeText={setCommentText}
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}
            onPress={handleAddComment}
            disabled={!commentText.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#0a1f1c" />
            ) : (
              <Ionicons name="send" size={18} color="#0a1f1c" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1f1c' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 55, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#1a3d38',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  errorText: { color: '#ff6b6b', fontSize: 16, marginTop: 12 },
  goBackText: { color: '#6fdfc4', fontSize: 14, marginTop: 8 },
  scrollContent: { flex: 1 },
  postSection: {
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#1a3d38',
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#1a4d45',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
    borderWidth: 1, borderColor: '#2a5d55',
  },
  authorName: { color: 'white', fontSize: 16, fontWeight: '600' },
  postTime: { color: '#5a8a80', fontSize: 12, marginTop: 2 },
  postContent: { color: 'rgba(255,255,255,0.92)', fontSize: 15, lineHeight: 22, marginBottom: 12 },
  postImage: { width: '100%', height: 250, borderRadius: 12, marginBottom: 14, backgroundColor: '#0d2b27' },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#2a5d55',
  },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  commentStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { color: '#8aa6a3', fontSize: 13, fontWeight: '500' },
  commentsTitle: {
    color: 'white', fontSize: 16, fontWeight: 'bold',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10,
  },
  noComments: { paddingHorizontal: 16, paddingVertical: 20, alignItems: 'center' },
  noCommentsText: { color: '#5a8a80', fontSize: 13 },
  commentCard: {
    marginHorizontal: 16, marginBottom: 10, padding: 12,
    backgroundColor: '#1a4d45', borderRadius: 12,
    borderWidth: 1, borderColor: '#2a5d55',
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  commentAvatar: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(111,223,196,0.12)',
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  commentAuthor: { color: '#6fdfc4', fontSize: 13, fontWeight: '600', flex: 1 },
  commentTime: { color: '#5a8a80', fontSize: 11, marginRight: 8 },
  deleteCommentBtn: { padding: 2 },
  commentContent: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18 },
  commentInputRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1a3d38', gap: 10,
  },
  commentInput: {
    flex: 1, backgroundColor: '#1a4d45', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, color: 'white',
    fontSize: 14, borderWidth: 1, borderColor: '#2a5d55',
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#6fdfc4',
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});