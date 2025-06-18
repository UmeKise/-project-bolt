import { CancellationRecord, CancellationPolicy } from '../types/cancellation';
import * as SecureStore from 'expo-secure-store';

interface IntegrationConfig {
  apiKey: string;
  endpoint: string;
  systemType: 'payment' | 'analytics' | 'notification' | 'crm' | 'erp' | 'bi';
  dataFormat: 'json' | 'xml' | 'csv';
  authType: 'bearer' | 'basic' | 'apiKey';
}

interface StandardizedResponse {
  success: boolean;
  data: any;
  error?: string;
  timestamp: string;
}

class ExtendedIntegrationService {
  private configs: Map<string, IntegrationConfig> = new Map();
  private dataFormats: Map<string, (data: any) => string> = new Map();

  constructor() {
    this.initializeDataFormats();
  }

  // データ形式の初期化
  private initializeDataFormats() {
    this.dataFormats.set('json', (data: any) => JSON.stringify(data, null, 2));
    this.dataFormats.set('xml', (data: any) => this.convertToXML(data));
    this.dataFormats.set('csv', (data: any) => this.convertToCSV(data));
  }

  // XMLへの変換
  private convertToXML(data: any): string {
    const convert = (obj: any, root: string = 'root'): string => {
      if (Array.isArray(obj)) {
        return obj.map(item => convert(item, root)).join('');
      }
      if (typeof obj === 'object' && obj !== null) {
        const children = Object.entries(obj)
          .map(([key, value]) => convert(value, key))
          .join('');
        return `<${root}>${children}</${root}>`;
      }
      return `<${root}>${obj}</${root}>`;
    };
    return `<?xml version="1.0" encoding="UTF-8"?>${convert(data)}`;
  }

  // CSVへの変換
  private convertToCSV(data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(item => headers.map(header => item[header]));
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // 統合設定の初期化
  async initializeConfigs() {
    try {
      const storedConfigs = await SecureStore.getItemAsync('extended_integration_configs');
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
        'extended_integration_configs',
        JSON.stringify(Array.from(this.configs.entries()))
      );
    } catch (error) {
      console.error('統合設定の保存に失敗しました:', error);
      throw error;
    }
  }

