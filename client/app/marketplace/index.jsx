import React, { useState, useCallback, useMemo } from 'react';
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
    TextInput,
    Modal,
    ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config';

// Crop categories for filtering
const CROP_CATEGORIES = [
    { id: 'all', label: 'All Crops', icon: 'leaf' },
    { id: 'vegetables', label: 'Vegetables', icon: 'nutrition' },
    { id: 'fruits', label: 'Fruits', icon: 'egg' },
    { id: 'grains', label: 'Grains & Rice', icon: 'grid' },
    { id: 'spices', label: 'Spices', icon: 'flame' },
    { id: 'dairy', label: 'Dairy', icon: 'water' },
    { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

const SORT_OPTIONS = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'price_low', label: 'Price: Low to High' },
    { id: 'price_high', label: 'Price: High to Low' },
];

export default function MarketplaceScreen() {
    const router = useRouter();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter states
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSort, setSelectedSort] = useState('newest');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const fetchListings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/marketplace`);
            const data = await response.json();
            const activeListings = Array.isArray(data)
                ? data.filter(item => item.isActive !== false && item.availableQuantity > 0)
                : [];
            setListings(activeListings);
        } catch (error) {
            console.error('Error fetching listings:', error);
            Alert.alert('Error', 'Could not load marketplace listings.');
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

    // Apply filters and sorting
    const filteredListings = useMemo(() => {
        let result = [...listings];

        // Search filter
        if (searchText.trim()) {
            const search = searchText.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(search) ||
                (item.description && item.description.toLowerCase().includes(search)) ||
                (item.location && item.location.toLowerCase().includes(search))
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            result = result.filter(item => {
                const itemCategory = (item.category || 'other').toLowerCase();
                return itemCategory === selectedCategory ||
                    (selectedCategory === 'vegetables' && itemCategory === 'crops');
            });
        }

        // Price range filter
        if (minPrice) {
            result = result.filter(item => item.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            result = result.filter(item => item.price <= parseFloat(maxPrice));
        }

        // Sorting
        switch (selectedSort) {
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'price_low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price_high':
                result.sort((a, b) => b.price - a.price);
                break;
        }

        return result;
    }, [listings, searchText, selectedCategory, selectedSort, minPrice, maxPrice]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchListings();
    };

    const clearFilters = () => {
        setSearchText('');
        setSelectedCategory('all');
        setSelectedSort('newest');
        setMinPrice('');
        setMaxPrice('');
    };

    const handleBuyNow = async (item) => {
        const user = await AsyncStorage.getItem('user');
        if (!user) {
            Alert.alert('Login Required', 'Please login to make a purchase', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Login', onPress: () => router.push('/') },
            ]);
            return;
        }

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

    const handleMessageSeller = async (item) => {
        const userStr = await AsyncStorage.getItem('user');
        if (!userStr) {
            Alert.alert('Login Required', 'Please login to message the seller');
            return;
        }
        const user = JSON.parse(userStr);

        // Get the seller ID as a string (sellerId may be populated as object or just a string)
        const sellerIdStr = item.sellerId?._id || item.sellerId;
        const sellerName = item.sellerId?.fullName || 'Seller';

        if (user._id === sellerIdStr) {
            Alert.alert('Note', 'This is your own listing');
            return;
        }

        // Fetch conversation ID
        try {
            const response = await fetch(`${API_BASE_URL}/api/messages/conversation-id/${user._id}/${sellerIdStr}`);
            const data = await response.json();

            if (response.ok) {
                router.push({
                    pathname: `/marketplace/chat/${data.conversationId}`,
                    params: {
                        receiverId: sellerIdStr,
                        receiverName: sellerName,
                    },
                });
            }
        } catch (error) {
            console.error('Error starting chat:', error);
            Alert.alert('Error', 'Could not start chat');
        }
    };

    const renderCategoryChip = (category) => (
        <TouchableOpacity
            key={category.id}
            style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
        >
            <Ionicons
                name={category.icon}
                size={14}
                color={selectedCategory === category.id ? '#0a1f1c' : '#6fdfc4'}
                style={{ marginTop: 1 }}
            />
            <Text style={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.categoryChipTextActive
            ]}>
                {category.label}
            </Text>
        </TouchableOpacity>
    );

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
            />

            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                        <View style={styles.sellerRow}>
                            <Text style={styles.sellerName} numberOfLines={1}>
                                {item.sellerId?.fullName || 'Seller'}
                            </Text>
                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={10} color="#f59e0b" />
                                <Text style={styles.ratingText}>
                                    {item.sellerId?.averageRating ? item.sellerId.averageRating.toFixed(1) : 'New'}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.cardPrice}>Rs. {item.price}/{item.unit || 'kg'}</Text>
                </View>

                {item.category && (
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{item.category}</Text>
                    </View>
                )}

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

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.messageButton}
                        onPress={() => handleMessageSeller(item)}
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={22} color="#6fdfc4" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.buyButton}
                        onPress={() => handleBuyNow(item)}
                    >
                        <Ionicons name="cart" size={18} color="#0a1f1c" />
                        <Text style={styles.buyButtonText}>Buy Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={80} color="#6fdfc4" />
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptySubtitle}>
                {searchText || selectedCategory !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Check back later for fresh produce!'}
            </Text>
            {(searchText || selectedCategory !== 'all') && (
                <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearFilters}>
                    <Text style={styles.clearFiltersBtnText}>Clear Filters</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // Filter Modal
    const renderFilterModal = () => (
        <Modal
            visible={showFilters}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowFilters(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filters</Text>
                        <TouchableOpacity onPress={() => setShowFilters(false)}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Price Range */}
                        <Text style={styles.filterLabel}>Price Range (Rs.)</Text>
                        <View style={styles.priceRow}>
                            <TextInput
                                style={styles.priceInput}
                                placeholder="Min"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                keyboardType="numeric"
                                value={minPrice}
                                onChangeText={setMinPrice}
                            />
                            <Text style={styles.priceSeparator}>to</Text>
                            <TextInput
                                style={styles.priceInput}
                                placeholder="Max"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                keyboardType="numeric"
                                value={maxPrice}
                                onChangeText={setMaxPrice}
                            />
                        </View>

                        {/* Sort */}
                        <Text style={styles.filterLabel}>Sort By</Text>
                        <View style={styles.sortOptions}>
                            {SORT_OPTIONS.map(option => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.sortOption,
                                        selectedSort === option.id && styles.sortOptionActive
                                    ]}
                                    onPress={() => setSelectedSort(option.id)}
                                >
                                    <Text style={[
                                        styles.sortOptionText,
                                        selectedSort === option.id && styles.sortOptionTextActive
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Category in Modal */}
                        <Text style={styles.filterLabel}>Crop Category</Text>
                        <View style={styles.modalCategories}>
                            {CROP_CATEGORIES.map(category => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.modalCategoryItem,
                                        selectedCategory === category.id && styles.modalCategoryItemActive
                                    ]}
                                    onPress={() => setSelectedCategory(category.id)}
                                >
                                    <Ionicons
                                        name={category.icon}
                                        size={20}
                                        color={selectedCategory === category.id ? '#0a1f1c' : '#6fdfc4'}
                                    />
                                    <Text style={[
                                        styles.modalCategoryText,
                                        selectedCategory === category.id && styles.modalCategoryTextActive
                                    ]}>
                                        {category.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Modal Actions */}
                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.clearBtn}
                            onPress={clearFilters}
                        >
                            <Text style={styles.clearBtnText}>Clear All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.applyBtn}
                            onPress={() => setShowFilters(false)}
                        >
                            <Text style={styles.applyBtnText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#6fdfc4" />
                <Text style={styles.loadingText}>Loading marketplace...</Text>
            </View>
        );
    }

    const activeFiltersCount = [
        searchText,
        selectedCategory !== 'all',
        minPrice,
        maxPrice,
        selectedSort !== 'newest'
    ].filter(Boolean).length;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Marketplace</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => router.push('/marketplace/chat')} style={styles.headerBtn}>
                        <Ionicons name="chatbubbles-outline" size={22} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/marketplace/orders')} style={styles.headerBtn}>
                        <Ionicons name="receipt-outline" size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search crops, vegetables, fruits..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText ? (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    ) : null}
                </View>
                <TouchableOpacity
                    style={[styles.filterBtn, activeFiltersCount > 0 && styles.filterBtnActive]}
                    onPress={() => setShowFilters(true)}
                >
                    <Ionicons name="options" size={22} color="white" />
                    {activeFiltersCount > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Category Chips */}
            <View style={{ height: 44, marginBottom: 10 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScrollContent}
                >
                    {CROP_CATEGORIES.map(renderCategoryChip)}
                </ScrollView>
            </View>

            {/* Results Count */}
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                    {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
                </Text>
                {activeFiltersCount > 0 && (
                    <TouchableOpacity onPress={clearFilters}>
                        <Text style={styles.clearFiltersText}>Clear filters</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Listings */}
            <FlatList
                data={filteredListings}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                ListEmptyComponent={renderEmptyList}
                contentContainerStyle={filteredListings.length === 0 ? styles.emptyList : styles.listContent}
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

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/marketplace/add')}
            >
                <Ionicons name="add" size={30} color="#0a1f1c" />
            </TouchableOpacity>

            {renderFilterModal()}
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
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 10,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 48,
    },
    searchInput: {
        flex: 1,
        color: 'white',
        marginLeft: 10,
        fontSize: 15,
    },
    filterBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBtnActive: {
        backgroundColor: '#6fdfc4',
    },
    filterBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#ff6b6b',
        borderRadius: 10,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },

    // Categories
    categoryScrollContent: {
        paddingHorizontal: 20,
        paddingRight: 30,
        gap: 10,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: 'rgba(111, 223, 196, 0.15)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(111, 223, 196, 0.3)',
        gap: 5,
    },
    categoryChipActive: {
        backgroundColor: '#6fdfc4',
        borderColor: '#6fdfc4',
    },
    categoryChipText: {
        color: '#6fdfc4',
        fontSize: 12,
        fontWeight: '600',
    },
    categoryChipTextActive: {
        color: '#0a1f1c',
    },

    // Results Header
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    resultsCount: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
    },
    clearFiltersText: {
        color: '#6fdfc4',
        fontSize: 13,
        fontWeight: '500',
    },

    // Cards
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
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    sellerName: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginRight: 8,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 3,
    },
    ratingText: {
        color: '#f59e0b',
        fontSize: 10,
        fontWeight: 'bold',
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
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(111, 223, 196, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    categoryBadgeText: {
        color: '#6fdfc4',
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'capitalize',
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
        flex: 1,
    },
    buyButtonText: {
        color: '#0a1f1c',
        fontWeight: 'bold',
        fontSize: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 5,
    },
    messageButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: 'rgba(111, 223, 196, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(111, 223, 196, 0.3)',
    },

    // Empty State
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
    clearFiltersBtn: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#6fdfc4',
        borderRadius: 20,
    },
    clearFiltersBtnText: {
        color: '#0a1f1c',
        fontWeight: 'bold',
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

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1a4d45',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    filterLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 15,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    priceInput: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        color: 'white',
        fontSize: 16,
    },
    priceSeparator: {
        color: 'rgba(255,255,255,0.5)',
    },
    sortOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    sortOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    sortOptionActive: {
        backgroundColor: '#6fdfc4',
    },
    sortOptionText: {
        color: 'white',
        fontSize: 13,
    },
    sortOptionTextActive: {
        color: '#0a1f1c',
        fontWeight: '600',
    },
    modalCategories: {
        gap: 10,
    },
    modalCategoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        gap: 12,
    },
    modalCategoryItemActive: {
        backgroundColor: '#6fdfc4',
    },
    modalCategoryText: {
        color: 'white',
        fontSize: 15,
    },
    modalCategoryTextActive: {
        color: '#0a1f1c',
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 25,
    },
    clearBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
    },
    clearBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    applyBtn: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#6fdfc4',
        alignItems: 'center',
    },
    applyBtnText: {
        color: '#0a1f1c',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
