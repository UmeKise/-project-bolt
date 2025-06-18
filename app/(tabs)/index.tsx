import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Search, Filter, MapPin, Star, Baby, Heart, Navigation } from 'lucide-react-native';
import { FacilityCard } from '@/components/FacilityCard';
import { FilterModal } from '@/components/FilterModal';
import * as Location from 'expo-location';

interface Location {
  latitude: number;
  longitude: number;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    barrierFree: false,
    nursingRoom: false,
    strollerFriendly: false,
    specializedStaff: false,
    kidsSpace: false,
    allergyFriendly: false,
  });
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // 位置情報の取得
  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          '位置情報の使用許可',
          '位置情報に基づく検索を行うために、位置情報の使用を許可してください。',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      Alert.alert(
        'エラー',
        '位置情報の取得に失敗しました。',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // 位置情報に基づく距離計算
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // 地球の半径（km）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

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

  const quickCategories = [
    { id: 'park', name: '公園', icon: '🌳' },
    { id: 'museum', name: '美術館・博物館', icon: '🏛️' },
    { id: 'cafe', name: 'カフェ・レストラン', icon: '☕' },
    { id: 'shopping', name: 'ショッピング', icon: '🛍️' },
    { id: 'medical', name: '医療・福祉', icon: '🏥' },
    { id: 'education', name: '教育施設', icon: '📚' },
  ];

  const filteredFacilities = useMemo(() => {
    return sampleFacilities
      .filter(facility => {
        // 検索クエリによるフィルタリング
        const matchesSearch = searchQuery === '' || 
          facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          facility.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          facility.description.toLowerCase().includes(searchQuery.toLowerCase());

        // フィルターによるフィルタリング
        const matchesFilters = Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          return facility.features.includes(key);
        });

        return matchesSearch && matchesFilters;
      })
      .map(facility => {
        // 位置情報がある場合、実際の距離を計算
        if (currentLocation && facility.location) {
          const distance = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            facility.location.latitude,
            facility.location.longitude
          );
          return {
            ...facility,
            distance: `${distance.toFixed(1)}km`,
          };
        }
        return facility;
      })
      .sort((a, b) => {
        // 位置情報がある場合、距離でソート
        if (currentLocation) {
          const distanceA = parseFloat(a.distance);
          const distanceB = parseFloat(b.distance);
          return distanceA - distanceB;
        }
        return 0;
      });
  }, [searchQuery, filters, currentLocation, sampleFacilities]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>あんしんおでかけナビ</Text>
        <Text style={styles.subtitle}>安心して出かけられる場所を見つけよう</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="施設名や地域を検索"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <View style={styles.locationContainer}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
          disabled={isLoadingLocation}
        >
          <Navigation size={20} color="#4A90E2" />
          <Text style={styles.locationButtonText}>
            {isLoadingLocation ? '位置情報取得中...' : '現在地から検索'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.quickCategoriesContainer}>
          <Text style={styles.sectionTitle}>カテゴリから探す</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {quickCategories.map((category) => (
              <TouchableOpacity 
                key={category.id} 
                style={styles.categoryCard}
                onPress={() => {
                  setSearchQuery(category.name);
                }}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.facilitiesContainer}>
          <Text style={styles.sectionTitle}>
            {searchQuery || Object.values(filters).some(Boolean) 
              ? '検索結果' 
              : 'おすすめの施設'}
          </Text>
          {filteredFacilities.length > 0 ? (
            filteredFacilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>
                条件に一致する施設が見つかりませんでした
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <FilterModal
        visible={showFilters}
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
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
  content: {
    flex: 1,
  },
  quickCategoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 12,
    marginRight: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  facilitiesContainer: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 100,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  locationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f7ff',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  locationButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
});