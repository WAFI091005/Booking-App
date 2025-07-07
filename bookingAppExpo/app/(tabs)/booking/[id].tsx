import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Animated,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';

const hotels = [
  { id: '1', name: 'Grand Luxury Hotel' },
  { id: '2', name: 'Mountain View Resort' },
  { id: '3', name: 'Beachfront Paradise' },
  { id: '4', name: 'City Business Hotel' },
  { id: '5', name: 'Heritage Boutique' },
  { id: '6', name: 'Modern Comfort Inn' },
];

const ALL_ROOMS = Array.from({ length: 10 }, (_, i) => 101 + i); // 101–110

const getStyles = (darkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? '#111827' : '#f8fafc',
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: darkMode ? '#1f2937' : '#fff',
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? '#374151' : '#f0f0f0',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 6,
      color: darkMode ? '#9ca3af' : '#1f2937',
    },
    hotelName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: darkMode ? '#3b82f6' : '#2563eb',
    },
    content: {
      padding: 20,
      flex: 1,
    },
    input: {
      borderWidth: 1,
      borderColor: darkMode ? '#374151' : '#d1d5db',
      padding: 12,
      borderRadius: 10,
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      marginBottom: 16,
      fontSize: 16,
      color: darkMode ? '#f3f4f6' : '#111827',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: darkMode ? '#f3f4f6' : '#374151',
      marginBottom: 8,
    },
    dateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 24,
    },
    datePicker: {
      flex: 1,
      padding: 14,
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: darkMode ? '#374151' : '#d1d5db',
    },
    dateLabel: {
      fontSize: 14,
      color: darkMode ? '#9ca3af' : '#6b7280',
      marginBottom: 4,
    },
    dateValue: {
      fontSize: 16,
      color: darkMode ? '#f3f4f6' : '#111827',
    },
    confirmButton: {
      marginTop: 12,
      backgroundColor: darkMode ? '#1d4ed8' : '#2563eb',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      marginTop: 12,
      backgroundColor: darkMode ? '#374151' : '#e5e7eb',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: darkMode ? '#f3f4f6' : '#111827',
    },
    summaryBox: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: darkMode ? '#1f2937' : '#f3f4f6',
      marginTop: 16,
      borderColor: darkMode ? '#374151' : '#d1d5db',
      borderWidth: 1,
    },
    summaryText: {
      color: darkMode ? '#f3f4f6' : '#374151',
      marginBottom: 4,
      fontSize: 14,
    },
    themeToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: darkMode ? '#374151' : '#f3f4f6',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },
    themeToggleText: {
      color: darkMode ? '#f3f4f6' : '#374151',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6,
    },
  });

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [hotelName, setHotelName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [roomNumber, setRoomNumber] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const hotel = hotels.find((item) => item.id === id);
    setHotelName(hotel ? hotel.name : 'Hotel tidak ditemukan');

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [id]);

  const findAvailableRoom = async (): Promise<number | null> => {
    const existing = await AsyncStorage.getItem('booking_history');
    const bookings = existing ? JSON.parse(existing) : [];

    const overlapBookings = bookings.filter(
      (b: any) =>
        b.hotelId === id &&
        dayjs(checkIn).isBefore(dayjs(b.checkOut)) &&
        dayjs(checkOut).isAfter(dayjs(b.checkIn))
    );

    const bookedRooms = overlapBookings.map((b: any) => b.roomNumber);
    const availableRooms = ALL_ROOMS.filter((room) => !bookedRooms.includes(room));

    return availableRooms.length > 0 ? availableRooms[0] : null;
  };

  const animateButton = async () => {
    if (!name || !email || !checkIn || !checkOut) {
      Alert.alert('Error', 'Semua field harus diisi');
      return;
    }

    if (dayjs(checkOut).isBefore(dayjs(checkIn))) {
      Alert.alert('Error', 'Tanggal check-out harus setelah check-in');
      return;
    }

    const room = await findAvailableRoom();
    if (!room) {
      Alert.alert('Penuh', 'Semua kamar sudah dibooking untuk tanggal ini');
      return;
    }

    setRoomNumber(room);
    setShowSummary(true);
  };

  const cancelSummary = () => setShowSummary(false);

  const handleBooking = async () => {
    setIsLoading(true);

    const bookingData = {
      hotelId: id,
      hotelName,
      name,
      email,
      checkIn: dayjs(checkIn).format('YYYY-MM-DD'),
      checkOut: dayjs(checkOut).format('YYYY-MM-DD'),
      roomNumber,
      createdAt: new Date().toISOString(),
      timestamp: Date.now(),
    };

    try {
      const existing = await AsyncStorage.getItem('booking_history');
      const bookings = existing ? JSON.parse(existing) : [];
      bookings.push(bookingData);
      await AsyncStorage.setItem('booking_history', JSON.stringify(bookings));

      setTimeout(() => {
        setIsLoading(false);
        Alert.alert('Sukses', 'Booking berhasil');
        setName('');
        setEmail('');
        setCheckIn(null);
        setCheckOut(null);
        setRoomNumber(null);
        setShowSummary(false);
        router.push('/history');
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      console.error('Booking error:', error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan booking');
    }
  };

  const theme = getStyles(darkMode);

  return (
    <SafeAreaView style={theme.container}>
      <View style={theme.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={theme.headerTitle}>Booking untuk:</Text>
            <Text style={theme.hotelName}>{hotelName}</Text>
          </View>
          <Pressable 
            style={theme.themeToggle}
            onPress={() => setDarkMode(!darkMode)}
          >
            <Text style={{ fontSize: 18 }}>
              {darkMode ? "🌙" : "☀️"}
            </Text>
            <Text style={theme.themeToggleText}>
              {darkMode ? "Dark" : "Light"}
            </Text>
          </Pressable>
        </View>
      </View>

      <Animated.View style={[theme.content, { opacity: fadeAnim }]}>
        <TextInput
          style={theme.input}
          placeholder="Nama Lengkap"
          placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={theme.input}
          placeholder="Email"
          placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={theme.sectionTitle}>📅 Tanggal Menginap</Text>
        <View style={theme.dateRow}>
          <Pressable style={theme.datePicker} onPress={() => setShowCheckIn(true)}>
            <Text style={theme.dateLabel}>Check-in</Text>
            <Text style={theme.dateValue}>
              {checkIn ? dayjs(checkIn).format('DD MMM YYYY') : 'Pilih Tanggal'}
            </Text>
          </Pressable>
          <Pressable style={theme.datePicker} onPress={() => setShowCheckOut(true)}>
            <Text style={theme.dateLabel}>Check-out</Text>
            <Text style={theme.dateValue}>
              {checkOut ? dayjs(checkOut).format('DD MMM YYYY') : 'Pilih Tanggal'}
            </Text>
          </Pressable>
        </View>

        {showCheckIn && (
          <DateTimePicker
            value={checkIn || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowCheckIn(false);
              if (date) setCheckIn(date);
            }}
          />
        )}
        {showCheckOut && (
          <DateTimePicker
            value={checkOut || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowCheckOut(false);
              if (date) setCheckOut(date);
            }}
          />
        )}

        {showSummary ? (
          <View style={theme.summaryBox}>
            <Text style={[theme.sectionTitle, { marginBottom: 12 }]}>📝 Ringkasan Booking</Text>
            <Text style={theme.summaryText}>📍 Hotel: {hotelName}</Text>
            <Text style={theme.summaryText}>👤 Nama: {name}</Text>
            <Text style={theme.summaryText}>📧 Email: {email}</Text>
            <Text style={theme.summaryText}>📅 Check-in: {dayjs(checkIn).format('DD MMM YYYY')}</Text>
            <Text style={theme.summaryText}>📅 Check-out: {dayjs(checkOut).format('DD MMM YYYY')}</Text>
            <Text style={theme.summaryText}>🛏️ Kamar: {roomNumber}</Text>
            <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
              <Pressable style={[theme.confirmButton, { flex: 1 }]} onPress={handleBooking}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={theme.confirmButtonText}>✅ Konfirmasi</Text>
                )}
              </Pressable>
              <Pressable style={[theme.cancelButton, { flex: 1 }]} onPress={cancelSummary}>
                <Text style={theme.cancelButtonText}>❌ Batalkan</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable style={theme.confirmButton} onPress={animateButton}>
              <Text style={theme.confirmButtonText}>🏨 Konfirmasi Booking</Text>
            </Pressable>
          </Animated.View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}