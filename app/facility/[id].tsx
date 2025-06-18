import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Star, Heart, Phone, Globe, Clock, Accessibility, Baby, Users, Navigation } from 'lucide-react-native';
import { useFavorites } from '@/hooks/useFavorites';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

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
    phone: '03-5245-4111',
    website: 'https://www.mot-art-museum.jp/',
    businessHours: '10:00 - 18:00',
    price: '一般 500円',
    detailedFeatures: {
      barrierFree: 'エレベーター、スロープ、車椅子用トイレ完備',
      nursingRoom: '授乳室、オムツ替え台あり',
      strollerFriendly: 'ベビーカーでの入館可能、館内移動も容易',
    },
  },
  // ... 他の施設データ
];

export default function FacilityDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [mapRegion, setMapRegion] = useState({
    latitude: 35.6812,
    longitude: 139.7671,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const facility = sampleFacilities.find(f => f.id === Number(id));
  const isFavorited = isFavorite(Number(id));

  if (!facility) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>施設が見つかりませんでした</Text>
      </SafeAreaView>
    );
  }

  const handleFavoritePress = async () => {
    if (isFavorited) {
      await removeFavorite(facility.id);
    } else {
      await addFavorite(facility.id);
    }
  };

  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${facility.location?.latitude},${facility.location?.longitude}`;
    Linking.openURL(url);
  };

  const handleOpenDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.location?.latitude},${facility.location?.longitude}`;
    Linking.openURL(url);
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'barrierFree':
        return <Accessibility size={20} color="#4A90E2" />;
      case 'nursingRoom':
        return <Baby size={20} color="#FF9500" />;
      case 'strollerFriendly':
        return <Baby size={20} color="#34C759" />;
      case 'specializedStaff':
        return <Users size={20} color="#AF52DE" />;
      case 'kidsSpace':
        return <Baby size={20} color="#FF2D92" />;
      case 'allergyFriendly':
        return <Heart size={20} color="#FF3B30" />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          <Image source={{ uri: facility.image }} style={styles.image} />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
          >
            <Heart
              size={24}
              color={isFavorited ? "#FF3B30" : "#fff"}
              fill={isFavorited ? "#FF3B30" : "none"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.name}>{facility.name}</Text>
              <Text style={styles.category}>{facility.category}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>{facility.rating.toFixed(1)}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <MapPin size={16} color="#666" />
              <Text style={styles.infoText}>{facility.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Clock size={16} color="#666" />
              <Text style={styles.infoText}>{facility.businessHours}</Text>
            </View>
            <View style={styles.infoRow}>
              <Phone size={16} color="#666" />
              <Text style={styles.infoText}>{facility.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Globe size={16} color="#666" />
              <Text style={styles.infoText}>{facility.website}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>施設の特徴</Text>
            <View style={styles.featuresContainer}>
              {facility.features.map((feature, index) => (
                <View key={index} style={styles.featureTag}>
                  {getFeatureIcon(feature)}
                  <Text style={styles.featureText}>
                    {facility.detailedFeatures[feature as keyof typeof facility.detailedFeatures]}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>施設の説明</Text>
            <Text style={styles.description}>{facility.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>料金</Text>
            <Text style={styles.price}>{facility.price}</Text>
          </View>

          <View style={styles.mapSection}>
            <Text style={styles.sectionTitle}>地図</Text>
            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={mapRegion}
                onRegionChangeComplete={setMapRegion}
              >
                {facility.location && (
                  <Marker
                    coordinate={{
                      latitude: facility.location.latitude,
                      longitude: facility.location.longitude,
                    }}
                    title={facility.name}
                    description={facility.address}
                  />
                )}
              </MapView>
            </View>
            <View style={styles.mapButtons}>
              <TouchableOpacity
                style={styles.mapButton}
                onPress={handleOpenMaps}
              >
                <MapPin size={20} color="#4A90E2" />
                <Text style={styles.mapButtonText}>地図を開く</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mapButton}
                onPress={handleOpenDirections}
              >
                <Navigation size={20} color="#4A90E2" />
                <Text style={styles.mapButtonText}>経路を表示</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
    width: width,
    height: width * 0.75,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  infoSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  featuresContainer: {
    gap: 12,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#4A90E2',
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  price: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  mapSection: {
    marginBottom: 24,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  mapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f7ff',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  mapButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
}); 