import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.username}>Farmer !</Text> 
      </View>

      <View style={styles.card}>
        <Ionicons name="sunny" size={50} color="#f9a825" />
        <Text style={styles.cardText}>Good Morning</Text>
        <Text style={styles.subText}>Matara, Sri Lanka</Text>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={() => router.replace('/')} // Go back to Login
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f1c',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  greeting: {
    fontSize: 20,
    color: '#8aa6a3',
  },
  username: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
    backgroundColor: '#1a4d45',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 50,
    borderWidth: 1,
    borderColor: '#6fdfc4',
  },
  cardText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subText: {
    color: '#b0c4c1',
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});