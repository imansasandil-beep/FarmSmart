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

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Crop Calendar</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
                {/* Zone Info Card */}
                {zone ? (
                    <TouchableOpacity
                        style={[styles.zoneCard, { borderColor: zone.color }]}
                        onPress={() => router.push('/cropcalender/zone')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.zoneCardRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.zoneCardTitle}>{zone.emoji} {zone.name}</Text>
                                <Text style={styles.zoneCardDistrict}>≡ƒôì {district || 'Tap to select district'}</Text>
                            </View>
                            <View style={[styles.seasonBadge, { backgroundColor: currentSeason.color }]}>
                                <Text style={styles.seasonBadgeText}>
                                    {currentSeason.emoji} {currentSeason.name}
                                </Text>
                            </View>
                        </View>
                        {monthlyTip && (
                            <Text style={styles.quickTip} numberOfLines={2}>
                                ≡ƒÆí {monthlyTip.zoneTip}
                            </Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.setupZoneCard}
                        onPress={() => router.push('/cropcalender/zone')}
                    >
                        <Ionicons name="location-outline" size={28} color="#6fdfc4" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.setupTitle}>Set Up Your Zone</Text>
                            <Text style={styles.setupSubtitle}>
                                Select your agro-ecological zone for personalized crop advice
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#6fdfc4" />
                    </TouchableOpacity>
                )}

                {/* Quick Navigation */}
                <View style={styles.navRow}>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => router.push('/cropcalender/crops')}
                    >
                        <Ionicons name="leaf" size={22} color="#2ecc71" />
                        <Text style={styles.navButtonText}>Crops</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => router.push('/cropcalender/suggestions')}
                    >
                        <Ionicons name="bulb" size={22} color="#f39c12" />
                        <Text style={styles.navButtonText}>Advice</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => router.push('/cropcalender/zone')}
                    >
                        <Ionicons name="map" size={22} color="#3498db" />
                        <Text style={styles.navButtonText}>Zone</Text>
                    </TouchableOpacity>
                </View>

                {/* Add Reminder Section */}
                <View style={styles.inputCard}>
                    <Text style={styles.label}>Activity Name:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Water the Corn"
                        placeholderTextColor="#8aa6a3"
                        value={taskTitle}
                        onChangeText={setTaskTitle}
                    />

                    <Text style={styles.label}>When?</Text>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
                        <Ionicons name="calendar" size={20} color="white" />
                        <Text style={styles.dateText}>{date.toLocaleString()}</Text>
                    </TouchableOpacity>

                    {showPicker && (
                        <DateTimePicker
                            value={date}
                            mode="datetime"
                            display="default"
                            onChange={onDateChange}
                            minimumDate={new Date()}
                        />
                    )}

                    <TouchableOpacity style={styles.addButton} onPress={handleScheduleNotification}>
                        <Text style={styles.addButtonText}>Set Reminder</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.subTitle}>Upcoming Reminders</Text>

                {/* Reminders List */}
                {reminders.length === 0 ? (
                    <View style={styles.emptyReminders}>
                        <Ionicons name="calendar-outline" size={40} color="#2a5d55" />
                        <Text style={styles.emptyText}>No reminders yet</Text>
                        <Text style={styles.emptySubtext}>
                            Add a reminder above or tap "Crops" to create one from crop data
                        </Text>
                    </View>
                ) : (
                    reminders.map((item) => (
                        <View key={item.id} style={styles.taskItem}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.taskTitle}>{item.title}</Text>
                                <Text style={styles.taskTime}>{item.time}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDeleteReminder(item.id)}>
                                <Ionicons name="trash-outline" size={24} color="#ff4444" />
                            </TouchableOpacity>
                            <Ionicons name="alarm" size={24} color="#f9a825" style={{ marginLeft: 15 }} />
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
