import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Clock } from 'lucide-react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

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

export default function NotificationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const notification = sampleNotifications.find((n) => n.id === id);

  if (!notification) {
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
          <View style={styles.backButton} />
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>お知らせが見つかりませんでした。</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'business_hours':
        return '営業時間';
      case 'special_hours':
        return '特別営業';
      case 'maintenance':
        return 'メンテナンス';
      default:
        return 'その他';
    }
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
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.facilityInfo}>
          <Image
            source={{ uri: notification.facilityImage }}
            style={styles.facilityImage}
          />
          <Text style={styles.facilityName}>{notification.facilityName}</Text>
          <Text style={styles.notificationType}>
            {getTypeText(notification.type)}
          </Text>
        </View>

        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>

          <View style={styles.dateInfo}>
            <View style={styles.dateItem}>
              <Calendar size={20} color="#666" />
              <Text style={styles.dateText}>
                {format(notification.startDate, 'yyyy年M月d日', { locale: ja })}
                {notification.startDate.getTime() !== notification.endDate.getTime() &&
                  ` 〜 ${format(notification.endDate, 'yyyy年M月d日', { locale: ja })}`}
              </Text>
            </View>
            {notification.type === 'business_hours' && (
              <View style={styles.dateItem}>
                <Clock size={20} color="#666" />
                <Text style={styles.dateText}>10:00 〜 17:00</Text>
              </View>
            )}
          </View>
        </View>
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
    width: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
  },
  facilityInfo: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  facilityImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationType: {
    fontSize: 14,
    color: '#2196F3',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  notificationContent: {
    padding: 16,
    backgroundColor: '#fff',
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  notificationMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 24,
  },
  dateInfo: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
}); 