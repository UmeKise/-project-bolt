import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Star, MapPin, Heart } from 'lucide-react-native';

interface Facility {
  id: string;
  name: string;
  image: string;
  rating: number;
  address: string;
  category: string;
}

interface FavoriteFacilitiesProps {
  facilities: Facility[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  onFacilityPress: (facility: Facility) => void;
  onRemoveFavorite: (facility: Facility) => void;
}

export default function FavoriteFacilities({
  facilities,
  isLoading = false,
  onLoadMore,
  onFacilityPress,
  onRemoveFavorite,
}: FavoriteFacilitiesProps) {
  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            color={star <= rating ? '#FFC107' : '#E0E0E0'}
            fill={star <= rating ? '#FFC107' : 'none'}
          />
        ))}
      </View>
    );
  };

  const renderItem = ({ item }: { item: Facility }) => (
    <TouchableOpacity
      style={styles.facilityCard}
      onPress={() => onFacilityPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.facilityImage} />
      <View style={styles.facilityInfo}>
        <Text style={styles.facilityName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          {renderStars(item.rating)}
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
        <View style={styles.addressContainer}>
          <MapPin size={16} color="#666" />
          <Text style={styles.address} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
        <Text style={styles.category}>{item.category}</Text>
      </View>
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => onRemoveFavorite(item)}
      >
        <Heart size={24} color="#F44336" fill="#F44336" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#4CAF50" />
      </View>
    );
  };

  if (facilities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Heart size={48} color="#E0E0E0" />
        <Text style={styles.emptyText}>
          お気に入りの施設がありません。
        </Text>
        <Text style={styles.emptySubText}>
          施設を探して、お気に入りに追加しましょう。
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={facilities}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListFooterComponent={renderFooter}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  facilityCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  facilityImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  facilityInfo: {
    padding: 16,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  category: {
    fontSize: 14,
    color: '#4CAF50',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 