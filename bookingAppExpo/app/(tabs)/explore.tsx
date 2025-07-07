import { View, Text, FlatList, Pressable, Image, StyleSheet, TextInput, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useMemo, useEffect } from 'react';
import { hotels } from '../hotels'; // Pastikan file ini punya struktur sesuai interface Hotel
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './../contexts/ThemeContext'; // Import useTheme

type Hotel = {
  id: string;
  name: string;
  price: number;
  rating: number;
  discount: number;
  image: string;
  location: string;
  facilities: string[];
  reviews: number;
};

type Category = {
  id: string;
  name: string;
  icon: string;
  active: boolean;
};

const categories: Category[] = [
  { id: '1', name: 'Semua', icon: '🏨', active: true },
  { id: '2', name: 'Mewah', icon: '⭐', active: false },
  { id: '3', name: 'Budget', icon: '💰', active: false },
  { id: '4', name: 'Resort', icon: '🏖️', active: false },
  { id: '5', name: 'Bisnis', icon: '🏢', active: false },
];

const getStyles = (darkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? '#111827' : '#f8fafc',
    },
    header: {
      backgroundColor: darkMode ? '#1f2937' : '#2563eb',
      paddingTop: 48,
      paddingBottom: 20,
      paddingHorizontal: 16,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    headerTitleContainer: {
      flex: 1,
    },
    headerTitle: {
      color: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    headerSubtitle: {
      color: darkMode ? '#9ca3af' : '#bfdbfe',
      fontSize: 16,
    },
    backButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    backButtonText: {
      color: '#ffffff',
      fontSize: 18,
    },
    themeToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: darkMode ? '#374151' : 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },
    themeText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6,
    },
    searchContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
    },
    searchInput: {
      flex: 1,
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: darkMode ? '#374151' : '#e5e7eb',
      color: darkMode ? '#f3f4f6' : '#1a1a1a',
    },
    filterButton: {
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: darkMode ? '#374151' : '#e5e7eb',
      justifyContent: 'center',
    },
    clearSearchButton: {
      backgroundColor: darkMode ? '#dc2626' : '#ef4444',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      justifyContent: 'center',
    },
    filterIcon: {
      fontSize: 18,
    },
    clearIcon: {
      fontSize: 16,
    },
    searchParamsInfo: {
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: darkMode ? '#374151' : '#e5e7eb',
    },
    searchParamsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: darkMode ? '#f3f4f6' : '#374151',
      marginBottom: 4,
    },
    searchParamsText: {
      fontSize: 12,
      color: darkMode ? '#9ca3af' : '#6b7280',
      lineHeight: 16,
    },
    categoriesSection: {
      paddingBottom: 16,
    },
    categoriesList: {
      paddingHorizontal: 16,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 12,
      borderWidth: 1,
      borderColor: darkMode ? '#374151' : '#e5e7eb',
    },
    activeCategoryButton: {
      backgroundColor: '#2563eb',
      borderColor: '#2563eb',
    },
    categoryIcon: {
      fontSize: 16,
      marginRight: 6,
    },
    categoryText: {
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontWeight: '500',
    },
    activeCategoryText: {
      color: '#ffffff',
    },
    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    resultsCount: {
      fontSize: 16,
      fontWeight: '600',
      color: darkMode ? '#f3f4f6' : '#374151',
    },
    searchResultsInfo: {
      fontSize: 14,
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontStyle: 'italic',
    },
    sortButton: {
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: darkMode ? '#374151' : '#e5e7eb',
    },
    sortText: {
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontSize: 14,
    },
    noResultsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    noResultsIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    noResultsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: darkMode ? '#f3f4f6' : '#374151',
      marginBottom: 8,
      textAlign: 'center',
    },
    noResultsSubtitle: {
      fontSize: 14,
      color: darkMode ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
      lineHeight: 20,
    },
    hotelsList: {
      paddingHorizontal: 16,
    },
    hotelCard: {
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      borderRadius: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: darkMode ? 0.2 : 0.1,
      shadowRadius: 8,
      elevation: 3,
      overflow: 'hidden',
    },
    imageContainer: {
      position: 'relative',
    },
    hotelImage: {
      width: '100%',
      height: 200,
      resizeMode: 'cover',
    },
    discountBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: '#ef4444',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    discountText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    favoriteButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 20,
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    favoriteIcon: {
      fontSize: 18,
    },
    hotelInfo: {
      padding: 16,
    },
    hotelHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    hotelName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: darkMode ? '#f3f4f6' : '#1f2937',
      flex: 1,
      marginRight: 8,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingStars: {
      fontSize: 12,
      marginRight: 4,
    },
    ratingText: {
      fontSize: 14,
      fontWeight: '600',
      color: darkMode ? '#f3f4f6' : '#374151',
    },
    locationText: {
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontSize: 14,
      marginBottom: 12,
    },
    highlightedLocation: {
      backgroundColor: darkMode ? '#fbbf24' : '#fef3c7',
      color: darkMode ? '#92400e' : '#92400e',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    facilitiesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    facilityTag: {
      backgroundColor: darkMode ? '#374151' : '#f3f4f6',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 6,
    },
    facilityText: {
      fontSize: 12,
      color: darkMode ? '#9ca3af' : '#6b7280',
    },
    moreFacilities: {
      fontSize: 12,
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontStyle: 'italic',
    },
    priceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    originalPrice: {
      fontSize: 14,
      color: darkMode ? '#6b7280' : '#9ca3af',
      textDecorationLine: 'line-through',
    },
    currentPrice: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#2563eb',
    },
    perNight: {
      fontSize: 12,
      color: darkMode ? '#9ca3af' : '#6b7280',
    },
    reviewsContainer: {
      alignItems: 'flex-end',
    },
    reviewsText: {
      fontSize: 12,
      color: darkMode ? '#9ca3af' : '#6b7280',
    },
  });

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mendapatkan parameter pencarian dari halaman index
  const destinationParam = params.destination as string;
  const checkInParam = params.checkIn as string;
  const checkOutParam = params.checkOut as string;
  const guestsParam = params.guests as string;
  const roomsParam = params.rooms as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('1');

  // --- START: Perubahan di sini ---
  const themeContext = useTheme();
  const isDarkMode = themeContext?.isDarkMode || false;
  const toggleTheme = themeContext?.toggleTheme; // Dapatkan fungsi toggleTheme dari context

  const theme = getStyles(isDarkMode); // Gunakan isDarkMode dari context
  // --- END: Perubahan di sini ---

  // Set search query berdasarkan parameter saat komponen dimount
  useEffect(() => {
    if (destinationParam) {
      setSearchQuery(destinationParam);
    }
  }, [destinationParam]);

  // Fungsi untuk mencari hotel berdasarkan lokasi dan nama
  const filteredHotels = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return hotels;
    }

    return hotels.filter(hotel => {
      // Cari berdasarkan lokasi
      const locationMatch = hotel.location.toLowerCase().includes(query);
      // Cari berdasarkan nama hotel
      const nameMatch = hotel.name.toLowerCase().includes(query);
      // Cari berdasarkan fasilitas
      const facilitiesMatch = hotel.facilities.some(facility =>
        facility.toLowerCase().includes(query)
      );

      return locationMatch || nameMatch || facilitiesMatch;
    });
  }, [searchQuery]);

  // Fungsi untuk highlight teks yang dicari
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return (
          <Text key={index} style={theme.highlightedLocation}>
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  const formatPrice = (price: number) => {
    return `Rp${price.toLocaleString('id-ID')}`;
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
      stars += '⭐';
    }
    if (hasHalfStar) {
      stars += '⭐';
    }
    return stars;
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderHotelCard = ({ item }: { item: Hotel }) => (
    <Pressable
      style={theme.hotelCard}
      onPress={() => {
        router.push(`/detail/${item.id}`);
      }}
      android_ripple={{ color: isDarkMode ? '#374151' : '#f3f4f6' }}
    >
      <View style={theme.imageContainer}>
        <Image source={{ uri: item.image }} style={theme.hotelImage} />
        {item.discount > 0 && (
          <View style={theme.discountBadge}>
            <Text style={theme.discountText}>-{item.discount}%</Text>
          </View>
        )}
        <Pressable style={theme.favoriteButton}>
          <Text style={theme.favoriteIcon}>🤍</Text>
        </Pressable>
      </View>

      <View style={theme.hotelInfo}>
        <View style={theme.hotelHeader}>
          <Text style={theme.hotelName} numberOfLines={1}>
            {searchQuery.trim() ? highlightSearchTerm(item.name, searchQuery.trim()) : item.name}
          </Text>
          <View style={theme.ratingContainer}>
            <Text style={theme.ratingStars}>{renderStars(item.rating)}</Text>
            <Text style={theme.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <Text style={theme.locationText}>
          📍 {searchQuery.trim() ? highlightSearchTerm(item.location, searchQuery.trim()) : item.location}
        </Text>

        <View style={theme.facilitiesContainer}>
          {item.facilities.slice(0, 3).map((facility, index) => (
            <View key={index} style={theme.facilityTag}>
              <Text style={theme.facilityText}>{facility}</Text>
            </View>
          ))}
          {item.facilities.length > 3 && (
            <Text style={theme.moreFacilities}>+{item.facilities.length - 3}</Text>
          )}
        </View>

        <View style={theme.priceContainer}>
          <View>
            {item.discount > 0 && (
              <Text style={theme.originalPrice}>
                {formatPrice(Math.round(item.price / (1 - item.discount / 100)))}
              </Text>
            )}
            <Text style={theme.currentPrice}>{formatPrice(item.price)}</Text>
            <Text style={theme.perNight}>per malam</Text>
          </View>
          <View style={theme.reviewsContainer}>
            <Text style={theme.reviewsText}>({item.reviews} ulasan)</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <Pressable
      style={[
        theme.categoryButton,
        activeCategory === item.id && theme.activeCategoryButton
      ]}
      onPress={() => setActiveCategory(item.id)}
    >
      <Text style={theme.categoryIcon}>{item.icon}</Text>
      <Text style={[
        theme.categoryText,
        activeCategory === item.id && theme.activeCategoryText
      ]}>
        {item.name}
      </Text>
    </Pressable>
  );

  const renderNoResults = () => (
    <View style={theme.noResultsContainer}>
      <Text style={theme.noResultsIcon}>🔍</Text>
      <Text style={theme.noResultsTitle}>Tidak ada hotel ditemukan</Text>
      <Text style={theme.noResultsSubtitle}>
        Coba ubah kata kunci pencarian atau{'\n'}
        hapus filter untuk melihat semua hotel
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={theme.container}>
      <View style={theme.header}>
        <View style={theme.headerTop}>
          <Pressable
            style={theme.backButton}
            onPress={() => router.back()}
          >
            <Text style={theme.backButtonText}>←</Text>
          </Pressable>
          <View style={theme.headerTitleContainer}>
            <Text style={theme.headerTitle}>Jelajahi Hotel</Text>
            <Text style={theme.headerSubtitle}>
              {destinationParam
                ? `Hasil pencarian untuk "${destinationParam.charAt(0).toUpperCase() + destinationParam.slice(1)}"`
                : 'Temukan penginapan terbaik untukmu'
              }
            </Text>
          </View>
          {/* Tombol ThemeSwitcher */}
          <Pressable
            style={theme.themeToggle}
            onPress={toggleTheme} // Panggil fungsi toggleTheme dari context
          >
            <Text style={{ fontSize: 16 }}>
              {isDarkMode ? "🌙" : "☀️"}
            </Text>
            <Text style={theme.themeText}>
              {isDarkMode ? "Dark" : "Light"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={theme.searchContainer}>
        <TextInput
          style={theme.searchInput}
          placeholder="Cari hotel atau lokasi..."
          placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.trim() ? (
          <Pressable style={theme.clearSearchButton} onPress={clearSearch}>
            <Text style={theme.clearIcon}>❌</Text>
          </Pressable>
        ) : (
          <Pressable style={theme.filterButton}>
            <Text style={theme.filterIcon}>⚙️</Text>
          </Pressable>
        )}
      </View>

      <View style={theme.categoriesSection}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
          contentContainerStyle={theme.categoriesList}
        />
      </View>

      <View style={theme.resultsHeader}>
        <View>
          <Text style={theme.resultsCount}>
            {filteredHotels.length} hotel ditemukan
          </Text>
          {searchQuery.trim() && (
            <Text style={theme.searchResultsInfo}>
              Hasil pencarian untuk "{searchQuery}"
            </Text>
          )}
        </View>
        <Pressable style={theme.sortButton}>
          <Text style={theme.sortText}>Urutkan 📊</Text>
        </Pressable>
      </View>

      {filteredHotels.length > 0 ? (
        <FlatList
          data={filteredHotels}
          keyExtractor={(item) => item.id}
          renderItem={renderHotelCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={theme.hotelsList}
        />
      ) : (
        renderNoResults()
      )}
    </SafeAreaView>
  );
}