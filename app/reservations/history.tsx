import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Filter } from 'lucide-react-native';
import { ReservationHistoryList } from '../../components/ReservationHistoryList';

// サンプルデータ
const sampleReservations = [
  {
    id: '1',
    facilityName: '東京美術館',
    facilityImage: 'https://example.com/tokyo-museum.jpg',
    date: new Date('2024-03-15'),
    time: '14:00',
    numberOfPeople: 2,
    status: 'completed',
    address: '東京都千代田区1-1-1',
    phone: '03-1234-5678',
    email: 'info@tokyo-museum.example.com',
    notes: '特別展「浮世絵の世界」を観覧予定',
  },
  {
    id: '2',
    facilityName: '代々木公園',
    facilityImage: 'https://example.com/yoyogi-park.jpg',
    date: new Date('2024-03-20'),
    time: '10:00',
    numberOfPeople: 4,
    status: 'upcoming',
    address: '東京都渋谷区代々木神園町2-1',
    phone: '03-3469-6081',
    email: 'info@yoyogi-park.example.com',
  },
  {
    id: '3',
    facilityName: 'カフェ・ド・パリ',
    facilityImage: 'https://example.com/cafe-de-paris.jpg',
    date: new Date('2024-03-10'),
    time: '15:30',
    numberOfPeople: 2,
    status: 'cancelled',
    address: '東京都港区六本木6-1-1',
    phone: '03-1234-5678',
    email: 'info@cafe-de-paris.example.com',
    notes: '体調不良のためキャンセル',
  },
];

export default function ReservationHistoryScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  const filteredReservations = sampleReservations.filter((reservation) => {
    if (filter === 'all') return true;
    return reservation.status === filter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>予約履歴</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.activeFilterText,
            ]}
          >
            すべて
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'upcoming' && styles.activeFilterTab]}
          onPress={() => setFilter('upcoming')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'upcoming' && styles.activeFilterText,
            ]}
          >
            予定
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'completed' && styles.activeFilterTab]}
          onPress={() => setFilter('completed')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'completed' && styles.activeFilterText,
            ]}
          >
            利用済み
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'cancelled' && styles.activeFilterTab]}
          onPress={() => setFilter('cancelled')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'cancelled' && styles.activeFilterText,
            ]}
          >
            キャンセル
          </Text>
        </TouchableOpacity>
      </View>

      <ReservationHistoryList reservations={filteredReservations} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeFilterTab: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 