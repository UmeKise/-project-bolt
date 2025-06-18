import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Filter } from 'lucide-react-native';
import { FacilityNotification } from '../../components/FacilityNotification';

// サンプルデータ
const sampleNotifications = [
  {
    id: '1',
    type: 'business_hours',
    title: '営業時間の変更について',
    message: 'システムメンテナンスのため、3月15日（金）は営業時間を10:00〜17:00に変更いたします。ご不便をおかけし申し訳ございません。',
    facilityName: '東京美術館',
    facilityImage: 'https://example.com/tokyo-museum.jpg',
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-03-15'),
  },
  {
    id: '2',
    type: 'special_hours',
    title: '特別営業のお知らせ',
    message: '春の特別展「浮世絵の世界」開催に伴い、3月20日（水）は20:00まで営業いたします。',
    facilityName: '東京美術館',
    facilityImage: 'https://example.com/tokyo-museum.jpg',
    startDate: new Date('2024-03-20'),
    endDate: new Date('2024-03-20'),
  },
  {
    id: '3',
    type: 'maintenance',
    title: 'メンテナンスのお知らせ',
    message: '館内設備の定期メンテナンスのため、3月25日（月）は休館いたします。ご不便をおかけし申し訳ございません。',
    facilityName: '東京美術館',
    facilityImage: 'https://example.com/tokyo-museum.jpg',
    startDate: new Date('2024-03-25'),
    endDate: new Date('2024-03-25'),
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'business_hours' | 'special_hours' | 'maintenance'>('all');

  const filteredNotifications = sampleNotifications.filter((notification) => {
    if (filter === 'all') return true;
    return notification.type === filter;
  });

  const handleNotificationPress = (notification: typeof sampleNotifications[0]) => {
    // 通知の詳細画面に遷移
    router.push({
      pathname: '/notifications/[id]',
      params: { id: notification.id },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>お知らせ</Text>
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
          style={[styles.filterTab, filter === 'business_hours' && styles.activeFilterTab]}
          onPress={() => setFilter('business_hours')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'business_hours' && styles.activeFilterText,
            ]}
          >
            営業時間
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'special_hours' && styles.activeFilterTab]}
          onPress={() => setFilter('special_hours')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'special_hours' && styles.activeFilterText,
            ]}
          >
            特別営業
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'maintenance' && styles.activeFilterTab]}
          onPress={() => setFilter('maintenance')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'maintenance' && styles.activeFilterText,
            ]}
          >
            メンテナンス
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNotifications}
        renderItem={({ item }) => (
          <FacilityNotification
            {...item}
            onPress={() => handleNotificationPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
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
  listContent: {
    paddingVertical: 8,
  },
}); 