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

    const handleScheduleNotification = async () => {
        if (!taskTitle.trim()) {
            Alert.alert('Error', 'Please enter an activity name!');
            return;
        }

        const now = new Date();
        if (date <= now) {
            Alert.alert('Error', 'Please select a future date and time!');
            return;
        }

        const settings = await Notifications.getPermissionsAsync();
        if (settings.status !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Error', 'We need permission to send you reminders!');
                return;
            }
        }

        try {
            const triggerSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

            const notificationContent = {
                title: 'FarmSmart Reminder ≡ƒÜ£',
                body: `It's time to: ${taskTitle}`,
                sound: 'default',
            };

            if (Platform.OS === 'android') {
                notificationContent.channelId = 'default';
            }

            const id = await Notifications.scheduleNotificationAsync({
                content: notificationContent,
                trigger: { type: 'timeInterval', seconds: triggerSeconds },
            });

            const newReminder = { id, title: taskTitle, time: date.toLocaleString() };
            const updatedReminders = [...reminders, newReminder];
            setReminders(updatedReminders);
            await AsyncStorage.setItem('farmReminders', JSON.stringify(updatedReminders));

            setTaskTitle('');
            Alert.alert('Success', 'Reminder set successfully!');
        } catch (error) {
            console.log('NOTIFICATION ERROR:', error);
            Alert.alert('Error Details', error.message || 'Failed to schedule.');
        }
    };

    const handleDeleteReminder = async (reminderId) => {
        try {
            await Notifications.cancelScheduledNotificationAsync(reminderId);
            const updatedReminders = reminders.filter((r) => r.id !== reminderId);
            setReminders(updatedReminders);
            await AsyncStorage.setItem('farmReminders', JSON.stringify(updatedReminders));
        } catch (error) {
            Alert.alert('Error', 'Failed to delete reminder');
        }
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setDate(currentDate);
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
    };

    const monthlyTip = zone ? getMonthlyTips(zone.id) : null;

