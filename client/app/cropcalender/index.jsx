import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentSeason, getMonthlyTips } from './_data/seasons';

// Configure Notification Handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// Android Notification Channel
if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
    });
}

export default function CropCalendarScreen() {
    const router = useRouter();
    const [taskTitle, setTaskTitle] = useState('');
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [reminders, setReminders] = useState([]);
    const [zone, setZone] = useState(null);
    const [district, setDistrict] = useState(null);

    const currentSeason = getCurrentSeason();

    // Reload zone + reminders every time the screen is focused
    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                try {
                    const storedReminders = await AsyncStorage.getItem('farmReminders');
                    if (storedReminders) setReminders(JSON.parse(storedReminders));

                    const savedZone = await AsyncStorage.getItem('selectedZone');
                    if (savedZone) setZone(JSON.parse(savedZone));

                    const savedDistrict = await AsyncStorage.getItem('selectedDistrict');
                    if (savedDistrict) setDistrict(savedDistrict);
                } catch (error) {
                    console.log('Error loading data:', error);
                }
            };
            loadData();
        }, [])
    );

