import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, Users, MapPin } from 'lucide-react-native';
import ReservationHistoryCard from '../../components/ReservationHistoryCard';

// サンプルデータ
const sampleReservations = [
  {
    id: '1',
    facilityName: '東京スカイツリー',
    facilityImage: 'https://example.com/skytree.jpg',
    date: new Date('2024-03-20'),
    time: '14:00',
    numberOfPeople: 2,
    status: 'upcoming' as const,
    address: '東京都墨田区押上1-1-2',
  },
  {
    id: '2',
    facilityName: '浅草寺',
    facilityImage: 'https://example.com/sensoji.jpg',
    date: new Date('2024-03-15'),
    time: '10:00',
    numberOfPeople: 4,
    status: 'completed' as const,
    address: '東京都台東区浅草2-3-1',
  },
  {
    id: '3',
    facilityName: '東京ディズニーランド',
    facilityImage: 'https://example.com/disneyland.jpg',
    date: new Date('2024-03-10'),
    time: '09:00',
    numberOfPeople: 3,
    status: 'cancelled' as const,
    address: '千葉県浦安市舞浜1-1',
  },
];

export default function ReservationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  const filteredReservations = sampleReservations.filter(
    (reservation) => reservation.status === activeTab
  );

  const handleReservationPress = (reservationId: string) => {
    router.push(`/reservation/${reservationId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>予約履歴</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'upcoming' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.activeTabText,
            ]}
          >
            予約済み
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'completed' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('completed')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'completed' && styles.activeTabText,
            ]}
          >
            完了
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'cancelled' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'cancelled' && styles.activeTabText,
            ]}
          >
            キャンセル
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {filteredReservations.length > 0 ? (
          filteredReservations.map((reservation) => (
            <ReservationHistoryCard
              key={reservation.id}
              reservation={reservation}
              onPress={() => handleReservationPress(reservation.id)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {activeTab === 'upcoming'
                ? '予約済みの施設はありません'
                : activeTab === 'completed'
                ? '完了した予約はありません'
                : 'キャンセルした予約はありません'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 