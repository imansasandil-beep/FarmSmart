import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStripe } from '@stripe/stripe-react-native';
import { API_BASE_URL } from '../../config';
const PLATFORM_FEE_PERCENT = 2;

export default function CheckoutScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { listingId, title, price, availableQuantity, unit, imageUrl, location } = params;

    // Stripe hooks
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState('1');
    const [deliveryAddress, setDeliveryAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
    });
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [gettingQuote, setGettingQuote] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState(null);

    // Calculate pricing
    const unitPrice = parseFloat(price) || 0;
    const qty = parseInt(quantity) || 1;
    const subtotal = unitPrice * qty;
    const platformFee = Math.round(subtotal * (PLATFORM_FEE_PERCENT / 100));
    const total = subtotal + platformFee + deliveryFee;

    const getDeliveryQuote = async () => {
        if (!deliveryAddress.city) {
            Alert.alert('Error', 'Please enter your city');
            return;
        }

        setGettingQuote(true);
        try {
            // Parse the listing location (format: "City, State")
            const pickupCity = location ? location.split(',')[0].trim() : '';

            const response = await fetch(`${API_BASE_URL}/api/delivery/quote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pickupAddress: { city: pickupCity, street: location },
                    dropoffAddress: deliveryAddress,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setDeliveryFee(data.fee);
                setDeliveryInfo(data);

                let message = `Delivery Fee: Rs. ${data.fee}`;
                if (data.distance > 0) {
                    message += `\nDistance: ~${data.distance} km`;
                }
                message += `\nEstimated Time: ${data.estimatedDeliveryTime}`;

                Alert.alert('📦 Delivery Quote', message);
            } else {
                setDeliveryFee(250);
                Alert.alert('Delivery Fee', 'Estimated delivery fee: Rs. 250');
            }
        } catch (error) {
            console.error('Quote error:', error);
            setDeliveryFee(250);
        } finally {
            setGettingQuote(false);
        }
    };

    const handleCheckout = async () => {
        // Validation
        if (!quantity || parseInt(quantity) < 1) {
            Alert.alert('Error', 'Please enter a valid quantity');
            return;
        }

        if (parseInt(quantity) > parseInt(availableQuantity)) {
            Alert.alert('Error', `Only ${availableQuantity} ${unit} available`);
            return;
        }

        if (!deliveryAddress.street || !deliveryAddress.city) {
            Alert.alert('Error', 'Please enter your delivery address');
            return;
        }

        setLoading(true);
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (!userStr) {
                Alert.alert('Error', 'Please login to continue');
                router.push('/');
                return;
            }
            const user = JSON.parse(userStr);

            // Create payment intent on backend
            const response = await fetch(`${API_BASE_URL}/api/payments/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId,
                    quantity: parseInt(quantity),
                    deliveryFee,
                    buyerId: user._id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('Error', data.message || 'Failed to create order');
                return;
            }

            // Check if this is dev mode (no real payment needed)
            if (data.devMode || !data.clientSecret) {
                Alert.alert(
                    'Order Placed! 🎉',
                    `Your order for ${quantity} ${unit} of ${title} has been placed.\n\nTotal: Rs. ${data.breakdown.total}\n\nOrder ID: ${data.orderId}`,
                    [
                        {
                            text: 'View Orders',
                            onPress: () => router.replace('/marketplace/orders'),
                        },
                    ]
                );
                return;
            }

            // Initialize Payment Sheet
            const { error: initError } = await initPaymentSheet({
                paymentIntentClientSecret: data.clientSecret,
                merchantDisplayName: 'FarmSmart',
                returnURL: 'farmsmart://stripe-redirect',
                defaultBillingDetails: {
                    name: user.fullName,
                },
            });

            if (initError) {
                Alert.alert('Error', initError.message);
                return;
            }

            // Present Payment Sheet
            const { error: paymentError } = await presentPaymentSheet();

            if (paymentError) {
                if (paymentError.code === 'Canceled') {
                    // User cancelled - do nothing
                    return;
                }
                Alert.alert('Payment Failed', paymentError.message);
                return;
            }

            // Payment successful - confirm with backend
            try {
                await fetch(`${API_BASE_URL}/api/payments/confirm-payment/${data.orderId}`, {
                    method: 'POST',
                });
            } catch (confirmError) {
                console.log('Could not confirm payment, will be processed by webhook:', confirmError);
            }

            Alert.alert(
                'Payment Successful! 🎉',
                `Your order for ${quantity} ${unit} of ${title} has been placed.\n\nTotal: Rs. ${data.breakdown.total}\n\nOrder ID: ${data.orderId}`,
                [
                    {
                        text: 'View Orders',
                        onPress: () => router.replace('/marketplace/orders'),
                    },
                ]
            );

        } catch (error) {
            console.error('Checkout error:', error);
            Alert.alert('Error', 'Could not process payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Product Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Product</Text>
                    <View style={styles.productCard}>
                        <Text style={styles.productName}>{title}</Text>
                        <Text style={styles.productPrice}>Rs. {unitPrice} / {unit}</Text>
                        <Text style={styles.productStock}>{availableQuantity} {unit} available</Text>
                    </View>
                </View>

                {/* Quantity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quantity ({unit})</Text>
                    <View style={styles.quantityRow}>
                        <TouchableOpacity
                            style={styles.quantityBtn}
                            onPress={() => setQuantity(Math.max(1, qty - 1).toString())}
                        >
                            <Ionicons name="remove" size={20} color="white" />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.quantityInput}
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="numeric"
                            textAlign="center"
                        />
                        <TouchableOpacity
                            style={styles.quantityBtn}
                            onPress={() => setQuantity(Math.min(parseInt(availableQuantity), qty + 1).toString())}
                        >
                            <Ionicons name="add" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Delivery Address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Street Address"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={deliveryAddress.street}
                        onChangeText={(text) => setDeliveryAddress({ ...deliveryAddress, street: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="City"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={deliveryAddress.city}
                        onChangeText={(text) => setDeliveryAddress({ ...deliveryAddress, city: text })}
                    />
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, styles.halfInput]}
                            placeholder="State"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={deliveryAddress.state}
                            onChangeText={(text) => setDeliveryAddress({ ...deliveryAddress, state: text })}
                        />
                        <TextInput
                            style={[styles.input, styles.halfInput]}
                            placeholder="ZIP Code"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={deliveryAddress.zipCode}
                            onChangeText={(text) => setDeliveryAddress({ ...deliveryAddress, zipCode: text })}
                            keyboardType="numeric"
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.quoteButton}
                        onPress={getDeliveryQuote}
                        disabled={gettingQuote}
                    >
                        {gettingQuote ? (
                            <ActivityIndicator size="small" color="#0a1f1c" />
                        ) : (
                            <>
                                <Ionicons name="bicycle" size={18} color="#0a1f1c" />
                                <Text style={styles.quoteButtonText}>Get Delivery Quote</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal ({qty} {unit})</Text>
                            <Text style={styles.summaryValue}>Rs. {subtotal}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Platform Fee ({PLATFORM_FEE_PERCENT}%)</Text>
                            <Text style={styles.summaryValue}>Rs. {platformFee}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee</Text>
                            <Text style={styles.summaryValue}>Rs. {deliveryFee}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>Rs. {total}</Text>
                        </View>
                    </View>
                </View>

                {/* Pay Button */}
                <TouchableOpacity
                    style={[styles.payButton, loading && styles.payButtonDisabled]}
                    onPress={handleCheckout}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Ionicons name="card" size={20} color="white" />
                            <Text style={styles.payButtonText}>Pay Rs. {total}</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.secureText}>
                    <Ionicons name="lock-closed" size={12} color="#6fdfc4" /> Secure payment via Stripe
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a1f1c',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: '#6fdfc4',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    productCard: {
        backgroundColor: '#1a4d45',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(111, 223, 196, 0.3)',
    },
    productName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    productPrice: {
        color: '#6fdfc4',
        fontSize: 16,
        fontWeight: '600',
    },
    productStock: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginTop: 4,
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1a4d45',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#6fdfc4',
    },
    quantityInput: {
        width: 80,
        height: 44,
        backgroundColor: '#1a4d45',
        borderRadius: 10,
        marginHorizontal: 15,
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: 'rgba(111, 223, 196, 0.3)',
    },
    input: {
        backgroundColor: '#1a4d45',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: 'white',
        borderWidth: 1,
        borderColor: 'rgba(111, 223, 196, 0.3)',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    quoteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6fdfc4',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
        marginTop: 4,
    },
    quoteButtonText: {
        color: '#0a1f1c',
        fontWeight: 'bold',
        fontSize: 14,
    },
    summaryCard: {
        backgroundColor: '#1a4d45',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(111, 223, 196, 0.3)',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    summaryValue: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        paddingTop: 12,
        marginTop: 8,
        marginBottom: 0,
    },
    totalLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        color: '#6fdfc4',
        fontSize: 20,
        fontWeight: 'bold',
    },
    payButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6fdfc4',
        paddingVertical: 16,
        borderRadius: 15,
        gap: 10,
        marginTop: 8,
        shadowColor: '#6fdfc4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    payButtonDisabled: {
        opacity: 0.7,
    },
    payButtonText: {
        color: '#0a1f1c',
        fontSize: 18,
        fontWeight: 'bold',
    },
    secureText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 12,
    },
});
