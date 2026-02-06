import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);

            const response = await fetch(`${API_BASE_URL}/api/notifications/${user._id}`);
            const data = await response.json();

            if (response.ok) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
                method: 'PATCH',
            });
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);

            await fetch(`${API_BASE_URL}/api/notifications/read-all/${user._id}`, {
                method: 'PATCH',
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order_placed':
            case 'new_sale':
                return { name: 'cart', color: '#6fdfc4' };
            case 'order_paid':
                return { name: 'checkmark-circle', color: '#22c55e' };
            case 'order_shipped':
                return { name: 'airplane', color: '#3b82f6' };
            case 'order_delivered':
                return { name: 'checkmark-done', color: '#22c55e' };
            case 'refund_requested':
            case 'refund_processed':
                return { name: 'return-down-back', color: '#f59e0b' };
            case 'review_received':
                return { name: 'star', color: '#f59e0b' };
            case 'new_message':
                return { name: 'chatbubble', color: '#8b5cf6' };
            default:
                return { name: 'notifications', color: '#6fdfc4' };
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const handleNotificationPress = (notification) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }

        // Navigate based on notification type
        if (notification.data?.orderId) {
            router.push('/marketplace/orders');
        }
    };

    const renderNotification = ({ item }) => {
        const icon = getNotificationIcon(item.type);

        return (
            <TouchableOpacity
                style={[styles.notificationCard, !item.read && styles.unreadCard]}
                onPress={() => handleNotificationPress(item)}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
                    <Ionicons name={icon.name} size={24} color={icon.color} />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                        {item.message}
                    </Text>
                    <Text style={styles.notificationTime}>{formatTime(item.createdAt)}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={80} color="#6fdfc4" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
                You'll see order updates and messages here
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
                <Text style={styles.headerTitle}>Notifications</Text>
                {unreadCount > 0 ? (
                    <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
                        <Text style={styles.markAllText}>Read All</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 60 }} />
                )}
            </View>

            {/* Notifications List */}
            <FlatList
                data={notifications}
                keyExtractor={(item) => item._id}
                renderItem={renderNotification}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={notifications.length === 0 ? styles.emptyList : styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#6fdfc4"
                        colors={['#6fdfc4']}
                    />
                }
                showsVerticalScrollIndicator={false}
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
    markAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(111, 223, 196, 0.2)',
        borderRadius: 15,
    },
    markAllText: {
        color: '#6fdfc4',
        fontSize: 12,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    emptyList: {
        flex: 1,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a4d45',
        borderRadius: 15,
        padding: 16,
        marginBottom: 12,
    },
    unreadCard: {
        backgroundColor: '#1a5d50',
        borderLeftWidth: 3,
        borderLeftColor: '#6fdfc4',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    contentContainer: {
        flex: 1,
    },
    notificationTitle: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    notificationMessage: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        lineHeight: 18,
    },
    notificationTime: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        marginTop: 6,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#6fdfc4',
        marginLeft: 8,
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
