import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config';

export default function VerificationScreen() {
    const router = useRouter();
    const [idNumber, setIdNumber] = useState('');
    const [address, setAddress] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!idNumber.trim() || !address.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setSubmitting(true);
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (!userStr) {
                router.replace('/');
                return;
            }
            const user = JSON.parse(userStr);

            const response = await fetch(`${API_BASE_URL}/api/user/request-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    idNumber: idNumber.trim(),
                    address: address.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Update local user data
                const updatedUser = { ...user, verificationStatus: 'pending' };
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

                Alert.alert(
                    'Success',
                    'Verification request submitted! We will review your details shortly.',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                Alert.alert('Error', data.message || 'Failed to submit request');
            }
        } catch (error) {
            console.error('Verification error:', error);
            Alert.alert('Error', 'Network error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Seller Verification</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="shield-checkmark" size={60} color="#6fdfc4" />
                </View>

                <Text style={styles.title}>Become a Verified Seller</Text>
                <Text style={styles.subtitle}>
                    Verified sellers get a badge on their listings and are trusted more by buyers.
                </Text>

                <View style={styles.form}>
                    <Text style={styles.label}>National ID / Passport Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your ID number"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={idNumber}
                        onChangeText={setIdNumber}
                    />

                    <Text style={styles.label}>Farm / Business Address</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Enter your full address"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={address}
                        onChangeText={setAddress}
                        multiline
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, submitting && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#0a1f1c" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Request</Text>
                        )}
                    </TouchableOpacity>
                </View>
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
    iconContainer: {
        marginTop: 20,
        marginBottom: 20,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(111, 223, 196, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    form: {
        width: '100%',
    },
    label: {
        color: 'white',
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 15,
        color: 'white',
        fontSize: 16,
        marginBottom: 20,
    },
    textArea: {
        height: 100,
    },
    submitButton: {
        backgroundColor: '#6fdfc4',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
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
