import { InteractionManager, Platform } from 'react-native';
import { cacheManager } from './CacheManager';

interface PerformanceMetric {
  name: string;
  duration?: number;
  timestamp: number;
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    totalOperations: number;
    averageDuration: number;
    slowestOperation: string;
    fastestOperation: string;
  };
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;

  public startOperation(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.addMetric(name, duration);
    };
  }

  public addMetric(name: string, duration?: number): void {
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
    });

    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  public async getPerformanceReport(): Promise<PerformanceReport> {
    const recentMetrics = this.metrics.slice(-100);
    const operationsWithDuration = recentMetrics.filter(m => m.duration !== undefined);

    const summary = {
      totalOperations: recentMetrics.length,
      averageDuration: 0,
      slowestOperation: '',
      fastestOperation: '',
    };

    if (operationsWithDuration.length > 0) {
      const durations = operationsWithDuration.map(m => m.duration!);
      summary.averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      
      const slowest = operationsWithDuration.reduce((a, b) => 
        (a.duration! > b.duration!) ? a : b
      );
      const fastest = operationsWithDuration.reduce((a, b) => 
        (a.duration! < b.duration!) ? a : b
      );

      summary.slowestOperation = slowest.name;
      summary.fastestOperation = fastest.name;
    }

    return {
      metrics: recentMetrics,
      summary,
    };
  }

  public clearMetrics(): void {
    this.metrics = [];
  }

  public getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  public getAverageDuration(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;

    const durations = metrics
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!);

    if (durations.length === 0) return 0;

    return durations.reduce((a, b) => a + b, 0) / durations.length;
  }
}

export const performanceMonitor = new PerformanceMonitor(); 