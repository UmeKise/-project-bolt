import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { FeedbackForm } from '../../components/FeedbackForm';
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

describe('FeedbackForm', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <FeedbackForm onClose={mockOnClose} />
    );

    expect(getByText('フィードバック')).toBeTruthy();
    expect(getByText('評価')).toBeTruthy();
    expect(getByText('カテゴリー')).toBeTruthy();
    expect(getByText('コメント')).toBeTruthy();
    expect(getByPlaceholderText('フィードバックを入力してください')).toBeTruthy();
  });

  it('handles rating selection', () => {
    const { getByTestId } = render(<FeedbackForm onClose={mockOnClose} />);
    const ratingButton = getByTestId('rating-4');
    fireEvent.press(ratingButton);
    expect(ratingButton).toHaveStyle({ backgroundColor: '#007AFF' });
  });

  it('handles category selection', () => {
    const { getByText } = render(<FeedbackForm onClose={mockOnClose} />);
    const categoryButton = getByText('使いやすさ');
    fireEvent.press(categoryButton);
    expect(categoryButton).toHaveStyle({ backgroundColor: '#007AFF' });
  });

  it('handles comment input', () => {
    const { getByPlaceholderText } = render(
      <FeedbackForm onClose={mockOnClose} />
    );
    const commentInput = getByPlaceholderText('フィードバックを入力してください');
    fireEvent.changeText(commentInput, 'テストコメント');
    expect(commentInput.props.value).toBe('テストコメント');
  });

  it('shows error when submitting without rating', async () => {
    const { getByText } = render(<FeedbackForm onClose={mockOnClose} />);
    const submitButton = getByText('送信');
    fireEvent.press(submitButton);
    expect(getByText('評価を選択してください')).toBeTruthy();
  });

  it('shows error when submitting without category', async () => {
    const { getByText, getByTestId } = render(
      <FeedbackForm onClose={mockOnClose} />
    );
    const ratingButton = getByTestId('rating-4');
    fireEvent.press(ratingButton);
    const submitButton = getByText('送信');
    fireEvent.press(submitButton);
    expect(getByText('カテゴリーを選択してください')).toBeTruthy();
  });

  it('submits feedback successfully', async () => {
    const mockSubmitFeedback = jest.fn().mockResolvedValue(undefined);
    (feedbackService.submitFeedback as jest.Mock) = mockSubmitFeedback;

    const { getByText, getByTestId, getByPlaceholderText } = render(
      <FeedbackForm onClose={mockOnClose} />
    );

    // 評価を選択
    const ratingButton = getByTestId('rating-4');
    fireEvent.press(ratingButton);

    // カテゴリーを選択
    const categoryButton = getByText('使いやすさ');
    fireEvent.press(categoryButton);

    // コメントを入力
    const commentInput = getByPlaceholderText('フィードバックを入力してください');
    fireEvent.changeText(commentInput, 'テストコメント');

    // 送信
    const submitButton = getByText('送信');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSubmitFeedback).toHaveBeenCalledWith({
        rating: 4,
        category: '使いやすさ',
        comment: 'テストコメント',
        timestamp: expect.any(Number),
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles submission error', async () => {
    const mockError = new Error('送信に失敗しました');
    const mockSubmitFeedback = jest.fn().mockRejectedValue(mockError);
    (feedbackService.submitFeedback as jest.Mock) = mockSubmitFeedback;

    const { getByText, getByTestId, getByPlaceholderText } = render(
      <FeedbackForm onClose={mockOnClose} />
    );

    // 評価を選択
    const ratingButton = getByTestId('rating-4');
    fireEvent.press(ratingButton);

    // カテゴリーを選択
    const categoryButton = getByText('使いやすさ');
    fireEvent.press(categoryButton);

    // コメントを入力
    const commentInput = getByPlaceholderText('フィードバックを入力してください');
    fireEvent.changeText(commentInput, 'テストコメント');

    // 送信
    const submitButton = getByText('送信');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('フィードバックの送信に失敗しました')).toBeTruthy();
    });
  });
}); 