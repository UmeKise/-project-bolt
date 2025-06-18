import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { X, AlertTriangle, Clock } from 'lucide-react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { generateCancellationEmail, sendCancellationEmail } from '../utils/emailService';
import { calculateCancellationFee, getCancellationPolicy } from '../utils/cancellationPolicy';

interface ReservationCancelModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  facilityName: string;
  facilityId: string;
  date: Date;
  time: string;
  numberOfPeople: number;
  amount: number;
  email: string;
}

export default function ReservationCancelModal({
  visible,
  onClose,
  onConfirm,
  facilityName,
  facilityId,
  date,
  time,
  numberOfPeople,
  amount,
  email,
}: ReservationCancelModalProps) {
  const [cancelReason, setCancelReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cancellationFee, setCancellationFee] = useState(0);
  const [cancellationRule, setCancellationRule] = useState<{
    description: string;
  }>({ description: '' });

  useEffect(() => {
    if (visible) {
      const policy = getCancellationPolicy(facilityId);
      const { fee, rule } = calculateCancellationFee(amount, date, policy);
      setCancellationFee(fee);
      setCancellationRule(rule);
    }
  }, [visible, facilityId, amount, date]);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);

      // キャンセル確認メールを送信
      const emailTemplate = generateCancellationEmail(
        {
          id: '',
          facilityName,
          facilityImage: '',
          date,
          time,
          numberOfPeople,
          status: 'cancelled',
          address: '',
          phone: '',
          email,
          amount,
          cancellationDeadline: date,
          cancellationPolicy: cancellationRule.description,
        },
        cancellationFee,
        cancelReason
      );

      await sendCancellationEmail(email, emailTemplate);

      // キャンセル処理を実行
      onConfirm(cancelReason);
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      // TODO: エラーメッセージを表示
    } finally {
      setIsLoading(false);
    }
  };

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
            <Text style={styles.title}>予約のキャンセル</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.warningContainer}>
              <AlertTriangle size={24} color="#F44336" />
              <Text style={styles.warningText}>
                この予約をキャンセルしてもよろしいですか？
              </Text>
            </View>

            <View style={styles.reservationInfo}>
              <Text style={styles.facilityName}>{facilityName}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>日付：</Text>
                <Text style={styles.infoValue}>
                  {format(date, 'yyyy年M月d日', { locale: ja })}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>時間：</Text>
                <Text style={styles.infoValue}>{time}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>人数：</Text>
                <Text style={styles.infoValue}>{numberOfPeople}名</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>予約金額：</Text>
                <Text style={styles.infoValue}>¥{amount.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.feeContainer}>
              <Text style={styles.feeTitle}>キャンセル料金</Text>
              <Text style={styles.feeAmount}>¥{cancellationFee.toLocaleString()}</Text>
              <Text style={styles.feeNote}>{cancellationRule.description}</Text>
            </View>

            <View style={styles.reasonContainer}>
              <Text style={styles.reasonTitle}>キャンセル理由（任意）</Text>
              <TextInput
                style={styles.reasonInput}
                multiline
                numberOfLines={4}
                placeholder="キャンセルの理由をご記入ください"
                value={cancelReason}
                onChangeText={setCancelReason}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>キャンセルしない</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>予約をキャンセル</Text>
              )}
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
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 16,
    color: '#F44336',
    marginLeft: 8,
    flex: 1,
  },
  reservationInfo: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  facilityName: {
    fontSize: 18,
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
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  feeContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  feeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  feeAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
  },
  feeNote: {
    fontSize: 14,
    color: '#666',
  },
  reasonContainer: {
    marginBottom: 16,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
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
    backgroundColor: '#F44336',
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