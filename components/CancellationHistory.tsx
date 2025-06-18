import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Calendar, Clock, DollarSign, FileText } from 'lucide-react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface CancellationRecord {
  id: string;
  facilityName: string;
  date: Date;
  time: string;
  amount: number;
  cancellationFee: number;
  reason?: string;
  cancelledAt: Date;
}

interface CancellationHistoryProps {
  cancellations: CancellationRecord[];
  onPress: (cancellation: CancellationRecord) => void;
}

export const CancellationHistory: React.FC<CancellationHistoryProps> = ({
  cancellations,
  onPress,
}) => {
  const renderCancellationItem = ({ item }: { item: CancellationRecord }) => (
    <TouchableOpacity
      style={styles.cancellationItem}
      onPress={() => onPress(item)}
    >
      <View style={styles.header}>
        <Text style={styles.facilityName}>{item.facilityName}</Text>
        <Text style={styles.cancelledAt}>
          {format(item.cancelledAt, 'yyyy/MM/dd HH:mm')}にキャンセル
        </Text>
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
        <DollarSign size={16} color="#666" />
        <Text style={styles.infoText}>
          予約金額: ¥{item.amount.toLocaleString()}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <DollarSign size={16} color="#F44336" />
        <Text style={[styles.infoText, styles.cancellationFee]}>
          キャンセル料金: ¥{item.cancellationFee.toLocaleString()}
        </Text>
      </View>

      {item.reason && (
        <View style={styles.infoRow}>
          <FileText size={16} color="#666" />
          <Text style={styles.infoText} numberOfLines={2}>
            キャンセル理由: {item.reason}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cancellations}
        renderItem={renderCancellationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
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
  cancellationItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  cancelledAt: {
    fontSize: 12,
    color: '#666',
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
    flex: 1,
  },
  cancellationFee: {
    color: '#F44336',
    fontWeight: 'bold',
  },
}); 