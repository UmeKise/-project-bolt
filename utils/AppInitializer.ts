import * as SecureStore from 'expo-secure-store';
import { performanceOptimizer } from './PerformanceOptimizer';
import { securityEnhancer } from './SecurityEnhancer';
import { errorReporter } from './ErrorReporter';

class AppInitializer {
  private static instance: AppInitializer;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): AppInitializer {
    if (!AppInitializer.instance) {
      AppInitializer.instance = new AppInitializer();
    }
    return AppInitializer.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // パフォーマンスモニタリングの初期化
      await this.initializePerformanceMonitoring();

      // セキュリティ設定の初期化
      await this.initializeSecurity();

      // エラーレポートの初期化
      await this.initializeErrorReporting();

      // アプリケーション設定の読み込み
      await this.loadAppSettings();

      this.isInitialized = true;
    } catch (error) {
      console.error('Application initialization failed:', error);
      throw error;
    }
  }

  private async initializePerformanceMonitoring(): Promise<void> {
    // パフォーマンスメトリクスのリセット
    performanceOptimizer.resetMetrics();

    // キャッシュのクリア
    await performanceOptimizer.clearCache();
  }

  private async initializeSecurity(): Promise<void> {
    // セキュリティメトリクスのリセット
    await securityEnhancer.resetSecurityMetrics();

    // 生体認証の可用性確認
    const isBiometricsAvailable = await securityEnhancer.checkBiometricAvailability();
    if (isBiometricsAvailable) {
      // 生体認証の設定を更新
      await SecureStore.setItemAsync('biometricsAvailable', 'true');
    }
  }

  private async initializeErrorReporting(): Promise<void> {
    // エラーレポートのクリア
    await errorReporter.clearErrorReports();

    // グローバルエラーハンドラーの設定
    this.setupGlobalErrorHandlers();
  }

  private async loadAppSettings(): Promise<void> {
    try {
      // アプリケーション設定の読み込み
      const settings = await SecureStore.getItemAsync('appSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        // 設定の適用
        if (parsedSettings.theme) {
          // テーマの適用
        }
        if (parsedSettings.language) {
          // 言語設定の適用
        }
      }
    } catch (error) {
      console.error('Error loading app settings:', error);
    }
  }

  private setupGlobalErrorHandlers(): void {
    // 未処理のPromiseエラーのハンドリング
    process.on('unhandledRejection', (error) => {
      errorReporter.reportError(error as Error, {
        context: 'unhandledRejection',
      });
    });

    // 未処理の例外のハンドリング
    process.on('uncaughtException', (error) => {
      errorReporter.reportError(error, {
        context: 'uncaughtException',
      });
    });
  }
}

export const appInitializer = AppInitializer.getInstance(); 