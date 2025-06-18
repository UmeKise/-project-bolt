import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { performanceMonitor } from '../utils/PerformanceMonitor';

interface PerformanceMetric {
  name: string;
  duration?: number;
  timestamp: number;
}

export const PerformanceMonitorComponent: React.FC = () => {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      const report = await performanceMonitor.getPerformanceReport();
      setMetrics(report.metrics);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <View
        style={[
          styles.floatingButton,
          { backgroundColor: theme.colors.primary },
        ]}
        onTouchEnd={() => setIsVisible(true)}
      >
        <Text style={[styles.buttonText, { color: theme.colors.background }]}>
          📊
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.colors.border },
        ]}
      >
        <Text
          style={[
            styles.title,
            { color: theme.colors.text },
          ]}
        >
          パフォーマンスモニター
        </Text>
        <Text
          style={[
            styles.closeButton,
            { color: theme.colors.primary },
          ]}
          onPress={() => setIsVisible(false)}
        >
          ✕
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {metrics.map((metric, index) => (
          <View
            key={index}
            style={[
              styles.metricItem,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <Text
              style={[
                styles.metricName,
                { color: theme.colors.text },
              ]}
            >
              {metric.name}
            </Text>
            {metric.duration && (
              <Text
                style={[
                  styles.metricDuration,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {metric.duration.toFixed(2)}ms
              </Text>
            )}
            <Text
              style={[
                styles.metricTimestamp,
                { color: theme.colors.textSecondary },
              ]}
            >
              {new Date(metric.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 300,
    height: 400,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 20,
    padding: 4,
  },
  content: {
    flex: 1,
  },
  metricItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  metricName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  metricDuration: {
    fontSize: 12,
  },
  metricTimestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 24,
  },
}); 