import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, StatusBar, Dimensions, Modal,
  TextInput, Alert, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('farmer');
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) {
        const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.user) {
          setProfile(response.data.user);
          await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
    } catch (error) {
      console.log('Error loading profile:', error);
      // Fallback to cached data
      const stored = await AsyncStorage.getItem('user');
      if (stored) setProfile(JSON.parse(stored));
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'farmer': return '#2ecc71';
      case 'buyer': return '#3498db';
      case 'expert': return '#e67e22';
      default: return '#8aa6a3';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'farmer': return 'leaf';
      case 'buyer': return 'cart';
      case 'expert': return 'school';
      default: return 'person';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const openEditModal = () => {
    setEditName(profile?.fullName || '');
    setEditPhone(profile?.phone || '');
    setEditRole(profile?.role || 'farmer');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    Keyboard.dismiss();
    if (!editName.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (editPhone && editPhone.length > 0 && editPhone.length < 9) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      const response = await axios.put(
        `${API_BASE_URL}/api/user/update-profile`,
        { fullName: editName.trim(), phone: editPhone, role: editRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.user) {
        setProfile(response.data.user);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        Alert.alert('Success', 'Profile updated successfully');
        setEditModalVisible(false);
      }
    } catch (error) {
      console.log('Save profile error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6fdfc4" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.fullName || 'User'}</Text>
          <Text style={styles.profileEmail}>{profile?.email || ''}</Text>

          {/* Role Badge */}
          <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(profile?.role) + '25' }]}>
            <Ionicons name={getRoleIcon(profile?.role)} size={14} color={getRoleBadgeColor(profile?.role)} />
            <Text style={[styles.roleBadgeText, { color: getRoleBadgeColor(profile?.role) }]}>
              {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'User'}
            </Text>
          </View>

          {/* Edit Button */}
          <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
            <Ionicons name="create-outline" size={16} color="#6fdfc4" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* User Info Section */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="person-outline" size={18} color="#6fdfc4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{profile?.fullName || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="mail-outline" size={18} color="#6fdfc4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{profile?.email || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="call-outline" size={18} color="#6fdfc4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{profile?.phone || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="calendar-outline" size={18} color="#6fdfc4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>{formatDate(profile?.createdAt)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#8aa6a3" />
                </TouchableOpacity>
              </View>

              {/* Name Input */}
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color="#6fdfc4" style={{ marginLeft: 12 }} />
                <TextInput
                  style={styles.textInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  placeholderTextColor="#4a7a70"
                />
              </View>

              {/* Phone Input */}
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={18} color="#6fdfc4" style={{ marginLeft: 12 }} />
                <TextInput
                  style={styles.textInput}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor="#4a7a70"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Role Selector */}
              <Text style={styles.inputLabel}>Role</Text>
              <View style={styles.roleRow}>
                {['farmer', 'buyer', 'expert'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.roleOption,
                      editRole === r && styles.roleOptionActive
                    ]}
                    onPress={() => setEditRole(r)}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      editRole === r && styles.roleOptionTextActive
                    ]}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveButton, saving && { opacity: 0.6 }]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#0a1f1c" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f1c',
  },
  loadingText: {
    color: '#8aa6a3',
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Avatar Card
  avatarCard: {
    backgroundColor: '#1a4d45',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a6d5a',
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#6fdfc4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: 'rgba(111,223,196,0.3)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0a1f1c',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#8aa6a3',
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  // Info Card
  infoCard: {
    backgroundColor: '#1a4d45',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#2a5d55',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  infoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(111,223,196,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 14,
  },
  infoLabel: {
    fontSize: 11,
    color: '#8aa6a3',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: 'white',
    fontWeight: '500',
    marginTop: 2,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#2a5d55',
    marginHorizontal: 14,
  },
  // Edit Button
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6fdfc4',
    gap: 6,
  },
  editButtonText: {
    color: '#6fdfc4',
    fontSize: 13,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f2f2a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: '#2a5d55',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  inputLabel: {
    color: '#8aa6a3',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a4d45',
    borderRadius: 12,
    marginBottom: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#2a5d55',
  },
  textInput: {
    flex: 1,
    color: 'white',
    fontSize: 15,
    paddingHorizontal: 12,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a5d55',
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: '#6fdfc4',
    borderColor: '#6fdfc4',
  },
  roleOptionText: {
    color: '#8aa6a3',
    fontWeight: '600',
    fontSize: 13,
  },
  roleOptionTextActive: {
    color: '#0a1f1c',
  },
  saveButton: {
    backgroundColor: '#6fdfc4',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    color: '#0a1f1c',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
