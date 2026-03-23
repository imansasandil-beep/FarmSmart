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
    Platform,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../../config';

// Crop categories
const CROP_CATEGORIES = [
    { id: 'vegetables', label: 'Vegetables', icon: 'nutrition' },
    { id: 'fruits', label: 'Fruits', icon: 'egg' },
    { id: 'grains', label: 'Grains & Rice', icon: 'grid' },
    { id: 'spices', label: 'Spices', icon: 'flame' },
    { id: 'dairy', label: 'Dairy', icon: 'water' },
    { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

export default function AddListingScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageUri, setImageUri] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        availableQuantity: '',
        unit: 'kg',
        location: '',
        description: '',
        category: 'vegetables',
    });
    const [pickupAddress, setPickupAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
    });

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddressChange = (field, value) => {
        setPickupAddress((prev) => ({ ...prev, [field]: value }));
    };

    const pickImage = async () => {
        Alert.alert(
            'Add Photo',
            'Choose how to add a photo',
            [
                {
                    text: 'Camera',
                    onPress: async () => {
                        const permission = await ImagePicker.requestCameraPermissionsAsync();
                        if (!permission.granted) {
                            Alert.alert('Permission needed', 'Camera permission is required');
                            return;
                        }
                        const result = await ImagePicker.launchCameraAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [4, 3],
                            quality: 0.8,
                        });
                        if (!result.canceled && result.assets[0]) {
                            setImageUri(result.assets[0].uri);
                            uploadImage(result.assets[0]);
                        }
                    },
                },
                {
                    text: 'Gallery',
                    onPress: async () => {
                        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (!permission.granted) {
                            Alert.alert('Permission needed', 'Gallery permission is required');
                            return;
                        }
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [4, 3],
                            quality: 0.8,
                        });
                        if (!result.canceled && result.assets[0]) {
                            setImageUri(result.assets[0].uri);
                            uploadImage(result.assets[0]);
                        }
                    },
                },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const uploadImage = async (imageAsset) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', {
                uri: imageAsset.uri,
                type: 'image/jpeg',
                name: 'listing_image.jpg',
            });

            const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();
            if (response.ok) {
                setUploadedImageUrl(data.url);
            } else {
                Alert.alert('Upload Failed', data.message || 'Could not upload image');
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload image');
        } finally {
            setUploading(false);
        }
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
        if (!formData.availableQuantity.trim() || isNaN(Number(formData.availableQuantity))) {
            Alert.alert('Validation Error', 'Please enter the available quantity');
            return false;
        }
        if (!pickupAddress.street.trim() || !pickupAddress.city.trim()) {
            Alert.alert('Validation Error', 'Please enter your pickup address for delivery');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (!userStr) {
                Alert.alert('Error', 'Please login to post a listing');
                router.push('/');
                return;
            }
            const user = JSON.parse(userStr);

            // Check if seller has completed Stripe Connect onboarding
            try {
                const connectRes = await fetch(`${API_BASE_URL}/api/payments/connect-status/${user._id}`);
                const connectData = await connectRes.json();
                if (!connectData.chargesEnabled) {
                    Alert.alert(
                        'Payment Setup Required',
                        'You need to set up your Stripe payment account before posting a listing. This ensures you can receive payments from buyers.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Set Up Now',
                                onPress: () => router.push('/marketplace/seller-setup'),
                            },
                        ]
                    );
                    setLoading(false);
                    return;
                }
            } catch (connectError) {
                console.error('Connect check error:', connectError);
                // Allow listing creation if we can't check — backend will catch it at checkout
            }

            const response = await fetch(`${API_BASE_URL}/api/marketplace/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    availableQuantity: Number(formData.availableQuantity),
                    quantity: `${formData.availableQuantity} ${formData.unit}`,
                    sellerId: user._id,
                    pickupAddress,
                    location: `${pickupAddress.city}, ${pickupAddress.state}`,
                    imageUrl: uploadedImageUrl || 'https://via.placeholder.com/400x300.png?text=No+Image',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Your listing has been posted!', [
                    { text: 'OK', onPress: () => router.back() },
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

    const unitOptions = ['kg', 'pieces', 'bags', 'bunches', 'liters'];

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
                {/* Product Details Section */}
                <Text style={styles.sectionTitle}>Product Details</Text>

                {/* Image Upload */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Product Image</Text>
                    <TouchableOpacity
                        style={styles.imagePicker}
                        onPress={pickImage}
                        disabled={uploading}
                    >
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.imagePickerContent}>
                                <Ionicons name="camera" size={40} color="#6fdfc4" />
                                <Text style={styles.imagePickerText}>Add Photo</Text>
                            </View>
                        )}
                        {uploading && (
                            <View style={styles.uploadingOverlay}>
                                <ActivityIndicator size="large" color="#6fdfc4" />
                                <Text style={styles.uploadingText}>Uploading...</Text>
                            </View>
                        )}
                        {uploadedImageUrl && !uploading && (
                            <View style={styles.uploadedBadge}>
                                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

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
                    <Text style={styles.label}>Price (Rs.) per unit *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 150"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={formData.price}
                        onChangeText={(text) => handleChange('price', text)}
                        keyboardType="numeric"
                    />
                </View>

                {/* Quantity and Unit */}
                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Quantity *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 50"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={formData.availableQuantity}
                            onChangeText={(text) => handleChange('availableQuantity', text)}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                        <Text style={styles.label}>Unit</Text>
                        <View style={styles.unitSelector}>
                            {unitOptions.slice(0, 3).map((unit) => (
                                <TouchableOpacity
                                    key={unit}
                                    style={[
                                        styles.unitOption,
                                        formData.unit === unit && styles.unitOptionActive,
                                    ]}
                                    onPress={() => handleChange('unit', unit)}
                                >
                                    <Text
                                        style={[
                                            styles.unitOptionText,
                                            formData.unit === unit && styles.unitOptionTextActive,
                                        ]}
                                    >
                                        {unit}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
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

                {/* Category */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category *</Text>
                    <View style={styles.categoryGrid}>
                        {CROP_CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryOption,
                                    formData.category === cat.id && styles.categoryOptionActive,
                                ]}
                                onPress={() => handleChange('category', cat.id)}
                            >
                                <Ionicons
                                    name={cat.icon}
                                    size={18}
                                    color={formData.category === cat.id ? '#0a1f1c' : '#6fdfc4'}
                                />
                                <Text
                                    style={[
                                        styles.categoryOptionText,
                                        formData.category === cat.id && styles.categoryOptionTextActive,
                                    ]}
                                >
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Pickup Address Section */}
                <Text style={styles.sectionTitle}>Pickup Address (for delivery)</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Street Address *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter street address"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={pickupAddress.street}
                        onChangeText={(text) => handleAddressChange('street', text)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>City *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter city"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={pickupAddress.city}
                        onChangeText={(text) => handleAddressChange('city', text)}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>State</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="State"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={pickupAddress.state}
                            onChangeText={(text) => handleAddressChange('state', text)}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                        <Text style={styles.label}>ZIP Code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ZIP"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={pickupAddress.zipCode}
                            onChangeText={(text) => handleAddressChange('zipCode', text)}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color="#6fdfc4" />
                    <Text style={styles.infoText}>
                        Your contact details are kept private. Buyers will purchase through the app, and delivery is handled by our delivery partners.
                    </Text>
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
                            <Text style={styles.submitButtonText}>Post Listing</Text>
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
    sectionTitle: {
        color: '#6fdfc4',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 16,
        marginTop: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1a4d45',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: 'white',
        borderWidth: 1,
        borderColor: 'rgba(111, 223, 196, 0.3)',
    },
    textArea: {
        height: 100,
        paddingTop: 14,
    },
    row: {
        flexDirection: 'row',
    },
    unitSelector: {
        flexDirection: 'row',
        gap: 6,
    },
    unitOption: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#1a4d45',
        borderWidth: 1,
        borderColor: 'rgba(111, 223, 196, 0.3)',
    },
    unitOptionActive: {
        backgroundColor: '#6fdfc4',
        borderColor: '#6fdfc4',
    },
    unitOptionText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '500',
    },
    unitOptionTextActive: {
        color: '#0a1f1c',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: '#1a4d45',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(111, 223, 196, 0.3)',
        gap: 6,
    },
    categoryOptionActive: {
        backgroundColor: '#6fdfc4',
        borderColor: '#6fdfc4',
    },
    categoryOptionText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        fontWeight: '500',
    },
    categoryOptionTextActive: {
        color: '#0a1f1c',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(111, 223, 196, 0.1)',
        borderRadius: 12,
        padding: 14,
        marginTop: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(111, 223, 196, 0.2)',
    },
    infoText: {
        flex: 1,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        lineHeight: 18,
        marginLeft: 10,
    },
    submitButton: {
        backgroundColor: '#6fdfc4',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 15,
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
    imagePicker: {
        height: 180,
        backgroundColor: '#1a4d45',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: 'rgba(111, 223, 196, 0.3)',
        borderStyle: 'dashed',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePickerContent: {
        alignItems: 'center',
        gap: 10,
    },
    imagePickerText: {
        color: '#6fdfc4',
        fontSize: 14,
        fontWeight: '500',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(10, 31, 28, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadingText: {
        color: '#6fdfc4',
        fontSize: 12,
        marginTop: 8,
    },
    uploadedBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(10, 31, 28, 0.8)',
        borderRadius: 12,
        padding: 4,
    },
});
