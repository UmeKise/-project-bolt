export const mockUser = {
  id: '1',
  name: 'テストユーザー',
  email: 'test@example.com',
  role: 'user',
};

export const mockCancellationRecord = {
  id: '1',
  userId: '1',
  reservationId: 'R001',
  cancellationDate: '2024-03-15',
  reason: '体調不良',
  refundAmount: 5000,
  status: 'approved',
};

export const mockCancellationPolicy = {
  id: '1',
  name: '標準キャンセルポリシー',
  description: '予約日の3日前までキャンセル可能',
  refundPercentage: 80,
  cancellationFee: 2000,
  minimumNotice: 72, // 時間単位
};

export const mockNotification = {
  id: '1',
  title: 'キャンセル完了',
  body: '予約のキャンセルが完了しました',
  data: {
    type: 'cancellation',
    recordId: '1',
  },
  timestamp: new Date().toISOString(),
  read: false,
};

export const mockPerformanceMetrics = {
  renderTime: 100,
  memoryUsage: 50,
  fps: 60,
};

export const mockErrorReport = {
  error: new Error('テストエラー'),
  componentStack: 'TestComponent',
  timestamp: new Date().toISOString(),
  deviceInfo: {
    platform: 'ios',
    version: '15.0',
    model: 'iPhone 13',
  },
}; 