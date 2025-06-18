import { differenceInHours } from 'date-fns';

export interface CancellationPolicy {
  id: string;
  facilityId: string;
  name: string;
  description: string;
  rules: CancellationRule[];
}

export interface CancellationRule {
  hoursBeforeReservation: number;
  feePercentage: number;
  description: string;
}

export const calculateCancellationFee = (
  amount: number,
  reservationDate: Date,
  policy: CancellationPolicy
): { fee: number; rule: CancellationRule } => {
  const now = new Date();
  const hoursUntilReservation = differenceInHours(reservationDate, now);

  // 適用されるルールを探す
  const applicableRule = policy.rules.find(
    (rule) => hoursUntilReservation <= rule.hoursBeforeReservation
  );

  if (!applicableRule) {
    // キャンセル期限を過ぎている場合は全額返金
    return {
      fee: 0,
      rule: {
        hoursBeforeReservation: 0,
        feePercentage: 0,
        description: 'キャンセル期限を過ぎているため、キャンセル料金は発生しません',
      },
    };
  }

  const fee = Math.floor(amount * (applicableRule.feePercentage / 100));
  return { fee, rule: applicableRule };
};

// デフォルトのキャンセルポリシー
export const defaultCancellationPolicy: CancellationPolicy = {
  id: 'default',
  facilityId: 'default',
  name: '標準キャンセルポリシー',
  description: '予約日の24時間前までにキャンセルした場合は全額返金、それ以降はキャンセル料金が発生します。',
  rules: [
    {
      hoursBeforeReservation: 24,
      feePercentage: 0,
      description: '予約日の24時間前までにキャンセルした場合は全額返金',
    },
    {
      hoursBeforeReservation: 12,
      feePercentage: 30,
      description: '予約日の12時間前までにキャンセルした場合は30%のキャンセル料金',
    },
    {
      hoursBeforeReservation: 0,
      feePercentage: 100,
      description: '予約日の12時間以内のキャンセルは全額のキャンセル料金',
    },
  ],
};

// 施設ごとのカスタムキャンセルポリシー
export const customCancellationPolicies: Record<string, CancellationPolicy> = {
  'facility-1': {
    id: 'facility-1',
    facilityId: 'facility-1',
    name: 'プレミアムキャンセルポリシー',
    description: '予約日の48時間前までにキャンセルした場合は全額返金、それ以降は段階的にキャンセル料金が発生します。',
    rules: [
      {
        hoursBeforeReservation: 48,
        feePercentage: 0,
        description: '予約日の48時間前までにキャンセルした場合は全額返金',
      },
      {
        hoursBeforeReservation: 24,
        feePercentage: 20,
        description: '予約日の24時間前までにキャンセルした場合は20%のキャンセル料金',
      },
      {
        hoursBeforeReservation: 12,
        feePercentage: 50,
        description: '予約日の12時間前までにキャンセルした場合は50%のキャンセル料金',
      },
      {
        hoursBeforeReservation: 0,
        feePercentage: 100,
        description: '予約日の12時間以内のキャンセルは全額のキャンセル料金',
      },
    ],
  },
  'facility-2': {
    id: 'facility-2',
    facilityId: 'facility-2',
    name: 'フレキシブルキャンセルポリシー',
    description: '予約日の12時間前までにキャンセルした場合は全額返金、それ以降は固定額のキャンセル料金が発生します。',
    rules: [
      {
        hoursBeforeReservation: 12,
        feePercentage: 0,
        description: '予約日の12時間前までにキャンセルした場合は全額返金',
      },
      {
        hoursBeforeReservation: 0,
        feePercentage: 50,
        description: '予約日の12時間以内のキャンセルは50%のキャンセル料金',
      },
    ],
  },
};

export const getCancellationPolicy = (facilityId: string): CancellationPolicy => {
  return customCancellationPolicies[facilityId] || defaultCancellationPolicy;
}; 