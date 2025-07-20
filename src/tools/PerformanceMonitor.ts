import * as os from 'os';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface PerformanceMetrics {
  timestamp: number;
  memory: {
    used: number;
    total: number;
    usage: number; // percentage
  };
  cpu: {
    usage: number; // percentage
    loadAverage: number[];
  };
  operation: {
    name: string;
    duration: number;
    success: boolean;
    metadata?: any;
  };
}

export interface BenchmarkResult {
  operationName: string;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  totalRuns: number;
  successRate: number;
  memoryImpact: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private activeOperations = new Map<string, number>();
  private maxMetrics = 1000; // Keep last 1000 metrics
  private isEnabled = true;

  constructor(options: { maxMetrics?: number; enabled?: boolean } = {}) {
    this.maxMetrics = options.maxMetrics || 1000;
    this.isEnabled = options.enabled !== false;
  }

  /**
   * Start timing an operation
   */
  startOperation(operationName: string): string {
    if (!this.isEnabled) return '';
    
    const operationId = `${operationName}_${Date.now()}_${Math.random()}`;
    this.activeOperations.set(operationId, Date.now());
    return operationId;
  }

  /**
   * End timing an operation and record metrics
   */
  endOperation(operationId: string, success = true, metadata?: any): void {
    if (!this.isEnabled || !operationId) return;
    
    const startTime = this.activeOperations.get(operationId);
    if (!startTime) return;

    const duration = Date.now() - startTime;
    const operationName = operationId.split('_')[0];
    
    this.recordMetric({
      timestamp: Date.now(),
      memory: this.getMemoryUsage(),
      cpu: this.getCPUUsage(),
      operation: {
        name: operationName,
        duration,
        success,
        metadata
      }
    });

    this.activeOperations.delete(operationId);
  }

  /**
   * Measure and record a function execution
   */
  async measureAsync<T>(
    operationName: string,
    fn: () => Promise<T>,
    metadata?: any
  ): Promise<T> {
    if (!this.isEnabled) {
      return await fn();
    }

    const operationId = this.startOperation(operationName);
    let success = true;
    let result: T;

    try {
      result = await fn();
    } catch (error) {
      success = false;
      throw error;
    } finally {
      this.endOperation(operationId, success, metadata);
    }

    return result;
  }

  /**
   * Measure synchronous function execution
   */
  measureSync<T>(
    operationName: string,
    fn: () => T,
    metadata?: any
  ): T {
    if (!this.isEnabled) {
      return fn();
    }

    const operationId = this.startOperation(operationName);
    let success = true;
    let result: T;

    try {
      result = fn();
    } catch (error) {
      success = false;
      throw error;
    } finally {
      this.endOperation(operationId, success, metadata);
    }

    return result;
  }

  /**
   * Get benchmark results for specific operations
   */
  getBenchmarks(operationName?: string): BenchmarkResult[] {
    const operations = operationName 
      ? this.metrics.filter(m => m.operation.name === operationName)
      : this.metrics;

    const grouped = this.groupBy(operations, m => m.operation.name);
    
    return Object.entries(grouped).map(([name, metrics]) => {
      const durations = metrics.map(m => m.operation.duration);
      const successes = metrics.filter(m => m.operation.success);
      const memoryUsages = metrics.map(m => m.memory.usage);
      
      return {
        operationName: name,
        avgDuration: this.average(durations),
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        totalRuns: metrics.length,
        successRate: (successes.length / metrics.length) * 100,
        memoryImpact: this.average(memoryUsages)
      };
    });
  }

  /**
   * Get real-time performance summary
   */
  getPerformanceSummary(): {
    currentMemory: { used: number; total: number; usage: number };
    currentCPU: { usage: number; loadAverage: number[] };
    recentOperations: Array<{ name: string; avgDuration: number; count: number }>;
    systemHealth: 'good' | 'warning' | 'critical';
  } {
    const current = {
      currentMemory: this.getMemoryUsage(),
      currentCPU: this.getCPUUsage(),
      recentOperations: this.getRecentOperationsSummary(),
      systemHealth: this.assessSystemHealth()
    };

    return current;
  }

  /**
   * Export metrics for analysis
   */
  async exportMetrics(filePath?: string): Promise<string> {
    const exportData = {
      timestamp: new Date().toISOString(),
      systemInfo: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        totalMemory: os.totalmem(),
        cpus: os.cpus().length
      },
      metrics: this.metrics,
      benchmarks: this.getBenchmarks()
    };

    const outputPath = filePath || path.join(os.homedir(), '.ai-cli', 'performance.json');
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeJson(outputPath, exportData, { spaces: 2 });
    
    return outputPath;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.activeOperations.clear();
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.activeOperations.clear();
    }
  }

  /**
   * Get detailed memory usage
   */
  private getMemoryUsage() {
    const process_memory = process.memoryUsage();
    const system_memory = {
      total: os.totalmem(),
      free: os.freemem()
    };

    const used = system_memory.total - system_memory.free;
    const usage = (used / system_memory.total) * 100;

    return {
      used: Math.round(used / 1024 / 1024), // MB
      total: Math.round(system_memory.total / 1024 / 1024), // MB
      usage: Math.round(usage * 100) / 100 // percentage
    };
  }

  /**
   * Get CPU usage (simplified)
   */
  private getCPUUsage() {
    const loadAvg = os.loadavg();
    const cpuCount = os.cpus().length;
    
    // Simplified CPU usage calculation
    const usage = (loadAvg[0] / cpuCount) * 100;
    
    return {
      usage: Math.min(Math.round(usage * 100) / 100, 100),
      loadAverage: loadAvg.map(avg => Math.round(avg * 100) / 100)
    };
  }

  /**
   * Record a metric and maintain max size
   */
  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Group array by key function
   */
  private groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      groups[key] = groups[key] || [];
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  /**
   * Calculate average of numbers
   */
  private average(numbers: number[]): number {
    return numbers.length > 0 
      ? Math.round((numbers.reduce((a, b) => a + b, 0) / numbers.length) * 100) / 100
      : 0;
  }

  /**
   * Get summary of recent operations
   */
  private getRecentOperationsSummary(): Array<{ name: string; avgDuration: number; count: number }> {
    const recent = this.metrics.slice(-50); // Last 50 operations
    const grouped = this.groupBy(recent, m => m.operation.name);
    
    return Object.entries(grouped).map(([name, metrics]) => ({
      name,
      avgDuration: this.average(metrics.map(m => m.operation.duration)),
      count: metrics.length
    }));
  }

  /**
   * Assess system health based on current metrics
   */
  private assessSystemHealth(): 'good' | 'warning' | 'critical' {
    const current = {
      memory: this.getMemoryUsage(),
      cpu: this.getCPUUsage()
    };

    // Critical thresholds
    if (current.memory.usage > 90 || current.cpu.usage > 90) {
      return 'critical';
    }

    // Warning thresholds
    if (current.memory.usage > 75 || current.cpu.usage > 75) {
      return 'warning';
    }

    return 'good';
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility decorators/helpers
export function measured(operationName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const opName = operationName || `${target.constructor.name}.${propertyName}`;

    descriptor.value = function (...args: any[]) {
      if (method.constructor.name === 'AsyncFunction') {
        return performanceMonitor.measureAsync(opName, () => method.apply(this, args));
      } else {
        return performanceMonitor.measureSync(opName, () => method.apply(this, args));
      }
    };

    return descriptor;
  };
} 