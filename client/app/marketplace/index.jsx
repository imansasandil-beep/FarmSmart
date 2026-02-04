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

export default function MarketplaceScreen() {
    const router = useRouter();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchListings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/marketplace`);
            const data = await response.json();
            // Only show active listings with available stock
            const activeListings = Array.isArray(data)
                ? data.filter(item => item.isActive !== false && item.availableQuantity > 0)
                : [];
            setListings(activeListings);
        } catch (error) {
            console.error('Error fetching listings:', error);
            Alert.alert('Error', 'Could not load marketplace listings. Please check your connection.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchListings();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchListings();
    };

    const handleBuyNow = async (item) => {
        // Check if user is logged in
        const user = await AsyncStorage.getItem('user');
        if (!user) {
            Alert.alert('Login Required', 'Please login to make a purchase', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Login', onPress: () => router.push('/') },
            ]);
            return;
        }

        // Navigate to checkout with listing info
        router.push({
            pathname: '/marketplace/checkout',
            params: {
                listingId: item._id,
                title: item.title,
                price: item.price,
                availableQuantity: item.availableQuantity,
                unit: item.unit || 'kg',
                imageUrl: item.imageUrl,
                location: item.location,
            },
        });
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            {/* Product Image */}
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
            />

            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.cardPrice}>Rs. {item.price}/{item.unit || 'kg'}</Text>
                </View>

                <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                        <Ionicons name="cube-outline" size={14} color="#6fdfc4" />
                        <Text style={styles.detailText}>
                            {item.availableQuantity} {item.unit || 'kg'} available
                        </Text>
                    </View>

                    {item.location ? (
                        <View style={styles.detailRow}>
                            <Ionicons name="location-outline" size={14} color="#6fdfc4" />
                            <Text style={styles.detailText} numberOfLines={1}>{item.location}</Text>
                        </View>
                    ) : null}
                </View>

                {item.description ? (
                    <Text style={styles.cardDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                ) : null}

                {/* Buy Now Button */}
                <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => handleBuyNow(item)}
                >
                    <Ionicons name="cart" size={18} color="white" />
                    <Text style={styles.buyButtonText}>Buy Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={80} color="#6fdfc4" />
            <Text style={styles.emptyTitle}>No Listings Available</Text>
            <Text style={styles.emptySubtitle}>Check back later for fresh produce!</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#6fdfc4" />
                <Text style={styles.loadingText}>Loading marketplace...</Text>
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
                <Text style={styles.headerTitle}>Marketplace</Text>
                <TouchableOpacity
                    onPress={() => router.push('/marketplace/orders')}
                    style={styles.ordersButton}
                >
                    <Ionicons name="receipt-outline" size={22} color="white" />
                </TouchableOpacity>
            </View>

            {/* Listings */}
            <FlatList
                data={listings}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                ListEmptyComponent={renderEmptyList}
                contentContainerStyle={listings.length === 0 ? styles.emptyList : styles.listContent}
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

            {/* FAB for adding listing */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/marketplace/add')}
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
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
        paddingBottom: 20,
        backgroundColor: '#0a1f1c',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ordersButton: {
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
        paddingBottom: 100,
    },
    emptyList: {
        flex: 1,
    },
    card: {
        backgroundColor: '#1a4d45',
        borderRadius: 15,
        marginBottom: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(111, 223, 196, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#0a1f1c',
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        flex: 1,
        marginRight: 10,
    },
    cardPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6fdfc4',
    },
    cardDetails: {
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailText: {
        color: 'rgba(255,255,255,0.7)',
        marginLeft: 6,
        fontSize: 13,
    },
    cardDescription: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginBottom: 12,
        lineHeight: 16,
    },
    buyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6fdfc4',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    buyButtonText: {
        color: '#0a1f1c',
        fontWeight: 'bold',
        fontSize: 16,
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
    fab: {
        position: 'absolute',
        right: 25,
        bottom: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#6fdfc4',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
});
