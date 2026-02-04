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
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config';

export default function OrdersScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('buyer'); // 'buyer' or 'seller'

    const fetchOrders = async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (!userStr) {
                Alert.alert('Error', 'Please login to view orders');
                router.push('/');
                return;
            }
            const user = JSON.parse(userStr);

            const endpoint = activeTab === 'buyer'
                ? `${API_BASE_URL}/api/orders/buyer/${user._id}`
                : `${API_BASE_URL}/api/orders/seller/${user._id}`;

            const response = await fetch(endpoint);
            const data = await response.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            Alert.alert('Error', 'Could not load orders');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [activeTab])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'confirmed': return '#3b82f6';
            case 'processing': return '#8b5cf6';
            case 'shipped': return '#06b6d4';
            case 'delivered': return '#22c55e';
            case 'cancelled': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid': return '#22c55e';
            case 'pending': return '#f59e0b';
            case 'failed': return '#ef4444';
            case 'refunded': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const renderOrder = ({ item }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item._id.slice(-8).toUpperCase()}</Text>
                <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
            </View>

            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.listingId?.title || 'Product'}</Text>
                <Text style={styles.quantity}>
                    {item.quantity} × Rs. {item.unitPrice}
                </Text>
            </View>

            <View style={styles.statusRow}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(item.paymentStatus) }]}>
                    <Ionicons
                        name={item.paymentStatus === 'paid' ? 'checkmark-circle' : 'time'}
                        size={12}
                        color="white"
                    />
                    <Text style={styles.statusText}>{item.paymentStatus.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Total</Text>
                <Text style={styles.priceValue}>Rs. {item.totalAmount}</Text>
            </View>

            {activeTab === 'seller' && (
                <View style={styles.earningsRow}>
                    <Text style={styles.earningsLabel}>Your Earnings</Text>
                    <Text style={styles.earningsValue}>Rs. {item.sellerPayout}</Text>
                </View>
            )}

            {item.deliveryStatus && item.deliveryStatus !== 'pending' && (
                <View style={styles.deliveryRow}>
                    <Ionicons name="bicycle" size={16} color="#6fdfc4" />
                    <Text style={styles.deliveryText}>
                        Delivery: {item.deliveryStatus}
                    </Text>
                </View>
            )}
        </View>
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={80} color="#6fdfc4" />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>
                {activeTab === 'buyer'
                    ? 'Start shopping to see your orders here!'
                    : 'Your sales will appear here.'}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#6fdfc4" />
                <Text style={styles.loadingText}>Loading orders...</Text>
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
                <Text style={styles.headerTitle}>My Orders</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'buyer' && styles.activeTab]}
                    onPress={() => setActiveTab('buyer')}
                >
                    <Ionicons
                        name="cart"
                        size={18}
                        color={activeTab === 'buyer' ? '#0a1f1c' : 'white'}
                    />
                    <Text style={[styles.tabText, activeTab === 'buyer' && styles.activeTabText]}>
                        Purchases
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'seller' && styles.activeTab]}
                    onPress={() => setActiveTab('seller')}
                >
                    <Ionicons
                        name="storefront"
                        size={18}
                        color={activeTab === 'seller' ? '#0a1f1c' : 'white'}
                    />
                    <Text style={[styles.tabText, activeTab === 'seller' && styles.activeTabText]}>
                        Sales
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Orders List */}
            <FlatList
                data={orders}
                keyExtractor={(item) => item._id}
                renderItem={renderOrder}
                ListEmptyComponent={renderEmptyList}
                contentContainerStyle={orders.length === 0 ? styles.emptyList : styles.listContent}
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
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#1a4d45',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 6,
    },
    activeTab: {
        backgroundColor: '#6fdfc4',
    },
    tabText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    activeTabText: {
        color: '#0a1f1c',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    emptyList: {
        flex: 1,
    },
    orderCard: {
        backgroundColor: '#1a4d45',
        borderRadius: 15,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(111, 223, 196, 0.3)',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    orderId: {
        color: '#6fdfc4',
        fontSize: 12,
        fontWeight: '600',
    },
    orderDate: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
    },
    productInfo: {
        marginBottom: 12,
    },
    productName: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    quantity: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    statusRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    statusText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 12,
    },
    priceLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    priceValue: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    earningsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    earningsLabel: {
        color: '#6fdfc4',
        fontSize: 13,
    },
    earningsValue: {
        color: '#6fdfc4',
        fontSize: 15,
        fontWeight: 'bold',
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 6,
    },
    deliveryText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
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
    loadingText: {
        color: '#6fdfc4',
        marginTop: 15,
        fontSize: 16,
    },
});
