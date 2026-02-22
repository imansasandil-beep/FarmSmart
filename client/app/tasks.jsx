import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Fix 1: Persistence

// 1. Configure Notification Handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 2. CRITICAL FOR ANDROID: Create Channel
// (This fixes the "Failed to schedule" error on Android)
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

export default function TaskScreen() {
  const router = useRouter();
  const [taskTitle, setTaskTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [reminders, setReminders] = useState([]);

  // Fix 1: Load saved reminders when screen opens
  useEffect(() => {
    const loadReminders = async () => {
      try {
        const stored = await AsyncStorage.getItem('farmReminders');
        if (stored) {
          setReminders(JSON.parse(stored));
        }
      } catch (error) {
        console.log('Error loading reminders:', error);
      }
    };
    loadReminders();
  }, []);

  const handleScheduleNotification = async () => {
    // Validation
    if (!taskTitle.trim()) {
      Alert.alert("Error", "Please enter an activity name!");
      return;
    }
    
    // Check for past dates
    const now = new Date();
    if (date <= now) {
      Alert.alert("Error", "Please select a future date and time!");
      return;
    }

    // Permission Check
    const settings = await Notifications.getPermissionsAsync();
    if (settings.status !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Error", "We need permission to send you reminders!");
        return;
      }
    }

    try {
      // Calculate seconds from now
      const triggerSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

      // Build notification content
      const notificationContent = {
        title: "FarmSmart Reminder 🚜",
        body: `It's time to: ${taskTitle}`,
        sound: 'default',
      };

      // Add channelId for Android (must be in content, not trigger)
      if (Platform.OS === 'android') {
        notificationContent.channelId = 'default';
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: {
          seconds: triggerSeconds,
        },
      });

      // Update State
      const newReminder = { id, title: taskTitle, time: date.toLocaleString() };
      const updatedReminders = [...reminders, newReminder];
      setReminders(updatedReminders);
      
      // Fix 1: Save to Storage
      await AsyncStorage.setItem('farmReminders', JSON.stringify(updatedReminders));
      
      setTaskTitle('');
      Alert.alert("Success", "Reminder set successfully!");
    } catch (error) {
      console.log("NOTIFICATION ERROR:", error);
      Alert.alert("Error Details", error.message || "Failed to schedule.");
    }
  };

  // Fix 3: Delete Functionality
  const handleDeleteReminder = async (reminderId) => {
    try {
      // Cancel the system notification
      await Notifications.cancelScheduledNotificationAsync(reminderId);
      
      // Remove from list
      const updatedReminders = reminders.filter(r => r.id !== reminderId);
      setReminders(updatedReminders);
      
      // Update Storage
      await AsyncStorage.setItem('farmReminders', JSON.stringify(updatedReminders));
      
    } catch (error) {
      Alert.alert("Error", "Failed to delete reminder");
    }
  };

  // Fix 2: Better Date Picker for Android
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>My Farm Tasks</Text>
        <View style={{ width: 28 }} />
      </View>

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
      
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <View style={{flex: 1}}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskTime}>{item.time}</Text>
            </View>
            
            {/* Fix 3: Trash Icon */}
            <TouchableOpacity onPress={() => handleDeleteReminder(item.id)}>
              <Ionicons name="trash-outline" size={24} color="#ff4444" />
            </TouchableOpacity>
            
            <Ionicons name="alarm" size={24} color="#f9a825" style={{marginLeft: 15}} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1f1c', padding: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  
  inputCard: {
    backgroundColor: '#1a4d45',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    borderWidth: 1, 
    borderColor: '#6fdfc4'
  },
  label: { color: '#6fdfc4', marginBottom: 8, fontWeight: 'bold' },
  input: {
    backgroundColor: '#0a1f1c',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2a5d55'
  },
  dateButton: {
    flexDirection: 'row',
    backgroundColor: '#0a1f1c',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a5d55'
  },
  dateText: { color: 'white', marginLeft: 10 },
  addButton: {
    backgroundColor: '#6fdfc4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  addButtonText: { color: '#0a1f1c', fontWeight: 'bold', fontSize: 16 },

  subTitle: { color: 'white', fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f9a825'
  },
  taskTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  taskTime: { color: '#8aa6a3', fontSize: 12, marginTop: 4 }
});