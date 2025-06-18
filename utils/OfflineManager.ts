import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { cacheManager } from './CacheManager';
import { errorReporter } from './ErrorReporter';

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

interface SyncStatus {
  isOnline: boolean;
  queueLength: number;
  lastSyncTime?: number;
  pendingChanges: number;
}

export class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = true;
  private syncQueue: SyncQueueItem[] = [];
  private lastSyncTime?: number;
  private readonly maxRetries = 3;
  private readonly maxQueueSize = 1000;

  private constructor() {
    this.initializeNetworkListener();
  }

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private initializeNetworkListener(): void {
    // TODO: ネットワーク状態の監視を実装
    // NetInfo.addEventListener(state => {
    //   this.isOnline = state.isConnected;
    //   if (this.isOnline) {
    //     this.processSyncQueue();
    //   }
    // });
  }

  public addToSyncQueue(
    action: 'create' | 'update' | 'delete',
    entity: string,
    data: any
  ): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const queueItem: SyncQueueItem = {
      id,
      action,
      entity,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.syncQueue.push(queueItem);

    if (this.syncQueue.length > this.maxQueueSize) {
      this.syncQueue = this.syncQueue.slice(-this.maxQueueSize);
    }

    if (this.isOnline) {
      this.processSyncQueue();
    }

    return id;
  }

  private async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const item = this.syncQueue[0];
    try {
      await this.syncItem(item);
      this.syncQueue.shift(); // 成功したアイテムを削除
      this.lastSyncTime = Date.now();
    } catch (error) {
      item.retryCount++;
      if (item.retryCount >= this.maxRetries) {
        this.syncQueue.shift(); // 最大リトライ回数を超えたアイテムを削除
        console.error('Sync failed after max retries:', item);
      }
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    // TODO: 実際のAPI呼び出しを実装
    console.log('Syncing item:', item);
    await new Promise(resolve => setTimeout(resolve, 1000)); // モック実装
  }

  public getSyncStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      lastSyncTime: this.lastSyncTime,
      pendingChanges: this.syncQueue.length,
    };
  }

  public clearSyncQueue(): void {
    this.syncQueue = [];
  }

  public getQueueItem(id: string): SyncQueueItem | undefined {
    return this.syncQueue.find(item => item.id === id);
  }

  public removeQueueItem(id: string): void {
    this.syncQueue = this.syncQueue.filter(item => item.id !== id);
  }

  public async forceSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot force sync while offline');
    }
    await this.processSyncQueue();
  }

  public cleanup(): void {
    // TODO: ネットワーク状態の監視を削除
  }
}

export const offlineManager = OfflineManager.getInstance(); 