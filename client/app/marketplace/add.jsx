import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config';

// Product categories - same as the ones we use for filtering
const CATEGORIES = [
    { id: 'vegetables', label: 'Vegetables', icon: 'nutrition' },
    { id: 'fruits', label: 'Fruits', icon: 'egg' },
    { id: 'grains', label: 'Grains & Rice', icon: 'grid' },
    { id: 'spices', label: 'Spices', icon: 'flame' },
    { id: 'dairy', label: 'Dairy', icon: 'water' },
    { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

// Common units for agricultural products
const UNITS = ['kg', 'g', 'lb', 'bunch', 'piece', 'dozen', 'liter'];

export default function AddListingScreen() {
    const router = useRouter();

    // Form state
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [availableQuantity, setAvailableQuantity] = useState('');
    const [unit, setUnit] = useState('kg');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('vegetables');
    const [location, setLocation] = useState('');
    const [imageUri, setImageUri] = useState(null);

    // Pickup address fields
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');

    // Loading states
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    /**
     * Pick an image from the phone's gallery
     * We ask for permission first, then let user choose
     */
    const pickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'We need access to your photos to upload a product image.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8, // Compress a bit to save bandwidth
            });

            if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    /**
     * Upload the selected image to our server (which sends it to Cloudinary)
     * Returns the URL of the uploaded image
     */
    const uploadImage = async (uri) => {
        try {
            const formData = new FormData();
            formData.append('image', {
                uri,
                type: 'image/jpeg',
                name: 'listing-image.jpg',
            });

            const response = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();
            if (response.ok) {
                return data.url;
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            throw error;
        }
    };

    /**
     * Validate the form before submitting
     * Returns true if everything looks good
     */
    const validateForm = () => {
        if (!title.trim()) {
            Alert.alert('Missing Info', 'Please enter a product title');
            return false;
        }
        if (!price || isNaN(price) || Number(price) <= 0) {
            Alert.alert('Invalid Price', 'Please enter a valid price');
            return false;
        }
        if (!availableQuantity || isNaN(availableQuantity) || Number(availableQuantity) <= 0) {
            Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
            return false;
        }
        if (!location.trim()) {
            Alert.alert('Missing Info', 'Please enter your location');
            return false;
        }
        return true;
    };

    /**
     * Submit the listing to the API
     * This uploads the image first (if selected), then creates the listing
     */
    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setSubmitting(true);

            // Get the current user's ID
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) {
                Alert.alert('Error', 'Please log in to create a listing');
                router.push('/login');
                return;
            }

            const user = JSON.parse(userData);
            const sellerId = user._id || user.id;

            // Upload image if one was selected
            let imageUrl = null;
            if (imageUri) {
                setUploading(true);
                try {
                    imageUrl = await uploadImage(imageUri);
                } catch (err) {
                    // If image upload fails, continue without image
                    console.log('Image upload failed, continuing without image');
                }
                setUploading(false);
            }

            // Build the listing payload
            const listingData = {
                title: title.trim(),
                price: Number(price),
                availableQuantity: Number(availableQuantity),
                unit,
                description: description.trim(),
                category,
                location: location.trim(),
                sellerId,
                pickupAddress: {
                    street: street.trim(),
                    city: city.trim(),
                    state: state.trim(),
                    zipCode: zipCode.trim(),
                    country: 'Sri Lanka',
                },
            };

            // Add image URL if we got one
            if (imageUrl) {
                listingData.imageUrl = imageUrl;
            }

            const response = await fetch(`${API_BASE_URL}/api/marketplace/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(listingData),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success!', 'Your listing has been posted.', [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            } else {
                Alert.alert('Error', data.message || 'Failed to create listing');
            }
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
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
                <Text style={styles.headerTitle}>Add Listing</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.form}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.formContent}
            >
                {/* Image Picker */}
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="camera-outline" size={40} color="#999" />
                            <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Title */}
                <Text style={styles.label}>Product Title *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Fresh Organic Tomatoes"
                    placeholderTextColor="#999"
                    value={title}
                    onChangeText={setTitle}
                    maxLength={100}
                />

                {/* Category */}
                <Text style={styles.label}>Category</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                >
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.categoryChip,
                                category === cat.id && styles.categoryChipSelected,
                            ]}
                            onPress={() => setCategory(cat.id)}
                        >
                            <Ionicons
                                name={cat.icon}
                                size={16}
                                color={category === cat.id ? '#fff' : '#1a4d45'}
                            />
                            <Text
                                style={[
                                    styles.categoryChipText,
                                    category === cat.id && styles.categoryChipTextSelected,
                                ]}
                            >
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Price and Quantity */}
                <View style={styles.row}>
                    <View style={styles.halfField}>
                        <Text style={styles.label}>Price (Rs.) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            placeholderTextColor="#999"
                            keyboardType="decimal-pad"
                            value={price}
                            onChangeText={setPrice}
                        />
                    </View>
                    <View style={styles.halfField}>
                        <Text style={styles.label}>Quantity *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={availableQuantity}
                            onChangeText={setAvailableQuantity}
                        />
                    </View>
                </View>

                {/* Unit Selector */}
                <Text style={styles.label}>Unit</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.unitScroll}
                >
                    {UNITS.map((u) => (
                        <TouchableOpacity
                            key={u}
                            style={[styles.unitChip, unit === u && styles.unitChipSelected]}
                            onPress={() => setUnit(u)}
                        >
                            <Text
                                style={[
                                    styles.unitChipText,
                                    unit === u && styles.unitChipTextSelected,
                                ]}
                            >
                                {u}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Description */}
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your product (quality, freshness, how it's grown...)"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={description}
                    onChangeText={setDescription}
                    maxLength={500}
                />

                {/* Location */}
                <Text style={styles.label}>Location *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Colombo, Kandy, Galle"
                    placeholderTextColor="#999"
                    value={location}
                    onChangeText={setLocation}
                />

                {/* Pickup Address */}
                <Text style={styles.sectionTitle}>Pickup Address</Text>
                <Text style={styles.sectionSubtitle}>
                    Where should the buyer or delivery person pick up the product?
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Street Address"
                    placeholderTextColor="#999"
                    value={street}
                    onChangeText={setStreet}
                />
                <View style={styles.row}>
                    <View style={styles.halfField}>
                        <TextInput
                            style={styles.input}
                            placeholder="City"
                            placeholderTextColor="#999"
                            value={city}
                            onChangeText={setCity}
                        />
                    </View>
                    <View style={styles.halfField}>
                        <TextInput
                            style={styles.input}
                            placeholder="Province"
                            placeholderTextColor="#999"
                            value={state}
                            onChangeText={setState}
                        />
                    </View>
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Postal Code"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={zipCode}
                    onChangeText={setZipCode}
                />

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <View style={styles.submitLoading}>
                            <ActivityIndicator color="#fff" size="small" />
                            <Text style={styles.submitButtonText}>
                                {uploading ? 'Uploading image...' : 'Creating listing...'}
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.submitButtonText}>Post Listing</Text>
                    )}
                </TouchableOpacity>
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
    form: {
        flex: 1,
    },
    formContent: {
        padding: 16,
        paddingBottom: 40,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    textArea: {
        height: 100,
        paddingTop: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfField: {
        flex: 1,
    },
    imagePicker: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        marginTop: 8,
        fontSize: 14,
        color: '#999',
    },
    categoryScroll: {
        marginBottom: 4,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#e8f5e9',
        marginRight: 8,
        gap: 6,
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
    unitScroll: {
        marginBottom: 4,
    },
    unitChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#e8f5e9',
        marginRight: 8,
    },
    unitChipSelected: {
        backgroundColor: '#1a4d45',
    },
    unitChipText: {
        fontSize: 13,
        color: '#1a4d45',
        fontWeight: '500',
    },
    unitChipTextSelected: {
        color: '#fff',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a4d45',
        marginTop: 24,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#888',
        marginBottom: 12,
    },
    submitButton: {
        backgroundColor: '#1a4d45',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
