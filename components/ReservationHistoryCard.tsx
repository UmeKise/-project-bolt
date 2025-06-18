import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Calendar, Clock, Users, MapPin, ChevronRight, X } from 'lucide-react-native';
import ReservationCancelModal from './ReservationCancelModal';

interface ReservationHistoryCardProps {
  reservation: {
    id: string;
    facilityName: string;
    facilityImage: string;
    date: Date;
    time: string;
    numberOfPeople: number;
    status: 'upcoming' | 'completed' | 'cancelled';
    address: string;
    amount: number;
    cancellationDeadline: Date;
    cancellationPolicy: string;
  };
  onPress: () => void;
  onCancel: (id: string, reason: string) => void;
}

export default function ReservationHistoryCard({
  reservation,
  onPress,
  onCancel,
}: ReservationHistoryCardProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '#4A90E2';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '予約済み';
      case 'completed':
        return '完了';
      case 'cancelled':
        return 'キャンセル';
      default:
        return '';
    }
  };

  const handleCancel = (reason: string) => {
    onCancel(reservation.id, reason);
    setShowCancelModal(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
      >
        <Image
          source={{ uri: reservation.facilityImage }}
          style={styles.image}
        />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.facilityName}>{reservation.facilityName}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(reservation.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusText(reservation.status)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={16} color="#666" />
            <Text style={styles.infoText}>{formatDate(reservation.date)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Clock size={16} color="#666" />
            <Text style={styles.infoText}>{reservation.time}</Text>
          </View>

          <View style={styles.infoRow}>
            <Users size={16} color="#666" />
            <Text style={styles.infoText}>{reservation.numberOfPeople}名</Text>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={16} color="#666" />
            <Text style={styles.infoText} numberOfLines={1}>
              {reservation.address}
            </Text>
          </View>
        </View>

        {reservation.status === 'upcoming' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowCancelModal(true)}
          >
            <X size={20} color="#F44336" />
          </TouchableOpacity>
        )}
        <ChevronRight size={20} color="#666" />
      </TouchableOpacity>

      <ReservationCancelModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        facilityName={reservation.facilityName}
        date={reservation.date}
        time={reservation.time}
        numberOfPeople={reservation.numberOfPeople}
        cancellationPolicy={reservation.cancellationPolicy}
        reservationAmount={reservation.amount}
        cancellationDeadline={reservation.cancellationDeadline}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  cancelButton: {
    padding: 8,
    marginRight: 8,
  },
}); 