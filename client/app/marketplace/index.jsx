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

/**
 * Category options for filtering
 * These match what we defined in the Listing schema
 */
const CATEGORIES = [
    { id: 'all', label: 'All', icon: 'grid' },
    { id: 'crops', label: 'Crops', icon: 'leaf' },
    { id: 'vegetables', label: 'Vegetables', icon: 'nutrition' },
    { id: 'fruits', label: 'Fruits', icon: 'cafe' },
    { id: 'grains', label: 'Grains', icon: 'grid' },
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

/**
 * MarketplaceScreen
 * The main browse page where users can see all listings,
 * filter by category, search, and tap to buy.
 */
export default function MarketplaceScreen() {
    const router = useRouter();

    // State for listings and loading
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // State for filters and search
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Current user info (for showing "My Listing" badges, etc.)
    const [currentUserId, setCurrentUserId] = useState(null);

    /**
     * Fetch all listings from the API
     * This runs on screen focus so we always see fresh data
     */
    const fetchListings = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/marketplace`);
            const data = await response.json();

            if (response.ok) {
                setListings(data);
            } else {
                console.error('Failed to fetch listings:', data.message);
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
            Alert.alert('Error', 'Failed to load listings. Please check your connection.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Get current user ID from storage
    const loadCurrentUser = useCallback(async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const parsed = JSON.parse(userData);
                setCurrentUserId(parsed._id || parsed.id);
            }
        } catch (error) {
            console.error('Error loading user:', error);
        }
    }, []);

    // Fetch listings when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadCurrentUser();
            fetchListings();
        }, [fetchListings, loadCurrentUser])
    );

    // Pull to refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchListings();
    }, [fetchListings]);

    /**
     * Filter and sort listings based on user selections
     * Using useMemo so we don't recalculate on every render
     */
    const filteredListings = useMemo(() => {
        let result = [...listings];

        // Filter by category
        if (selectedCategory !== 'all') {
            result = result.filter(item =>
                item.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // Filter by search query (title or description)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.title?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query)
            );
        }

        // Sort
        switch (sortBy) {
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'price_low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price_high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
            default:
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }

        return result;
    }, [listings, selectedCategory, searchQuery, sortBy]);

    // Clear all filters
    const clearFilters = () => {
        setSelectedCategory('all');
        setSearchQuery('');
        setSortBy('newest');
    };

    /**
     * Handle "Buy Now" button tap
     * TODO: Will navigate to checkout screen (coming later)
     */
    const handleBuyNow = (item) => {
        if (!currentUserId) {
            Alert.alert('Login Required', 'Please log in to make a purchase.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Login', onPress: () => router.push('/login') },
            ]);
            return;
        }

        // Don't let users buy their own listings
        const sellerId = item.sellerId?._id || item.sellerId;
        if (sellerId === currentUserId) {
            Alert.alert('Oops!', "You can't buy your own listing.");
            return;
        }

        // Navigate to checkout (we'll create this screen later)
        router.push({
            pathname: '/marketplace/checkout',
            params: { listingId: item._id },
        });
    };

    /**
     * Render a single category chip for filtering
     */
    const renderCategoryChip = (category) => {
        const isSelected = selectedCategory === category.id;
        return (
            <TouchableOpacity
                key={category.id}
                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                onPress={() => setSelectedCategory(category.id)}
            >
                <Ionicons
                    name={category.icon}
                    size={16}
                    color={isSelected ? '#fff' : '#1a4d45'}
                />
                <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                    {category.label}
                </Text>
            </TouchableOpacity>
        );
    };

    /**
     * Render a single listing card
     * Shows image, title, price, seller info, and buy button
     */
    const renderItem = ({ item }) => {
        const sellerId = item.sellerId?._id || item.sellerId;
        const isOwnListing = sellerId === currentUserId;
        const sellerName = item.sellerId?.fullName || 'Unknown Seller';
        const isVerified = item.sellerId?.isVerified;
        const rating = item.sellerId?.averageRating || 0;

        return (
            <View style={styles.card}>
                {/* Product Image */}
                <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />

                {/* Own listing badge */}
                {isOwnListing && (
                    <View style={styles.ownBadge}>
                        <Text style={styles.ownBadgeText}>Your Listing</Text>
                    </View>
                )}

                <View style={styles.cardContent}>
                    {/* Title and Price */}
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.cardPrice}>Rs. {item.price?.toLocaleString()}</Text>

                    {/* Quantity available */}
                    <Text style={styles.cardQuantity}>
                        {item.availableQuantity} {item.unit} available
                    </Text>

                    {/* Seller info */}
                    <View style={styles.sellerRow}>
                        <Text style={styles.sellerName} numberOfLines={1}>
                            {sellerName}
                        </Text>
                        {isVerified && (
                            <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                        )}
                        {rating > 0 && (
                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                            </View>
                        )}
                    </View>

                    {/* Location */}
                    {item.location ? (
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={14} color="#888" />
                            <Text style={styles.locationText} numberOfLines={1}>
                                {item.location}
                            </Text>
                        </View>
                    ) : null}

                    {/* Buy button */}
                    <TouchableOpacity
                        style={[styles.buyButton, isOwnListing && styles.buyButtonDisabled]}
                        onPress={() => handleBuyNow(item)}
                        disabled={isOwnListing}
                    >
                        <Text style={styles.buyButtonText}>
                            {isOwnListing ? 'Your Listing' : 'Buy Now'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Empty state when no listings match filters
    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No listings found</Text>
            <Text style={styles.emptySubtitle}>
                {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Be the first to add a listing!'}
            </Text>
        </View>
    );

    // Loading state
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1a4d45" />
                <Text style={styles.loadingText}>Loading marketplace...</Text>
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
                <Text style={styles.headerTitle}>Marketplace</Text>
                <TouchableOpacity
                    onPress={() => router.push('/marketplace/add')}
                    style={styles.addButton}
                >
                    <Ionicons name="add-circle" size={28} color="#1a4d45" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#888" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        placeholderTextColor="#888"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#888" />
                        </TouchableOpacity>
                    ) : null}
                </View>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowFilterModal(true)}
                >
                    <Ionicons name="options-outline" size={22} color="#1a4d45" />
                </TouchableOpacity>
            </View>

            {/* Category Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryScrollContent}
            >
                {CATEGORIES.map(renderCategoryChip)}
            </ScrollView>

            {/* Results count */}
            <View style={styles.resultsRow}>
                <Text style={styles.resultsText}>
                    {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
                </Text>
                {(searchQuery || selectedCategory !== 'all' || sortBy !== 'newest') && (
                    <TouchableOpacity onPress={clearFilters}>
                        <Text style={styles.clearFiltersText}>Clear filters</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Listings Grid */}
            <FlatList
                data={filteredListings}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyList}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#1a4d45']}
                        tintColor="#1a4d45"
                    />
                }
            />

            {/* Filter/Sort Modal */}
            <Modal
                visible={showFilterModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Sort By</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {SORT_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.sortOption,
                                    sortBy === option.id && styles.sortOptionSelected,
                                ]}
                                onPress={() => {
                                    setSortBy(option.id);
                                    setShowFilterModal(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.sortOptionText,
                                        sortBy === option.id && styles.sortOptionTextSelected,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                                {sortBy === option.id && (
                                    <Ionicons name="checkmark" size={20} color="#1a4d45" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a4d45',
    },
    addButton: {
        padding: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        gap: 10,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 44,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: '#333',
    },
    filterButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
    },
    categoryScroll: {
        backgroundColor: '#fff',
        maxHeight: 50,
    },
    categoryScrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#e8f5e9',
        marginRight: 8,
        gap: 4,
    },
    categoryChipSelected: {
        backgroundColor: '#1a4d45',
    },
    categoryChipText: {
        fontSize: 13,
        color: '#1a4d45',
        fontWeight: '500',
    },
    categoryChipTextSelected: {
        color: '#fff',
    },
    resultsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    resultsText: {
        fontSize: 14,
        color: '#666',
    },
    clearFiltersText: {
        fontSize: 14,
        color: '#1a4d45',
        fontWeight: '500',
    },
    listContent: {
        paddingHorizontal: 8,
        paddingBottom: 20,
    },
    row: {
        justifyContent: 'space-between',
    },
    card: {
        flex: 1,
        margin: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        maxWidth: '47%',
    },
    cardImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#e0e0e0',
    },
    ownBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#1a4d45',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    ownBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardContent: {
        padding: 10,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    cardPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a4d45',
        marginBottom: 2,
    },
    cardQuantity: {
        fontSize: 12,
        color: '#888',
        marginBottom: 6,
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    sellerName: {
        fontSize: 12,
        color: '#666',
        flex: 1,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    ratingText: {
        fontSize: 11,
        color: '#666',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    locationText: {
        fontSize: 11,
        color: '#888',
        flex: 1,
    },
    buyButton: {
        backgroundColor: '#1a4d45',
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    buyButtonDisabled: {
        backgroundColor: '#ccc',
    },
    buyButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sortOptionSelected: {
        backgroundColor: '#f0f8f0',
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    sortOptionText: {
        fontSize: 16,
        color: '#333',
    },
    sortOptionTextSelected: {
        color: '#1a4d45',
        fontWeight: '600',
    },
});
