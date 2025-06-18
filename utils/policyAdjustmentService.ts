import { CancellationRecord } from '../types/cancellation';
import { CancellationPolicy, CancellationRule } from './cancellationPolicy';

interface PolicyAdjustmentResult {
  success: boolean;
  newPolicy?: CancellationPolicy;
  reason?: string;
}

interface CancellationStats {
  totalCancellations: number;
  cancellationsByTime: {
    [key: string]: number;
  };
  averageFee: number;
  revenueLoss: number;
}

// キャンセル統計を計算
const calculateCancellationStats = (
  records: CancellationRecord[],
  currentPolicy: CancellationPolicy
): CancellationStats => {
  const stats: CancellationStats = {
    totalCancellations: records.length,
    cancellationsByTime: {},
    averageFee: 0,
    revenueLoss: 0,
  };

  let totalFee = 0;

  records.forEach((record) => {
    // 時間帯別のキャンセル数を集計
    const hour = new Date(record.cancellationDate).getHours();
    const timeSlot = `${hour}:00-${hour + 1}:00`;
    stats.cancellationsByTime[timeSlot] = (stats.cancellationsByTime[timeSlot] || 0) + 1;

    // 手数料を集計
    totalFee += record.cancellationFee;
    stats.revenueLoss += record.amount - record.cancellationFee;
  });

  stats.averageFee = totalFee / records.length;

  return stats;
};

// ポリシーを自動調整
export const adjustPolicy = async (
  currentPolicy: CancellationPolicy,
  cancellationRecords: CancellationRecord[],
  period: 'week' | 'month' | 'quarter' = 'month'
): Promise<PolicyAdjustmentResult> => {
  try {
    // 期間に応じてレコードをフィルタリング
    const now = new Date();
    const filteredRecords = cancellationRecords.filter((record) => {
      const recordDate = new Date(record.cancellationDate);
      const diff = now.getTime() - recordDate.getTime();
      const days = diff / (1000 * 60 * 60 * 24);

      switch (period) {
        case 'week':
          return days <= 7;
        case 'month':
          return days <= 30;
        case 'quarter':
          return days <= 90;
        default:
          return false;
      }
    });

    // キャンセル統計を計算
    const stats = calculateCancellationStats(filteredRecords, currentPolicy);

    // 統計に基づいてポリシーを調整
    const newPolicy = { ...currentPolicy };
    const adjustments: string[] = [];

    // キャンセル率が高い時間帯の手数料を調整
    Object.entries(stats.cancellationsByTime).forEach(([timeSlot, count]) => {
      const cancellationRate = count / stats.totalCancellations;
      if (cancellationRate > 0.3) { // 30%以上のキャンセル率
        const rule = newPolicy.rules.find((r) => r.hoursBefore === 24);
        if (rule) {
          rule.feePercentage = Math.min(rule.feePercentage + 10, 100);
          adjustments.push(`${timeSlot}のキャンセル率が高いため、24時間前の手数料を${rule.feePercentage}%に引き上げました`);
        }
      }
    });

    // 平均手数料が低すぎる場合は調整
    if (stats.averageFee < stats.revenueLoss * 0.3) {
      newPolicy.rules.forEach((rule) => {
        rule.feePercentage = Math.min(rule.feePercentage + 5, 100);
      });
      adjustments.push('平均手数料が低いため、全体的に手数料率を5%引き上げました');
    }

    // キャンセル数が少ない場合は手数料を緩和
    if (stats.totalCancellations < 5) {
      newPolicy.rules.forEach((rule) => {
        rule.feePercentage = Math.max(rule.feePercentage - 5, 0);
      });
      adjustments.push('キャンセル数が少ないため、手数料率を5%引き下げました');
    }

    return {
      success: true,
      newPolicy,
      reason: adjustments.join('\n'),
    };
  } catch (error) {
    console.error('ポリシーの自動調整に失敗しました:', error);
    return {
      success: false,
      reason: 'ポリシーの自動調整に失敗しました',
    };
  }
};

// ポリシー調整の履歴を保存
interface PolicyAdjustmentHistory {
  id: string;
  facilityId: string;
  oldPolicy: CancellationPolicy;
  newPolicy: CancellationPolicy;
  reason: string;
  timestamp: Date;
}

const policyAdjustmentHistory: PolicyAdjustmentHistory[] = [];

export const savePolicyAdjustment = (
  facilityId: string,
  oldPolicy: CancellationPolicy,
  newPolicy: CancellationPolicy,
  reason: string
): void => {
  policyAdjustmentHistory.push({
    id: `adj_${Date.now()}`,
    facilityId,
    oldPolicy,
    newPolicy,
    reason,
    timestamp: new Date(),
  });
};

// ポリシー調整の履歴を取得
export const getPolicyAdjustmentHistory = (
  facilityId?: string
): PolicyAdjustmentHistory[] => {
  if (facilityId) {
    return policyAdjustmentHistory.filter(
      (history) => history.facilityId === facilityId
    );
  }
  return policyAdjustmentHistory;
};

// ポリシー調整の推奨を取得
export const getPolicyAdjustmentRecommendation = (
  currentPolicy: CancellationPolicy,
  cancellationRecords: CancellationRecord[]
): string[] => {
  const recommendations: string[] = [];
  const stats = calculateCancellationStats(cancellationRecords, currentPolicy);

  // キャンセル率が高い時間帯の推奨
  Object.entries(stats.cancellationsByTime).forEach(([timeSlot, count]) => {
    const cancellationRate = count / stats.totalCancellations;
    if (cancellationRate > 0.3) {
      recommendations.push(
        `${timeSlot}のキャンセル率が${(cancellationRate * 100).toFixed(1)}%と高いため、この時間帯の手数料率の引き上げを検討してください`
      );
    }
  });

  // 収益損失に関する推奨
  if (stats.revenueLoss > stats.averageFee * 2) {
    recommendations.push(
      '収益損失が平均手数料の2倍を超えています。手数料率の全体的な見直しを検討してください'
    );
  }

  // キャンセル数が少ない場合の推奨
  if (stats.totalCancellations < 5) {
    recommendations.push(
      'キャンセル数が少ないため、現在のポリシーが適切かどうか、より長期的なデータを収集することを推奨します'
    );
  }

  return recommendations;
}; 