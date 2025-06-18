import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Heart, MapPin, Star } from 'lucide-react-native';

interface Facility {
  id: string;
  name: string;
  category: string;
  address: string;
  rating: number;
  image: string;
}

interface FavoriteFacilitiesManagerProps {
  facilities: Facility[];
  onRemove: (facilityId: string) => void;
  onPress: (facility: Facility) => void;
}

export default function FavoriteFacilitiesManager({
  facilities,
  onRemove,
  onPress,
}: FavoriteFacilitiesManagerProps) {
  const renderFacility = ({ item }: { item: Facility }) => (
    <TouchableOpacity
      style={styles.facilityCard}
      onPress={() => onPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.facilityImage} />
      <View style={styles.facilityInfo}>
        <Text style={styles.facilityName}>{item.name}</Text>
        <Text style={styles.facilityCategory}>{item.category}</Text>
        <View style={styles.facilityDetails}>
          <View style={styles.detailItem}>
            <MapPin size={16} color="#666" />
            <Text style={styles.detailText}>{item.address}</Text>
          </View>
          <View style={styles.detailItem}>
            <Star size={16} color="#FFC107" />
            <Text style={styles.detailText}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(item.id)}
      >
        <Heart size={24} color="#F44336" fill="#F44336" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {facilities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Heart size={48} color="#ccc" />
          <Text style={styles.emptyText}>
            お気に入りの施設がありません。
          </Text>
          <Text style={styles.emptySubText}>
            施設を探して、お気に入りに追加しましょう。
          </Text>
        </View>
      ) : (
        <FlatList
          data={facilities}
          renderItem={renderFacility}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  facilityCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
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
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  facilityInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  facilityCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  facilityDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  removeButton: {
    padding: 8,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
    color: '#999',
    textAlign: 'center',
  },
}); 