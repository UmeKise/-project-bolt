import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { feedbackService, Feedback } from '../services/FeedbackService';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

interface FeedbackAnalysisProps {
  timeRange?: 'day' | 'week' | 'month' | 'year';
}

export const FeedbackAnalysis: React.FC<FeedbackAnalysisProps> = ({
  timeRange = 'week',
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<{
    averageRating: number;
    categoryDistribution: Record<string, number>;
    recentFeedback: Feedback[];
  } | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, [timeRange]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const data = await feedbackService.getFeedbackAnalysis();
      setAnalysis(data);
    } catch (error) {
      console.error('Failed to load feedback analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          データの読み込みに失敗しました
        </Text>
      </View>
    );
  }

  const chartData = {
    labels: ['1', '2', '3', '4', '5'],
    datasets: [
      {
        data: Object.values(analysis.categoryDistribution),
      },
    ],
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.text },
          ]}
        >
          平均評価
        </Text>
        <Text
          style={[
            styles.averageRating,
            { color: theme.colors.primary },
          ]}
        >
          {analysis.averageRating.toFixed(1)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.text },
          ]}
        >
          カテゴリー分布
        </Text>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.card,
            backgroundGradientFrom: theme.colors.card,
            backgroundGradientTo: theme.colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => theme.colors.primary,
            labelColor: (opacity = 1) => theme.colors.text,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: theme.colors.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.text },
          ]}
        >
          最近のフィードバック
        </Text>
        {analysis.recentFeedback.map((feedback, index) => (
          <View
            key={feedback.id}
            style={[
              styles.feedbackItem,
              {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.feedbackHeader}>
              <Text
                style={[
                  styles.feedbackCategory,
                  { color: theme.colors.primary },
                ]}
              >
                {feedback.category}
              </Text>
              <Text
                style={[
                  styles.feedbackRating,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {feedback.rating} / 5
              </Text>
            </View>
            <Text
              style={[
                styles.feedbackComment,
                { color: theme.colors.text },
              ]}
            >
              {feedback.comment}
            </Text>
            <Text
              style={[
                styles.feedbackTimestamp,
                { color: theme.colors.textSecondary },
              ]}
            >
              {new Date(feedback.timestamp).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  feedbackItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackCategory: {
    fontSize: 16,
    fontWeight: '500',
  },
  feedbackRating: {
    fontSize: 14,
  },
  feedbackComment: {
    fontSize: 14,
    marginBottom: 8,
  },
  feedbackTimestamp: {
    fontSize: 12,
  },
}); 