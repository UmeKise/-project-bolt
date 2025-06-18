import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { CreditCard, Download, Receipt } from 'lucide-react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Payment {
  id: string;
  amount: number;
  date: Date;
  status: 'completed' | 'refunded' | 'failed';
  facilityName: string;
  reservationId: string;
}

interface PaymentHistoryManagerProps {
  payments: Payment[];
  onPaymentPress: (payment: Payment) => void;
  onDownloadReceipt: (payment: Payment) => void;
}

export default function PaymentHistoryManager({
  payments,
  onPaymentPress,
  onDownloadReceipt,
}: PaymentHistoryManagerProps) {
  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'refunded':
        return '#FF9800';
      case 'failed':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'refunded':
        return '返金済み';
      case 'failed':
        return '失敗';
      default:
        return status;
    }
  };

  const renderPayment = ({ item }: { item: Payment }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => onPaymentPress(item)}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <CreditCard size={20} color="#666" />
          <Text style={styles.facilityName}>{item.facilityName}</Text>
        </View>
        <Text
          style={[
            styles.status,
            { color: getStatusColor(item.status) },
          ]}
        >
          {getStatusText(item.status)}
        </Text>
      </View>

      <View style={styles.paymentDetails}>
        <Text style={styles.amount}>
          ¥{item.amount.toLocaleString()}
        </Text>
        <Text style={styles.date}>
          {format(item.date, 'yyyy年MM月dd日 HH:mm', { locale: ja })}
        </Text>
      </View>

      <View style={styles.paymentFooter}>
        <Text style={styles.reservationId}>
          予約番号: {item.reservationId}
        </Text>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => onDownloadReceipt(item)}
        >
          <Download size={16} color="#4CAF50" />
          <Text style={styles.downloadText}>領収書</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Receipt size={48} color="#ccc" />
          <Text style={styles.emptyText}>
            支払い履歴がありません。
          </Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderPayment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    color: '#333',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentDetails: {
    marginBottom: 12,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  reservationId: {
    fontSize: 12,
    color: '#666',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
}); 