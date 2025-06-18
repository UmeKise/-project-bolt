import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { performanceMonitor } from './PerformanceMonitor';

interface ErrorReport {
  error: Error;
  componentStack?: string;
  timestamp: string;
  deviceInfo: {
    platform: string;
    version: string;
    model?: string;
  };
  userInfo?: {
    userId?: string;
    email?: string;
  };
}

interface ErrorSummary {
  totalErrors: number;
  errorTypes: Record<string, number>;
  recentErrors: ErrorReport[];
}

export class ErrorReporter {
  private static instance: ErrorReporter;
  private errorQueue: ErrorReport[];
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly STORAGE_KEY = 'error_reports';
  private readonly MAX_REPORTS = 100;
  private reports: ErrorReport[] = [];
  private userInfo: Record<string, any> = {};
  private readonly maxErrors = 1000;

  private constructor() {
    this.errorQueue = [];
    this.loadErrorQueue();
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  private setupGlobalErrorHandlers(): void {
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      this.captureError(args[0] instanceof Error ? args[0] : new Error(args[0]));
      originalConsoleError.apply(console, args);
    };

    if (Platform.OS === 'web') {
      window.addEventListener('error', (event) => {
        this.captureError(event.error);
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(event.reason);
      });
    }
  }

  public setUserInfo(info: Record<string, any>): void {
    this.userInfo = { ...this.userInfo, ...info };
  }

  public async captureError(error: Error | unknown): Promise<void> {
    try {
      if (this.reports.length >= this.MAX_REPORTS) {
        this.reports = this.reports.slice(-this.MAX_REPORTS + 1);
      }

      const errorReport: ErrorReport = {
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now().toString(),
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version.toString(),
          model: Platform.select({ ios: Platform.constants.model }),
        },
        userInfo: this.userInfo,
      };

      this.reports.push(errorReport);
      await this.sendErrorReport(errorReport);
    } catch (reportingError) {
      console.error('エラーレポートの生成に失敗しました:', reportingError);
    }
  }

  private async getPerformanceMetrics(): Promise<any[]> {
    try {
      const report = await performanceMonitor.getPerformanceReport();
      return report.metrics;
    } catch (error) {
      console.error('パフォーマンスメトリクスの取得に失敗しました:', error);
      return [];
    }
  }

  private async getAndroidMemoryInfo(): Promise<number | undefined> {
    if (Platform.OS === 'android') {
      try {
        // Androidのメモリ情報を取得する実装
        return undefined;
      } catch (error) {
        console.error('メモリ情報の取得に失敗しました:', error);
        return undefined;
      }
    }
    return undefined;
  }

  public reportError(error: Error, context?: Record<string, any>): void {
    const report: ErrorReport = {
      error,
      timestamp: Date.now().toString(),
      deviceInfo: {
        platform: Platform.OS,
        version: Platform.Version.toString(),
        model: Platform.select({ ios: Platform.constants.model }),
      },
      userInfo: this.userInfo,
    };

    this.reports.push(report);

    if (this.reports.length > this.maxErrors) {
      this.reports = this.reports.slice(-this.maxErrors);
    }

    // エラーをコンソールに出力
    console.error('Error Report:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date(report.timestamp).toISOString(),
    });

    // TODO: エラーを外部サービスに送信する実装を追加
  }

  public getErrorSummary(): ErrorSummary {
    const recentErrors = this.reports.slice(-100);
    const errorTypes: Record<string, number> = {};

    recentErrors.forEach(report => {
      const type = report.error.name || 'Unknown';
      errorTypes[type] = (errorTypes[type] || 0) + 1;
    });

    return {
      totalErrors: recentErrors.length,
      errorTypes,
      recentErrors,
    };
  }

  public clearErrors(): void {
    this.reports = [];
  }

  public getErrorsByType(type: string): ErrorReport[] {
    return this.reports.filter(report => 
      report.error.name === type || report.error.constructor.name === type
    );
  }

  public getErrorsByTimeRange(startTime: number, endTime: number): ErrorReport[] {
    return this.reports.filter(report => 
      report.timestamp >= startTime && report.timestamp <= endTime
    );
  }

  public async sendErrorReport(report: ErrorReport): Promise<void> {
    try {
      // TODO: エラーレポートを外部サービスに送信する実装を追加
      console.log('Sending error report:', report);
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }

  public getReports(): ErrorReport[] {
    return [...this.reports];
  }

  public async logErrorReport(report: ErrorReport): Promise<void> {
    try {
      console.log('エラーレポート:', JSON.stringify(report, null, 2));
    } catch (error) {
      console.error('エラーレポートのログ出力に失敗しました:', error);
    }
  }

  // エラーレポートの保存
  private async saveErrorQueue(): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        this.STORAGE_KEY,
        JSON.stringify(this.reports)
      );
    } catch (error) {
      console.error('Error saving error queue:', error);
    }
  }

  // エラーレポートの読み込み
  private async loadErrorQueue(): Promise<void> {
    try {
      const storedQueue = await SecureStore.getItemAsync(this.STORAGE_KEY);
      if (storedQueue) {
        this.reports = JSON.parse(storedQueue);
      }
    } catch (error) {
      console.error('Error loading error queue:', error);
    }
  }

  // エラーレポートの送信
  public async sendErrorReports(): Promise<void> {
    try {
      // キューに溜まっているエラーを送信
      for (const queuedReport of this.reports) {
        await this.sendToServer(queuedReport);
      }
      this.reports = [];
      await this.saveErrorQueue();
    } catch (error) {
      console.error('Error sending reports:', error);
    }
  }

  // サーバーへの送信
  private async sendToServer(report: ErrorReport): Promise<void> {
    try {
      // TODO: 実際のAPIエンドポイントに送信
      console.log('Sending error report to server:', report);
    } catch (error) {
      console.error('Error sending to server:', error);
      throw error;
    }
  }

  // エラーレポートのクリア
  public async clearErrorReports(): Promise<void> {
    this.reports = [];
    await this.saveErrorQueue();
  }
}

export const errorReporter = ErrorReporter.getInstance(); 