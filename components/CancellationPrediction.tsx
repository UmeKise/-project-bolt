import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { format, subMonths, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CancellationRecord, CancellationPrediction } from '../types/cancellation';

interface CancellationPredictionProps {
  records: CancellationRecord[];
}

export const CancellationPrediction: React.FC<CancellationPredictionProps> = ({
  records,
}) => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'1m' | '3m' | '6m'>('3m');
  const [predictionData, setPredictionData] = useState<CancellationPrediction[]>([]);

  useEffect(() => {
    calculatePredictions();
  }, [records, selectedPeriod]);

  const calculatePredictions = () => {
    setLoading(true);

    // 期間に応じてデータをフィルタリング
    const now = new Date();
    const monthsAgo = selectedPeriod === '1m' ? 1 : selectedPeriod === '3m' ? 3 : 6;
    const startDate = subMonths(now, monthsAgo);

    const filteredRecords = records.filter((record) => {
      const recordDate = parseISO(record.cancellationDate);
      return recordDate >= startDate;
    });

    // 月別のデータを集計
    const monthlyData = new Map<string, number>();
    filteredRecords.forEach((record) => {
      const month = format(parseISO(record.cancellationDate), 'yyyy-MM');
      monthlyData.set(month, (monthlyData.get(month) || 0) + 1);
    });

    // 予測データを生成
    const predictions: CancellationPrediction[] = [];
    const months = Array.from(monthlyData.keys()).sort();

    months.forEach((month, index) => {
      const actual = monthlyData.get(month) || 0;
      let predicted = actual;
      let confidence = 1;

      // 過去のデータに基づいて予測を計算
      if (index > 0) {
        const prevMonth = months[index - 1];
        const prevActual = monthlyData.get(prevMonth) || 0;
        predicted = Math.round(prevActual * 0.9 + actual * 0.1); // 単純な移動平均
        confidence = 0.8 - (index * 0.1); // 時間が経つほど信頼度が下がる
      }

      predictions.push({
        month,
        actual,
        predicted,
        confidence,
      });
    });

    // 将来の予測を追加
    const lastMonth = months[months.length - 1];
    const lastActual = monthlyData.get(lastMonth) || 0;
    const futureMonths = 3;

    for (let i = 1; i <= futureMonths; i++) {
      const futureMonth = format(subMonths(parseISO(lastMonth + '-01'), -i), 'yyyy-MM');
      const predicted = Math.round(lastActual * (1 - i * 0.1)); // 徐々に減少する予測
      const confidence = 0.5 - (i * 0.1); // 将来の予測ほど信頼度が低い

      predictions.push({
        month: futureMonth,
        actual: 0,
        predicted,
        confidence,
      });
    }

    setPredictionData(predictions);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const chartData = {
    labels: predictionData.map((item) => format(parseISO(item.month + '-01'), 'MM月')),
    datasets: [
      {
        data: predictionData.map((item) => item.actual),
        color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: predictionData.map((item) => item.predicted),
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>キャンセル予測分析</Text>
        <View style={styles.periodSelector}>
          <Text
            style={[
              styles.periodButton,
              selectedPeriod === '1m' && styles.selectedPeriod,
            ]}
            onPress={() => setSelectedPeriod('1m')}
          >
            1ヶ月
          </Text>
          <Text
            style={[
              styles.periodButton,
              selectedPeriod === '3m' && styles.selectedPeriod,
            ]}
            onPress={() => setSelectedPeriod('3m')}
          >
            3ヶ月
          </Text>
          <Text
            style={[
              styles.periodButton,
              selectedPeriod === '6m' && styles.selectedPeriod,
            ]}
            onPress={() => setSelectedPeriod('6m')}
          >
            6ヶ月
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={350}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'blue' }]} />
            <Text style={styles.legendText}>実際のキャンセル数</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'red' }]} />
            <Text style={styles.legendText}>予測キャンセル数</Text>
          </View>
        </View>
      </View>

      <View style={styles.predictionsContainer}>
        {predictionData.map((item) => (
          <View key={item.month} style={styles.predictionItem}>
            <Text style={styles.monthText}>
              {format(parseISO(item.month + '-01'), 'yyyy年MM月', { locale: ja })}
            </Text>
            <View style={styles.predictionDetails}>
              <Text style={styles.actualText}>
                実際: {item.actual}件
              </Text>
              <Text style={styles.predictedText}>
                予測: {item.predicted}件
              </Text>
              <Text style={styles.confidenceText}>
                信頼度: {(item.confidence * 100).toFixed(0)}%
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
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  periodButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  selectedPeriod: {
    backgroundColor: '#007AFF',
    color: '#fff',
  },
  chartContainer: {
    alignItems: 'center',
    padding: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  predictionsContainer: {
    padding: 16,
  },
  predictionItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  predictionDetails: {
    marginLeft: 8,
  },
  actualText: {
    fontSize: 14,
    color: '#0066cc',
    marginBottom: 4,
  },
  predictedText: {
    fontSize: 14,
    color: '#cc0000',
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
  },
}); 