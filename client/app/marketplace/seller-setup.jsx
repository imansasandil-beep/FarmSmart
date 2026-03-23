import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { API_BASE_URL } from '../../config';

/**
 * Seller Setup Screen
 * Handles Stripe Connect onboarding for sellers.
 * Sellers must complete this before they can receive payments.
 * 
 * Flow:
 * 1. Seller taps "Set Up Payments"
 * 2. Backend creates a Stripe Express account + Account Link
 * 3. Seller is redirected to Stripe's hosted onboarding (in browser)
 * 4. After completing, they return here and see their status
 */
export default function SellerSetupScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [setupLoading, setSetupLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [user, setUser] = useState(null);

    // Check the seller's Connect status whenever screen is focused
    useFocusEffect(
        useCallback(() => {
            checkConnectStatus();
        }, [])
    );

    const checkConnectStatus = async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (!userStr) {
                Alert.alert('Error', 'Please login first');
                router.push('/');
                return;
            }
            const userData = JSON.parse(userStr);
            setUser(userData);

            const response = await fetch(
                `${API_BASE_URL}/api/payments/connect-status/${userData._id}`
            );
            const data = await response.json();
            if (response.ok) {
                setStatus(data);
            }
        } catch (error) {
            console.error('Status check error:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Start or continue the Stripe onboarding process.
     * Opens Stripe's hosted onboarding page in the browser.
     */
    const handleSetupPayments = async () => {
        if (!user) return;

        setSetupLoading(true);
        try {
            // If they already have an account, just get a fresh onboarding link
            if (status?.hasStripeAccount && !status?.chargesEnabled) {
                const response = await fetch(
                    `${API_BASE_URL}/api/payments/onboarding-link/${user._id}`
                );
                const data = await response.json();
                if (response.ok && data.onboardingUrl) {
                    await WebBrowser.openBrowserAsync(data.onboardingUrl);
                    // Refresh status after they return
                    checkConnectStatus();
                    return;
                }
            }

            // Create a new Connected Account
            const response = await fetch(
                `${API_BASE_URL}/api/payments/create-connect-account`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sellerId: user._id }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                if (data.chargesEnabled) {
                    // Already fully set up
                    Alert.alert('All Set! ✅', 'Your payment account is already active.');
                    checkConnectStatus();
                } else if (data.onboardingUrl) {
                    // Open Stripe's hosted onboarding in the browser
                    await WebBrowser.openBrowserAsync(data.onboardingUrl);
                    // Refresh status after they return from Stripe
                    checkConnectStatus();
                }
            } else {
                Alert.alert('Error', data.message || 'Failed to set up payments');
            }
        } catch (error) {
            console.error('Setup error:', error);
            Alert.alert('Error', 'Could not connect to server. Please try again.');
        } finally {
            setSetupLoading(false);
        }
    };

    const getStatusInfo = () => {
        if (!status || !status.hasStripeAccount) {
            return {
                icon: 'card-outline',
                title: 'Set Up Payments',
                subtitle: 'Connect your Stripe account to receive payments from buyers.',
                color: '#6fdfc4',
                showButton: true,
                buttonText: 'Get Started',
            };
        }
        if (status.chargesEnabled) {
            return {
                icon: 'checkmark-circle',
                title: 'Payments Active ✅',
                subtitle: 'Your Stripe account is verified and ready to receive payments.',
                color: '#22c55e',
                showButton: false,
                buttonText: '',
            };
        }
        if (status.detailsSubmitted) {
            return {
                icon: 'time',
                title: 'Under Review',
                subtitle: 'Stripe is verifying your account. This usually takes a few minutes.',
                color: '#f59e0b',
                showButton: true,
                buttonText: 'Check Again',
            };
        }
        return {
            icon: 'alert-circle',
            title: 'Setup Incomplete',
            subtitle: 'You need to complete the Stripe onboarding process to receive payments.',
            color: '#f59e0b',
            showButton: true,
            buttonText: 'Continue Setup',
        };
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#6fdfc4" />
                <Text style={styles.loadingText}>Checking payment setup...</Text>
            </View>
        );
    }

    const statusInfo = getStatusInfo();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Setup</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Status Card */}
                <View style={styles.statusCard}>
                    <View style={[styles.statusIcon, { backgroundColor: `${statusInfo.color}20` }]}>
                        <Ionicons name={statusInfo.icon} size={48} color={statusInfo.color} />
                    </View>
                    <Text style={styles.statusTitle}>{statusInfo.title}</Text>
                    <Text style={styles.statusSubtitle}>{statusInfo.subtitle}</Text>

                    {statusInfo.showButton && (
                        <TouchableOpacity
                            style={[styles.setupButton, setupLoading && styles.setupButtonDisabled]}
                            onPress={handleSetupPayments}
                            disabled={setupLoading}
                        >
                            {setupLoading ? (
                                <ActivityIndicator color="#0a1f1c" />
                            ) : (
                                <>
                                    <Ionicons name="flash" size={20} color="#0a1f1c" />
                                    <Text style={styles.setupButtonText}>{statusInfo.buttonText}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>How it works</Text>

                    <View style={styles.infoItem}>
                        <View style={styles.infoNumber}>
                            <Text style={styles.infoNumberText}>1</Text>
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoItemTitle}>Create Stripe Account</Text>
                            <Text style={styles.infoItemText}>
                                Tap the button above to create your Stripe Express account.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <View style={styles.infoNumber}>
                            <Text style={styles.infoNumberText}>2</Text>
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoItemTitle}>Complete Verification</Text>
                            <Text style={styles.infoItemText}>
                                Stripe will verify your identity. Follow the steps in the browser.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <View style={styles.infoNumber}>
                            <Text style={styles.infoNumberText}>3</Text>
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoItemTitle}>Start Selling</Text>
                            <Text style={styles.infoItemText}>
                                Once verified, you'll automatically receive payments when buyers purchase your products.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Security Note */}
                <View style={styles.securityNote}>
                    <Ionicons name="shield-checkmark" size={20} color="#6fdfc4" />
                    <Text style={styles.securityText}>
                        Powered by Stripe. Your banking information is securely handled by Stripe and never stored on our servers.
                    </Text>
                </View>
            </ScrollView>
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
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    statusCard: {
        backgroundColor: '#1a4d45',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(111, 223, 196, 0.3)',
        marginBottom: 24,
    },
    statusIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    statusTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
        textAlign: 'center',
    },
    statusSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    setupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6fdfc4',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 12,
        gap: 8,
        width: '100%',
        shadowColor: '#6fdfc4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    setupButtonDisabled: {
        opacity: 0.7,
    },
    setupButtonText: {
        color: '#0a1f1c',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoSection: {
        marginBottom: 20,
    },
    infoTitle: {
        color: '#6fdfc4',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoItem: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    infoNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(111, 223, 196, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    infoNumberText: {
        color: '#6fdfc4',
        fontSize: 14,
        fontWeight: 'bold',
    },
    infoContent: {
        flex: 1,
    },
    infoItemTitle: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoItemText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        lineHeight: 18,
    },
    securityNote: {
        flexDirection: 'row',
        backgroundColor: 'rgba(111, 223, 196, 0.1)',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(111, 223, 196, 0.2)',
        alignItems: 'flex-start',
    },
    securityText: {
        flex: 1,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        lineHeight: 18,
        marginLeft: 10,
    },
    loadingText: {
        color: '#6fdfc4',
        marginTop: 15,
        fontSize: 16,
    },
});
