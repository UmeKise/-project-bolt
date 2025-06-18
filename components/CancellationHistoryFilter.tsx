import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Search, Filter, X } from 'lucide-react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CancellationHistoryFilterProps {
  onFilter: (filters: CancellationFilters) => void;
}

export interface CancellationFilters {
  searchText: string;
  startDate: Date | null;
  endDate: Date | null;
  minAmount: number | null;
  maxAmount: number | null;
}

export const CancellationHistoryFilter: React.FC<CancellationHistoryFilterProps> = ({
  onFilter,
}) => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');

  const handleApplyFilters = () => {
    const filters: CancellationFilters = {
      searchText,
      startDate,
      endDate,
      minAmount: minAmount ? parseInt(minAmount, 10) : null,
      maxAmount: maxAmount ? parseInt(maxAmount, 10) : null,
    };
    onFilter(filters);
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    setSearchText('');
    setStartDate(null);
    setEndDate(null);
    setMinAmount('');
    setMaxAmount('');
    onFilter({
      searchText: '',
      startDate: null,
      endDate: null,
      minAmount: null,
      maxAmount: null,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="施設名で検索"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>フィルター</Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>期間</Text>
                <View style={styles.dateRangeContainer}>
                  <View style={styles.dateInput}>
                    <Text style={styles.dateLabel}>開始日</Text>
                    <DateTimePicker
                      value={startDate || new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, date) => setStartDate(date || null)}
                    />
                    {startDate && (
                      <Text style={styles.dateValue}>
                        {format(startDate, 'yyyy/MM/dd')}
                      </Text>
                    )}
                  </View>
                  <View style={styles.dateInput}>
                    <Text style={styles.dateLabel}>終了日</Text>
                    <DateTimePicker
                      value={endDate || new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, date) => setEndDate(date || null)}
                    />
                    {endDate && (
                      <Text style={styles.dateValue}>
                        {format(endDate, 'yyyy/MM/dd')}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>キャンセル料金</Text>
                <View style={styles.amountRangeContainer}>
                  <View style={styles.amountInput}>
                    <Text style={styles.amountLabel}>最小金額</Text>
                    <TextInput
                      style={styles.amountTextInput}
                      keyboardType="numeric"
                      value={minAmount}
                      onChangeText={setMinAmount}
                      placeholder="0"
                    />
                  </View>
                  <View style={styles.amountInput}>
                    <Text style={styles.amountLabel}>最大金額</Text>
                    <TextInput
                      style={styles.amountTextInput}
                      keyboardType="numeric"
                      value={maxAmount}
                      onChangeText={setMaxAmount}
                      placeholder="999999"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={handleResetFilters}
              >
                <Text style={styles.resetButtonText}>リセット</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.applyButton]}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyButtonText}>適用</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  filterContent: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  amountRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  amountTextInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  modalFooter: {
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
  resetButton: {
    backgroundColor: '#f5f5f5',
  },
  applyButton: {
    backgroundColor: '#2196F3',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#666',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
}); 