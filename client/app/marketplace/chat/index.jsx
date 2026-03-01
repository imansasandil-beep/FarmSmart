import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../config';

export default function ConversationsScreen() {
    const router = useRouter();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchConversations = async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (!userStr) {
                router.replace('/');
                return;
            }
            const user = JSON.parse(userStr);

            const response = await fetch(`${API_BASE_URL}/api/messages/conversations/${user._id}`);
            const data = await response.json();

            if (response.ok) {
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchConversations();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations();
    };

    const handlePress = (item) => {
        router.push({
            pathname: `/marketplace/chat/${item.conversationId}`,
            params: {
                receiverId: item.otherUser._id,
                receiverName: item.otherUser.fullName,
            },
        });
    };

    const formatTime = (date) => {
        const now = new Date();
        const msgDate = new Date(date);
        const diff = now - msgDate;

        if (diff < 86400000 && now.getDate() === msgDate.getDate()) {
            return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return msgDate.toLocaleDateString();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
            <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {item.otherUser.fullName?.charAt(0).toUpperCase() || '?'}
                    </Text>
                </View>
                {item.unreadCount > 0 && <View style={styles.unreadBadge} />}
            </View>

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.name}>{item.otherUser.fullName}</Text>
                    <Text style={styles.time}>{formatTime(item.lastMessageDate)}</Text>
                </View>

                <View style={styles.messageRow}>
                    <Text
                        style={[
                            styles.messagePreview,
                            item.unreadCount > 0 && styles.unreadMessage
                        ]}
                        numberOfLines={1}
                    >
                        {item.lastMessage}
                    </Text>
                    {item.unreadCount > 0 && (
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{item.unreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={80} color="#6fdfc4" />
            <Text style={styles.emptyTitle}>No Messages Yet</Text>
            <Text style={styles.emptySubtitle}>
                Chat with sellers to ask questions about products
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#6fdfc4" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Messages</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={conversations}
                keyExtractor={(item) => item.conversationId}
                renderItem={renderItem}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={conversations.length === 0 ? styles.emptyList : styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#6fdfc4"
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a1f1c',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    emptyList: {
        flex: 1,
    },
    card: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#1a4d45',
        borderRadius: 15,
        marginBottom: 12,
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 15,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#6fdfc4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0a1f1c',
    },
    unreadBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#22c55e',
        borderWidth: 2,
        borderColor: '#1a4d45',
    },
    content: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    name: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    time: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
    },
    messageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    messagePreview: {
        flex: 1,
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        marginRight: 10,
    },
    unreadMessage: {
        color: 'white',
        fontWeight: '600',
    },
    countBadge: {
        backgroundColor: '#6fdfc4',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    countText: {
        color: '#0a1f1c',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 8,
        textAlign: 'center',
    },
});
