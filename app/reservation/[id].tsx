import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Globe,
  ArrowLeft,
} from 'lucide-react-native';

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
    phone: '03-1234-5678',
    website: 'https://example.com/skytree',
    notes: 'エレベーターで展望台まで上がります。',
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
    phone: '03-2345-6789',
    website: 'https://example.com/sensoji',
    notes: '参拝後、仲見世通りを散策します。',
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
    phone: '045-123-4567',
    website: 'https://example.com/disneyland',
    notes: 'パレードの時間を確認してください。',
  },
];

export default function ReservationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const reservation = sampleReservations.find((r) => r.id === id);

  if (!reservation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>予約が見つかりませんでした。</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const handleCancel = () => {
    Alert.alert(
      '予約のキャンセル',
      'この予約をキャンセルしてもよろしいですか？',
      [
        {
          text: 'いいえ',
          style: 'cancel',
        },
        {
          text: 'はい',
          style: 'destructive',
          onPress: () => {
            // キャンセル処理を実装
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>予約詳細</Text>
      </View>

      <ScrollView style={styles.content}>
        <Image
          source={{ uri: reservation.facilityImage }}
          style={styles.image}
        />

        <View style={styles.infoContainer}>
          <Text style={styles.facilityName}>{reservation.facilityName}</Text>

          <View style={styles.infoRow}>
            <Calendar size={20} color="#666" />
            <Text style={styles.infoText}>{formatDate(reservation.date)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Clock size={20} color="#666" />
            <Text style={styles.infoText}>{reservation.time}</Text>
          </View>

          <View style={styles.infoRow}>
            <Users size={20} color="#666" />
            <Text style={styles.infoText}>{reservation.numberOfPeople}名</Text>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={20} color="#666" />
            <Text style={styles.infoText}>{reservation.address}</Text>
          </View>

          <View style={styles.infoRow}>
            <Phone size={20} color="#666" />
            <Text style={styles.infoText}>{reservation.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Globe size={20} color="#666" />
            <Text style={styles.infoText}>{reservation.website}</Text>
          </View>

          {reservation.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>備考</Text>
              <Text style={styles.notesText}>{reservation.notes}</Text>
            </View>
          )}
        </View>

        {reservation.status === 'upcoming' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>予約をキャンセル</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  facilityName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  notesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cancelButton: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 