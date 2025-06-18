import * as tf from '@tensorflow/tfjs';
import { format, subMonths, differenceInDays } from 'date-fns';
import { CancellationRecord, CancellationPrediction, AnomalyDetection } from '../types/cancellation';

interface FeatureSet {
  temporal: number[];
  categorical: number[];
  numerical: number[];
}

class AdvancedMLService {
  private models: Map<string, tf.LayersModel> = new Map();
  private featureScalers: Map<string, tf.Scalar[]> = new Map();
  private lastTrainingDate: Date = new Date();

  // 高度なLSTMモデルの構築
  private buildAdvancedModel(inputShape: number[]): tf.LayersModel {
    const model = tf.sequential();

    // 入力層
    model.add(tf.layers.lstm({
      units: 128,
      returnSequences: true,
      inputShape: inputShape,
      dropout: 0.2,
      recurrentDropout: 0.2
    }));

    // 中間層
    model.add(tf.layers.lstm({
      units: 64,
      returnSequences: true,
      dropout: 0.2,
      recurrentDropout: 0.2
    }));

    model.add(tf.layers.lstm({
      units: 32,
      returnSequences: false,
      dropout: 0.2,
      recurrentDropout: 0.2
    }));

    // 全結合層
    model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  // 特徴量エンジニアリング
  private extractFeatures(records: CancellationRecord[]): FeatureSet {
    const temporal: number[] = [];
    const categorical: number[] = [];
    const numerical: number[] = [];

    records.forEach(record => {
      // 時間的特徴
      const date = new Date(record.cancelledAt);
      temporal.push(
        date.getMonth() / 11, // 月の正規化
        date.getDay() / 6,    // 曜日の正規化
        date.getHours() / 23  // 時間の正規化
      );

      // カテゴリカル特徴
      const reasonEncoding = this.encodeReason(record.reason);
      categorical.push(...reasonEncoding);

      // 数値的特徴
      numerical.push(
        record.fee,
        this.calculateDaysFromLastCancellation(records, record),
        this.calculateCancellationRate(records, record)
      );
    });

    return { temporal, categorical, numerical };
  }

  // 理由のエンコーディング
  private encodeReason(reason: string): number[] {
    const reasons = ['weather', 'emergency', 'schedule', 'other'];
    return reasons.map(r => reason.toLowerCase().includes(r) ? 1 : 0);
  }

  // 前回のキャンセルからの日数計算
  private calculateDaysFromLastCancellation(records: CancellationRecord[], currentRecord: CancellationRecord): number {
    const previousCancellations = records
      .filter(r => r.userId === currentRecord.userId && new Date(r.cancelledAt) < new Date(currentRecord.cancelledAt))
      .sort((a, b) => new Date(b.cancelledAt).getTime() - new Date(a.cancelledAt).getTime());

    if (previousCancellations.length === 0) return 365; // デフォルト値

    return differenceInDays(
      new Date(currentRecord.cancelledAt),
      new Date(previousCancellations[0].cancelledAt)
    );
  }

  // キャンセル率の計算
  private calculateCancellationRate(records: CancellationRecord[], currentRecord: CancellationRecord): number {
    const userRecords = records.filter(r => r.userId === currentRecord.userId);
    const totalReservations = userRecords.length;
    const cancellations = userRecords.filter(r => r.status === 'cancelled').length;

    return totalReservations > 0 ? cancellations / totalReservations : 0;
  }

  // モデルの再学習
  async retrainModel(records: CancellationRecord[]) {
    const daysSinceLastTraining = differenceInDays(new Date(), this.lastTrainingDate);
    
    if (daysSinceLastTraining < 7) {
      console.log('前回の学習から7日経過していないため、再学習をスキップします');
      return;
    }

    try {
      const features = this.extractFeatures(records);
      const { temporal, categorical, numerical } = features;

      // 特徴量の結合
      const combinedFeatures = tf.tensor2d(
        temporal.map((t, i) => [...t, ...categorical.slice(i * 4, (i + 1) * 4), ...numerical.slice(i * 3, (i + 1) * 3)])
      );

      // モデルの再学習
      const model = this.buildAdvancedModel([combinedFeatures.shape[1]]);
      await model.fit(combinedFeatures, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss}, val_loss = ${logs?.val_loss}`);
          }
        }
      });

      this.models.set('prediction', model);
      this.lastTrainingDate = new Date();

      // メモリの解放
      combinedFeatures.dispose();
    } catch (error) {
      console.error('モデルの再学習に失敗しました:', error);
      throw error;
    }
  }

  // 高度な予測分析
  async predictWithAdvancedModel(records: CancellationRecord[]): Promise<CancellationPrediction[]> {
    try {
      const features = this.extractFeatures(records);
      const { temporal, categorical, numerical } = features;

      // 特徴量の結合
      const combinedFeatures = tf.tensor2d(
        temporal.map((t, i) => [...t, ...categorical.slice(i * 4, (i + 1) * 4), ...numerical.slice(i * 3, (i + 1) * 3)])
      );

      // 予測の実行
      const model = this.models.get('prediction') || this.buildAdvancedModel([combinedFeatures.shape[1]]);
      const predictions = await model.predict(combinedFeatures) as tf.Tensor;
      const predictedValues = await predictions.array() as number[];

      // 予測結果の整形
      const results = records.map((record, index) => ({
        month: format(new Date(record.cancelledAt), 'yyyy-MM'),
        actual: 1, // 実際のキャンセル数
        predicted: predictedValues[index],
        confidence: this.calculateConfidence(predictedValues[index], records),
        trend: this.calculateTrend(predictedValues, index),
        severity: this.calculateSeverity(predictedValues[index], records)
      }));

      // メモリの解放
      combinedFeatures.dispose();
      predictions.dispose();

      return results;
    } catch (error) {
      console.error('高度な予測分析に失敗しました:', error);
      throw error;
    }
  }

  // 信頼度の計算
  private calculateConfidence(prediction: number, records: CancellationRecord[]): number {
    const variance = tf.moments(tf.tensor1d(records.map(r => r.fee))).variance.dataSync()[0];
    return Math.max(0, Math.min(1, 1 - (variance / prediction)));
  }

  // 傾向の計算
  private calculateTrend(predictions: number[], currentIndex: number): number {
    if (currentIndex < 2) return 0;

    const recentPredictions = predictions.slice(currentIndex - 2, currentIndex + 1);
    const xMean = 1;
    const yMean = recentPredictions.reduce((sum, val) => sum + val, 0) / recentPredictions.length;

    let numerator = 0;
    let denominator = 0;

    recentPredictions.forEach((y, x) => {
      numerator += (x - xMean) * (y - yMean);
      denominator += Math.pow(x - xMean, 2);
    });

    return denominator === 0 ? 0 : numerator / denominator;
  }

  // 重要度の計算
  private calculateSeverity(prediction: number, records: CancellationRecord[]): 'low' | 'medium' | 'high' {
    const mean = records.reduce((sum, r) => sum + r.fee, 0) / records.length;
    const std = Math.sqrt(
      records.reduce((sum, r) => sum + Math.pow(r.fee - mean, 2), 0) / records.length
    );

    const zScore = Math.abs((prediction - mean) / std);

    if (zScore > 2) return 'high';
    if (zScore > 1) return 'medium';
    return 'low';
  }
}

export const advancedMLService = new AdvancedMLService(); 