import { Platform } from 'react-native';
import { CancellationRecord } from '../types/cancellation';

// フィードバックの種類
export type FeedbackType = 'cancellation' | 'support' | 'policy' | 'general';

// フィードバックの評価
export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

// フィードバックのインターフェース
export interface Feedback {
  id: string;
  userId: string;
  type: FeedbackType;
  rating: FeedbackRating;
  comment: string;
  cancellationId?: string;
  facilityId?: string;
  createdAt: Date;
  metadata?: {
    deviceInfo?: {
      platform: string;
      version: string;
    };
    userAgent?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
}

// フィードバックを保存
const feedbacks: Feedback[] = [];

// フィードバックを送信
export const submitFeedback = (
  feedback: Omit<Feedback, 'id' | 'createdAt'>
): Feedback => {
  const newFeedback: Feedback = {
    ...feedback,
    id: `fb_${Date.now()}`,
    createdAt: new Date(),
    metadata: {
      ...feedback.metadata,
      deviceInfo: {
        platform: Platform.OS,
        version: Platform.Version.toString(),
      },
    },
  };

  feedbacks.push(newFeedback);
  return newFeedback;
};

// キャンセル関連のフィードバックを送信
export const submitCancellationFeedback = (
  userId: string,
  cancellation: CancellationRecord,
  rating: FeedbackRating,
  comment: string
): Feedback => {
  return submitFeedback({
    userId,
    type: 'cancellation',
    rating,
    comment,
    cancellationId: cancellation.id,
    facilityId: cancellation.facilityId,
  });
};

// フィードバックを取得
export const getFeedback = (feedbackId: string): Feedback | undefined => {
  return feedbacks.find((feedback) => feedback.id === feedbackId);
};

// ユーザーのフィードバック一覧を取得
export const getUserFeedbacks = (userId: string): Feedback[] => {
  return feedbacks.filter((feedback) => feedback.userId === userId);
};

// 施設のフィードバック一覧を取得
export const getFacilityFeedbacks = (facilityId: string): Feedback[] => {
  return feedbacks.filter((feedback) => feedback.facilityId === facilityId);
};

// フィードバックの統計を取得
export const getFeedbackStats = (): {
  totalFeedbacks: number;
  averageRating: number;
  ratingDistribution: {
    [key in FeedbackRating]: number;
  };
  typeDistribution: {
    [key in FeedbackType]: number;
  };
} => {
  const stats = {
    totalFeedbacks: feedbacks.length,
    averageRating: 0,
    ratingDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
    typeDistribution: {
      cancellation: 0,
      support: 0,
      policy: 0,
      general: 0,
    },
  };

  let totalRating = 0;

  feedbacks.forEach((feedback) => {
    stats.ratingDistribution[feedback.rating]++;
    stats.typeDistribution[feedback.type]++;
    totalRating += feedback.rating;
  });

  stats.averageRating =
    stats.totalFeedbacks > 0
      ? totalRating / stats.totalFeedbacks
      : 0;

  return stats;
};

// フィードバックを検索
export const searchFeedbacks = (
  query: string,
  type?: FeedbackType,
  minRating?: FeedbackRating
): Feedback[] => {
  return feedbacks.filter((feedback) => {
    if (type && feedback.type !== type) return false;
    if (minRating && feedback.rating < minRating) return false;

    return (
      feedback.comment.toLowerCase().includes(query.toLowerCase()) ||
      feedback.id.includes(query)
    );
  });
};

// フィードバックをエクスポート
export const exportFeedbacks = (
  type?: FeedbackType,
  startDate?: Date,
  endDate?: Date
): string => {
  const filteredFeedbacks = feedbacks.filter((feedback) => {
    if (type && feedback.type !== type) return false;
    if (startDate && feedback.createdAt < startDate) return false;
    if (endDate && feedback.createdAt > endDate) return false;
    return true;
  });

  return JSON.stringify(filteredFeedbacks, null, 2);
};

// フィードバックの分析結果を取得
export const analyzeFeedbacks = (): {
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  commonKeywords: string[];
  improvementAreas: string[];
} => {
  const analysis = {
    sentimentAnalysis: {
      positive: 0,
      neutral: 0,
      negative: 0,
    },
    commonKeywords: [] as string[],
    improvementAreas: [] as string[],
  };

  // 感情分析（簡易版）
  feedbacks.forEach((feedback) => {
    if (feedback.rating >= 4) {
      analysis.sentimentAnalysis.positive++;
    } else if (feedback.rating === 3) {
      analysis.sentimentAnalysis.neutral++;
    } else {
      analysis.sentimentAnalysis.negative++;
    }
  });

  // キーワード分析（簡易版）
  const keywordCount: { [key: string]: number } = {};
  feedbacks.forEach((feedback) => {
    const words = feedback.comment
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2);
    words.forEach((word) => {
      keywordCount[word] = (keywordCount[word] || 0) + 1;
    });
  });

  analysis.commonKeywords = Object.entries(keywordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);

  // 改善点の分析
  const negativeFeedbacks = feedbacks.filter(
    (feedback) => feedback.rating <= 2
  );
  const improvementKeywords = new Set<string>();
  negativeFeedbacks.forEach((feedback) => {
    const words = feedback.comment
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2);
    words.forEach((word) => improvementKeywords.add(word));
  });

  analysis.improvementAreas = Array.from(improvementKeywords);

  return analysis;
}; 