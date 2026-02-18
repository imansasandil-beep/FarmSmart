import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config';

/**
 * Checkout Screen
 * Shows order summary, calculates delivery fees,
 * and handles payment (Stripe or dev mode).
 */
export default function CheckoutScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Listing data from route params
    const { listingId, title, price, availableQuantity, unit, imageUrl, location } = params;

    // Form state
    const [quantity, setQuantity] = useState('1');
    const [deliveryAddress, setDeliveryAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
    });

    // Delivery quote
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [deliveryDistance, setDeliveryDistance] = useState(null);
    const [deliveryTime, setDeliveryTime] = useState('');
    const [loadingQuote, setLoadingQuote] = useState(false);

    // Payment
    const [processing, setProcessing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Platform fee is 2%
    const PLATFORM_FEE_PERCENT = 2;

    // Load current user on mount
    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                setCurrentUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Error loading user:', error);
        }
    };

    // Calculate price breakdown
    const unitPrice = Number(price) || 0;
    const qty = Number(quantity) || 1;
    const subtotal = unitPrice * qty;
    const platformFee = Math.round(subtotal * PLATFORM_FEE_PERCENT / 100);
    const totalAmount = subtotal + platformFee + deliveryFee;
    const sellerPayout = subtotal - platformFee;

    /**
     * Get a delivery fee quote from the API
     * Based on distance between seller's location and buyer's city
     */
    const getDeliveryQuote = async () => {
        if (!deliveryAddress.city.trim()) {
            Alert.alert('Enter City', 'Please enter your city to calculate delivery fees');
            return;
        }

        try {
            setLoadingQuote(true);
            const response = await fetch(`${API_BASE_URL}/api/delivery/quote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pickupLocation: location || '',
                    deliveryLocation: deliveryAddress.city,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setDeliveryFee(data.deliveryFee);
                setDeliveryDistance(data.distance);
                setDeliveryTime(data.estimatedTime);
            } else {
                Alert.alert('Error', data.message || 'Could not get delivery quote');
            }
        } catch (error) {
            console.error('Quote error:', error);
            Alert.alert('Error', 'Failed to get delivery quote');
        } finally {
            setLoadingQuote(false);
        }
    };

    /**
     * Validate the order before processing payment
     */
    const validateOrder = () => {
        const qtyNum = Number(quantity);
        if (!qtyNum || qtyNum < 1) {
            Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
            return false;
        }
        if (qtyNum > Number(availableQuantity)) {
            Alert.alert('Not Enough Stock', `Only ${availableQuantity} ${unit} available`);
            return false;
        }
        if (!deliveryAddress.city.trim()) {
            Alert.alert('Missing Address', 'Please enter your delivery address');
            return false;
        }
        if (!currentUser) {
            Alert.alert('Not Logged In', 'Please log in to place an order');
            return false;
        }
        return true;
    };

    /**
     * Process the order
     * In dev mode: creates the order directly
     * In production: would initiate Stripe payment first
     */
    const handlePlaceOrder = async () => {
        if (!validateOrder()) return;

        try {
            setProcessing(true);

            // Fetch the full listing to get sellerId
            const listingResponse = await fetch(`${API_BASE_URL}/api/marketplace/${listingId}`);
            const listing = await listingResponse.json();

            if (!listingResponse.ok) {
                Alert.alert('Error', 'Could not find listing');
                return;
            }

            const sellerId = listing.sellerId?._id || listing.sellerId;

            // Don't let users buy their own stuff
            if (sellerId === (currentUser._id || currentUser.id)) {
                Alert.alert('Oops!', "You can't buy your own listing");
                return;
            }

            // Build the order
            const orderData = {
                buyerId: currentUser._id || currentUser.id,
                sellerId,
                listingId,
                quantity: Number(quantity),
                unitPrice,
                subtotal,
                platformFeePercent: PLATFORM_FEE_PERCENT,
                platformFee,
                deliveryFee,
                totalAmount,
                sellerPayout,
                deliveryAddress: {
                    street: deliveryAddress.street,
                    city: deliveryAddress.city,
                    state: deliveryAddress.state,
                    zipCode: deliveryAddress.zipCode,
                    country: 'Sri Lanka',
                },
                paymentStatus: 'paid', // Dev mode: auto-mark as paid
                status: 'confirmed',
            };

            // Create the order
            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert(
                    'Order Placed!',
                    `Your order for ${quantity} ${unit} of ${title} has been confirmed.`,
                    [{ text: 'View Orders', onPress: () => router.push('/marketplace/orders') }]
                );
            } else {
                Alert.alert('Error', data.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Order error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a4d45" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Product Summary */}
                <View style={styles.productCard}>
                    <Image source={{ uri: imageUrl }} style={styles.productImage} />
                    <View style={styles.productInfo}>
                        <Text style={styles.productTitle} numberOfLines={2}>{title}</Text>
                        <Text style={styles.productPrice}>Rs. {unitPrice} / {unit || 'kg'}</Text>
                        <Text style={styles.productAvailable}>
                            {availableQuantity} {unit || 'kg'} available
                        </Text>
                        {location ? (
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={14} color="#888" />
                                <Text style={styles.locationText}>{location}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                {/* Quantity Selector */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quantity</Text>
                    <View style={styles.quantityRow}>
                        <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => {
                                const current = Number(quantity) || 1;
                                if (current > 1) setQuantity(String(current - 1));
                            }}
                        >
                            <Ionicons name="remove" size={20} color="#1a4d45" />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.qtyInput}
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="numeric"
                            textAlign="center"
                        />
                        <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => {
                                const current = Number(quantity) || 0;
                                if (current < Number(availableQuantity)) {
                                    setQuantity(String(current + 1));
                                }
                            }}
                        >
                            <Ionicons name="add" size={20} color="#1a4d45" />
                        </TouchableOpacity>
                        <Text style={styles.qtyUnit}>{unit || 'kg'}</Text>
                    </View>
                </View>

                {/* Delivery Address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Street Address"
                        placeholderTextColor="#999"
                        value={deliveryAddress.street}
                        onChangeText={(text) => setDeliveryAddress(prev => ({ ...prev, street: text }))}
                    />
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, styles.halfInput]}
                            placeholder="City *"
                            placeholderTextColor="#999"
                            value={deliveryAddress.city}
                            onChangeText={(text) => setDeliveryAddress(prev => ({ ...prev, city: text }))}
                        />
                        <TextInput
                            style={[styles.input, styles.halfInput]}
                            placeholder="Province"
                            placeholderTextColor="#999"
                            value={deliveryAddress.state}
                            onChangeText={(text) => setDeliveryAddress(prev => ({ ...prev, state: text }))}
                        />
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Postal Code"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={deliveryAddress.zipCode}
                        onChangeText={(text) => setDeliveryAddress(prev => ({ ...prev, zipCode: text }))}
                    />

                    {/* Get delivery quote button */}
                    <TouchableOpacity
                        style={styles.quoteButton}
                        onPress={getDeliveryQuote}
                        disabled={loadingQuote}
                    >
                        {loadingQuote ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="bicycle-outline" size={18} color="#fff" />
                                <Text style={styles.quoteButtonText}>Calculate Delivery Fee</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Show delivery info if we have a quote */}
                    {deliveryFee > 0 && (
                        <View style={styles.deliveryInfo}>
                            <View style={styles.deliveryRow}>
                                <Text style={styles.deliveryLabel}>Delivery Fee</Text>
                                <Text style={styles.deliveryValue}>Rs. {deliveryFee}</Text>
                            </View>
                            {deliveryDistance && (
                                <View style={styles.deliveryRow}>
                                    <Text style={styles.deliveryLabel}>Distance</Text>
                                    <Text style={styles.deliveryValue}>{deliveryDistance} km</Text>
                                </View>
                            )}
                            {deliveryTime && (
                                <View style={styles.deliveryRow}>
                                    <Text style={styles.deliveryLabel}>Est. Time</Text>
                                    <Text style={styles.deliveryValue}>{deliveryTime}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Price Breakdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>
                            {quantity} × Rs. {unitPrice}
                        </Text>
                        <Text style={styles.summaryValue}>Rs. {subtotal}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Platform Fee (2%)</Text>
                        <Text style={styles.summaryValue}>Rs. {platformFee}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery</Text>
                        <Text style={styles.summaryValue}>
                            {deliveryFee > 0 ? `Rs. ${deliveryFee}` : 'Calculate above'}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>Rs. {totalAmount}</Text>
                    </View>
                </View>

                {/* Dev mode notice */}
                <View style={styles.devNotice}>
                    <Ionicons name="information-circle-outline" size={16} color="#f59e0b" />
                    <Text style={styles.devNoticeText}>
                        Dev Mode: Orders are auto-confirmed without real payment
                    </Text>
                </View>

                {/* Place Order Button */}
                <TouchableOpacity
                    style={[styles.placeOrderButton, processing && styles.buttonDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={processing}
                >
                    {processing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.placeOrderText}>Place Order - Rs. {totalAmount}</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
    content: {
        flex: 1,
        padding: 16,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    productTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1a4d45',
        marginBottom: 2,
    },
    productAvailable: {
        fontSize: 12,
        color: '#888',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    locationText: {
        fontSize: 12,
        color: '#888',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a4d45',
        marginBottom: 12,
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    qtyButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyInput: {
        width: 60,
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    qtyUnit: {
        fontSize: 14,
        color: '#666',
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#333',
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    halfInput: {
        flex: 1,
    },
    quoteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a4d45',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
        marginTop: 8,
    },
    quoteButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    deliveryInfo: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
    },
    deliveryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    deliveryLabel: {
        color: '#666',
        fontSize: 14,
    },
    deliveryValue: {
        color: '#1a4d45',
        fontWeight: '600',
        fontSize: 14,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        color: '#666',
        fontSize: 14,
    },
    summaryValue: {
        color: '#333',
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a4d45',
    },
    devNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff8e1',
        padding: 12,
        borderRadius: 8,
        gap: 8,
        marginBottom: 16,
    },
    devNoticeText: {
        fontSize: 12,
        color: '#f59e0b',
        flex: 1,
    },
    placeOrderButton: {
        backgroundColor: '#1a4d45',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    placeOrderText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
