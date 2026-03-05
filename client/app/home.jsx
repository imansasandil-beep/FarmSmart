import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  // List of Menu Options matching your screenshot
  const menuItems = [
    { title: 'Crop calendar', route: 'tasks' },
    { title: 'Weather Forecast', route: 'weatherForecast' },
    { title: 'Crop-specific recommendations', route: 'recommendations' },
    { title: 'Personal insights', route: 'insights' },
    { title: 'Chat platform', route: 'chat' },
    { title: 'Profile', route: 'profile' },
    { title: 'Pest and diseases', route: 'pests' },
    { title: 'Seller Contact', route: 'seller' },
    { title: 'Settings', route: 'settings' }, // We will use this for Logout for now
  ];

  useEffect(() => {
    const getUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserName(user.fullName);
        }
      } catch (error) {
        console.log("Error loading user", error);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const handleMenuPress = async (item) => {
    // 1. Check for Settings (Logout)
    if (item.title === 'Settings') {
      Alert.alert(
        "Log Out",
        "Do you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Log Out",
            style: 'destructive',
            onPress: async () => {
              await AsyncStorage.removeItem('user');
              router.replace('/');
            }
          }
        ]
      );
    }
    // 2. Check for Crop Calendar (which now goes to Tasks)
    else if (item.route === 'tasks') {
      router.push('/tasks');
    }
    // 3. Weather Forecast
    else if (item.route === 'weatherForecast') {
      router.push('/weatherForecast');
    }
    // 4. Everything else
    else {
      Alert.alert(item.title, "This feature is coming soon!");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6fdfc4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>FarmSmart</Text>
          {/* Small personalization subtitle */}
          <Text style={styles.greeting}>Hello, {userName}</Text>
        </View>
        <View style={styles.logoCircle}>
          <Ionicons name="leaf" size={24} color="white" />
        </View>
      </View>

      {/* MENU LIST */}
      <ScrollView contentContainerStyle={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuButton}
            onPress={() => handleMenuPress(item)}
          >
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f1c', // Deep Dark Green
    paddingTop: 60, // Space for status bar
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  greeting: {
    fontSize: 14,
    color: '#6fdfc4', // Mint Green
    marginTop: 2,
    textTransform: 'capitalize',
  },
  logoCircle: {
    width: 45,
    height: 45,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  menuContainer: {
    paddingBottom: 40,
  },
  menuButton: {
    backgroundColor: '#1a4d45', // Slightly lighter green for buttons
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 15, // Rounded corners like screenshot
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#6fdfc4', // Mint border to match theme
    alignItems: 'center',

    // Shadow for depth
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});