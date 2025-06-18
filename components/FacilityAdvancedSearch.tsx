import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Calendar, Clock, Users, MapPin, Sliders } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface FacilityAdvancedSearchProps {
  onSearch: (searchParams: SearchParams) => void;
}

interface SearchParams {
  date: Date;
  time: string;
  numberOfPeople: number;
  location: string;
  priceRange: {
    min: number;
    max: number;
  };
  amenities: string[];
}

export default function FacilityAdvancedSearch({
  onSearch,
}: FacilityAdvancedSearchProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    date: new Date(),
    time: '12:00',
    numberOfPeople: 2,
    location: '',
    priceRange: {
      min: 0,
      max: 10000,
    },
    amenities: [],
  });

  const amenities = [
    { id: 'parking', name: '駐車場' },
    { id: 'wifi', name: 'Wi-Fi' },
    { id: 'shower', name: 'シャワー' },
    { id: 'locker', name: 'ロッカー' },
    { id: 'towel', name: 'タオルレンタル' },
    { id: 'vending', name: '自販機' },
  ];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSearchParams({ ...searchParams, date: selectedDate });
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setSearchParams({
        ...searchParams,
        time: format(selectedTime, 'HH:mm'),
      });
    }
  };

  const handlePeopleChange = (value: number) => {
    if (value >= 1 && value <= 10) {
      setSearchParams({ ...searchParams, numberOfPeople: value });
    }
  };

  const toggleAmenity = (amenityId: string) => {
    const newAmenities = searchParams.amenities.includes(amenityId)
      ? searchParams.amenities.filter((id) => id !== amenityId)
      : [...searchParams.amenities, amenityId];
    setSearchParams({ ...searchParams, amenities: newAmenities });
  };

  const handleSearch = () => {
    onSearch(searchParams);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>日時</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color="#666" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>
              {format(searchParams.date, 'yyyy年MM月dd日', { locale: ja })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Clock size={20} color="#666" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>{searchParams.time}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={searchParams.date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={new Date(`2000-01-01T${searchParams.time}`)}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>人数</Text>
        <View style={styles.peopleContainer}>
          <TouchableOpacity
            style={styles.peopleButton}
            onPress={() => handlePeopleChange(searchParams.numberOfPeople - 1)}
            disabled={searchParams.numberOfPeople <= 1}
          >
            <Text style={styles.peopleButtonText}>-</Text>
          </TouchableOpacity>
          <View style={styles.peopleCount}>
            <Users size={20} color="#666" style={styles.buttonIcon} />
            <Text style={styles.peopleText}>
              {searchParams.numberOfPeople}名
            </Text>
          </View>
          <TouchableOpacity
            style={styles.peopleButton}
            onPress={() => handlePeopleChange(searchParams.numberOfPeople + 1)}
            disabled={searchParams.numberOfPeople >= 10}
          >
            <Text style={styles.peopleButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>エリア</Text>
        <View style={styles.locationContainer}>
          <MapPin size={20} color="#666" style={styles.buttonIcon} />
          <TextInput
            style={styles.locationInput}
            placeholder="エリアを入力"
            value={searchParams.location}
            onChangeText={(text) =>
              setSearchParams({ ...searchParams, location: text })
            }
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>料金範囲</Text>
        <View style={styles.priceRangeContainer}>
          <TextInput
            style={styles.priceInput}
            placeholder="最小"
            keyboardType="numeric"
            value={searchParams.priceRange.min.toString()}
            onChangeText={(text) =>
              setSearchParams({
                ...searchParams,
                priceRange: {
                  ...searchParams.priceRange,
                  min: parseInt(text) || 0,
                },
              })
            }
          />
          <Text style={styles.priceRangeText}>〜</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="最大"
            keyboardType="numeric"
            value={searchParams.priceRange.max.toString()}
            onChangeText={(text) =>
              setSearchParams({
                ...searchParams,
                priceRange: {
                  ...searchParams.priceRange,
                  max: parseInt(text) || 0,
                },
              })
            }
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>設備・サービス</Text>
        <View style={styles.amenitiesContainer}>
          {amenities.map((amenity) => (
            <TouchableOpacity
              key={amenity.id}
              style={[
                styles.amenityButton,
                searchParams.amenities.includes(amenity.id) &&
                  styles.amenityButtonActive,
              ]}
              onPress={() => toggleAmenity(amenity.id)}
            >
              <Text
                style={[
                  styles.amenityText,
                  searchParams.amenities.includes(amenity.id) &&
                    styles.amenityTextActive,
                ]}
              >
                {amenity.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Sliders size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.searchButtonText}>検索条件で検索</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  peopleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  peopleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  peopleButtonText: {
    fontSize: 24,
    color: '#666',
  },
  peopleCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  peopleText: {
    fontSize: 16,
    color: '#333',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  priceRangeText: {
    marginHorizontal: 8,
    fontSize: 16,
    color: '#666',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  amenityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    margin: 4,
  },
  amenityButtonActive: {
    backgroundColor: '#4CAF50',
  },
  amenityText: {
    fontSize: 14,
    color: '#666',
  },
  amenityTextActive: {
    color: '#fff',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 