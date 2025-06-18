import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Search, MapPin, Star, Filter, X } from 'lucide-react-native';

interface Facility {
  id: string;
  name: string;
  image: string;
  rating: number;
  address: string;
  category: string;
  price: number;
  distance: number;
}

interface FacilitySearchProps {
  facilities: Facility[];
  categories: string[];
  isLoading?: boolean;
  onSearch: (query: string) => void;
  onFilterChange: (filters: SearchFilters) => void;
  onFacilityPress: (facility: Facility) => void;
}

interface SearchFilters {
  category?: string;
  minRating?: number;
  maxPrice?: number;
  maxDistance?: number;
}

export default function FacilitySearch({
  facilities,
  categories,
  isLoading = false,
  onSearch,
  onFilterChange,
  onFacilityPress,
}: FacilitySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch(text);
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

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

  const renderFacilityItem = ({ item }: { item: Facility }) => (
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
        <View style={styles.facilityFooter}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.price}>¥{item.price.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>カテゴリー</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                filters.category === category && styles.categoryChipSelected,
              ]}
              onPress={() =>
                handleFilterChange({
                  category: filters.category === category ? undefined : category,
                })
              }
            >
              <Text
                style={[
                  styles.categoryChipText,
                  filters.category === category && styles.categoryChipTextSelected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>評価</Text>
        <View style={styles.ratingFilters}>
          {[3, 4, 5].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingChip,
                filters.minRating === rating && styles.ratingChipSelected,
              ]}
              onPress={() =>
                handleFilterChange({
                  minRating: filters.minRating === rating ? undefined : rating,
                })
              }
            >
              <Text
                style={[
                  styles.ratingChipText,
                  filters.minRating === rating && styles.ratingChipTextSelected,
                ]}
              >
                {rating}★以上
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>価格帯</Text>
        <View style={styles.priceFilters}>
          {[
            { label: '¥5,000以下', value: 5000 },
            { label: '¥10,000以下', value: 10000 },
            { label: '¥20,000以下', value: 20000 },
          ].map((price) => (
            <TouchableOpacity
              key={price.value}
              style={[
                styles.priceChip,
                filters.maxPrice === price.value && styles.priceChipSelected,
              ]}
              onPress={() =>
                handleFilterChange({
                  maxPrice: filters.maxPrice === price.value ? undefined : price.value,
                })
              }
            >
              <Text
                style={[
                  styles.priceChipText,
                  filters.maxPrice === price.value && styles.priceChipTextSelected,
                ]}
              >
                {price.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>距離</Text>
        <View style={styles.distanceFilters}>
          {[
            { label: '1km以内', value: 1 },
            { label: '3km以内', value: 3 },
            { label: '5km以内', value: 5 },
          ].map((distance) => (
            <TouchableOpacity
              key={distance.value}
              style={[
                styles.distanceChip,
                filters.maxDistance === distance.value && styles.distanceChipSelected,
              ]}
              onPress={() =>
                handleFilterChange({
                  maxDistance:
                    filters.maxDistance === distance.value ? undefined : distance.value,
                })
              }
            >
              <Text
                style={[
                  styles.distanceChipText,
                  filters.maxDistance === distance.value &&
                    styles.distanceChipTextSelected,
                ]}
              >
                {distance.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
        <X size={16} color="#666" />
        <Text style={styles.clearButtonText}>フィルターをクリア</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="施設を検索"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={showFilters ? '#fff' : '#666'} />
        </TouchableOpacity>
      </View>

      {showFilters && renderFilters()}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={facilities}
          keyExtractor={(item) => item.id}
          renderItem={renderFacilityItem}
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
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filtersContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#4CAF50',
  },
  categoryChipText: {
    color: '#666',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  ratingFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  ratingChipSelected: {
    backgroundColor: '#4CAF50',
  },
  ratingChipText: {
    color: '#666',
  },
  ratingChipTextSelected: {
    color: '#fff',
  },
  priceFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  priceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  priceChipSelected: {
    backgroundColor: '#4CAF50',
  },
  priceChipText: {
    color: '#666',
  },
  priceChipTextSelected: {
    color: '#fff',
  },
  distanceFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  distanceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  distanceChipSelected: {
    backgroundColor: '#4CAF50',
  },
  distanceChipText: {
    color: '#666',
  },
  distanceChipTextSelected: {
    color: '#fff',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
  },
  clearButtonText: {
    color: '#666',
    marginLeft: 4,
  },
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
  facilityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 14,
    color: '#4CAF50',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 