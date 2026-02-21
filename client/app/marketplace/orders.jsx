import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config';

// Color coding for different order statuses
const STATUS_COLORS = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    processing: '#8b5cf6',
    shipped: '#06b6d4',
    delivered: '#10b981',
    cancelled: '#ef4444',
};

export default function OrdersScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('buying'); // 'buying' or 'selling'
    const [currentUser, setCurrentUser] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) {
                setLoading(false);
                return;
            }

            const user = JSON.parse(userData);
            setCurrentUser(user);
            const userId = user._id || user.id;

            // Fetch based on active tab
            const endpoint = activeTab === 'buying'
                ? `${API_BASE_URL}/api/orders/buyer/${userId}`
                : `${API_BASE_URL}/api/orders/seller/${userId}`;

            const response = await fetch(endpoint);
            const data = await response.json();

            if (response.ok) {
                setOrders(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Fetch orders error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab]);

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [fetchOrders])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    // Handle status update (for sellers)
    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                Alert.alert('Updated', `Order marked as ${newStatus}`);
                fetchOrders(); // Refresh the list
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update order');
        }
    };

    // Handle order cancellation
    const handleCancel = (orderId) => {
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
                                method: 'PUT',
                            });
                            if (response.ok) {
                                Alert.alert('Cancelled', 'Order has been cancelled');
                                fetchOrders();
                            } else {
                                const data = await response.json();
                                Alert.alert('Error', data.message);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cancel order');
                        }
                    },
                },
            ]
        );
    };

    // Get next status options for seller
    const getNextStatus = (currentStatus) => {
        const flow = {
            confirmed: 'processing',
            processing: 'shipped',
            shipped: 'delivered',
        };
        return flow[currentStatus] || null;
    };

    const renderOrder = ({ item }) => {
        const listing = item.listingId;
        const otherParty = activeTab === 'buying' ? item.sellerId : item.buyerId;
        const statusColor = STATUS_COLORS[item.status] || '#666';
        const nextStatus = activeTab === 'selling' ? getNextStatus(item.status) : null;

        return (
            <View style={styles.orderCard}>
                {/* Product info */}
                <View style={styles.orderHeader}>
                    <Image
                        source={{ uri: listing?.imageUrl || 'https://via.placeholder.com/60' }}
                        style={styles.orderImage}
                    />
                    <View style={styles.orderInfo}>
                        <Text style={styles.orderTitle} numberOfLines={1}>
                            {listing?.title || 'Product'}
                        </Text>
                        <Text style={styles.orderParty}>
                            {activeTab === 'buying' ? 'Seller' : 'Buyer'}: {otherParty?.fullName || 'Unknown'}
                        </Text>
                        <Text style={styles.orderDate}>
                            {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                {/* Order details */}
                <View style={styles.orderDetails}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Quantity</Text>
                        <Text style={styles.detailValue}>{item.quantity} {listing?.unit || 'kg'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total</Text>
                        <Text style={styles.detailValue}>Rs. {item.totalAmount}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payment</Text>
                        <Text style={[
                            styles.detailValue,
                            { color: item.paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }
                        ]}>
                            {item.paymentStatus}
                        </Text>
                    </View>
                </View>

                {/* Action buttons */}
                <View style={styles.orderActions}>
                    {/* Seller can advance the order status */}
                    {activeTab === 'selling' && nextStatus && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleStatusUpdate(item._id, nextStatus)}
                        >
                            <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                            <Text style={styles.actionButtonText}>
                                Mark as {nextStatus}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Both can cancel if not yet processing */}
                    {['pending', 'confirmed'].includes(item.status) && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => handleCancel(item._id)}
                        >
                            <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}

                    {/* Buyer can leave review after delivery */}
                    {activeTab === 'buying' && item.status === 'delivered' && (
                        <TouchableOpacity
                            style={styles.reviewButton}
                            onPress={() => router.push({
                                pathname: '/marketplace/review',
                                params: {
                                    orderId: item._id,
                                    sellerId: item.sellerId?._id || item.sellerId,
                                    listingId: item.listingId?._id || item.listingId,
                                },
                            })}
                        >
                            <Ionicons name="star-outline" size={16} color="#f59e0b" />
                            <Text style={styles.reviewButtonText}>Leave Review</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1a4d45" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a4d45" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'buying' && styles.tabActive]}
                    onPress={() => { setActiveTab('buying'); setLoading(true); }}
                >
                    <Ionicons name="cart-outline" size={18} color={activeTab === 'buying' ? '#fff' : '#1a4d45'} />
                    <Text style={[styles.tabText, activeTab === 'buying' && styles.tabTextActive]}>
                        Buying
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'selling' && styles.tabActive]}
                    onPress={() => { setActiveTab('selling'); setLoading(true); }}
                >
                    <Ionicons name="storefront-outline" size={18} color={activeTab === 'selling' ? '#fff' : '#1a4d45'} />
                    <Text style={[styles.tabText, activeTab === 'selling' && styles.tabTextActive]}>
                        Selling
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Orders List */}
            <FlatList
                data={orders}
                keyExtractor={(item) => item._id}
                renderItem={renderOrder}
                contentContainerStyle={orders.length === 0 ? styles.emptyContainer : styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyTitle}>No orders yet</Text>
                        <Text style={styles.emptySubtext}>
                            {activeTab === 'buying'
                                ? 'Browse the marketplace to find products'
                                : 'Your sold items will appear here'}
                        </Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#1a4d45']}
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a4d45',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        gap: 6,
    },
    tabActive: {
        backgroundColor: '#1a4d45',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a4d45',
    },
    tabTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    emptyContainer: {
        flex: 1,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
    },
    orderInfo: {
        flex: 1,
        marginLeft: 12,
    },
    orderTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    orderParty: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    orderDate: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    orderDetails: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    detailLabel: {
        color: '#888',
        fontSize: 13,
    },
    detailValue: {
        color: '#333',
        fontSize: 13,
        fontWeight: '500',
    },
    orderActions: {
        flexDirection: 'row',
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a4d45',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ef4444',
        gap: 4,
    },
    cancelButtonText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 13,
    },
    reviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#fef3c7',
        gap: 4,
    },
    reviewButtonText: {
        color: '#f59e0b',
        fontWeight: '600',
        fontSize: 13,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
});
