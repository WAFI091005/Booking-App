import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, Modal, Platform, Alert } from 'react-native';
import { useState, useMemo } from 'react'; // Import useMemo
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from './../contexts/ThemeContext';
import ThemeSwitcher from './../components/ThemeSwitcher';
import { useRouter } from 'expo-router';
import { hotels } from '../hotels'; // Import data hotels dari file hotels.js

export default function HomeScreen() {
  const [destination, setDestination] = useState('');
  const [guests, setGuests] = useState('2 tamu, 1 kamar');

  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'checkin' | 'checkout' | null>(null);

  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [guestCount, setGuestCount] = useState(2);
  const [roomCount, setRoomCount] = useState(1);

  const router = useRouter();
  const themeContext = useTheme();
  const isDarkMode = themeContext?.isDarkMode || false;
  const theme = getStyles(isDarkMode);

  // --- START: Perubahan di sini ---
  // Hitung jumlah hotel per lokasi secara dinamis menggunakan useMemo
  const hotelCountsByLocation = useMemo(() => {
    const counts: { [key: string]: number } = {};
    hotels.forEach(hotel => {
      const locationKey = hotel.location.split(' ')[0]; // Ambil hanya kata pertama dari lokasi (misal: 'Jakarta', 'Bandung', 'Bali', 'Yogyakarta')
      counts[locationKey] = (counts[locationKey] || 0) + 1;
    });
    return counts;
  }, [hotels]); // Dependensi adalah 'hotels', jadi akan dihitung ulang jika data hotels berubah

  // Perbarui popularDestinations menggunakan data yang dihitung
  const popularDestinations = [
    { name: 'Bali', hotels: `${hotelCountsByLocation['Bali'] || 0} hotel`, image: '🏝️' },
    { name: 'Jakarta', hotels: `${hotelCountsByLocation['Jakarta'] || 0} hotel`, image: '🏙️' },
    { name: 'Yogyakarta', hotels: `${hotelCountsByLocation['Yogyakarta'] || 0} hotel`, image: '🏛️' },
    { name: 'Bandung', hotels: `${hotelCountsByLocation['Bandung'] || 0} hotel`, image: '🏔️' },
    // Anda bisa menambahkan destinasi lain di sini jika ada di data hotels.js
    // Contoh: { name: 'Surabaya', hotels: `${hotelCountsByLocation['Surabaya'] || 0} hotel`, image: '🏙️' },
    // Contoh: { name: 'Medan', hotels: `${hotelCountsByLocation['Medan'] || 0} hotel`, image: '🌆' },
  ];
  // --- END: Perubahan di sini ---

  const deals = [
    { title: 'Diskon 30%', subtitle: 'Hotel berbintang di Bali', color: '#ef4444' },
    { title: 'Gratis Sarapan', subtitle: 'Untuk booking 3 malam', color: '#22c55e' },
    { title: 'Last Minute', subtitle: 'Hemat hingga 50%', color: '#3b82f6' },
  ];

  const showPicker = (type: 'checkin' | 'checkout') => setShowDatePicker(type);
  const formatDate = (date: Date | null) =>
    date ? date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pilih tanggal';

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android' && event.type === 'dismissed') {
      setShowDatePicker(null);
      return;
    }

    if (!selectedDate) {
      setShowDatePicker(null);
      return;
    }

    if (showDatePicker === 'checkin') {
      setCheckIn(selectedDate);
      if (!checkOut || selectedDate > checkOut) {
        setCheckOut(selectedDate);
      }
    } else if (showDatePicker === 'checkout') {
      if (checkIn && selectedDate < checkIn) {
        Alert.alert('Peringatan', 'Tanggal check-out tidak boleh sebelum tanggal check-in.');
        setCheckOut(checkIn);
      } else {
        setCheckOut(selectedDate);
      }
    }
    setShowDatePicker(null);
  };

  const getMinCheckoutDate = () => {
    return checkIn || new Date();
  };

  const handleSearch = () => {
    if (!destination.trim()) {
      Alert.alert('Peringatan', 'Silakan masukkan tujuan terlebih dahulu');
      return;
    }

    router.push({
      pathname: '/explore',
      params: {
        destination: destination.toLowerCase(),
        checkIn: checkIn ? checkIn.toISOString() : '',
        checkOut: checkOut ? checkOut.toISOString() : '',
        guests: guestCount.toString(),
        rooms: roomCount.toString()
      }
    });
  };

  const handleDestinationClick = (destinationName: string) => {
    router.push({
      pathname: '/explore',
      params: {
        destination: destinationName.toLowerCase()
      }
    });
  };

  return (
    <ScrollView style={theme.container}>
      <View style={theme.header}>
        <View style={theme.headerContent}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={theme.headerTitle}>BookingHotel</Text>
              <Text style={theme.headerSubtitle}>Temukan penginapan terbaik untuk perjalananmu</Text>
            </View>
            <ThemeSwitcher />
          </View>
        </View>
        <View style={theme.headerOverlay} />
      </View>

      <View style={theme.searchCard}>
        <View style={theme.inputGroup}>
          <Text style={theme.label}>📍 Tujuan</Text>
          <TextInput
            style={theme.textInput}
            placeholder="Mau ke mana?"
            placeholderTextColor={isDarkMode ? "#9ca3af" : "#9ca3af"}
            value={destination}
            onChangeText={setDestination}
          />
        </View>

        <View style={theme.dateRow}>
          <View style={theme.dateInput}>
            <Text style={theme.label}>📅 Check-in</Text>
            <Pressable style={theme.dateButton} onPress={() => showPicker('checkin')}>
              <Text style={theme.dateButtonText}>{formatDate(checkIn)}</Text>
            </Pressable>
          </View>
          <View style={theme.dateInput}>
            <Text style={theme.label}>📅 Check-out</Text>
            <Pressable style={theme.dateButton} onPress={() => showPicker('checkout')}>
              <Text style={theme.dateButtonText}>{formatDate(checkOut)}</Text>
            </Pressable>
          </View>
        </View>

        <View style={theme.inputGroup}>
          <Text style={theme.label}>👥 Tamu & Kamar</Text>
          <Pressable style={theme.guestButton} onPress={() => setGuestModalVisible(true)}>
            <Text style={theme.guestButtonText}>{guests}</Text>
          </Pressable>
        </View>

        <Pressable style={theme.searchButton} onPress={handleSearch}>
          <Text style={theme.searchButtonText}>🔍 Cari Hotel</Text>
        </Pressable>
      </View>

      {/* Modal: Date Picker untuk Check-in */}
      {showDatePicker === 'checkin' && (
        <DateTimePicker
          value={checkIn || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
      {/* Modal: Date Picker untuk Check-out */}
      {showDatePicker === 'checkout' && (
        <DateTimePicker
          value={checkOut || getMinCheckoutDate()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={getMinCheckoutDate()}
        />
      )}

      {/* Modal: Guest Picker */}
      <Modal visible={guestModalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <Text style={[theme.label, { fontSize: 18, marginBottom: 10 }]}>👥 Jumlah Tamu</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={theme.label}>Tamu</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable onPress={() => setGuestCount(Math.max(1, guestCount - 1))} style={theme.dateButton}>
                  <Text style={theme.dateButtonText}>-</Text>
                </Pressable>
                <Text style={[theme.label, { marginHorizontal: 12 }]}>{guestCount}</Text>
                <Pressable onPress={() => setGuestCount(guestCount + 1)} style={theme.dateButton}>
                  <Text style={theme.dateButtonText}>+</Text>
                </Pressable>
              </View>
            </View>

            <Text style={[theme.label, { fontSize: 18, marginBottom: 10 }]}>🛏️ Jumlah Kamar</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={theme.label}>Kamar</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable onPress={() => setRoomCount(Math.max(1, roomCount - 1))} style={theme.dateButton}>
                  <Text style={theme.dateButtonText}>-</Text>
                </Pressable>
                <Text style={[theme.label, { marginHorizontal: 12 }]}>{roomCount}</Text>
                <Pressable onPress={() => setRoomCount(roomCount + 1)} style={theme.dateButton}>
                  <Text style={theme.dateButtonText}>+</Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              style={[theme.searchButton, { marginTop: 10 }]}
              onPress={() => {
                setGuests(`${guestCount} tamu, ${roomCount} kamar`);
                setGuestModalVisible(false);
              }}
            >
              <Text style={theme.searchButtonText}>Simpan</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={theme.section}>
        <Text style={theme.sectionTitle}>🔥 Penawaran Spesial</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={theme.dealsContainer}>
          {deals.map((deal, index) => (
            <Pressable
              key={index}
              style={[theme.dealCard, { backgroundColor: deal.color }]}
              onPress={() => alert(`Lihat ${deal.title}`)}
            >
              <Text style={theme.dealTitle}>{deal.title}</Text>
              <Text style={theme.dealSubtitle}>{deal.subtitle}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={theme.section}>
        <Text style={theme.sectionTitle}>📍 Destinasi Populer</Text>
        <View style={theme.destinationsGrid}>
          {popularDestinations.map((destination, index) => (
            <Pressable
              key={index}
              style={theme.destinationCard}
              onPress={() => handleDestinationClick(destination.name)}
            >
              <Text style={theme.destinationEmoji}>{destination.image}</Text>
              <Text style={theme.destinationName}>{destination.name}</Text>
              <Text style={theme.destinationHotels}>{destination.hotels}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={theme.section}>
        <Text style={theme.sectionTitle}>⚡ Akses Cepat</Text>
        <View style={theme.quickActionsRow}>
          <Pressable
            style={theme.quickActionButton}
            onPress={() => router.push('/history')}
          >
            <Text style={theme.quickActionEmoji}>📋</Text>
            <Text style={theme.quickActionText}>Booking Saya</Text>
          </Pressable>
          <Pressable style={theme.quickActionButton} onPress={() => alert('Favorit')}>
            <Text style={theme.quickActionEmoji}>❤️</Text>
            <Text style={theme.quickActionText}>Favorit</Text>
          </Pressable>
          <Pressable style={theme.quickActionButton} onPress={() => alert('Bantuan')}>
            <Text style={theme.quickActionEmoji}>🎧</Text>
            <Text style={theme.quickActionText}>Bantuan</Text>
          </Pressable>
        </View>
      </View>

      <View style={theme.section}>
        <View style={theme.premiumCard}>
          <Text style={theme.premiumTitle}>✨ Jadi Member Premium</Text>
          <Text style={theme.premiumSubtitle}>Dapatkan diskon eksklusif dan benefit istimewa lainnya</Text>
          <Pressable style={theme.premiumButton} onPress={() => alert('Bergabung sekarang')}>
            <Text style={theme.premiumButtonText}>Bergabung Gratis</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#111827' : '#f8fafc',
  },
  header: {
    backgroundColor: isDarkMode ? '#1f2937' : '#2563eb',
    paddingTop: 48,
    paddingBottom: 36,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    position: 'relative',
    zIndex: 2,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  headerSubtitle: {
    color: isDarkMode ? '#bfdbfe' : '#bfdbfe',
    fontSize: 17,
    lineHeight: 24,
    paddingRight: 20,
  },
  searchCard: {
    marginHorizontal: 20,
    marginTop: -30,
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: isDarkMode ? 0.3 : 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: isDarkMode ? '#f3f4f6' : '#374151',
    fontWeight: '600',
    marginBottom: 10,
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: isDarkMode ? '#374151' : '#fafbfc',
    color: isDarkMode ? '#ffffff' : '#000000',
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: isDarkMode ? '#374151' : '#fafbfc',
  },
  dateButtonText: {
    color: isDarkMode ? '#d1d5db' : '#6b7280',
    fontSize: 16,
  },
  guestButton: {
    borderWidth: 1,
    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: isDarkMode ? '#374151' : '#fafbfc',
  },
  guestButtonText: {
    color: isDarkMode ? '#f3f4f6' : '#374151',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: isDarkMode ? '#3b82f6' : '#2563eb',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: isDarkMode ? '#f3f4f6' : '#1f2937',
    marginBottom: 18,
  },
  dealsContainer: {
    paddingRight: 20,
  },
  dealCard: {
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDarkMode ? 0.2 : 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  dealTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 4,
  },
  dealSubtitle: {
    color: '#ffffff',
    opacity: 0.95,
    fontSize: 15,
    lineHeight: 20,
  },
  destinationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  destinationCard: {
    width: '48%',
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDarkMode ? 0.2 : 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  destinationEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  destinationName: {
    fontWeight: 'bold',
    color: isDarkMode ? '#f3f4f6' : '#1f2937',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 4,
  },
  destinationHotels: {
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDarkMode ? 0.2 : 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickActionText: {
    color: isDarkMode ? '#f3f4f6' : '#374151',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  premiumCard: {
    backgroundColor: isDarkMode ? '#1f2937' : '#2563eb',
    borderRadius: 20,
    padding: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  premiumTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  premiumSubtitle: {
    color: isDarkMode ? '#bfdbfe' : '#bfdbfe',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  premiumButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  premiumButtonText: {
    color: isDarkMode ? '#3b82f6' : '#2563eb',
    fontWeight: '700',
    fontSize: 16,
  },
});