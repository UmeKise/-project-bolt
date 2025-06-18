import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Filter, MapPin, X, Navigation } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import FilterModal from '@/components/FilterModal';

// サンプルデータ（実際のアプリではAPIから取得）
const sampleFacilities = [
  {
    id: 1,
    name: '東京都現代美術館',
    category: '美術館',
    address: '東京都江東区三好4-1-1',
    rating: 4.5,
    distance: '1.2km',
    features: ['barrierFree', 'nursingRoom', 'strollerFriendly'],
    image: 'https://images.pexels.com/photos/1001965/pexels-photo-1001965.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'ベビーカーでの入館可能。授乳室完備で小さなお子様連れでも安心です。',
    location: {
      latitude: 35.6812,
      longitude: 139.7671,
    },
  },
  {
    id: 2,
    name: 'みどりの公園',
    category: '公園',
    address: '東京都品川区中延2-9-1',
    rating: 4.8,
    distance: '0.8km',
    features: ['barrierFree', 'kidsSpace', 'specializedStaff'],
    image: 'https://images.pexels.com/photos/1612361/pexels-photo-1612361.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: '療育士が常駐しており、障害を持つお子様も安心して遊べます。',
    location: {
      latitude: 35.6107,
      longitude: 139.7159,
    },
  },
  {
    id: 3,
    name: 'やさしいカフェ',
    category: 'カフェ',
    address: '東京都渋谷区恵比寿1-2-3',
    rating: 4.3,
    distance: '2.1km',
    features: ['allergyFriendly', 'nursingRoom', 'kidsSpace'],
    image: 'https://images.pexels.com/photos/683039/pexels-photo-683039.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'アレルギー対応メニュー豊富。キッズスペース併設で家族でゆっくり過ごせます。',
    location: {
      latitude: 35.6467,
      longitude: 139.7103,
    },
  },
];

export default function MapScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 35.6812,
    longitude: 139.7671,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [selectedFacility, setSelectedFacility] = useState<typeof sampleFacilities[0] | null>(null);
  const [filteredFacilities, setFilteredFacilities] = useState(sampleFacilities);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    categories: [] as string[],
    features: [] as string[],
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    let filtered = sampleFacilities;

    // 検索クエリでフィルタリング
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(facility =>
        facility.name.toLowerCase().includes(query) ||
        facility.category.toLowerCase().includes(query) ||
        facility.address.toLowerCase().includes(query)
      );
    }

    // カテゴリーでフィルタリング
    if (activeFilters.categories.length > 0) {
      filtered = filtered.filter(facility =>
        activeFilters.categories.includes(facility.category)
      );
    }

    // 特徴でフィルタリング
    if (activeFilters.features.length > 0) {
      filtered = filtered.filter(facility =>
        activeFilters.features.every(feature =>
          facility.features.includes(feature)
        )
      );
    }

    setFilteredFacilities(filtered);
  }, [searchQuery, activeFilters]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('位置情報の取得に失敗しました:', error);
    }
  };

  const handleMarkerPress = (facility: typeof sampleFacilities[0]) => {
    setSelectedFacility(facility);
  };

  const handleFacilityPress = () => {
    if (selectedFacility) {
      router.push(`/facility/${selectedFacility.id}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleFilterApply = (filters: {
    categories: string[];
    features: string[];
  }) => {
    setActiveFilters(filters);
  };

  const handleDirections = async (facility: typeof sampleFacilities[0]) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          '位置情報の使用許可が必要です',
          'ルート案内を使用するには、位置情報の使用を許可してください。'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${facility.location.latitude},${facility.location.longitude}&travelmode=transit`;

      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'エラー',
          'Google Mapsを開けませんでした。'
        );
      }
    } catch (error) {
      console.error('ルート案内の開始に失敗しました:', error);
      Alert.alert(
        'エラー',
        'ルート案内を開始できませんでした。'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="施設を検索"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch}>
                <X size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.filterButton,
              (activeFilters.categories.length > 0 || activeFilters.features.length > 0) &&
                styles.filterButtonActive,
            ]}
            onPress={handleFilterPress}
          >
            <Filter size={20} color="#4A90E2" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={currentLocation}
          showsUserLocation
          showsMyLocationButton
        >
          {filteredFacilities.map((facility) => (
            <Marker
              key={facility.id}
              coordinate={{
                latitude: facility.location.latitude,
                longitude: facility.location.longitude,
              }}
              title={facility.name}
              description={facility.address}
              onPress={() => handleMarkerPress(facility)}
            />
          ))}
        </MapView>
      </View>

      {selectedFacility && (
        <TouchableOpacity
          style={styles.facilityCard}
          onPress={handleFacilityPress}
        >
          <View style={styles.facilityInfo}>
            <Text style={styles.facilityName}>{selectedFacility.name}</Text>
            <Text style={styles.facilityCategory}>{selectedFacility.category}</Text>
            <View style={styles.facilityLocation}>
              <MapPin size={14} color="#666" />
              <Text style={styles.facilityAddress}>{selectedFacility.address}</Text>
            </View>
          </View>
          <View style={styles.facilityActions}>
            <Text style={styles.facilityDistance}>{selectedFacility.distance}</Text>
            <TouchableOpacity
              style={styles.directionsButton}
              onPress={() => handleDirections(selectedFacility)}
            >
              <Navigation size={16} color="#4A90E2" />
              <Text style={styles.directionsButtonText}>ルート</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
        initialFilters={activeFilters}
      />
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  filterButtonActive: {
    backgroundColor: '#4A90E2',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  facilityCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  facilityInfo: {
    flex: 1,
    marginRight: 16,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  facilityCategory: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 4,
  },
  facilityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facilityAddress: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  facilityDistance: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  facilityActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  directionsButtonText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
});