export interface CancellationRecord {
  id: string;
  facilityId: string;
  facilityName: string;
  userId: string;
  userName: string;
  reservationId: string;
  cancelledAt: string;
  reason: string;
  fee: number;
  status: 'pending' | 'paid' | 'waived';
}

export interface CancellationPolicy {
  id: string;
  facilityId: string;
  name: string;
  description: string;
  rules: CancellationRule[];
  createdAt: string;
  updatedAt: string;
}

export interface CancellationRule {
  id: string;
  hoursBeforeCheckIn: number;
  feePercentage: number;
  description: string;
}

export interface CancellationStats {
  totalCancellations: number;
  totalFees: number;
  averageFee: number;
  cancellationRate: number;
  byFacility: {
    [key: string]: {
      count: number;
      totalFees: number;
      averageFee: number;
    };
  };
}

export interface CancellationPrediction {
  month: string;
  actual: number;
  predicted: number;
  confidence: number;
  trend: number;
  severity: 'low' | 'medium' | 'high';
}

export interface AnomalyDetection {
  date: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
}

export interface PersonalizedRecommendation {
  type: 'policy' | 'alert' | 'suggestion';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionItems: string[];
}

export interface CancellationReason {
  id: string;
  name: string;
  description: string;
  category: 'customer' | 'facility' | 'external';
  isActive: boolean;
} 