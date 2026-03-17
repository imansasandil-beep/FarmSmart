import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config';

export default function ReviewScreen() {
    const { orderId, listingTitle, listingImage } = useLocalSearchParams();
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [canReview, setCanReview] = useState(false);
    const [sellerId, setSellerId] = useState(null);
    const [listingId, setListingId] = useState(null);

    useEffect(() => {
        const checkEligibility = async () => {
            try {
                const userStr = await AsyncStorage.getItem('user');
                if (!userStr) {
                    router.replace('/');
                    return;
                }

                // Fetch the order to get sellerId and listingId
                const orderRes = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
                if (orderRes.ok) {
                    const orderData = await orderRes.json();
                    setSellerId(orderData.sellerId?._id || orderData.sellerId);
                    setListingId(orderData.listingId?._id || orderData.listingId);
                }

                const response = await fetch(`${API_BASE_URL}/api/reviews/can-review/${orderId}`);
                const data = await response.json();

                if (response.ok) {
                    if (data.alreadyReviewed) {
                        Alert.alert('Info', 'You have already reviewed this order', [
                            { text: 'OK', onPress: () => router.back() }
                        ]);
                    } else if (!data.canReview) {
                        Alert.alert('Error', 'This order cannot be reviewed', [
                            { text: 'OK', onPress: () => router.back() }
                        ]);
                    } else {
                        setCanReview(true);
                    }
                } else {
                    Alert.alert('Error', data.message || 'Error checking review eligibility');
                    router.back();
                }
            } catch (error) {
                console.error('Eligibility check error:', error);
                Alert.alert('Error', 'Network error');
                router.back();
            } finally {
                setLoading(false);
            }
        };

        checkEligibility();
    }, [orderId]);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Error', 'Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            const userStr = await AsyncStorage.getItem('user');
            const user = JSON.parse(userStr);

            const response = await fetch(`${API_BASE_URL}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    reviewerId: user._id,
                    sellerId,
                    listingId,
                    rating,
                    comment: comment.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Review submitted successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Error', data.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Review submit error:', error);
            Alert.alert('Error', 'Network error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#6fdfc4" />
            </View>
        );
    }

    if (!canReview) return null;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rate Order</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>How was your order?</Text>
                <Text style={styles.subtitle}>{listingTitle}</Text>

                <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                            key={star}
                            onPress={() => setRating(star)}
                            style={styles.starButton}
                        >
                            <Ionicons
                                name={star <= rating ? "star" : "star-outline"}
                                size={40}
                                color={star <= rating ? "#f59e0b" : "rgba(255,255,255,0.3)"}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Write a review (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Share your experience..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        multiline
                        textAlignVertical="top"
                        value={comment}
                        onChangeText={setComment}
                        maxLength={500}
                    />
                    <Text style={styles.charCount}>{comment.length}/500</Text>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#0a1f1c" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Review</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
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
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
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
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        color: '#6fdfc4',
        fontSize: 16,
        marginBottom: 30,
        textAlign: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 40,
    },
    starButton: {
        padding: 5,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 30,
    },
    label: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
        padding: 15,
        color: 'white',
        height: 120,
        fontSize: 15,
    },
    charCount: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        alignSelf: 'flex-end',
        marginTop: 5,
    },
    submitButton: {
        width: '100%',
        backgroundColor: '#6fdfc4',
        paddingVertical: 16,
        borderRadius: 15,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#0a1f1c',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
