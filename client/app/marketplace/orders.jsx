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
    const [activeTab, setActiveTab] = useState('buyer');
    const [updatingOrder, setUpdatingOrder] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const fetchOrders = async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (!userStr) {
                Alert.alert('Error', 'Please login to view orders');
                router.push('/');
                return;
            }
            const user = JSON.parse(userStr);
            setCurrentUser(user);

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

    const updateOrderStatus = async (orderId, newStatus) => {
        setUpdatingOrder(orderId);
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                Alert.alert('Success', `Order marked as ${newStatus}`);
                fetchOrders();
            } else {
                const data = await response.json();
                Alert.alert('Error', data.message || 'Failed to update order');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            Alert.alert('Error', 'Could not update order status');
        } finally {
            setUpdatingOrder(null);
        }
    };

    const requestRefund = async (orderId) => {
        Alert.alert(
            'Request Refund',
            'Are you sure you want to request a refund for this order?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Request Refund',
                    style: 'destructive',
                    onPress: async () => {
                        setUpdatingOrder(orderId);
                        try {
                            const response = await fetch(`${API_BASE_URL}/api/payments/refund/${orderId}`, {
                                method: 'POST',
                            });
                            const data = await response.json();
                            if (response.ok) {
                                Alert.alert('Refund Requested', data.message || 'Your refund request has been submitted.');
                                fetchOrders();
                            } else {
                                Alert.alert('Error', data.message || 'Could not request refund');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Could not process refund request');
                        } finally {
                            setUpdatingOrder(null);
                        }
                    },
                },
            ]
        );
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
            case 'refund_requested': return '#f59e0b';
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

    const getNextStatus = (currentStatus) => {
        switch (currentStatus) {
            case 'pending':
            case 'confirmed':
                return 'shipped';
            case 'shipped':
                return 'delivered';
            default:
                return null;
        }
    };

    const renderOrder = ({ item }) => {
        const nextStatus = activeTab === 'seller' ? getNextStatus(item.status) : null;
        const isUpdating = updatingOrder === item._id;
        const canRequestRefund = activeTab === 'buyer' &&
            item.paymentStatus === 'paid' &&
            item.status !== 'delivered' &&
            item.paymentStatus !== 'refund_requested' &&
            item.paymentStatus !== 'refunded';

        return (
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

                {/* Buyer info for sellers */}
                {activeTab === 'seller' && item.buyerId && (
                    <View style={styles.buyerInfo}>
                        <Ionicons name="person" size={14} color="#6fdfc4" />
                        <View>
                            <Text style={styles.buyerName}>
                                Buyer: {item.buyerId.fullName || 'Unknown'}
                            </Text>
                            {item.buyerId.phone && (
                                <Text style={styles.buyerPhone}>
                                    {item.buyerId.phone}
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                {/* Delivery Address for sellers */}
                {activeTab === 'seller' && item.deliveryAddress && (
                    <View style={styles.addressInfo}>
                        <Ionicons name="location" size={14} color="#6fdfc4" />
                        <Text style={styles.addressText} numberOfLines={2}>
                            {item.deliveryAddress.street}, {item.deliveryAddress.city}
                        </Text>
                    </View>
                )}

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
                        <Text style={styles.statusText}>
                            {item.paymentStatus.replace('_', ' ').toUpperCase()}
                        </Text>
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

                {/* Seller Action Buttons */}
                {activeTab === 'seller' && nextStatus && item.paymentStatus === 'paid' && (
                    <TouchableOpacity
                        style={[styles.actionButton, isUpdating && styles.actionButtonDisabled]}
                        onPress={() => updateOrderStatus(item._id, nextStatus)}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <ActivityIndicator size="small" color="#0a1f1c" />
                        ) : (
                            <>
                                <Ionicons
                                    name={nextStatus === 'shipped' ? 'airplane' : 'checkmark-done'}
                                    size={18}
                                    color="#0a1f1c"
                                />
                                <Text style={styles.actionButtonText}>
                                    Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {/* Rate Order Button */}
                {activeTab === 'buyer' && item.status === 'delivered' && (
                    <TouchableOpacity
                        style={styles.reviewButton}
                        onPress={() => router.push({
                            pathname: '/marketplace/review',
                            params: {
                                orderId: item._id,
                                listingTitle: item.listingId?.title,
                                listingImage: item.listingId?.imageUrl,
                            }
                        })}
                    >
                        <Ionicons name="star" size={16} color="#0a1f1c" />
                        <Text style={styles.reviewButtonText}>Rate Order</Text>
                    </TouchableOpacity>
                )}

                {/* Buyer Refund Button */}
                {canRequestRefund && (
                    <TouchableOpacity
                        style={[styles.refundButton, isUpdating && styles.actionButtonDisabled]}
                        onPress={() => requestRefund(item._id)}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <ActivityIndicator size="small" color="#ef4444" />
                        ) : (
                            <>
                                <Ionicons name="return-down-back" size={16} color="#ef4444" />
                                <Text style={styles.refundButtonText}>Request Refund</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderVerificationCard = () => {
        if (!currentUser || currentUser.isVerified) return null;

        if (currentUser.verificationStatus === 'pending') {
            return (
                <View style={[styles.verificationCard, styles.pendingCard]}>
                    <Ionicons name="time" size={24} color="#0a1f1c" />
                    <View style={styles.verificationTextContainer}>
                        <Text style={styles.verificationTitle}>Verification Pending</Text>
                        <Text style={styles.verificationSubtitle}>We are reviewing your details</Text>
                    </View>
                </View>
            );
        }

        return (
            <TouchableOpacity
                style={styles.verificationCard}
                onPress={() => router.push('/marketplace/verification')}
            >
                <View style={styles.verificationContent}>
                    <Ionicons name="shield-checkmark" size={24} color="#0a1f1c" />
                    <View style={styles.verificationTextContainer}>
                        <Text style={styles.verificationTitle}>Become a Verified Seller</Text>
                        <Text style={styles.verificationSubtitle}>Get a badge and build trust</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#0a1f1c" />
            </TouchableOpacity>
        );
    };

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
                ListHeaderComponent={activeTab === 'seller' ? renderVerificationCard : null}
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
        marginBottom: 10,
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
    buyerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 6,
    },
    buyerName: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
    },
    addressInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        gap: 6,
    },
    addressText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        flex: 1,
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
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6fdfc4',
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 12,
        gap: 8,
    },
    actionButtonDisabled: {
        opacity: 0.6,
    },
    actionButtonText: {
        color: '#0a1f1c',
        fontWeight: 'bold',
        fontSize: 14,
    },
    refundButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#ef4444',
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 12,
        gap: 6,
    },
    refundButtonText: {
        color: '#ef4444',
        fontWeight: '600',
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
    buyerPhone: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginTop: 2,
    },
    reviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f59e0b',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
        marginBottom: 10,
    },
    reviewButtonText: {
        color: '#0a1f1c',
        fontWeight: 'bold',
        fontSize: 14,
    },
    loadingText: {
        color: '#6fdfc4',
        marginTop: 15,
        fontSize: 16,
    },
    verificationCard: {
        backgroundColor: '#6fdfc4',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pendingCard: {
        backgroundColor: 'rgba(111, 223, 196, 0.5)',
    },
    verificationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    verificationTextContainer: {
        marginLeft: 10,
    },
    verificationTitle: {
        color: '#0a1f1c',
        fontWeight: 'bold',
        fontSize: 16,
    },
    verificationSubtitle: {
        color: '#0a1f1c',
        fontSize: 12,
        opacity: 0.8,
    },
});
