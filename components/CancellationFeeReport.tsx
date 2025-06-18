import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ja } from 'date-fns/locale';

interface CancellationRecord {
  id: string;
  facilityName: string;
  date: Date;
  amount: number;
  cancellationFee: number;
  reason?: string;
  cancelledAt: Date;
}

interface CancellationFeeReportProps {
  records: CancellationRecord[];
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

export const CancellationFeeReport: React.FC<CancellationFeeReportProps> = ({
  records,
  onDateRangeChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'1m' | '3m' | '6m'>('3m');
  const [monthlyData, setMonthlyData] = useState<{
    labels: string[];
    datasets: { data: number[] }[];
  }>({ labels: [], datasets: [{ data: [] }] });

  useEffect(() => {
    const calculateMonthlyData = () => {
      const endDate = new Date();
      const startDate = subMonths(endDate, selectedPeriod === '1m' ? 1 : selectedPeriod === '3m' ? 3 : 6);
      onDateRangeChange(startDate, endDate);

      const monthlyFees: { [key: string]: number } = {};
      let currentDate = startDate;

      while (currentDate <= endDate) {
        const monthKey = format(currentDate, 'yyyy-MM');
        monthlyFees[monthKey] = 0;
        currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      }

      records.forEach((record) => {
        const monthKey = format(record.cancelledAt, 'yyyy-MM');
        if (monthlyFees[monthKey] !== undefined) {
          monthlyFees[monthKey] += record.cancellationFee;
        }
      });

      const labels = Object.keys(monthlyFees).map((key) =>
        format(new Date(key), 'MM月', { locale: ja })
      );
      const data = Object.values(monthlyFees);

      setMonthlyData({
        labels,
        datasets: [{ data }],
      });
    };

    calculateMonthlyData();
  }, [records, selectedPeriod]);

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const calculateTotalFees = () => {
    return records.reduce((sum, record) => sum + record.cancellationFee, 0);
  };

  const calculateAverageFee = () => {
    if (records.length === 0) return 0;
    return calculateTotalFees() / records.length;
  };

  const calculateCancellationRate = () => {
    if (records.length === 0) return 0;
    const totalAmount = records.reduce((sum, record) => sum + record.amount, 0);
    return (calculateTotalFees() / totalAmount) * 100;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>キャンセル料金レポート</Text>
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === '1m' && styles.selectedPeriod,
            ]}
            onPress={() => setSelectedPeriod('1m')}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === '1m' && styles.selectedPeriodText,
              ]}
            >
              1ヶ月
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === '3m' && styles.selectedPeriod,
            ]}
            onPress={() => setSelectedPeriod('3m')}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === '3m' && styles.selectedPeriodText,
              ]}
            >
              3ヶ月
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === '6m' && styles.selectedPeriod,
            ]}
            onPress={() => setSelectedPeriod('6m')}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === '6m' && styles.selectedPeriodText,
              ]}
            >
              6ヶ月
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>総キャンセル料金</Text>
            <Text style={styles.summaryValue}>
              ¥{calculateTotalFees().toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>平均キャンセル料金</Text>
            <Text style={styles.summaryValue}>
              ¥{calculateAverageFee().toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>キャンセル率</Text>
            <Text style={styles.summaryValue}>
              {calculateCancellationRate().toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>月別キャンセル料金推移</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#2196F3" />
          ) : (
            <BarChart
              data={monthlyData}
              width={350}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
              fromZero
            />
          )}
        </View>

        <View style={styles.facilityBreakdown}>
          <Text style={styles.sectionTitle}>施設別キャンセル料金</Text>
          {Object.entries(
            records.reduce((acc, record) => {
              acc[record.facilityName] = (acc[record.facilityName] || 0) + record.cancellationFee;
              return acc;
            }, {} as { [key: string]: number })
          )
            .sort(([, a], [, b]) => b - a)
            .map(([facility, amount]) => (
              <View key={facility} style={styles.facilityItem}>
                <Text style={styles.facilityName}>{facility}</Text>
                <Text style={styles.facilityAmount}>
                  ¥{amount.toLocaleString()}
                </Text>
              </View>
            ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
  },
  selectedPeriod: {
    backgroundColor: '#2196F3',
  },
  periodButtonText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  selectedPeriodText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  chartContainer: {
    padding: 16,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  facilityBreakdown: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  facilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  facilityName: {
    fontSize: 14,
    color: '#333',
  },
  facilityAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
}); 