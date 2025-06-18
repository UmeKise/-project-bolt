import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { CreditCard, Download, Receipt } from 'lucide-react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Payment {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: Date;
  facilityName: string;
  reservationId: string;
  paymentMethod: string;
}

interface PaymentHistoryProps {
  payments: Payment[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  onPaymentPress: (payment: Payment) => void;
  onDownloadReceipt: (payment: Payment) => void;
}

export default function PaymentHistory({
  payments,
  isLoading = false,
  onLoadMore,
  onPaymentPress,
  onDownloadReceipt,
}: PaymentHistoryProps) {
  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FFC107';
      case 'failed':
        return '#F44336';
      case 'refunded':
        return '#9E9E9E';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'pending':
        return '処理中';
      case 'failed':
        return '失敗';
      case 'refunded':
        return '返金済み';
      default:
        return status;
    }
  };

  const renderItem = ({ item }: { item: Payment }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => onPaymentPress(item)}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.facilityName}>{item.facilityName}</Text>
          <Text style={styles.paymentDate}>
            {format(item.date, 'yyyy年MM月dd日 HH:mm', { locale: ja })}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>支払い金額</Text>
          <Text style={styles.amount}>¥{item.amount.toLocaleString()}</Text>
        </View>

        <View style={styles.paymentMethod}>
          <CreditCard size={16} color="#666" />
          <Text style={styles.paymentMethodText}>{item.paymentMethod}</Text>
        </View>
      </View>

      <View style={styles.paymentFooter}>
        <Text style={styles.reservationId}>
          予約ID: {item.reservationId}
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

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#4CAF50" />
      </View>
    );
  };

  if (payments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Receipt size={48} color="#E0E0E0" />
        <Text style={styles.emptyText}>
          支払い履歴がありません。
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={payments}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListFooterComponent={renderFooter}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reservationId: {
    fontSize: 12,
    color: '#666',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  downloadText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 4,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
}); 