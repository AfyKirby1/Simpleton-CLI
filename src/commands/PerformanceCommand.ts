import { performanceMonitor } from '../tools/PerformanceMonitor';
import { FileManager } from '../tools/FileManager';
import { ConfigManager } from '../config/ConfigManager';
import { LLMClient } from '../llm/LLMClient';

export interface PerformanceOptions {
  show?: boolean;
  benchmark?: string;
  export?: string;
  clear?: boolean;
  enable?: boolean;
  disable?: boolean;
}

export class PerformanceCommand {
  private fileManager: FileManager;
  private config: ConfigManager;

  constructor() {
    this.fileManager = new FileManager();
    this.config = new ConfigManager();
  }

  async run(options: PerformanceOptions): Promise<void> {
    if (options.enable) {
      await this.enableMonitoring();
    } else if (options.disable) {
      await this.disableMonitoring();
    } else if (options.clear) {
      await this.clearMetrics();
    } else if (options.export) {
      await this.exportMetrics(options.export);
    } else if (options.benchmark) {
      await this.runBenchmark(options.benchmark);
    } else if (options.show !== false) {
      await this.showPerformance();
    } else {
      await this.showHelp();
    }
  }

  private async showPerformance(): Promise<void> {
    console.log('🚀 AI CLI Performance Dashboard');
    console.log('─'.repeat(50));

    const summary = performanceMonitor.getPerformanceSummary();
    
    // System Health
    const healthIcon = {
      good: '✅',
      warning: '⚠️',
      critical: '❌'
    }[summary.systemHealth];
    
    console.log(`\n🏥 System Health: ${healthIcon} ${summary.systemHealth.toUpperCase()}`);
    
    // Memory Usage
    console.log('\n💾 Memory Usage:');
    console.log(`  Used: ${summary.currentMemory.used}MB / ${summary.currentMemory.total}MB`);
    console.log(`  Usage: ${summary.currentMemory.usage}%`);
    
    // CPU Usage
    console.log('\n🔧 CPU Usage:');
    console.log(`  Current: ${summary.currentCPU.usage}%`);
    console.log(`  Load Average: [${summary.currentCPU.loadAverage.join(', ')}]`);
    
    // Recent Operations
    if (summary.recentOperations.length > 0) {
      console.log('\n📊 Recent Operations:');
      summary.recentOperations.forEach(op => {
        console.log(`  ${op.name}: ${op.avgDuration}ms avg (${op.count} runs)`);
      });
    }

    // Component Performance
    await this.showComponentStats();

    // Benchmarks
    const benchmarks = performanceMonitor.getBenchmarks();
    if (benchmarks.length > 0) {
      console.log('\n🏆 Performance Benchmarks:');
      benchmarks.forEach(bench => {
        console.log(`\n  📋 ${bench.operationName}:`);
        console.log(`    Average: ${bench.avgDuration}ms`);
        console.log(`    Range: ${bench.minDuration}ms - ${bench.maxDuration}ms`);
        console.log(`    Success Rate: ${bench.successRate.toFixed(1)}%`);
        console.log(`    Total Runs: ${bench.totalRuns}`);
        console.log(`    Memory Impact: ${bench.memoryImpact.toFixed(1)}%`);
      });
    }
  }

  private async showComponentStats(): Promise<void> {
    console.log('\n🔧 Component Performance:');
    
    try {
      // File Manager Stats
      const fileStats = this.fileManager.getCacheStats();
      if (fileStats.entryCount > 0) {
        console.log(`  📁 File Cache: ${fileStats.entryCount} entries, ${fileStats.hitRate.toFixed(1)}% hit rate`);
        console.log(`    Cache Size: ${Math.round(fileStats.totalSize / 1024)}KB`);
      }

      // LLM Client Stats (if available)
      const effectiveModel = await this.config.getEffectiveModel();
      const llmClient = new LLMClient(this.config.getEndpoint(), effectiveModel);
      const llmStats = llmClient.getStats();
      
      if (llmStats.requestCount > 0) {
        console.log(`  🧠 LLM Client: ${llmStats.requestCount} requests`);
        console.log(`    Avg Response: ${llmStats.avgResponseTime.toFixed(1)}ms`);
        console.log(`    Total Tokens: ${llmStats.totalTokens}`);
        console.log(`    Cache Hits: ${llmStats.cacheHits}`);
        console.log(`    Error Rate: ${((llmStats.errorCount / llmStats.requestCount) * 100).toFixed(1)}%`);
      }
    } catch (error) {
      console.log('  ⚠️  Some component stats unavailable');
    }
  }

