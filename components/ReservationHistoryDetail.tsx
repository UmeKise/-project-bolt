import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Calendar, Clock, Users, MapPin, Phone, Mail, X } from 'lucide-react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import ReservationCancelModal from './ReservationCancelModal';
import { Reservation } from './ReservationHistoryList';

interface ReservationHistoryDetailProps {
  reservation: Reservation;
  onClose: () => void;
  onCancel: (id: string, reason: string) => void;
}

export const ReservationHistoryDetail: React.FC<ReservationHistoryDetailProps> = ({
  reservation,
  onClose,
  onCancel,
}: ReservationHistoryDetailProps) => {
  const [showCancelModal, setShowCancelModal] = useState(false);

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

  const handleCancel = (reason: string) => {
    onCancel(reservation.id, reason);
    setShowCancelModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>予約詳細</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Image
          source={{ uri: reservation.facilityImage }}
          style={styles.facilityImage}
        />

        <View style={styles.section}>
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

        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Calendar size={20} color="#666" />
            <Text style={styles.infoText}>
              {format(reservation.date, 'yyyy年MM月dd日 (EEEE)', {
                locale: ja,
              })}
            </Text>
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
            <Mail size={20} color="#666" />
            <Text style={styles.infoText}>{reservation.email}</Text>
          </View>

          {reservation.status === 'upcoming' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCancelModal(true)}
            >
              <Text style={styles.cancelButtonText}>予約をキャンセル</Text>
            </TouchableOpacity>
          )}
        </View>

        {reservation.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>備考</Text>
            <Text style={styles.notes}>{reservation.notes}</Text>
          </View>
        )}
      </ScrollView>

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
    </View>
  );
};

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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  facilityImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  facilityName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notes: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 