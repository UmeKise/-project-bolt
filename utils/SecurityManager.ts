import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { errorReporter } from './ErrorReporter';

interface SecurityConfig {
  encryptionKey: string;
  biometricEnabled: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
}

export class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;
  private readonly DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000; // 30分
  private readonly DEFAULT_MAX_LOGIN_ATTEMPTS = 5;
  private loginAttempts: number = 0;
  private lastActivity: number = Date.now();

  private constructor() {
    this.config = {
      encryptionKey: '',
      biometricEnabled: false,
      sessionTimeout: this.DEFAULT_SESSION_TIMEOUT,
      maxLoginAttempts: this.DEFAULT_MAX_LOGIN_ATTEMPTS,
    };
    this.initialize();
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  private async initialize(): Promise<void> {
    try {
      await this.loadConfig();
      this.startSessionTimer();
    } catch (error) {
      await errorReporter.captureError(error);
    }
  }

  private async loadConfig(): Promise<void> {
    try {
      const savedConfig = await SecureStore.getItemAsync('security_config');
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
      }
    } catch (error) {
      await errorReporter.captureError(error);
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        'security_config',
        JSON.stringify(this.config)
      );
    } catch (error) {
      await errorReporter.captureError(error);
    }
  }

  private startSessionTimer(): void {
    setInterval(() => {
      this.checkSessionTimeout();
    }, 60000); // 1分ごとにチェック
  }

  private checkSessionTimeout(): void {
    const now = Date.now();
    if (now - this.lastActivity > this.config.sessionTimeout) {
      this.handleSessionTimeout();
    }
  }

  private handleSessionTimeout(): void {
    // セッションタイムアウト時の処理
    this.clearSession();
  }

  public updateLastActivity(): void {
    this.lastActivity = Date.now();
  }

  public async encryptData(data: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const iv = await Crypto.getRandomBytesAsync(16);
      const encryptedData = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data + key
      );
      return encryptedData;
    } catch (error) {
      await errorReporter.captureError(error);
      throw new Error('データの暗号化に失敗しました');
    }
  }

  public async decryptData(encryptedData: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      // 復号化の実装
      return encryptedData;
    } catch (error) {
      await errorReporter.captureError(error);
      throw new Error('データの復号化に失敗しました');
    }
  }

  private async getEncryptionKey(): Promise<string> {
    if (!this.config.encryptionKey) {
      this.config.encryptionKey = await Crypto.getRandomBytesAsync(32).then(
        bytes => bytes.toString('hex')
      );
      await this.saveConfig();
    }
    return this.config.encryptionKey;
  }

  public async setBiometricEnabled(enabled: boolean): Promise<void> {
    this.config.biometricEnabled = enabled;
    await this.saveConfig();
  }

  public isBiometricEnabled(): boolean {
    return this.config.biometricEnabled;
  }

  public async setSessionTimeout(timeout: number): Promise<void> {
    this.config.sessionTimeout = timeout;
    await this.saveConfig();
  }

  public getSessionTimeout(): number {
    return this.config.sessionTimeout;
  }

  public async setMaxLoginAttempts(attempts: number): Promise<void> {
    this.config.maxLoginAttempts = attempts;
    await this.saveConfig();
  }

  public getMaxLoginAttempts(): number {
    return this.config.maxLoginAttempts;
  }

  public incrementLoginAttempts(): void {
    this.loginAttempts++;
  }

  public resetLoginAttempts(): void {
    this.loginAttempts = 0;
  }

  public isLoginBlocked(): boolean {
    return this.loginAttempts >= this.config.maxLoginAttempts;
  }

  public async clearSession(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('session_token');
      this.loginAttempts = 0;
      this.lastActivity = Date.now();
    } catch (error) {
      await errorReporter.captureError(error);
    }
  }

  public async validateSession(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      return !!token;
    } catch (error) {
      await errorReporter.captureError(error);
      return false;
    }
  }

  public getSecurityConfig(): SecurityConfig {
    return { ...this.config };
  }
}

export const securityManager = SecurityManager.getInstance(); 