import { CancellationRecord, CancellationPolicy } from '../types/cancellation';

interface PolicyAdjustmentConfig {
  enabled: boolean;
  thresholds: {
    cancellationRate: number; // キャンセル率の閾値（%）
    revenueImpact: number; // 収益への影響の閾値（%）
  };
  adjustmentRules: {
    increaseFee: boolean; // キャンセル料金の増額
    extendNoticePeriod: boolean; // キャンセル通知期間の延長
    addRestrictions: boolean; // 制限の追加
  };
}

interface AdjustmentResult {
  success: boolean;
  adjustments: {
    feeChange?: number;
    noticePeriodChange?: number;
    newRestrictions?: string[];
  };
  reason: string;
}

class PolicyAdjustmentService {
  private static instance: PolicyAdjustmentService;
  private config: PolicyAdjustmentConfig = {
    enabled: true,
    thresholds: {
      cancellationRate: 20, // 20%以上のキャンセル率で調整を検討
      revenueImpact: 10, // 10%以上の収益影響で調整を検討
    },
    adjustmentRules: {
      increaseFee: true,
      extendNoticePeriod: true,
      addRestrictions: true,
    },
  };

  private constructor() {}

  static getInstance(): PolicyAdjustmentService {
    if (!PolicyAdjustmentService.instance) {
      PolicyAdjustmentService.instance = new PolicyAdjustmentService();
    }
    return PolicyAdjustmentService.instance;
  }

  async analyzeAndAdjustPolicy(
    policy: CancellationPolicy,
    records: CancellationRecord[]
  ): Promise<AdjustmentResult> {
    try {
      if (!this.config.enabled) {
        return {
          success: false,
          adjustments: {},
          reason: 'ポリシー自動調整が無効になっています',
        };
      }

      const analysis = await this.analyzePolicy(policy, records);
      if (!analysis.needsAdjustment) {
        return {
          success: false,
          adjustments: {},
          reason: 'ポリシーの調整は必要ありません',
        };
      }

      const adjustments = await this.calculateAdjustments(policy, analysis);
      return {
        success: true,
        adjustments,
        reason: analysis.reason,
      };
    } catch (error) {
      console.error('Failed to analyze and adjust policy:', error);
      throw new Error('ポリシーの分析と調整に失敗しました');
    }
  }

  private async analyzePolicy(
    policy: CancellationPolicy,
    records: CancellationRecord[]
  ): Promise<{
    needsAdjustment: boolean;
    reason: string;
    metrics: {
      cancellationRate: number;
      revenueImpact: number;
    };
  }> {
    const totalReservations = records.length;
    const cancellations = records.filter(
      (record) => record.status === 'cancelled'
    ).length;

    const cancellationRate = (cancellations / totalReservations) * 100;
    const totalRevenue = records.reduce(
      (sum, record) => sum + record.cancellationFee,
      0
    );
    const potentialRevenue = records.reduce(
      (sum, record) => sum + record.originalAmount,
      0
    );
    const revenueImpact =
      ((potentialRevenue - totalRevenue) / potentialRevenue) * 100;

    const needsAdjustment =
      cancellationRate > this.config.thresholds.cancellationRate ||
      revenueImpact > this.config.thresholds.revenueImpact;

    let reason = '';
    if (cancellationRate > this.config.thresholds.cancellationRate) {
      reason += `キャンセル率が${this.config.thresholds.cancellationRate}%を超えています（現在: ${cancellationRate.toFixed(1)}%）`;
    }
    if (revenueImpact > this.config.thresholds.revenueImpact) {
      if (reason) reason += '、';
      reason += `収益への影響が${this.config.thresholds.revenueImpact}%を超えています（現在: ${revenueImpact.toFixed(1)}%）`;
    }

    return {
      needsAdjustment,
      reason,
      metrics: {
        cancellationRate,
        revenueImpact,
      },
    };
  }

  private async calculateAdjustments(
    policy: CancellationPolicy,
    analysis: {
      needsAdjustment: boolean;
      reason: string;
      metrics: {
        cancellationRate: number;
        revenueImpact: number;
      };
    }
  ): Promise<{
    feeChange?: number;
    noticePeriodChange?: number;
    newRestrictions?: string[];
  }> {
    const adjustments: {
      feeChange?: number;
      noticePeriodChange?: number;
      newRestrictions?: string[];
    } = {};

    if (this.config.adjustmentRules.increaseFee) {
      // キャンセル料金の増額を計算
      const currentFee = policy.rules[0]?.feePercentage || 0;
      const feeIncrease = Math.min(
        Math.ceil(analysis.metrics.cancellationRate / 10),
        20
      ); // 最大20%まで増額
      adjustments.feeChange = currentFee + feeIncrease;
    }

    if (this.config.adjustmentRules.extendNoticePeriod) {
      // キャンセル通知期間の延長を計算
      const currentNoticePeriod = policy.rules[0]?.noticePeriod || 0;
      const periodIncrease = Math.min(
        Math.ceil(analysis.metrics.cancellationRate / 5),
        7
      ); // 最大7日まで延長
      adjustments.noticePeriodChange = currentNoticePeriod + periodIncrease;
    }

    if (this.config.adjustmentRules.addRestrictions) {
      // 新しい制限を追加
      adjustments.newRestrictions = [
        'キャンセル回数が3回を超える場合、追加料金が発生します',
        '繁忙期のキャンセルは通常の2倍の料金が適用されます',
      ];
    }

    return adjustments;
  }

  async updateConfig(newConfig: Partial<PolicyAdjustmentConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...newConfig };
    } catch (error) {
      console.error('Failed to update policy adjustment config:', error);
      throw new Error('ポリシー調整設定の更新に失敗しました');
    }
  }

  async getConfig(): Promise<PolicyAdjustmentConfig> {
    return this.config;
  }
}

export default PolicyAdjustmentService; 