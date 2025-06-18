import { useCallback, useMemo, useRef } from 'react';
import { InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheConfig {
  key: string;
  ttl?: number; // Time to live in milliseconds
}

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  fps: number;
}

class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private cache: Map<string, { data: any; timestamp: number }>;
  private metrics: PerformanceMetrics[];

  private constructor() {
    this.cache = new Map();
    this.metrics = [];
  }

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // メモ化された関数を作成
  public createMemoizedFunction<T extends (...args: any[]) => any>(
    fn: T,
    deps: any[]
  ): T {
    return useCallback(fn, deps) as T;
  }

  // メモ化された値を計算
  public createMemoizedValue<T>(factory: () => T, deps: any[]): T {
    return useMemo(factory, deps);
  }

  // レンダリングの最適化
  public optimizeRendering(component: React.ComponentType<any>) {
    return React.memo(component);
  }

  // キャッシュの設定
  public async setCache<T>(config: CacheConfig, data: T): Promise<void> {
    const cacheItem = {
      data,
      timestamp: Date.now(),
    };

    this.cache.set(config.key, cacheItem);
    await AsyncStorage.setItem(config.key, JSON.stringify(cacheItem));
  }

  // キャッシュの取得
  public async getCache<T>(config: CacheConfig): Promise<T | null> {
    // メモリキャッシュを確認
    const memoryCache = this.cache.get(config.key);
    if (memoryCache) {
      if (config.ttl && Date.now() - memoryCache.timestamp > config.ttl) {
        this.cache.delete(config.key);
        await AsyncStorage.removeItem(config.key);
        return null;
      }
      return memoryCache.data as T;
    }

    // AsyncStorageを確認
    const storageCache = await AsyncStorage.getItem(config.key);
    if (storageCache) {
      const parsedCache = JSON.parse(storageCache);
      if (config.ttl && Date.now() - parsedCache.timestamp > config.ttl) {
        await AsyncStorage.removeItem(config.key);
        return null;
      }
      this.cache.set(config.key, parsedCache);
      return parsedCache.data as T;
    }

    return null;
  }

  // パフォーマンスメトリクスの記録
  public recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
  }

  // パフォーマンスメトリクスの取得
  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  // バックグラウンドタスクの実行
  public runInBackground(task: () => void): void {
    InteractionManager.runAfterInteractions(() => {
      task();
    });
  }

  // キャッシュのクリア
  public async clearCache(): Promise<void> {
    this.cache.clear();
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys);
  }

  // パフォーマンスメトリクスのリセット
  public resetMetrics(): void {
    this.metrics = [];
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance();

// カスタムフック
export const usePerformanceOptimizer = () => {
  const optimizer = useRef(performanceOptimizer);

  return {
    createMemoizedFunction: optimizer.current.createMemoizedFunction.bind(optimizer.current),
    createMemoizedValue: optimizer.current.createMemoizedValue.bind(optimizer.current),
    optimizeRendering: optimizer.current.optimizeRendering.bind(optimizer.current),
    setCache: optimizer.current.setCache.bind(optimizer.current),
    getCache: optimizer.current.getCache.bind(optimizer.current),
    recordMetrics: optimizer.current.recordMetrics.bind(optimizer.current),
    getMetrics: optimizer.current.getMetrics.bind(optimizer.current),
    runInBackground: optimizer.current.runInBackground.bind(optimizer.current),
    clearCache: optimizer.current.clearCache.bind(optimizer.current),
    resetMetrics: optimizer.current.resetMetrics.bind(optimizer.current),
  };
}; 