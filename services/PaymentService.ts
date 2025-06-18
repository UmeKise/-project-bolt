import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { CancellationRecord } from '../types/cancellation';

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_transfer';
  details: {
    cardNumber?: string;
    expiryDate?: string;
    bankAccount?: string;
  };
  isDefault: boolean;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

class PaymentService {
  private static instance: PaymentService;
  private paymentMethods: PaymentMethod[] = [];

  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async initialize(): Promise<void> {
    try {
      const storedMethods = await SecureStore.getItemAsync('paymentMethods');
      if (storedMethods) {
        this.paymentMethods = JSON.parse(storedMethods);
      }
    } catch (error) {
      console.error('Failed to initialize payment service:', error);
      throw new Error('支払いサービスの初期化に失敗しました');
    }
  }

  async addPaymentMethod(method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    try {
      const newMethod: PaymentMethod = {
        ...method,
        id: Date.now().toString(),
      };

      this.paymentMethods.push(newMethod);
      await this.savePaymentMethods();

      return newMethod;
    } catch (error) {
      console.error('Failed to add payment method:', error);
      throw new Error('支払い方法の追加に失敗しました');
    }
  }

  async removePaymentMethod(methodId: string): Promise<void> {
    try {
      this.paymentMethods = this.paymentMethods.filter(
        (method) => method.id !== methodId
      );
      await this.savePaymentMethods();
    } catch (error) {
      console.error('Failed to remove payment method:', error);
      throw new Error('支払い方法の削除に失敗しました');
    }
  }

  async setDefaultPaymentMethod(methodId: string): Promise<void> {
    try {
      this.paymentMethods = this.paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === methodId,
      }));
      await this.savePaymentMethods();
    } catch (error) {
      console.error('Failed to set default payment method:', error);
      throw new Error('デフォルト支払い方法の設定に失敗しました');
    }
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.paymentMethods;
  }

  async processPayment(
    record: CancellationRecord,
    methodId?: string
  ): Promise<PaymentResult> {
    try {
      const paymentMethod = methodId
        ? this.paymentMethods.find((method) => method.id === methodId)
        : this.paymentMethods.find((method) => method.isDefault);

      if (!paymentMethod) {
        throw new Error('有効な支払い方法が見つかりません');
      }

      // 実際の支払い処理をシミュレート
      const result = await this.simulatePayment(record, paymentMethod);

      if (result.success) {
        // 支払い成功時の処理
        await this.updatePaymentStatus(record.id, 'paid', result.transactionId);
      }

      return result;
    } catch (error) {
      console.error('Payment processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '支払い処理に失敗しました',
      };
    }
  }

  private async savePaymentMethods(): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        'paymentMethods',
        JSON.stringify(this.paymentMethods)
      );
    } catch (error) {
      console.error('Failed to save payment methods:', error);
      throw new Error('支払い方法の保存に失敗しました');
    }
  }

  private async simulatePayment(
    record: CancellationRecord,
    method: PaymentMethod
  ): Promise<PaymentResult> {
    // 実際の環境では、ここで決済ゲートウェイとの通信を行う
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: `txn_${Date.now()}`,
        });
      }, 1000);
    });
  }

  private async updatePaymentStatus(
    recordId: string,
    status: 'paid' | 'failed',
    transactionId?: string
  ): Promise<void> {
    // 実際の環境では、ここでデータベースの更新を行う
    console.log(`Payment status updated for record ${recordId}: ${status}`);
  }
}

export default PaymentService; 