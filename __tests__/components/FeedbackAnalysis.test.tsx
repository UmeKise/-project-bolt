import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { FeedbackAnalysis } from '../../components/FeedbackAnalysis';
import { feedbackService } from '../../services/FeedbackService';

// モックの設定
jest.mock('../../services/FeedbackService');
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#FFFFFF',
        text: '#000000',
        primary: '#007AFF',
        border: '#E0E0E0',
        card: '#F5F5F5',
        textSecondary: '#666666',
      },
    },
  }),
}));

describe('FeedbackAnalysis', () => {
  const mockAnalysisData = {
    averageRating: 4.2,
    totalFeedback: 100,
    categoryDistribution: {
      '使いやすさ': 40,
      '機能': 30,
      'デザイン': 20,
      'その他': 10,
    },
    recentTrends: [
      { date: '2024-03-01', rating: 4.0 },
      { date: '2024-03-02', rating: 4.2 },
      { date: '2024-03-03', rating: 4.5 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    const { getByText } = render(<FeedbackAnalysis />);
    expect(getByText('読み込み中...')).toBeTruthy();
  });

  it('renders analysis data correctly', async () => {
    const mockGetAnalysis = jest.fn().mockResolvedValue(mockAnalysisData);
    (feedbackService.getAnalysis as jest.Mock) = mockGetAnalysis;

    const { getByText } = render(<FeedbackAnalysis />);

    await waitFor(() => {
      expect(getByText('フィードバック分析')).toBeTruthy();
      expect(getByText('平均評価: 4.2')).toBeTruthy();
      expect(getByText('総フィードバック数: 100')).toBeTruthy();
      expect(getByText('カテゴリー分布')).toBeTruthy();
      expect(getByText('使いやすさ: 40%')).toBeTruthy();
      expect(getByText('機能: 30%')).toBeTruthy();
      expect(getByText('デザイン: 20%')).toBeTruthy();
      expect(getByText('その他: 10%')).toBeTruthy();
      expect(getByText('最近の傾向')).toBeTruthy();
    });
  });

  it('handles error state', async () => {
    const mockError = new Error('分析データの取得に失敗しました');
    const mockGetAnalysis = jest.fn().mockRejectedValue(mockError);
    (feedbackService.getAnalysis as jest.Mock) = mockGetAnalysis;

    const { getByText } = render(<FeedbackAnalysis />);

    await waitFor(() => {
      expect(getByText('分析データの取得に失敗しました')).toBeTruthy();
      expect(getByText('再試行')).toBeTruthy();
    });
  });

  it('retries loading on error', async () => {
    const mockGetAnalysis = jest.fn()
      .mockRejectedValueOnce(new Error('分析データの取得に失敗しました'))
      .mockResolvedValueOnce(mockAnalysisData);
    (feedbackService.getAnalysis as jest.Mock) = mockGetAnalysis;

    const { getByText } = render(<FeedbackAnalysis />);

    await waitFor(() => {
      expect(getByText('分析データの取得に失敗しました')).toBeTruthy();
    });

    const retryButton = getByText('再試行');
    fireEvent.press(retryButton);

    await waitFor(() => {
      expect(getByText('平均評価: 4.2')).toBeTruthy();
    });
  });

  it('updates data on refresh', async () => {
    const mockGetAnalysis = jest.fn()
      .mockResolvedValueOnce(mockAnalysisData)
      .mockResolvedValueOnce({
        ...mockAnalysisData,
        averageRating: 4.5,
        totalFeedback: 120,
      });
    (feedbackService.getAnalysis as jest.Mock) = mockGetAnalysis;

    const { getByText, getByTestId } = render(<FeedbackAnalysis />);

    await waitFor(() => {
      expect(getByText('平均評価: 4.2')).toBeTruthy();
    });

    const refreshButton = getByTestId('refresh-button');
    fireEvent.press(refreshButton);

    await waitFor(() => {
      expect(getByText('平均評価: 4.5')).toBeTruthy();
      expect(getByText('総フィードバック数: 120')).toBeTruthy();
    });
  });
}); 