  private async runBenchmark(benchmarkType: string): Promise<void> {
    console.log(`🏃 Running ${benchmarkType} benchmark...`);
    console.log('─'.repeat(50));

    switch (benchmarkType) {
      case 'file-ops':
        await this.benchmarkFileOperations();
        break;
      case 'config':
        await this.benchmarkConfiguration();
        break;
      case 'ollama':
        await this.benchmarkOllamaOperations();
        break;
      case 'all':
        await this.benchmarkFileOperations();
        await this.benchmarkConfiguration();
        await this.benchmarkOllamaOperations();
        break;
      default:
        console.log(`❌ Unknown benchmark type: ${benchmarkType}`);
        console.log('Available benchmarks: file-ops, config, ollama, all');
    }
  }

  private async benchmarkFileOperations(): Promise<void> {
    console.log('\n📁 File Operations Benchmark:');
    const testDir = process.cwd();
    
    // Benchmark file listing
    const listOp = await performanceMonitor.measureAsync(
      'benchmark-file-list',
      () => this.fileManager.listFiles(testDir)
    );
    
    console.log(`  File Listing: Found ${listOp.length} files`);
    
    // Benchmark reading multiple small files
    const smallFiles = listOp.slice(0, 10);
    await performanceMonitor.measureAsync(
      'benchmark-file-read-multiple',
      () => this.fileManager.readMultipleFiles(smallFiles)
    );
    
    console.log(`  Multi-file Read: ${smallFiles.length} files`);
    
    // Benchmark project summary
    await performanceMonitor.measureAsync(
      'benchmark-project-summary',
      () => this.fileManager.getProjectSummary(testDir)
    );
    
    console.log(`  Project Summary: Complete`);
  }

  private async benchmarkConfiguration(): Promise<void> {
    console.log('\n⚙️  Configuration Benchmark:');
    
    // Benchmark config operations
    await performanceMonitor.measureAsync(
      'benchmark-config-get',
      async () => this.config.getModel()
    );
    
    await performanceMonitor.measureAsync(
      'benchmark-config-project-detection',
      async () => await this.config.autoDetectCurrentProject()
    );
    
    console.log(`  Configuration operations complete`);
  }

  private async benchmarkOllamaOperations(): Promise<void> {
    console.log('\n🤖 Ollama Operations Benchmark:');
    
    // Benchmark Ollama status check
    await performanceMonitor.measureAsync(
      'benchmark-ollama-status',
      () => this.config.checkOllamaStatus()
    );
    
    await performanceMonitor.measureAsync(
      'benchmark-effective-model',
      () => this.config.getEffectiveModel()
    );
    
    console.log(`  Ollama operations complete`);
  }

  private async exportMetrics(filepath?: string): Promise<void> {
    try {
      const exportPath = await performanceMonitor.exportMetrics(filepath);
      console.log(`✅ Performance metrics exported to: ${exportPath}`);
    } catch (error) {
      console.error(`❌ Failed to export metrics: ${error}`);
    }
  }

  private async clearMetrics(): Promise<void> {
    performanceMonitor.clear();
    this.fileManager.clearCache();
    console.log('✅ Performance metrics and caches cleared');
  }

  private async enableMonitoring(): Promise<void> {
    performanceMonitor.setEnabled(true);
    console.log('✅ Performance monitoring enabled');
  }

  private async disableMonitoring(): Promise<void> {
    performanceMonitor.setEnabled(false);
    console.log('✅ Performance monitoring disabled');
  }

  private async showHelp(): Promise<void> {
    console.log('📖 Performance Command Help');
    console.log('─'.repeat(40));
    console.log('');
    console.log('Usage: ai-cli performance [options]');
    console.log('');
    console.log('Options:');
    console.log('  --show           Show performance dashboard (default)');
    console.log('  --benchmark <type>  Run benchmark (file-ops, config, ollama, all)');
    console.log('  --export [path]  Export metrics to JSON file');
    console.log('  --clear          Clear all metrics and caches');
    console.log('  --enable         Enable performance monitoring');
    console.log('  --disable        Disable performance monitoring');
    console.log('');
    console.log('Examples:');
    console.log('  ai-cli performance');
    console.log('  ai-cli performance --benchmark all');
    console.log('  ai-cli performance --export ./metrics.json');
    console.log('  ai-cli performance --clear');
  }
} 