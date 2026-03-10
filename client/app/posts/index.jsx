import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/expo';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

export default function PostFeedScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum = 1, isRefresh = false) => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API_BASE_URL}/api/posts?page=${pageNum}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (isRefresh || pageNum === 1) {
        setPosts(res.data.posts);
      } else {
        setPosts(prev => [...prev, ...res.data.posts]);
      }
      setHasMore(pageNum < res.data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Fetch posts error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts(1, true);
  }, []);

  const handleLike = async (postId) => {
    try {
      const token = await getToken();
      const res = await axios.post(
        `${API_BASE_URL}/api/posts/${postId}/like`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(prev =>
        prev.map(p =>
          p._id === postId
            ? {
                ...p,
                likesCount: res.data.likesCount,
                likes: res.data.liked
                  ? [...(p.likes || []), user?.id]
                  : (p.likes || []).filter(id => id !== user?.id),
              }
            : p
        )
      );
    } catch (error) {
      console.error('Like error:', error);
    }
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

  const renderPost = ({ item }) => {
    const isLiked = item.likes?.includes(user?.id);
    return (
      <TouchableOpacity
        style={styles.postCard}
        activeOpacity={0.85}
        onPress={() => router.push(`/posts/${item._id}`)}
      >
        <View style={styles.postHeader}>
          <View style={styles.avatarSmall}>
            <Ionicons name="person" size={16} color="#6fdfc4" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.postAuthor}>{item.authorName}</Text>
            <Text style={styles.postTime}>{getTimeAgo(item.createdAt)}</Text>
          </View>
        </View>

        <Text style={styles.postContent} numberOfLines={4}>{item.content}</Text>

        {item.image && (
          <Image source={{ uri: item.image }} style={styles.postImage} />
        )}

        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item._id)}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? '#ff6b6b' : '#8aa6a3'}
            />
            <Text style={[styles.actionText, isLiked && { color: '#ff6b6b' }]}>
              {item.likesCount || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/posts/${item._id}`)}>
            <Ionicons name="chatbubble-outline" size={18} color="#8aa6a3" />
            <Text style={styles.actionText}>{item.commentsCount || 0}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6fdfc4" />
        <Text style={styles.loadingText}>Loading posts...</Text>
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
        <Text style={styles.headerTitle}>Community Posts</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6fdfc4" colors={['#6fdfc4']} />
        }
        onEndReached={() => { if (hasMore && !loading) fetchPosts(page + 1); }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="newspaper-outline" size={60} color="#2a5d55" />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtitle}>Be the first to share with the community!</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/posts/create')} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#0a1f1c" />
      </TouchableOpacity>
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
  listContent: { padding: 16, paddingBottom: 80 },
  loadingText: { color: '#8aa6a3', marginTop: 12, fontSize: 14 },
  postCard: {
    backgroundColor: '#1a4d45', borderRadius: 16, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: '#2a5d55',
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarSmall: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(111,223,196,0.12)',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
    borderWidth: 1, borderColor: 'rgba(111,223,196,0.25)',
  },
  postAuthor: { color: 'white', fontSize: 14, fontWeight: '600' },
  postTime: { color: '#5a8a80', fontSize: 11, marginTop: 1 },
  postContent: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  postImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 10, backgroundColor: '#0d2b27' },
  postActions: { flexDirection: 'row', gap: 20, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#2a5d55' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { color: '#8aa6a3', fontSize: 13, fontWeight: '500' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyTitle: { color: '#8aa6a3', fontSize: 18, fontWeight: '600', marginTop: 14 },
  emptySubtitle: { color: '#5a8a80', fontSize: 13, marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },
  fab: {
    position: 'absolute', bottom: 24, right: 20, width: 56, height: 56,
    borderRadius: 28, backgroundColor: '#6fdfc4', alignItems: 'center',
    justifyContent: 'center', elevation: 5,
    shadowColor: '#6fdfc4', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
});