import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Calendar, Clock, Users, X } from 'lucide-react-native';

interface ReservationConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  facilityName: string;
  reservation: {
    date: Date;
    time: string;
    numberOfPeople: number;
    notes: string;
  };
}

export default function ReservationConfirmationModal({
  visible,
  onClose,
  onConfirm,
  facilityName,
  reservation,
}: ReservationConfirmationModalProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>予約内容の確認</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.facilityInfo}>
              <Text style={styles.facilityName}>{facilityName}</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color="#666" />
                <Text style={styles.sectionTitle}>日付</Text>
              </View>
              <Text style={styles.sectionContent}>
                {formatDate(reservation.date)}
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock size={20} color="#666" />
                <Text style={styles.sectionTitle}>時間</Text>
              </View>
              <Text style={styles.sectionContent}>{reservation.time}</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Users size={20} color="#666" />
                <Text style={styles.sectionTitle}>人数</Text>
              </View>
              <Text style={styles.sectionContent}>
                {reservation.numberOfPeople}名
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>予約を確定する</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  facilityInfo: {
    marginBottom: 24,
  },
  facilityName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  sectionContent: {
    fontSize: 16,
    color: '#333',
    marginLeft: 28,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 