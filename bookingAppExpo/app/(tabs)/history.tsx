import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Pressable,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './../contexts/ThemeContext'; // Import useTheme

type BookingHistoryItem = {
  hotelId: string;
  hotelName?: string;
  name?: string;
  checkIn: string;
  checkOut: string;
  createdAt: string;
};

const getStyles = (darkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? '#111827' : '#f8fafc'
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: darkMode ? '#1f2937' : '#fff',
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? '#374151' : '#f0f0f0',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: darkMode ? '#f3f4f6' : '#1a1a1a',
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: darkMode ? '#9ca3af' : '#666'
    },
    listContainer: { padding: 16 },
    emptyListContainer: { flex: 1, justifyContent: 'center' },
    historyCard: {
      backgroundColor: darkMode ? '#1f2937' : '#fff',
      borderRadius: 12,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: darkMode ? 0.2 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeader: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? '#374151' : '#f5f5f5',
    },
    hotelInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    hotelName: {
      fontSize: 18,
      fontWeight: '600',
      color: darkMode ? '#f3f4f6' : '#1a1a1a',
    },
    guestName: {
      fontSize: 14,
      color: darkMode ? '#9ca3af' : '#4b5563',
      marginTop: 4,
    },
    statusBadge: {
      backgroundColor: darkMode ? '#065f46' : '#e8f5e8',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
      color: darkMode ? '#34d399' : '#2d7d32',
    },
    cardContent: { padding: 16 },
    dateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dateItem: { flex: 1, alignItems: 'center' },
    dateSeparator: {
      width: 1,
      height: 40,
      backgroundColor: darkMode ? '#374151' : '#e0e0e0',
      marginHorizontal: 16,
    },
    dateLabel: {
      fontSize: 12,
      color: darkMode ? '#9ca3af' : '#666',
      marginTop: 4,
      marginBottom: 2,
    },
    dateValue: {
      fontSize: 14,
      fontWeight: '600',
      color: darkMode ? '#f3f4f6' : '#1a1a1a',
    },
    divider: {
      height: 1,
      backgroundColor: darkMode ? '#374151' : '#f0f0f0',
      marginVertical: 16
    },
    bookingInfo: { flexDirection: 'row', alignItems: 'center' },
    bookingDate: {
      fontSize: 13,
      color: darkMode ? '#9ca3af' : '#666',
      marginLeft: 8,
    },
    cancelBtn: {
      marginTop: 12,
      paddingVertical: 10,
      backgroundColor: darkMode ? '#7f1d1d' : '#fee2e2',
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelText: {
      color: darkMode ? '#fca5a5' : '#b91c1c',
      fontWeight: 'bold',
      fontSize: 14,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: darkMode ? '#9ca3af' : '#666',
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: darkMode ? '#6b7280' : '#999',
      textAlign: 'center',
      lineHeight: 20,
    },
  });

export default function HistoryScreen() {
  const [history, setHistory] = useState<BookingHistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // --- START: Perubahan di sini ---
  const themeContext = useTheme();
  const isDarkMode = themeContext?.isDarkMode || false;
  const toggleTheme = themeContext?.toggleTheme;

  const theme = getStyles(isDarkMode); // Gunakan isDarkMode dari context
  // --- END: Perubahan di sini ---


  const fetchHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('booking_history');
      setHistory(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleCancelBooking = (createdAt: string) => {
    Alert.alert('Batalkan Booking?', 'Apakah Anda yakin ingin membatalkan pemesanan ini?', [
      { text: 'Tidak', style: 'cancel' },
      {
        text: 'Ya',
        style: 'destructive',
        onPress: async () => {
          try {
            const stored = await AsyncStorage.getItem('booking_history');
            const parsed = stored ? JSON.parse(stored) : [];
            const updated = parsed.filter((item: BookingHistoryItem) => item.createdAt !== createdAt);
            await AsyncStorage.setItem('booking_history', JSON.stringify(updated));
            setHistory(updated);
          } catch (error) {
            console.error('Error canceling booking:', error);
          }
        },
      },
    ]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const renderHistoryItem = ({ item }: { item: BookingHistoryItem }) => (
    <View style={theme.historyCard}>
      <View style={theme.cardHeader}>
        <View style={theme.hotelInfo}>
          <View style={{ flex: 1 }}>
            <Text style={theme.hotelName}>
              {item.hotelName || item.name || 'Hotel Tidak Diketahui'}
            </Text>
            <Text style={theme.guestName}>Atas nama: {item.name || 'Nama tidak tersedia'}</Text>
          </View>
          <View style={theme.statusBadge}>
            <Text style={theme.statusText}>Selesai</Text>
          </View>
        </View>
      </View>

      <View style={theme.cardContent}>
        <View style={theme.dateRow}>
          <View style={theme.dateItem}>
            <Ionicons name="calendar-outline" size={16} color={isDarkMode ? "#9ca3af" : "#666"} />
            <Text style={theme.dateLabel}>Check-in</Text>
            <Text style={theme.dateValue}>{item.checkIn}</Text>
          </View>
          <View style={theme.dateSeparator} />
          <View style={theme.dateItem}>
            <Ionicons name="calendar-outline" size={16} color={isDarkMode ? "#9ca3af" : "#666"} />
            <Text style={theme.dateLabel}>Check-out</Text>
            <Text style={theme.dateValue}>{item.checkOut}</Text>
          </View>
        </View>

        <View style={theme.divider} />

        <View style={theme.bookingInfo}>
          <Ionicons name="time-outline" size={16} color={isDarkMode ? "#9ca3af" : "#999"} />
          <Text style={theme.bookingDate}>
            Dipesan pada{' '}
            {new Date(item.createdAt).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        <Pressable style={theme.cancelBtn} onPress={() => handleCancelBooking(item.createdAt)}>
          <Text style={theme.cancelText}>❌ Batalkan</Text>
        </Pressable>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={theme.emptyContainer}>
      <Ionicons name="document-text-outline" size={80} color={isDarkMode ? "#4b5563" : "#ccc"} />
      <Text style={theme.emptyTitle}>Belum Ada Riwayat</Text>
      <Text style={theme.emptySubtitle}>Riwayat pemesanan hotel Anda akan muncul di sini</Text>
    </View>
  );

  return (
    <SafeAreaView style={theme.container}>
      <View style={theme.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={theme.headerTitle}>Riwayat Pemesanan</Text>
            {history.length > 0 && (
              <Text style={theme.headerSubtitle}>{history.length} pemesanan</Text>
            )}
          </View>
          {/* Tombol ThemeSwitcher */}
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDarkMode ? '#374151' : '#f3f4f6', // Sesuaikan warna latar
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
            }}
            onPress={toggleTheme} // Panggil fungsi toggleTheme dari context
          >
            <Text style={{ fontSize: 18, marginRight: 6 }}>
              {isDarkMode ? "🌙" : "☀️"}
            </Text>
            <Text style={{
              color: isDarkMode ? '#f3f4f6' : '#374151', // Sesuaikan warna teks
              fontSize: 12,
              fontWeight: '600'
            }}>
              {isDarkMode ? "Dark" : "Light"}
            </Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={history}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderHistoryItem}
        contentContainerStyle={[
          theme.listContainer,
          history.length === 0 && theme.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[isDarkMode ? '#60a5fa' : '#007AFF']} // Sesuaikan warna loading dengan tema
            tintColor={isDarkMode ? '#60a5fa' : '#007AFF'}
          />
        }
        ListEmptyComponent={<EmptyState />}
      />
    </SafeAreaView>
  );
}