import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, ArrowRight } from 'lucide-react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ReservationEditConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  facilityName: string;
  currentDate: Date;
  currentTime: string;
  currentNumberOfPeople: number;
  newDate: Date;
  newTime: string;
  newNumberOfPeople: number;
}

export default function ReservationEditConfirmModal({
  visible,
  onClose,
  onConfirm,
  facilityName,
  currentDate,
  currentTime,
  currentNumberOfPeople,
  newDate,
  newTime,
  newNumberOfPeople,
}: ReservationEditConfirmModalProps) {
  const hasChanges =
    currentDate.getTime() !== newDate.getTime() ||
    currentTime !== newTime ||
    currentNumberOfPeople !== newNumberOfPeople;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>予約変更の確認</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.facilityName}>{facilityName}</Text>

            <View style={styles.changeContainer}>
              <View style={styles.currentInfo}>
                <Text style={styles.sectionTitle}>現在の予約</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>日付：</Text>
                  <Text style={styles.infoValue}>
                    {format(currentDate, 'yyyy年M月d日', { locale: ja })}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>時間：</Text>
                  <Text style={styles.infoValue}>{currentTime}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>人数：</Text>
                  <Text style={styles.infoValue}>{currentNumberOfPeople}名</Text>
                </View>
              </View>

              <View style={styles.arrowContainer}>
                <ArrowRight size={24} color="#666" />
              </View>

              <View style={styles.newInfo}>
                <Text style={styles.sectionTitle}>変更後の予約</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>日付：</Text>
                  <Text style={styles.infoValue}>
                    {format(newDate, 'yyyy年M月d日', { locale: ja })}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>時間：</Text>
                  <Text style={styles.infoValue}>{newTime}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>人数：</Text>
                  <Text style={styles.infoValue}>{newNumberOfPeople}名</Text>
                </View>
              </View>
            </View>

            {!hasChanges && (
              <Text style={styles.noChangesText}>
                変更内容がありません。日付、時間、または人数を変更してください。
              </Text>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                !hasChanges && styles.disabledButton,
              ]}
              onPress={onConfirm}
              disabled={!hasChanges}
            >
              <Text style={styles.confirmButtonText}>変更を確定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  facilityName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentInfo: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  arrowContainer: {
    paddingHorizontal: 8,
  },
  newInfo: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 60,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  noChangesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
}); 