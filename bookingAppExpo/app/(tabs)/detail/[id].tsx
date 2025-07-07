import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { hotels } from '../../hotels'; // Import dari file shared
import { Ionicons } from '@expo/vector-icons';

const getStyles = (darkMode: boolean) =>
  StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: darkMode ? '#111827' : '#fff' 
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 48,
      paddingBottom: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    backButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    themeToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },
    themeText: {
      color: darkMode ? '#374151' : '#374151',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6,
    },
    image: { 
      width: '100%', 
      height: 280, 
      resizeMode: 'cover' 
    },
    content: { 
      padding: 16, 
      paddingBottom: 40,
      backgroundColor: darkMode ? '#111827' : '#fff',
    },
    name: { 
      fontSize: 24, 
      fontWeight: 'bold', 
      color: darkMode ? '#f3f4f6' : '#1f2937', 
      marginBottom: 4 
    },
    location: { 
      fontSize: 16, 
      color: darkMode ? '#9ca3af' : '#6b7280', 
      marginBottom: 4 
    },
    rating: { 
      fontSize: 16, 
      color: '#f59e0b', 
      marginBottom: 12 
    },
    facilitiesHeader: {
      fontSize: 18,
      fontWeight: '600',
      color: darkMode ? '#f3f4f6' : '#1f2937',
      marginBottom: 8,
      marginTop: 12,
    },
    facilities: { 
      marginBottom: 12,
      backgroundColor: darkMode ? '#1f2937' : '#f8fafc',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: darkMode ? '#374151' : '#e5e7eb',
    },
    facilityItem: { 
      fontSize: 14, 
      color: darkMode ? '#d1d5db' : '#374151',
      marginBottom: 6,
      lineHeight: 20,
    },
    discount: { 
      fontSize: 16, 
      color: '#ef4444', 
      fontWeight: 'bold', 
      marginBottom: 6,
      backgroundColor: darkMode ? '#7f1d1d' : '#fee2e2',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: 'flex-start',
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
      backgroundColor: darkMode ? '#1f2937' : '#f0f9ff',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: darkMode ? '#374151' : '#bae6fd',
    },
    price: { 
      fontSize: 20, 
      color: '#2563eb', 
      fontWeight: 'bold',
    },
    perNight: {
      fontSize: 14,
      color: darkMode ? '#9ca3af' : '#6b7280',
      marginTop: 2,
    },
    priceIcon: {
      fontSize: 24,
    },
    messageBox: {
      backgroundColor: darkMode ? '#1e3a8a' : '#f0f9ff',
      padding: 16,
      borderRadius: 12,
      borderColor: darkMode ? '#3b82f6' : '#bae6fd',
      borderWidth: 1,
      marginBottom: 24,
    },
    messageText: { 
      fontSize: 14, 
      color: darkMode ? '#dbeafe' : '#0369a1', 
      lineHeight: 20 
    },
    bookingButton: {
      backgroundColor: '#10b981',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    bookingButtonText: { 
      color: 'white', 
      fontSize: 16, 
      fontWeight: 'bold' 
    },
    centered: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: darkMode ? '#111827' : '#fff',
      padding: 20,
    },
    errorContainer: {
      backgroundColor: darkMode ? '#1f2937' : '#fff',
      padding: 24,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: darkMode ? 0.2 : 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    errorIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    errorText: { 
      fontSize: 18, 
      color: darkMode ? '#fca5a5' : '#ef4444',
      fontWeight: '600',
      marginBottom: 8,
      textAlign: 'center',
    },
    debugText: { 
      fontSize: 14, 
      color: darkMode ? '#9ca3af' : '#6b7280', 
      marginTop: 8,
      textAlign: 'center',
    },
    retryButton: {
      backgroundColor: '#2563eb',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      marginTop: 16,
    },
    retryButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
  });

export default function HotelDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  const theme = getStyles(darkMode);

  // Safety check: make sure id is a string
  const hotelId = typeof id === 'string' ? id : '';

  console.log('Received ID:', hotelId); // Debug log
  console.log('Available hotels:', hotels.map(h => ({ id: h.id, name: h.name }))); // Debug log

  const hotel = hotels.find(h => h.id === hotelId);

  console.log('Found hotel:', hotel); // Debug log

  if (!hotel) {
    return (
      <SafeAreaView style={theme.centered}>
        <View style={theme.errorContainer}>
          <Text style={theme.errorIcon}>🏨</Text>
          <Text style={theme.errorText}>Hotel tidak ditemukan</Text>
          <Text style={theme.debugText}>ID yang dicari: {hotelId}</Text>
          <TouchableOpacity 
            style={theme.retryButton}
            onPress={() => router.back()}
          >
            <Text style={theme.retryButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
        
        <Pressable 
          style={[theme.themeToggle, { position: 'absolute', top: 60, right: 20 }]}
          onPress={() => setDarkMode(!darkMode)}
        >
          <Text style={{ fontSize: 16 }}>
            {darkMode ? "🌙" : "☀️"}
          </Text>
          <Text style={theme.themeText}>
            {darkMode ? "Dark" : "Light"}
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

  const handleBooking = () => {
    router.push(`/booking/${hotel.id}`);
  };

  return (
    <View style={theme.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: hotel.image }} style={theme.image} />
          <View style={theme.header}>
            <Pressable style={theme.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </Pressable>
            <Pressable 
              style={theme.themeToggle}
              onPress={() => setDarkMode(!darkMode)}
            >
              <Text style={{ fontSize: 16 }}>
                {darkMode ? "🌙" : "☀️"}
              </Text>
              <Text style={theme.themeText}>
                {darkMode ? "Dark" : "Light"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={theme.content}>
          <Text style={theme.name}>{hotel.name}</Text>
          <Text style={theme.location}>📍 {hotel.location}</Text>
          <Text style={theme.rating}>⭐ {hotel.rating} ({hotel.reviews} ulasan)</Text>

          <Text style={theme.facilitiesHeader}>🏨 Fasilitas Hotel</Text>
          <View style={theme.facilities}>
            {hotel.facilities.map((facility, index) => (
              <Text key={index} style={theme.facilityItem}>✓ {facility}</Text>
            ))}
          </View>

          <View style={theme.priceContainer}>
            <View>
              {hotel.discount > 0 && (
                <Text style={theme.discount}>🔥 Diskon {hotel.discount}%</Text>
              )}
              <Text style={theme.price}>{formatPrice(hotel.price)}</Text>
              <Text style={theme.perNight}>per malam</Text>
            </View>
            <Text style={theme.priceIcon}>💰</Text>
          </View>

          <View style={theme.messageBox}>
            <Text style={theme.messageText}>
              ✨ Jangan lewatkan kesempatan menginap di {hotel.name}! 🏨{"\n\n"}
              🌟 Nikmati fasilitas terbaik dan pengalaman menginap yang tak terlupakan. Cocok untuk keluarga, pasangan, maupun perjalanan bisnis.{"\n\n"}
              📞 Hubungi kami untuk penawaran khusus!
            </Text>
          </View>

          <TouchableOpacity style={theme.bookingButton} onPress={handleBooking}>
            <Text style={theme.bookingButtonText}>🎯 Booking Sekarang</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}