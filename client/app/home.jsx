import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Dimensions, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

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

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getWeatherEmoji = () => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 18) return '☀️';
    return '🌙';
  };

  // Quick action cards at the top
  const quickActions = [
    { title: 'Crop\nCalendar', icon: 'calendar', color: '#2ecc71', route: 'cropcalender' },
    { title: 'Market\nPlace', icon: 'storefront', color: '#3498db', route: 'marketplace' },
    { title: 'My\nTasks', icon: 'checkbox', color: '#f39c12', route: 'tasks' },
  ];

  // Main menu items with icons and descriptions
  const menuItems = [
    {
      title: 'Crop Calendar',
      subtitle: 'Plan your planting & harvesting',
      icon: 'leaf',
      iconColor: '#2ecc71',
      route: 'cropcalender',
      badge: 'NEW',
    },
    {
      title: 'Marketplace',
      subtitle: 'Buy & sell agricultural products',
      icon: 'storefront',
      iconColor: '#3498db',
      route: 'marketplace',
    },
    {
      title: 'Crop Recommendations',
      subtitle: 'AI-powered crop suggestions',
      icon: 'analytics',
      iconColor: '#9b59b6',
      route: 'recommendations',
    },
    {
      title: 'Personal Insights',
      subtitle: 'Track your farming progress',
      icon: 'bar-chart',
      iconColor: '#e67e22',
      route: 'insights',
    },
    {
      title: 'Chat Platform',
      subtitle: 'Connect with farmers & experts',
      icon: 'chatbubbles',
      iconColor: '#1abc9c',
      route: 'chat',
    },
    {
      title: 'Pest & Diseases',
      subtitle: 'Identify and treat crop issues',
      icon: 'bug',
      iconColor: '#e74c3c',
      route: 'pests',
    },
    {
      title: 'Seller Contact',
      subtitle: 'Find suppliers near you',
      icon: 'call',
      iconColor: '#2980b9',
      route: 'seller',
    },
    {
      title: 'Profile',
      subtitle: 'Manage your account',
      icon: 'person-circle',
      iconColor: '#8e44ad',
      route: 'profile',
    },
  ];

  const handleMenuPress = async (item) => {
    if (item.route === 'cropcalender') {
      router.push('/cropcalender');
    } else if (item.route === 'marketplace') {
      router.push('/marketplace');
    } else if (item.route === 'tasks') {
      router.push('/tasks');
    } else {
      Alert.alert(item.title, 'This feature is coming soon!');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('user');
            router.replace('/');
          },
        },
      ]
    );
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
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* === HEADER === */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{getGreeting()} {getWeatherEmoji()}</Text>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.dateText}>
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long', month: 'short', day: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifButton}>
              <Ionicons name="notifications-outline" size={22} color="white" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* === WELCOME BANNER === */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerIconWrap}>
              <Ionicons name="leaf" size={32} color="#6fdfc4" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.bannerTitle}>FarmSmart</Text>
              <Text style={styles.bannerSubtitle}>
                Your intelligent farming companion 🌾
              </Text>
            </View>
          </View>
          <View style={styles.bannerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Zones</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>15+</Text>
              <Text style={styles.statLabel}>Crops</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>25</Text>
              <Text style={styles.statLabel}>Districts</Text>
            </View>
          </View>
        </View>

        {/* === QUICK ACTIONS === */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionRow}>
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickActionCard}
              onPress={() => handleMenuPress(action)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '25' }]}>
                <Ionicons name={action.icon} size={26} color={action.color} />
              </View>
              <Text style={styles.quickActionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* === FEATURES === */}
        <Text style={styles.sectionTitle}>Features</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuCard}
            onPress={() => handleMenuPress(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: item.iconColor + '20' }]}>
              <Ionicons name={item.icon} size={24} color={item.iconColor} />
            </View>
            <View style={styles.menuTextWrap}>
              <View style={styles.menuTitleRow}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4a7a70" />
          </TouchableOpacity>
        ))}

        {/* === FOOTER === */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>FarmSmart v1.0</Text>
          <Text style={styles.footerSubtext}>Made for Sri Lankan Farmers 🇱🇰</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f1c',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#8aa6a3',
    fontWeight: '500',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 13,
    color: '#6fdfc4',
    marginTop: 4,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  notifButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ff6b6b',
  },
  logoutButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,107,107,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Banner
  bannerCard: {
    backgroundColor: '#1a4d45',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a6d5a',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(111,223,196,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(111,223,196,0.25)',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#8aa6a3',
    marginTop: 3,
  },
  bannerStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14,
    padding: 14,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6fdfc4',
  },
  statLabel: {
    fontSize: 11,
    color: '#8aa6a3',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#2a5d55',
  },

  // Section title
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 14,
  },

  // Quick Actions
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#1a4d45',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a5d55',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Menu Cards
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a4d45',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a5d55',
  },
  menuIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextWrap: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuSubtitle: {
    color: '#8aa6a3',
    fontSize: 12,
    marginTop: 3,
  },
  badge: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#0a1f1c',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 10,
  },
  footerText: {
    color: '#4a7a70',
    fontSize: 13,
    fontWeight: '600',
  },
  footerSubtext: {
    color: '#3a5d55',
    fontSize: 12,
    marginTop: 4,
  },
});
