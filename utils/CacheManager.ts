import * as SecureStore from 'expo-secure-store';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry?: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheItem<any>>;
  private readonly DEFAULT_EXPIRY = 1000 * 60 * 60; // 1時間

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  public async set<T>(
    key: string,
    data: T,
    expiry: number = this.DEFAULT_EXPIRY
  ): Promise<void> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry,
    };

    this.cache.set(key, cacheItem);

    try {
      await SecureStore.setItemAsync(
        key,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      console.error('キャッシュの保存に失敗しました:', error);
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    // メモリキャッシュを確認
    const cachedItem = this.cache.get(key);
    if (cachedItem) {
      if (this.isExpired(cachedItem)) {
        this.cache.delete(key);
        await SecureStore.deleteItemAsync(key);
        return null;
      }
      return cachedItem.data as T;
    }

    // 永続化ストレージを確認
    try {
      const storedItem = await SecureStore.getItemAsync(key);
      if (storedItem) {
        const cacheItem: CacheItem<T> = JSON.parse(storedItem);
        if (this.isExpired(cacheItem)) {
          await SecureStore.deleteItemAsync(key);
          return null;
        }
        this.cache.set(key, cacheItem);
        return cacheItem.data;
      }
    } catch (error) {
      console.error('キャッシュの読み込みに失敗しました:', error);
    }

    return null;
  }

  public async remove(key: string): Promise<void> {
    this.cache.delete(key);
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('キャッシュの削除に失敗しました:', error);
    }
  }

  public async clear(): Promise<void> {
    this.cache.clear();
    try {
      const keys = await SecureStore.getAllKeysAsync();
      await Promise.all(
        keys.map(key => SecureStore.deleteItemAsync(key))
      );
    } catch (error) {
      console.error('キャッシュのクリアに失敗しました:', error);
    }
  }

  private isExpired(cacheItem: CacheItem<any>): boolean {
    if (!cacheItem.expiry) return false;
    return Date.now() - cacheItem.timestamp > cacheItem.expiry;
  }

  public async getCacheSize(): Promise<number> {
    try {
      const keys = await SecureStore.getAllKeysAsync();
      return keys.length;
    } catch (error) {
      console.error('キャッシュサイズの取得に失敗しました:', error);
      return 0;
    }
  }

  public async getCacheKeys(): Promise<string[]> {
    try {
      return await SecureStore.getAllKeysAsync();
    } catch (error) {
      console.error('キャッシュキーの取得に失敗しました:', error);
      return [];
    }
  }
}

export const cacheManager = CacheManager.getInstance(); 