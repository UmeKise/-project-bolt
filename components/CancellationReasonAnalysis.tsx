import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { CancellationRecord, CancellationReason } from '../types/cancellation';

interface CancellationReasonAnalysisProps {
  records: CancellationRecord[];
}

export const CancellationReasonAnalysis: React.FC<CancellationReasonAnalysisProps> = ({
  records,
}) => {
  const [loading, setLoading] = useState(true);
  const [reasonAnalysis, setReasonAnalysis] = useState<CancellationReason[]>([]);
  const [totalCancellations, setTotalCancellations] = useState(0);

  useEffect(() => {
    analyzeReasons();
  }, [records]);

  const analyzeReasons = () => {
    setLoading(true);
    const reasonMap = new Map<string, CancellationReason>();

    records.forEach((record) => {
      const reason = record.reason || '未指定';
      const existing = reasonMap.get(reason);

      if (existing) {
        existing.count++;
        existing.totalAmount += record.cancellationFee;
        existing.averageAmount = existing.totalAmount / existing.count;
      } else {
        reasonMap.set(reason, {
          reason,
          count: 1,
          percentage: 0,
          totalAmount: record.cancellationFee,
          averageAmount: record.cancellationFee,
        });
      }
    });

    const total = records.length;
    const analysis = Array.from(reasonMap.values()).map((item) => ({
      ...item,
      percentage: (item.count / total) * 100,
    }));

    setReasonAnalysis(analysis);
    setTotalCancellations(total);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const chartData = reasonAnalysis.map((item) => ({
    name: item.reason,
    count: item.count,
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>キャンセル理由分析</Text>
        <Text style={styles.subtitle}>
          総キャンセル数: {totalCancellations}件
        </Text>
      </View>

      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          width={350}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      <View style={styles.detailsContainer}>
        {reasonAnalysis.map((item) => (
          <View key={item.reason} style={styles.reasonItem}>
            <Text style={styles.reasonText}>{item.reason}</Text>
            <View style={styles.reasonDetails}>
              <Text style={styles.reasonCount}>
                件数: {item.count}件 ({item.percentage.toFixed(1)}%)
              </Text>
              <Text style={styles.reasonAmount}>
                平均金額: ¥{item.averageAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  chartContainer: {
    alignItems: 'center',
    padding: 16,
  },
  detailsContainer: {
    padding: 16,
  },
  reasonItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  reasonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reasonDetails: {
    marginLeft: 8,
  },
  reasonCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  reasonAmount: {
    fontSize: 14,
    color: '#666',
  },
}); 