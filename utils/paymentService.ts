import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { CancellationRecord } from '../types/cancellation';

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_transfer';
  last4: string;
  expiryDate?: string;
  bankName?: string;
  accountNumber?: string;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// 支払い方法を保存
export const savePaymentMethod = async (
  paymentMethod: PaymentMethod
): Promise<void> => {
  try {
    const key = `payment_method_${paymentMethod.id}`;
    await SecureStore.setItemAsync(key, JSON.stringify(paymentMethod));
  } catch (error) {
    console.error('支払い方法の保存に失敗しました:', error);
    throw new Error('支払い方法の保存に失敗しました');
  }
};

// 支払い方法を取得
export const getPaymentMethod = async (
  id: string
): Promise<PaymentMethod | null> => {
  try {
    const key = `payment_method_${id}`;
    const data = await SecureStore.getItemAsync(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('支払い方法の取得に失敗しました:', error);
    return null;
  }
};

// 支払いを実行
export const processPayment = async (
  cancellation: CancellationRecord,
  paymentMethod: PaymentMethod
): Promise<PaymentResult> => {
  try {
    // 支払い処理のシミュレーション
    const result = await simulatePaymentProcess(
      cancellation.cancellationFee,
      paymentMethod
    );

    if (result.success) {
      // 支払い履歴を保存
      await savePaymentHistory({
        cancellationId: cancellation.id,
        amount: cancellation.cancellationFee,
        paymentMethodId: paymentMethod.id,
        transactionId: result.transactionId!,
        status: 'completed',
        timestamp: new Date(),
      });
    }

    return result;
  } catch (error) {
    console.error('支払い処理に失敗しました:', error);
    return {
      success: false,
      error: '支払い処理に失敗しました',
    };
  }
};

// 支払い履歴を保存
interface PaymentHistory {
  cancellationId: string;
  amount: number;
  paymentMethodId: string;
  transactionId: string;
  status: 'completed' | 'failed' | 'pending';
  timestamp: Date;
}

const savePaymentHistory = async (
  history: PaymentHistory
): Promise<void> => {
  try {
    const key = `payment_history_${history.cancellationId}`;
    await SecureStore.setItemAsync(key, JSON.stringify(history));
  } catch (error) {
    console.error('支払い履歴の保存に失敗しました:', error);
    throw new Error('支払い履歴の保存に失敗しました');
  }
};

// 支払い履歴を取得
export const getPaymentHistory = async (
  cancellationId: string
): Promise<PaymentHistory | null> => {
  try {
    const key = `payment_history_${cancellationId}`;
    const data = await SecureStore.getItemAsync(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('支払い履歴の取得に失敗しました:', error);
    return null;
  }
};

// 支払い処理のシミュレーション
const simulatePaymentProcess = async (
  amount: number,
  paymentMethod: PaymentMethod
): Promise<PaymentResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 90%の確率で成功
      const success = Math.random() < 0.9;
      resolve({
        success,
        transactionId: success
          ? `txn_${Math.random().toString(36).substr(2, 9)}`
          : undefined,
        error: success ? undefined : '支払い処理に失敗しました',
      });
    }, 2000);
  });
};

// 支払い方法を削除
export const deletePaymentMethod = async (id: string): Promise<void> => {
  try {
    const key = `payment_method_${id}`;
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('支払い方法の削除に失敗しました:', error);
    throw new Error('支払い方法の削除に失敗しました');
  }
};

// 支払い方法の一覧を取得
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    const keys = await SecureStore.getAllKeysAsync();
    const paymentMethodKeys = keys.filter((key) =>
      key.startsWith('payment_method_')
    );
    const methods = await Promise.all(
      paymentMethodKeys.map((key) => SecureStore.getItemAsync(key))
    );
    return methods
      .filter((data): data is string => data !== null)
      .map((data) => JSON.parse(data));
  } catch (error) {
    console.error('支払い方法の一覧取得に失敗しました:', error);
    return [];
  }
};

// 支払い履歴の一覧を取得
export const getPaymentHistories = async (): Promise<PaymentHistory[]> => {
  try {
    const keys = await SecureStore.getAllKeysAsync();
    const historyKeys = keys.filter((key) =>
      key.startsWith('payment_history_')
    );
    const histories = await Promise.all(
      historyKeys.map((key) => SecureStore.getItemAsync(key))
    );
    return histories
      .filter((data): data is string => data !== null)
      .map((data) => JSON.parse(data));
  } catch (error) {
    console.error('支払い履歴の一覧取得に失敗しました:', error);
    return [];
  }
}; 