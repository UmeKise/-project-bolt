interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  shouldRetry?: (error: any) => boolean;
}

interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  attempts: number;
}

class RetryMechanism {
  private static instance: RetryMechanism;
  private defaultConfig: RetryConfig = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
  };

  private constructor() {}

  public static getInstance(): RetryMechanism {
    if (!RetryMechanism.instance) {
      RetryMechanism.instance = new RetryMechanism();
    }
    return RetryMechanism.instance;
  }

  // 非同期操作のリトライ
  public async retry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<RetryResult<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };
    let attempts = 0;
    let delay = finalConfig.initialDelay;

    while (attempts < finalConfig.maxAttempts) {
      try {
        const result = await operation();
        return {
          success: true,
          data: result,
          attempts: attempts + 1,
        };
      } catch (error) {
        attempts++;

        if (
          attempts === finalConfig.maxAttempts ||
          (finalConfig.shouldRetry && !finalConfig.shouldRetry(error))
        ) {
          return {
            success: false,
            error,
            attempts,
          };
        }

        await this.delay(delay);
        delay = Math.min(
          delay * finalConfig.backoffFactor,
          finalConfig.maxDelay
        );
      }
    }

    return {
      success: false,
      attempts,
    };
  }

  // 同期操作のリトライ
  public retrySync<T>(
    operation: () => T,
    config: Partial<RetryConfig> = {}
  ): RetryResult<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    let attempts = 0;
    let delay = finalConfig.initialDelay;

    while (attempts < finalConfig.maxAttempts) {
      try {
        const result = operation();
        return {
          success: true,
          data: result,
          attempts: attempts + 1,
        };
      } catch (error) {
        attempts++;

        if (
          attempts === finalConfig.maxAttempts ||
          (finalConfig.shouldRetry && !finalConfig.shouldRetry(error))
        ) {
          return {
            success: false,
            error,
            attempts,
          };
        }

        this.delaySync(delay);
        delay = Math.min(
          delay * finalConfig.backoffFactor,
          finalConfig.maxDelay
        );
      }
    }

    return {
      success: false,
      attempts,
    };
  }

  // 遅延関数（非同期）
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 遅延関数（同期）
  private delaySync(ms: number): void {
    const start = Date.now();
    while (Date.now() - start < ms) {
      // ビジーウェイト
    }
  }

  // デフォルト設定の更新
  public updateDefaultConfig(config: Partial<RetryConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }
}

export const retryMechanism = RetryMechanism.getInstance();

// カスタムフック
export const useRetry = () => {
  return {
    retry: retryMechanism.retry.bind(retryMechanism),
    retrySync: retryMechanism.retrySync.bind(retryMechanism),
    updateDefaultConfig: retryMechanism.updateDefaultConfig.bind(retryMechanism),
  };
}; 