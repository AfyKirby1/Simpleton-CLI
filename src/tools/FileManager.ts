import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import { CacheManager } from './CacheManager';

export class FileManager {
  private cache: CacheManager;

  constructor() {
    this.cache = new CacheManager({
      maxSize: 100 * 1024 * 1024, // 100MB for file cache
      defaultTTL: 5 * 60 * 1000, // 5 minutes for file content
      enablePersistent: true
    });
  }

  async readFile(filePath: string): Promise<string> {
    try {
      // Check cache first
      const cached = await this.cache.getCachedFileContent(filePath);
      if (cached !== null) {
        return cached;
      }

      // Read from disk and cache
      const content = await fs.readFile(filePath, 'utf-8');
      await this.cache.cacheFileContent(filePath, content);
      return content;
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.ensureDir(dir);
      
      await fs.writeFile(filePath, content, 'utf-8');
      
      // Update cache
      await this.cache.cacheFileContent(filePath, content);
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error}`);
    }
  }

  async listFiles(directory: string): Promise<string[]> {
    try {
      // Check cache first
      const cached = await this.cache.getCachedProjectFiles(directory);
      if (cached !== null) {
        return cached;
      }

      // Optimized patterns with priority order (most common first)
      const patterns = [
        '**/*.ts',      // TypeScript first (most common in this project)
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx',
        '**/*.json',
        '**/*.md',
        '**/*.yml',
        '**/*.yaml',
        '**/*.html',
        '**/*.css',
        '**/*.scss',
        '**/*.txt'
      ];

      // Enhanced ignore patterns for better performance
      const ignorePatterns = [
        'node_modules/**',
        'dist/**',
        'build/**',
        '.git/**',
        'coverage/**',
        '.next/**',
        '.nuxt/**',
        '.cache/**',
        'tmp/**',
        'temp/**',
        '*.log',
        '.DS_Store',
        'Thumbs.db'
      ];

      // Use parallel processing for better performance
      const filePromises = patterns.map(async (pattern) => {
        try {
          return await glob(pattern, {
            cwd: directory,
            ignore: ignorePatterns,
            nodir: true, // Only return files, not directories
            follow: false, // Don't follow symlinks for security
            maxDepth: 10 // Limit depth to prevent infinite recursion
          });
        } catch (error) {
          return []; // Return empty array if pattern fails
        }
      });

      // Wait for all patterns to complete and flatten results
      const results = await Promise.all(filePromises);
      const files = [...new Set(results.flat())].sort(); // Remove duplicates and sort

      // Cache the results
      await this.cache.cacheProjectFiles(directory, files);
      
      return files;
    } catch (error) {
      throw new Error(`Failed to list files in ${directory}: ${error}`);
    }
  }

  async readMultipleFiles(filePaths: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    // Process files in parallel with batching to avoid overwhelming the system
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < filePaths.length; i += batchSize) {
      batches.push(filePaths.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const batchPromises = batch.map(async (filePath) => {
        try {
          const content = await this.readFile(filePath);
          return { filePath, content };
        } catch (error) {
          console.warn(`Failed to read ${filePath}:`, error);
          return { filePath, content: '' };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ filePath, content }) => {
        if (content) {
          results.set(filePath, content);
        }
      });
    }

    return results;
  }

  async getProjectSummary(directory: string): Promise<{
    totalFiles: number;
    fileTypes: Map<string, number>;
    totalSize: number;
    lastModified: Date;
  }> {
    const cacheKey = this.cache.generateKey('project-summary', directory);
    const cached = this.cache.get<any>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const files = await this.listFiles(directory);
    const fileTypes = new Map<string, number>();
    let totalSize = 0;
    let lastModified = new Date(0);

    // Process file stats in parallel batches
    const batchSize = 20;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const statPromises = batch.map(async (file) => {
        try {
          const fullPath = path.join(directory, file);
          const stats = await fs.stat(fullPath);
          const ext = path.extname(file).toLowerCase();
          
          return { ext, size: stats.size, mtime: stats.mtime };
        } catch (error) {
          return null;
        }
      });

      const batchStats = await Promise.all(statPromises);
      batchStats.forEach((stat) => {
        if (stat) {
          const count = fileTypes.get(stat.ext) || 0;
          fileTypes.set(stat.ext, count + 1);
          totalSize += stat.size;
          
          if (stat.mtime > lastModified) {
            lastModified = stat.mtime;
          }
        }
      });
    }

    const summary = {
      totalFiles: files.length,
      fileTypes,
      totalSize,
      lastModified
    };

    // Cache for 5 minutes
    this.cache.set(cacheKey, summary, 5 * 60 * 1000);
    return summary;
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      return await fs.pathExists(filePath);
    } catch (error) {
      return false;
    }
  }

  async getFileStats(filePath: string): Promise<fs.Stats> {
    try {
      return await fs.stat(filePath);
    } catch (error) {
      throw new Error(`Failed to get stats for ${filePath}: ${error}`);
    }
  }

  async copyFile(source: string, destination: string): Promise<void> {
    try {
      await fs.copy(source, destination);
      
      // Invalidate cache for destination
      const cacheKey = this.cache.generateKey('file-content', destination);
      this.cache.delete(cacheKey);
    } catch (error) {
      throw new Error(`Failed to copy file from ${source} to ${destination}: ${error}`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.remove(filePath);
      
      // Invalidate cache
      const cacheKey = this.cache.generateKey('file-content', filePath);
      this.cache.delete(cacheKey);
    } catch (error) {
      throw new Error(`Failed to delete file ${filePath}: ${error}`);
    }
  }

  // Get cache statistics for monitoring
  getCacheStats() {
    return this.cache.getStats();
  }

  // Clear file cache (useful for development)
  clearCache(): void {
    this.cache.clear();
  }
} 