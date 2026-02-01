import React, { useState } from 'react';
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
    Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.8.119:5000'; // Update this to your server IP

export default function AddListingScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        quantity: '',
        sellerPhone: '',
        location: '',
        description: '',
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            Alert.alert('Validation Error', 'Please enter a title for your listing');
            return false;
        }
        if (!formData.price.trim() || isNaN(Number(formData.price))) {
            Alert.alert('Validation Error', 'Please enter a valid price');
            return false;
        }
        if (!formData.quantity.trim()) {
            Alert.alert('Validation Error', 'Please enter the quantity');
            return false;
        }
        if (!formData.sellerPhone.trim()) {
            Alert.alert('Validation Error', 'Please enter your phone number');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Get seller name from stored user data
            let sellerName = '';
            try {
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    sellerName = user.fullName || '';
                }
            } catch (e) {
                console.log('Could not get user name');
            }

            const response = await fetch(`${API_URL}/api/marketplace/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    sellerName,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Your listing has been posted!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Error', data.message || 'Failed to create listing');
            }
        } catch (error) {
            console.error('Error creating listing:', error);
            Alert.alert('Error', 'Could not connect to server. Please check your connection.');
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
                <Text style={styles.headerTitle}>Post a Listing</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.formContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Title */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Fresh Organic Tomatoes"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={formData.title}
                        onChangeText={(text) => handleChange('title', text)}
                    />
                </View>

                {/* Price */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Price (Rs.) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 150"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={formData.price}
                        onChangeText={(text) => handleChange('price', text)}
                        keyboardType="numeric"
                    />
                </View>

                {/* Quantity */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Quantity *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 50 kg"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={formData.quantity}
                        onChangeText={(text) => handleChange('quantity', text)}
                    />
                </View>

                {/* Phone Number */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., +94771234567"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={formData.sellerPhone}
                        onChangeText={(text) => handleChange('sellerPhone', text)}
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Location */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Location</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Colombo, Sri Lanka"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={formData.location}
                        onChangeText={(text) => handleChange('location', text)}
                    />
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your product..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={formData.description}
                        onChangeText={(text) => handleChange('description', text)}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={22} color="white" />
                            <Text style={styles.submitButtonText}>Post Item</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.requiredNote}>* Required fields</Text>
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
    formContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#6fdfc4',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1a4d45',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: 'white',
        borderWidth: 1,
        borderColor: 'rgba(111, 223, 196, 0.3)',
    },
    textArea: {
        height: 100,
        paddingTop: 14,
    },
    submitButton: {
        backgroundColor: '#6fdfc4',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 15,
        marginTop: 20,
        gap: 8,
        shadowColor: '#6fdfc4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#0a1f1c',
        fontSize: 18,
        fontWeight: 'bold',
    },
    requiredNote: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 15,
    },
});
