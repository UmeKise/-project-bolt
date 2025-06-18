import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Calendar, Clock, Users } from 'lucide-react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ReservationHistoryDetail } from './ReservationHistoryDetail';
import ReservationHistoryCard from './ReservationHistoryCard';

export interface Reservation {
  id: string;
  facilityName: string;
  facilityImage: string;
  date: Date;
  time: string;
  numberOfPeople: number;
  status: 'completed' | 'cancelled' | 'upcoming';
  address: string;
  phone: string;
  email: string;
  notes?: string;
  amount: number;
  cancellationDeadline: Date;
  cancellationPolicy: string;
}

interface ReservationHistoryListProps {
  reservations: Reservation[];
  onCancelReservation: (id: string, reason: string) => void;
}

export const ReservationHistoryList: React.FC<ReservationHistoryListProps> = ({
  reservations,
  onCancelReservation,
}: ReservationHistoryListProps) => {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const handleReservationPress = (reservation: Reservation): void => {
    setSelectedReservation(reservation);
  };

  const handleCancelReservation = (id: string, reason: string): void => {
    onCancelReservation(id, reason);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      case 'upcoming':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '利用済み';
      case 'cancelled':
        return 'キャンセル済み';
      case 'upcoming':
        return '予定';
      default:
        return status;
    }
  };

  const renderReservationItem = ({ item }: { item: Reservation }) => (
    <TouchableOpacity
      style={styles.reservationItem}
      onPress={() => handleReservationPress(item)}
    >
      <Image
        source={{ uri: item.facilityImage }}
        style={styles.facilityImage}
      />
      <View style={styles.reservationInfo}>
        <Text style={styles.facilityName}>{item.facilityName}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Calendar size={16} color="#666" />
          <Text style={styles.infoText}>
            {format(item.date, 'yyyy年MM月dd日 (EEEE)', { locale: ja })}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={16} color="#666" />
          <Text style={styles.infoText}>{item.time}</Text>
        </View>
        <View style={styles.infoRow}>
          <Users size={16} color="#666" />
          <Text style={styles.infoText}>{item.numberOfPeople}名</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reservations}
        renderItem={({ item }: { item: Reservation }) => (
          <ReservationHistoryCard
            reservation={item}
            onPress={() => handleReservationPress(item)}
            onCancel={handleCancelReservation}
          />
        )}
        keyExtractor={(item: Reservation) => item.id}
        contentContainerStyle={styles.listContent}
      />
      {selectedReservation && (
        <ReservationHistoryDetail
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  reservationItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  facilityImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  reservationInfo: {
    padding: 16,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
}); 