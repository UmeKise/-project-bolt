import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CancellationRecord } from '../types/cancellation';

interface CustomReportProps {
  records: CancellationRecord[];
  onSave: (config: ReportConfig) => void;
}

interface ReportConfig {
  name: string;
  description: string;
  dateRange: {
    start: string;
    end: string;
  };
  metrics: {
    totalFees: boolean;
    averageFees: boolean;
    cancellationRate: boolean;
    reasonBreakdown: boolean;
  };
  charts: {
    monthlyTrend: boolean;
    facilityBreakdown: boolean;
    reasonDistribution: boolean;
  };
  filters: {
    minAmount: number;
    maxAmount: number;
    facilities: string[];
    reasons: string[];
  };
}

export const CustomReport: React.FC<CustomReportProps> = ({ records, onSave }) => {
  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    description: '',
    dateRange: {
      start: format(new Date(), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
    },
    metrics: {
      totalFees: true,
      averageFees: true,
      cancellationRate: true,
      reasonBreakdown: true,
    },
    charts: {
      monthlyTrend: true,
      facilityBreakdown: true,
      reasonDistribution: true,
    },
    filters: {
      minAmount: 0,
      maxAmount: 100000,
      facilities: [],
      reasons: [],
    },
  });

  const handleSave = () => {
    if (!config.name.trim()) {
      Alert.alert('エラー', 'レポート名を入力してください');
      return;
    }

    onSave(config);
  };

  const toggleMetric = (metric: keyof ReportConfig['metrics']) => {
    setConfig((prev) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [metric]: !prev.metrics[metric],
      },
    }));
  };

  const toggleChart = (chart: keyof ReportConfig['charts']) => {
    setConfig((prev) => ({
      ...prev,
      charts: {
        ...prev.charts,
        [chart]: !prev.charts[chart],
      },
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>レポート設定</Text>
        <TextInput
          style={styles.input}
          placeholder="レポート名"
          value={config.name}
          onChangeText={(text) => setConfig((prev) => ({ ...prev, name: text }))}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="説明"
          multiline
          numberOfLines={3}
          value={config.description}
          onChangeText={(text) =>
            setConfig((prev) => ({ ...prev, description: text }))
          }
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>期間</Text>
        <View style={styles.dateInputs}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="開始日 (YYYY-MM-DD)"
            value={config.dateRange.start}
            onChangeText={(text) =>
              setConfig((prev) => ({
                ...prev,
                dateRange: { ...prev.dateRange, start: text },
              }))
            }
          />
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="終了日 (YYYY-MM-DD)"
            value={config.dateRange.end}
            onChangeText={(text) =>
              setConfig((prev) => ({
                ...prev,
                dateRange: { ...prev.dateRange, end: text },
              }))
            }
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>メトリクス</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>総キャンセル料</Text>
          <Switch
            value={config.metrics.totalFees}
            onValueChange={() => toggleMetric('totalFees')}
          />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>平均キャンセル料</Text>
          <Switch
            value={config.metrics.averageFees}
            onValueChange={() => toggleMetric('averageFees')}
          />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>キャンセル率</Text>
          <Switch
            value={config.metrics.cancellationRate}
            onValueChange={() => toggleMetric('cancellationRate')}
          />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>理由別内訳</Text>
          <Switch
            value={config.metrics.reasonBreakdown}
            onValueChange={() => toggleMetric('reasonBreakdown')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>グラフ</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>月次トレンド</Text>
          <Switch
            value={config.charts.monthlyTrend}
            onValueChange={() => toggleChart('monthlyTrend')}
          />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>施設別内訳</Text>
          <Switch
            value={config.charts.facilityBreakdown}
            onValueChange={() => toggleChart('facilityBreakdown')}
          />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>理由別分布</Text>
          <Switch
            value={config.charts.reasonDistribution}
            onValueChange={() => toggleChart('reasonDistribution')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>フィルター</Text>
        <View style={styles.filterInputs}>
          <TextInput
            style={[styles.input, styles.amountInput]}
            placeholder="最小金額"
            keyboardType="numeric"
            value={config.filters.minAmount.toString()}
            onChangeText={(text) =>
              setConfig((prev) => ({
                ...prev,
                filters: {
                  ...prev.filters,
                  minAmount: parseInt(text) || 0,
                },
              }))
            }
          />
          <TextInput
            style={[styles.input, styles.amountInput]}
            placeholder="最大金額"
            keyboardType="numeric"
            value={config.filters.maxAmount.toString()}
            onChangeText={(text) =>
              setConfig((prev) => ({
                ...prev,
                filters: {
                  ...prev.filters,
                  maxAmount: parseInt(text) || 0,
                },
              }))
            }
          />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>レポートを保存</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    marginRight: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  filterInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountInput: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
}); 