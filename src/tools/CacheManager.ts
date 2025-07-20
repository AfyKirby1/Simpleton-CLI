import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  size?: number; // Size in bytes for memory management
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalSize: number;
  entryCount: number;
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private stats = { hits: 0, misses: 0 };
  private maxSize: number;
  private defaultTTL: number;
  private persistentCachePath: string;

  constructor(options: {
    maxSize?: number; // Max cache size in bytes
    defaultTTL?: number; // Default TTL in milliseconds
    enablePersistent?: boolean;
  } = {}) {
    this.maxSize = options.maxSize || 100 * 1024 * 1024; // 100MB default
    this.defaultTTL = options.defaultTTL || 30 * 60 * 1000; // 30 minutes default
    this.persistentCachePath = path.join(os.homedir(), '.ai-cli', 'cache');
    
    if (options.enablePersistent) {
      this.loadPersistentCache();
    }

    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const size = this.estimateSize(data);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      size
    };

    // Check if we need to evict entries
    this.ensureSpace(size);
    
    this.cache.set(key, entry);
  }

  /**
   * Generate cache key from multiple parameters
   */
  generateKey(...parts: string[]): string {
    const combined = parts.join('|');
    return crypto.createHash('md5').update(combined).digest('hex');
  }

  /**
   * Cache project file list with smart invalidation
   */
  async cacheProjectFiles(projectPath: string, files: string[]): Promise<void> {
    const key = this.generateKey('project-files', projectPath);
    const projectStat = await fs.stat(projectPath);
    
    // Include modification time in the data for invalidation
    const data = {
      files,
      mtime: projectStat.mtime.getTime(),
      path: projectPath
    };

    this.set(key, data, 10 * 60 * 1000); // 10 minutes TTL for file lists
  }

  /**
   * Get cached project files with automatic invalidation
   */
  async getCachedProjectFiles(projectPath: string): Promise<string[] | null> {
    const key = this.generateKey('project-files', projectPath);
    const cached = this.get<{ files: string[], mtime: number, path: string }>(key);
    
    if (!cached) {
      return null;
    }

    try {
      const projectStat = await fs.stat(projectPath);
      
      // Invalidate if directory was modified
      if (projectStat.mtime.getTime() !== cached.mtime) {
        this.delete(key);
        return null;
      }

      return cached.files;
    } catch (error) {
      // Directory doesn't exist anymore
      this.delete(key);
      return null;
    }
  }

  /**
   * Cache file content with content-based invalidation
   */
  async cacheFileContent(filePath: string, content: string): Promise<void> {
    const key = this.generateKey('file-content', filePath);
    const fileStat = await fs.stat(filePath);
    
    const data = {
      content,
      mtime: fileStat.mtime.getTime(),
      size: fileStat.size
    };

    this.set(key, data, 5 * 60 * 1000); // 5 minutes TTL for file content
  }

  /**
   * Get cached file content with automatic invalidation
   */
  async getCachedFileContent(filePath: string): Promise<string | null> {
    const key = this.generateKey('file-content', filePath);
    const cached = this.get<{ content: string, mtime: number, size: number }>(key);
    
    if (!cached) {
      return null;
    }

    try {
      const fileStat = await fs.stat(filePath);
      
      // Invalidate if file was modified or size changed
      if (fileStat.mtime.getTime() !== cached.mtime || fileStat.size !== cached.size) {
        this.delete(key);
        return null;
      }

      return cached.content;
    } catch (error) {
      // File doesn't exist anymore
      this.delete(key);
      return null;
    }
  }

  /**
   * Cache Ollama status with short TTL
   */
  cacheOllamaStatus(status: any): void {
    const key = 'ollama-status';
    this.set(key, status, 30 * 1000); // 30 seconds TTL
  }

  /**
   * Get cached Ollama status
   */
  getCachedOllamaStatus(): any | null {
    return this.get('ollama-status');
  }

  /**
   * Delete a cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + (entry.size || 0), 0);
    
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      totalSize,
      entryCount: this.cache.size
    };
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry, now)) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>, now = Date.now()): boolean {
    return (entry.timestamp + entry.ttl) < now;
  }

  /**
   * Estimate size of data for memory management
   */
  private estimateSize(data: any): number {
    try {
      return Buffer.byteLength(JSON.stringify(data), 'utf8');
    } catch {
      return 1024; // Default estimate
    }
  }

  /**
   * Ensure we have enough space, evict old entries if needed
   */
  private ensureSpace(newEntrySize: number): void {
    let currentSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + (entry.size || 0), 0);

    if (currentSize + newEntrySize <= this.maxSize) {
      return;
    }

    // Sort entries by age (oldest first)
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    // Remove oldest entries until we have space
    for (const [key, entry] of entries) {
      this.cache.delete(key);
      currentSize -= (entry.size || 0);
      
      if (currentSize + newEntrySize <= this.maxSize) {
        break;
      }
    }
  }

  /**
   * Load persistent cache from disk
   */
  private async loadPersistentCache(): Promise<void> {
    try {
      await fs.ensureDir(this.persistentCachePath);
      const cacheFile = path.join(this.persistentCachePath, 'cache.json');
      
      if (await fs.pathExists(cacheFile)) {
        const data = await fs.readJson(cacheFile);
        
        // Only load non-expired entries
        const now = Date.now();
        for (const [key, entry] of Object.entries(data)) {
          if (!this.isExpired(entry as CacheEntry<any>, now)) {
            this.cache.set(key, entry as CacheEntry<any>);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load persistent cache:', error);
    }
  }

  /**
   * Save cache to disk
   */
  async savePersistentCache(): Promise<void> {
    try {
      await fs.ensureDir(this.persistentCachePath);
      const cacheFile = path.join(this.persistentCachePath, 'cache.json');
      
      // Convert Map to object for JSON serialization
      const data = Object.fromEntries(this.cache);
      await fs.writeJson(cacheFile, data, { spaces: 2 });
    } catch (error) {
      console.warn('Failed to save persistent cache:', error);
    }
  }
} 