  // 標準化されたAPIリクエスト
  private async makeRequest(
    endpoint: string,
    method: string,
    data: any,
    config: IntegrationConfig
  ): Promise<StandardizedResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': `application/${config.dataFormat}`,
      };

      // 認証ヘッダーの設定
      switch (config.authType) {
        case 'bearer':
          headers['Authorization'] = `Bearer ${config.apiKey}`;
          break;
        case 'basic':
          headers['Authorization'] = `Basic ${Buffer.from(config.apiKey).toString('base64')}`;
          break;
        case 'apiKey':
          headers['X-API-Key'] = config.apiKey;
          break;
      }

      const response = await fetch(endpoint, {
        method,
        headers,
        body: this.dataFormats.get(config.dataFormat)?.(data)
      });

      const responseData = await response.json();

      return {
        success: response.ok,
        data: responseData,
        error: response.ok ? undefined : responseData.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // CRMシステムとの連携
  async syncWithCRM(records: CancellationRecord[]) {
    const config = this.configs.get('crm');
    if (!config) {
      throw new Error('CRMシステムの設定が見つかりません');
    }

    return this.makeRequest(
      `${config.endpoint}/customers/cancellations`,
      'POST',
      {
        records: records.map(record => ({
          customerId: record.userId,
          customerName: record.userName,
          cancellationDate: record.cancelledAt,
          reason: record.reason,
          amount: record.fee
        }))
      },
      config
    );
  }

  // ERPシステムとの連携
  async syncWithERP(records: CancellationRecord[]) {
    const config = this.configs.get('erp');
    if (!config) {
      throw new Error('ERPシステムの設定が見つかりません');
    }

    return this.makeRequest(
      `${config.endpoint}/financial/transactions`,
      'POST',
      {
        transactions: records.map(record => ({
          transactionId: record.id,
          type: 'cancellation',
          amount: record.fee,
          date: record.cancelledAt,
          status: record.status
        }))
      },
      config
    );
  }

  // BIシステムとの連携
  async syncWithBI(records: CancellationRecord[]) {
    const config = this.configs.get('bi');
    if (!config) {
      throw new Error('BIシステムの設定が見つかりません');
    }

    return this.makeRequest(
      `${config.endpoint}/analytics/cancellations`,
      'POST',
      {
        metrics: {
          totalCancellations: records.length,
          totalAmount: records.reduce((sum, r) => sum + r.fee, 0),
          averageAmount: records.reduce((sum, r) => sum + r.fee, 0) / records.length,
          byReason: this.groupByReason(records),
          byFacility: this.groupByFacility(records)
        }
      },
      config
    );
  }

  // 理由によるグループ化
  private groupByReason(records: CancellationRecord[]): Record<string, number> {
    return records.reduce((acc, record) => {
      acc[record.reason] = (acc[record.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // 施設によるグループ化
  private groupByFacility(records: CancellationRecord[]): Record<string, number> {
    return records.reduce((acc, record) => {
      acc[record.facilityId] = (acc[record.facilityId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // データのエクスポート
  async exportData(records: CancellationRecord[], format: 'json' | 'xml' | 'csv'): Promise<string> {
    try {
      const formatter = this.dataFormats.get(format);
      if (!formatter) {
        throw new Error(`未対応のデータ形式: ${format}`);
      }
      return formatter(records);
    } catch (error) {
      console.error('データのエクスポートに失敗しました:', error);
      throw error;
    }
  }

  // データのインポート
  async importData(data: string, format: 'json' | 'xml' | 'csv'): Promise<CancellationRecord[]> {
    try {
      let records: CancellationRecord[];

      switch (format) {
        case 'json':
          records = JSON.parse(data);
          break;
        case 'xml':
          records = this.parseXML(data);
          break;
        case 'csv':
          records = this.parseCSV(data);
          break;
        default:
          throw new Error(`未対応のデータ形式: ${format}`);
      }

      return records;
    } catch (error) {
      console.error('データのインポートに失敗しました:', error);
      throw error;
    }
  }

  // XMLのパース
  private parseXML(xml: string): CancellationRecord[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const records: CancellationRecord[] = [];

    const recordNodes = doc.getElementsByTagName('record');
    for (let i = 0; i < recordNodes.length; i++) {
      const node = recordNodes[i];
      records.push({
        id: node.getAttribute('id') || '',
        facilityId: node.getAttribute('facilityId') || '',
        facilityName: node.getAttribute('facilityName') || '',
        userId: node.getAttribute('userId') || '',
        userName: node.getAttribute('userName') || '',
        reservationId: node.getAttribute('reservationId') || '',
        cancelledAt: node.getAttribute('cancelledAt') || '',
        reason: node.getAttribute('reason') || '',
        fee: parseFloat(node.getAttribute('fee') || '0'),
        status: (node.getAttribute('status') as 'pending' | 'paid' | 'waived') || 'pending'
      });
    }

    return records;
  }

  // CSVのパース
  private parseCSV(csv: string): CancellationRecord[] {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    const records: CancellationRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const record: any = {};

      headers.forEach((header, index) => {
        record[header.trim()] = values[index]?.trim();
      });

      records.push({
        id: record.id,
        facilityId: record.facilityId,
        facilityName: record.facilityName,
        userId: record.userId,
        userName: record.userName,
        reservationId: record.reservationId,
        cancelledAt: record.cancelledAt,
        reason: record.reason,
        fee: parseFloat(record.fee),
        status: record.status as 'pending' | 'paid' | 'waived'
      });
    }

    return records;
  }

  // 通知履歴の取得
  async getNotificationHistory(): Promise<CancellationRecord[]> {
    try {
      const config = this.configs.get('notification');
      if (!config) {
        throw new Error('通知システムの設定が見つかりません');
      }

      const response = await this.makeRequest(
        `${config.endpoint}/notifications/history`,
        'GET',
        null,
        config
      );

      if (!response.success) {
        throw new Error(response.error || '通知履歴の取得に失敗しました');
      }

      return response.data.records;
    } catch (error) {
      console.error('通知履歴の取得に失敗しました:', error);
      return [];
    }
  }
}

export const extendedIntegrationService = new ExtendedIntegrationService(); 