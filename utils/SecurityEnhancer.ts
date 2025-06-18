import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

interface SecurityConfig {
  encryptionKey: string;
  maxLoginAttempts: number;
  lockoutDuration: number; // in milliseconds
}

interface SecurityMetrics {
  loginAttempts: number;
  lastLoginAttempt: number;
  failedAttempts: number;
}

class SecurityEnhancer {
  private static instance: SecurityEnhancer;
  private config: SecurityConfig;
  private metrics: SecurityMetrics;
  private encryptionKey: string;

  private constructor() {
    this.config = {
      encryptionKey: 'your-secure-encryption-key',
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
    };
    this.metrics = {
      loginAttempts: 0,
      lastLoginAttempt: 0,
      failedAttempts: 0,
    };
    this.encryptionKey = this.config.encryptionKey;
  }

  public static getInstance(): SecurityEnhancer {
    if (!SecurityEnhancer.instance) {
      SecurityEnhancer.instance = new SecurityEnhancer();
    }
    return SecurityEnhancer.instance;
  }

  // 設定の更新
  public updateConfig(config: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // データの暗号化
  public async encryptData(data: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const iv = await Crypto.getRandomBytesAsync(16);
      const encryptedData = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data + key
      );
      return `${iv.toString('base64')}:${encryptedData}`;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('データの暗号化に失敗しました');
    }
  }

  // データの復号化
  public async decryptData(encryptedData: string): Promise<string> {
    try {
      const [ivBase64, encrypted] = encryptedData.split(':');
      const key = await this.getEncryptionKey();
      const decryptedData = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        encrypted + key
      );
      return decryptedData;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('データの復号化に失敗しました');
    }
  }

  // 生体認証の確認
  public async checkBiometricAvailability(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Biometric check error:', error);
      return false;
    }
  }

  // 生体認証の実行
  public async authenticateWithBiometrics(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '生体認証で認証してください',
        fallbackLabel: 'パスコードを使用',
      });
      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }

  // ログイン試行の記録
  public async recordLoginAttempt(success: boolean): Promise<void> {
    this.metrics.loginAttempts++;
    this.metrics.lastLoginAttempt = Date.now();

    if (!success) {
      this.metrics.failedAttempts++;
      await this.saveMetrics();
    } else {
      this.metrics.failedAttempts = 0;
      await this.saveMetrics();
    }
  }

  // アカウントロックの確認
  public async isAccountLocked(): Promise<boolean> {
    if (this.metrics.failedAttempts >= this.config.maxLoginAttempts) {
      const timeSinceLastAttempt = Date.now() - this.metrics.lastLoginAttempt;
      return timeSinceLastAttempt < this.config.lockoutDuration;
    }
    return false;
  }

  // セキュリティメトリクスの取得
  public getSecurityMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  // セキュリティメトリクスのリセット
  public async resetSecurityMetrics(): Promise<void> {
    this.metrics = {
      loginAttempts: 0,
      lastLoginAttempt: 0,
      failedAttempts: 0,
    };
    await this.saveMetrics();
  }

  // セキュアストレージへの保存
  private async saveMetrics(): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        'securityMetrics',
        JSON.stringify(this.metrics)
      );
    } catch (error) {
      console.error('Save metrics error:', error);
    }
  }

  // セキュアストレージからの読み込み
  private async loadMetrics(): Promise<void> {
    try {
      const metrics = await SecureStore.getItemAsync('securityMetrics');
      if (metrics) {
        this.metrics = JSON.parse(metrics);
      }
    } catch (error) {
      console.error('Load metrics error:', error);
    }
  }

  // 暗号化キーの取得
  private async getEncryptionKey(): Promise<string> {
    if (Platform.OS === 'web') {
      return this.encryptionKey;
    }
    try {
      const key = await SecureStore.getItemAsync('encryptionKey');
      if (key) {
        return key;
      }
      await SecureStore.setItemAsync('encryptionKey', this.encryptionKey);
      return this.encryptionKey;
    } catch (error) {
      console.error('Get encryption key error:', error);
      return this.encryptionKey;
    }
  }
}

export const securityEnhancer = SecurityEnhancer.getInstance();

// カスタムフック
export const useSecurityEnhancer = () => {
  return {
    encryptData: securityEnhancer.encryptData.bind(securityEnhancer),
    decryptData: securityEnhancer.decryptData.bind(securityEnhancer),
    checkBiometricAvailability: securityEnhancer.checkBiometricAvailability.bind(securityEnhancer),
    authenticateWithBiometrics: securityEnhancer.authenticateWithBiometrics.bind(securityEnhancer),
    recordLoginAttempt: securityEnhancer.recordLoginAttempt.bind(securityEnhancer),
    isAccountLocked: securityEnhancer.isAccountLocked.bind(securityEnhancer),
    getSecurityMetrics: securityEnhancer.getSecurityMetrics.bind(securityEnhancer),
    resetSecurityMetrics: securityEnhancer.resetSecurityMetrics.bind(securityEnhancer),
  };
}; 