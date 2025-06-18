import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { machineLearningService } from '../services/MachineLearningService';
import { CancellationRecord, CancellationPrediction, AnomalyDetection, PersonalizedRecommendation } from '../types/cancellation';
import { Alert, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react-native';

interface MachineLearningDashboardProps {
  records: CancellationRecord[];
}

export const MachineLearningDashboard: React.FC<MachineLearningDashboardProps> = ({ records }) => {
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<CancellationPrediction[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [predResults, anomalyResults, recommendationResults] = await Promise.all([
          machineLearningService.predictCancellations(records),
          machineLearningService.detectAnomalies(records),
          machineLearningService.generateRecommendations(records)
        ]);

        setPredictions(predResults);
        setAnomalies(anomalyResults);
        setRecommendations(recommendationResults);
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [records]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>分析中...</Text>
      </View>
    );
  }

  const chartData = {
    labels: predictions.map(p => p.month),
    datasets: [
      {
        data: predictions.map(p => p.actual),
        color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
        strokeWidth: 2
      },
      {
        data: predictions.map(p => p.predicted),
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>予測分析</Text>
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
              borderRadius: 16
            }
          }}
          style={styles.chart}
        />
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'blue' }]} />
            <Text>実際の値</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'red' }]} />
            <Text>予測値</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>異常検知</Text>
        {anomalies.map((anomaly, index) => (
          <View key={index} style={styles.anomalyCard}>
            <AlertCircle size={24} color={anomaly.severity === 'high' ? 'red' : 'orange'} />
            <View style={styles.anomalyContent}>
              <Text style={styles.anomalyDate}>{anomaly.date}</Text>
              <Text style={styles.anomalyValue}>
                値: {anomaly.value} (期待値: {anomaly.expectedValue.toFixed(2)})
              </Text>
              <Text style={styles.anomalyDeviation}>
                偏差: {anomaly.deviation.toFixed(2)}標準偏差
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>推奨事項</Text>
        {recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              {recommendation.type === 'alert' ? (
                <Alert size={24} color="red" />
              ) : recommendation.type === 'policy' ? (
                <TrendingUp size={24} color="orange" />
              ) : (
                <TrendingDown size={24} color="green" />
              )}
              <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
            </View>
            <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
            <View style={styles.actionItems}>
              {recommendation.actionItems.map((item, itemIndex) => (
                <Text key={itemIndex} style={styles.actionItem}>• {item}</Text>
              ))}
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
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  anomalyCard: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  anomalyContent: {
    marginLeft: 10,
    flex: 1,
  },
  anomalyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  anomalyValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  anomalyDeviation: {
    fontSize: 14,
    color: '#ff6b6b',
    marginTop: 2,
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4dabf7',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  actionItems: {
    marginTop: 10,
  },
  actionItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
}); 