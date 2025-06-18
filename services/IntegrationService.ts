import { CancellationRecord, CancellationPolicy } from '../types/cancellation';
import * as SecureStore from 'expo-secure-store';

interface IntegrationConfig {
  apiKey: string;
  endpoint: string;
  systemType: 'payment' | 'analytics' | 'notification';
}

class IntegrationService {
  private configs: Map<string, IntegrationConfig> = new Map();

  // 統合設定の初期化
  async initializeConfigs() {
    try {
      const storedConfigs = await SecureStore.getItemAsync('integration_configs');
      if (storedConfigs) {
        this.configs = new Map(JSON.parse(storedConfigs));
      }
    } catch (error) {
      console.error('統合設定の初期化に失敗しました:', error);
      throw error;
    }
  }

  // 統合設定の保存
  async saveConfig(systemId: string, config: IntegrationConfig) {
    try {
      this.configs.set(systemId, config);
      await SecureStore.setItemAsync(
        'integration_configs',
        JSON.stringify(Array.from(this.configs.entries()))
      );
    } catch (error) {
      console.error('統合設定の保存に失敗しました:', error);
      throw error;
    }
  }

  // 支払いシステムとの連携
  async syncWithPaymentSystem(records: CancellationRecord[]) {
    const config = this.configs.get('payment');
    if (!config) {
      throw new Error('支払いシステムの設定が見つかりません');
    }

    try {
      const response = await fetch(`${config.endpoint}/payments/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          records: records.map(record => ({
            id: record.id,
            amount: record.fee,
            status: record.status,
            dueDate: record.cancelledAt
          }))
        })
      });

      if (!response.ok) {
        throw new Error('支払いシステムとの同期に失敗しました');
      }

      return await response.json();
    } catch (error) {
      console.error('支払いシステムとの同期に失敗しました:', error);
      throw error;
    }
  }

  // 分析システムとの連携
  async syncWithAnalyticsSystem(records: CancellationRecord[]) {
    const config = this.configs.get('analytics');
    if (!config) {
      throw new Error('分析システムの設定が見つかりません');
    }

    try {
      const response = await fetch(`${config.endpoint}/analytics/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          records: records.map(record => ({
            id: record.id,
            facilityId: record.facilityId,
            userId: record.userId,
            cancelledAt: record.cancelledAt,
            reason: record.reason,
            fee: record.fee
          }))
        })
      });

      if (!response.ok) {
        throw new Error('分析システムとの同期に失敗しました');
      }

      return await response.json();
    } catch (error) {
      console.error('分析システムとの同期に失敗しました:', error);
      throw error;
    }
  }

  // 通知システムとの連携
  async syncWithNotificationSystem(policy: CancellationPolicy) {
    const config = this.configs.get('notification');
    if (!config) {
      throw new Error('通知システムの設定が見つかりません');
    }

    try {
      const response = await fetch(`${config.endpoint}/notifications/policy-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          policyId: policy.id,
          facilityId: policy.facilityId,
          name: policy.name,
          description: policy.description,
          rules: policy.rules
        })
      });

      if (!response.ok) {
        throw new Error('通知システムとの同期に失敗しました');
      }

      return await response.json();
    } catch (error) {
      console.error('通知システムとの同期に失敗しました:', error);
      throw error;
    }
  }

  // データのエクスポート
  async exportData(records: CancellationRecord[], format: 'csv' | 'json') {
    try {
      let data: string;
      
      if (format === 'csv') {
        const headers = ['ID', '施設ID', '施設名', 'ユーザーID', 'ユーザー名', '予約ID', 'キャンセル日時', '理由', '料金', 'ステータス'];
        const rows = records.map(record => [
          record.id,
          record.facilityId,
          record.facilityName,
          record.userId,
          record.userName,
          record.reservationId,
          record.cancelledAt,
          record.reason,
          record.fee,
          record.status
        ]);
        
        data = [headers, ...rows].map(row => row.join(',')).join('\n');
      } else {
        data = JSON.stringify(records, null, 2);
      }

      return data;
    } catch (error) {
      console.error('データのエクスポートに失敗しました:', error);
      throw error;
    }
  }

  // データのインポート
  async importData(data: string, format: 'csv' | 'json'): Promise<CancellationRecord[]> {
    try {
      let records: CancellationRecord[];

      if (format === 'csv') {
        const rows = data.split('\n').map(row => row.split(','));
        const headers = rows[0];
        records = rows.slice(1).map(row => ({
          id: row[0],
          facilityId: row[1],
          facilityName: row[2],
          userId: row[3],
          userName: row[4],
          reservationId: row[5],
          cancelledAt: row[6],
          reason: row[7],
          fee: parseFloat(row[8]),
          status: row[9] as 'pending' | 'paid' | 'waived'
        }));
      } else {
        records = JSON.parse(data);
      }

      return records;
    } catch (error) {
      console.error('データのインポートに失敗しました:', error);
      throw error;
    }
  }
}

export const integrationService = new IntegrationService(); 