import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MapPin, Star, Heart, Accessibility, Baby, Users } from 'lucide-react-native';
import { useFavorites } from '@/hooks/useFavorites';
import { useRouter } from 'expo-router';

interface Facility {
  id: number;
  name: string;
  category: string;
  address: string;
  rating: number;
  distance: string;
  features: string[];
  image: string;
  description: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface Props {
  facility: Facility;
}

export function FacilityCard({ facility }: Props) {
  const router = useRouter();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isFavorited = isFavorite(facility.id);

  const handleFavoritePress = async (e: any) => {
    e.stopPropagation();
    if (isFavorited) {
      await removeFavorite(facility.id);
    } else {
      await addFavorite(facility.id);
    }
  };

  const handlePress = () => {
    router.push(`/facility/${facility.id}`);
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'barrierFree':
        return <Accessibility size={16} color="#4A90E2" />;
      case 'nursingRoom':
        return <Baby size={16} color="#FF9500" />;
      case 'strollerFriendly':
        return <Baby size={16} color="#34C759" />;
      case 'specializedStaff':
        return <Users size={16} color="#AF52DE" />;
      case 'kidsSpace':
        return <Baby size={16} color="#FF2D92" />;
      case 'allergyFriendly':
        return <Heart size={16} color="#FF3B30" />;
      default:
        return null;
    }
  };

  const getFeatureLabel = (feature: string) => {
    switch (feature) {
      case 'barrierFree':
        return 'バリアフリー';
      case 'nursingRoom':
        return '授乳室';
      case 'strollerFriendly':
        return 'ベビーカーOK';
      case 'specializedStaff':
        return '専門スタッフ';
      case 'kidsSpace':
        return 'キッズスペース';
      case 'allergyFriendly':
        return 'アレルギー対応';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image source={{ uri: facility.image }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.name}>{facility.name}</Text>
            <Text style={styles.category}>{facility.category}</Text>
          </View>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
          >
            <Heart 
              size={20} 
              color={isFavorited ? "#FF3B30" : "#ccc"} 
              fill={isFavorited ? "#FF3B30" : "none"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.locationContainer}>
          <MapPin size={14} color="#666" />
          <Text style={styles.address}>{facility.address}</Text>
        </View>

        <View style={styles.ratingContainer}>
          <Star size={14} color="#FFD700" fill="#FFD700" />
          <Text style={styles.rating}>{facility.rating.toFixed(1)}</Text>
          <Text style={styles.distance}>• {facility.distance}</Text>
        </View>

        <Text style={styles.description}>{facility.description}</Text>

        <View style={styles.featuresContainer}>
          {facility.features.map((feature, index) => (
            <View key={index} style={styles.featureTag}>
              {getFeatureIcon(feature)}
              <Text style={styles.featureText}>{getFeatureLabel(feature)}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  favoriteButton: {
    padding: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  address: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
    fontWeight: '500',
  },
  distance: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  description: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  featureText: {
    fontSize: 11,
    color: '#4A90E2',
    fontWeight: '500',
  },
});