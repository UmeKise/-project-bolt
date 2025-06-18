import { CancellationRecord, CancellationPrediction, AnomalyDetection, PersonalizedRecommendation } from '../types/cancellation';
import * as tf from '@tensorflow/tfjs';
import { format, subMonths } from 'date-fns';

class MachineLearningService {
  private model: tf.LayersModel | null = null;
  private isModelLoaded = false;

  // モデルの初期化
  async initializeModel() {
    try {
      // シンプルなLSTMモデルの構築
      const model = tf.sequential();
      model.add(tf.layers.lstm({
        units: 50,
        returnSequences: true,
        inputShape: [12, 1]
      }));
      model.add(tf.layers.dropout({ rate: 0.2 }));
      model.add(tf.layers.lstm({ units: 30, returnSequences: false }));
      model.add(tf.layers.dense({ units: 1 }));

      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError'
      });

      this.model = model;
      this.isModelLoaded = true;
    } catch (error) {
      console.error('モデルの初期化に失敗しました:', error);
      throw error;
    }
  }

  // 予測分析の実行
  async predictCancellations(records: CancellationRecord[]): Promise<CancellationPrediction[]> {
    if (!this.isModelLoaded) {
      await this.initializeModel();
    }

    try {
      // データの前処理
      const monthlyData = this.preprocessData(records);
      const tensorData = tf.tensor2d(monthlyData, [monthlyData.length, 1]);
      const normalizedData = this.normalizeData(tensorData);

      // 予測の実行
      const predictions = await this.model!.predict(normalizedData) as tf.Tensor;
      const predictedValues = await predictions.array() as number[];

      // 予測結果の整形
      return this.formatPredictions(predictedValues, records);
    } catch (error) {
      console.error('予測の実行に失敗しました:', error);
      throw error;
    }
  }

  // 異常検知の実行
  async detectAnomalies(records: CancellationRecord[]): Promise<AnomalyDetection[]> {
    try {
      const anomalies: AnomalyDetection[] = [];
      const monthlyData = this.preprocessData(records);
      
      // 統計的な異常検知
      const mean = this.calculateMean(monthlyData);
      const std = this.calculateStandardDeviation(monthlyData, mean);
      const threshold = 2; // 2標準偏差を閾値として使用

      monthlyData.forEach((value, index) => {
        const zScore = Math.abs((value - mean) / std);
        if (zScore > threshold) {
          anomalies.push({
            date: format(subMonths(new Date(), monthlyData.length - index - 1), 'yyyy-MM'),
            value: value,
            expectedValue: mean,
            deviation: zScore,
            severity: zScore > 3 ? 'high' : 'medium'
          });
        }
      });

      return anomalies;
    } catch (error) {
      console.error('異常検知の実行に失敗しました:', error);
      throw error;
    }
  }

  // パーソナライズされた推奨事項の生成
  async generateRecommendations(records: CancellationRecord[]): Promise<PersonalizedRecommendation[]> {
    try {
      const recommendations: PersonalizedRecommendation[] = [];
      const monthlyData = this.preprocessData(records);
      const anomalies = await this.detectAnomalies(records);

      // キャンセル率の傾向分析
      const trend = this.analyzeTrend(monthlyData);
      
      // 推奨事項の生成
      if (trend > 0.1) {
        recommendations.push({
          type: 'policy',
          title: 'キャンセル率の上昇傾向',
          description: 'キャンセル率が上昇傾向にあります。ポリシーの見直しを検討してください。',
          priority: 'high',
          actionItems: [
            'キャンセル料金の見直し',
            'キャンセル期限の調整',
            '特典の追加検討'
          ]
        });
      }

      // 異常値に基づく推奨事項
      anomalies.forEach(anomaly => {
        if (anomaly.severity === 'high') {
          recommendations.push({
            type: 'alert',
            title: '異常なキャンセル率を検出',
            description: `${anomaly.date}に異常なキャンセル率を検出しました。`,
            priority: 'high',
            actionItems: [
              '原因の調査',
              '顧客への確認',
              '一時的な対策の実施'
            ]
          });
        }
      });

      return recommendations;
    } catch (error) {
      console.error('推奨事項の生成に失敗しました:', error);
      throw error;
    }
  }

  // データの前処理
  private preprocessData(records: CancellationRecord[]): number[] {
    const monthlyData = new Map<string, number>();
    
    records.forEach(record => {
      const month = format(new Date(record.cancelledAt), 'yyyy-MM');
      monthlyData.set(month, (monthlyData.get(month) || 0) + 1);
    });

    return Array.from(monthlyData.values());
  }

  // データの正規化
  private normalizeData(data: tf.Tensor): tf.Tensor {
    const { mean, variance } = tf.moments(data);
    return data.sub(mean).div(tf.sqrt(variance));
  }

  // 予測結果の整形
  private formatPredictions(predictions: number[], records: CancellationRecord[]): CancellationPrediction[] {
    const lastDate = new Date(Math.max(...records.map(r => new Date(r.cancelledAt).getTime())));
    
    return predictions.map((prediction, index) => ({
      month: format(subMonths(lastDate, -(index + 1)), 'yyyy-MM'),
      predictedCount: Math.round(prediction),
      confidence: this.calculateConfidence(prediction, records),
      trend: this.analyzeTrend(predictions.slice(0, index + 1))
    }));
  }

  // 平均値の計算
  private calculateMean(data: number[]): number {
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  }

  // 標準偏差の計算
  private calculateStandardDeviation(data: number[], mean: number): number {
    const squareDiffs = data.map(value => {
      const diff = value - mean;
      return diff * diff;
    });
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  // 傾向の分析
  private analyzeTrend(data: number[]): number {
    if (data.length < 2) return 0;
    
    const xMean = (data.length - 1) / 2;
    const yMean = this.calculateMean(data);
    
    let numerator = 0;
    let denominator = 0;
    
    data.forEach((y, x) => {
      numerator += (x - xMean) * (y - yMean);
      denominator += Math.pow(x - xMean, 2);
    });
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  // 信頼度の計算
  private calculateConfidence(prediction: number, records: CancellationRecord[]): number {
    const monthlyData = this.preprocessData(records);
    const std = this.calculateStandardDeviation(monthlyData, this.calculateMean(monthlyData));
    return Math.max(0, Math.min(1, 1 - (std / prediction)));
  }
}

export const machineLearningService = new MachineLearningService(); 