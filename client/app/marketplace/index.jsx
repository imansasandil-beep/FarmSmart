import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Linking,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://192.168.8.119:5000'; // Update this to your server IP

export default function MarketplaceScreen() {
    const router = useRouter();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchListings = async () => {
        try {
            const response = await fetch(`${API_URL}/api/marketplace`);
            const data = await response.json();
            setListings(data);
        } catch (error) {
            console.error('Error fetching listings:', error);
            Alert.alert('Error', 'Could not load marketplace listings. Please check your connection.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Refresh listings when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchListings();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchListings();
    };

    const handleCallSeller = (phone) => {
        const phoneUrl = `tel:${phone}`;
        Linking.canOpenURL(phoneUrl)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(phoneUrl);
                } else {
                    Alert.alert('Error', 'Phone dialer is not available on this device');
                }
            })
            .catch((err) => console.error('Error opening phone dialer:', err));
    };

    const handleWhatsApp = (phone) => {
        // Remove any non-numeric characters from phone
        const cleanPhone = phone.replace(/\D/g, '');
        const whatsappUrl = `whatsapp://send?phone=${cleanPhone}`;
        Linking.canOpenURL(whatsappUrl)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(whatsappUrl);
                } else {
                    Alert.alert('Error', 'WhatsApp is not installed on this device');
                }
            })
            .catch((err) => console.error('Error opening WhatsApp:', err));
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardPrice}>Rs. {item.price}</Text>
            </View>

            <View style={styles.cardDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="cube-outline" size={16} color="#6fdfc4" />
                    <Text style={styles.detailText}>Qty: {item.quantity}</Text>
                </View>

                {item.location ? (
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color="#6fdfc4" />
                        <Text style={styles.detailText}>{item.location}</Text>
                    </View>
                ) : null}

                {item.sellerName ? (
                    <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={16} color="#6fdfc4" />
                        <Text style={styles.detailText}>{item.sellerName}</Text>
                    </View>
                ) : null}
            </View>

            {item.description ? (
                <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            ) : null}

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCallSeller(item.sellerPhone)}
                >
                    <Ionicons name="call" size={18} color="white" />
                    <Text style={styles.buttonText}>Call Seller</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={() => handleWhatsApp(item.sellerPhone)}
                >
                    <Ionicons name="logo-whatsapp" size={18} color="white" />
                    <Text style={styles.buttonText}>WhatsApp</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={80} color="#6fdfc4" />
            <Text style={styles.emptyTitle}>No Listings Yet</Text>
            <Text style={styles.emptySubtitle}>Be the first to post a crop for sale!</Text>
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
                <View style={{ width: 40 }} />
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

            {/* Floating Action Button */}
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
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#6fdfc4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        flex: 1,
        marginRight: 10,
    },
    cardPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6fdfc4',
    },
    cardDetails: {
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailText: {
        color: 'rgba(255,255,255,0.8)',
        marginLeft: 8,
        fontSize: 14,
    },
    cardDescription: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        marginBottom: 12,
        lineHeight: 18,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    callButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2d7d6e',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 6,
    },
    whatsappButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#25D366',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 6,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
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
