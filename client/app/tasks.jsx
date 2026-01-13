import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

// 1. Configure how notifications appear when the app is OPEN
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function TaskScreen() {
  const router = useRouter();
  const [taskTitle, setTaskTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    // 2. Ask for permission on load
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please enable notifications to set reminders!');
      }
    }
    requestPermissions();
  }, []);

const handleScheduleNotification = async () => {
    // 1. VALIDATION: Check for empty name
    if (!taskTitle.trim()) {
      Alert.alert("Error", "Please enter an activity name!");
      return;
    }

    // 2. VALIDATION: Check if date is in the past
    const now = new Date();
    if (date <= now) {
      Alert.alert("Error", "Please select a future date and time!");
      return;
    }

    // 3. PERMISSION: Check again right before scheduling
    const settings = await Notifications.getPermissionsAsync();
    if (settings.status !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Error", "We need permission to send you reminders!");
        return;
      }
    }

    // 4. SCHEDULE: Use "seconds from now" to be safe
    try {
      // Calculate how many seconds from NOW until the selected date
      const triggerSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "FarmSmart Reminder 🚜",
          body: `It's time to: ${taskTitle}`,
          sound: 'default',
        },
        trigger: {
          seconds: triggerSeconds, // Logic: "Ring in X seconds"
        },
      });

      const newReminder = { id, title: taskTitle, time: date.toLocaleString() };
      setReminders([...reminders, newReminder]);
      
      setTaskTitle('');
      Alert.alert("Success", "Reminder set successfully!");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to schedule notification. Please try again.");
    }
  };
  // Date Picker Handler
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android
    setDate(currentDate);
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

      {/* INPUT SECTION */}
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
        
        {/* Date Picker Button */}
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
            minimumDate={new Date()} // Can't pick the past
          />
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleScheduleNotification}>
          <Text style={styles.addButtonText}>Set Reminder</Text>
        </TouchableOpacity>
      </View>

      {/* LIST OF UPCOMING TASKS */}
      <Text style={styles.subTitle}>Upcoming Reminders</Text>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <View>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskTime}>{item.time}</Text>
            </View>
            <Ionicons name="alarm" size={24} color="#f9a825" />
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