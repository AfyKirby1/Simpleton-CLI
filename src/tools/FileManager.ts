import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

export class FileManager {
  async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
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
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error}`);
    }
  }

  async listFiles(directory: string): Promise<string[]> {
    try {
      const patterns = [
        '**/*.js',
        '**/*.ts',
        '**/*.jsx',
        '**/*.tsx',
        '**/*.json',
        '**/*.md',
        '**/*.txt',
        '**/*.yml',
        '**/*.yaml',
        '**/*.html',
        '**/*.css',
        '**/*.scss'
      ];

      const files: string[] = [];
      
      for (const pattern of patterns) {
        try {
          const matches = await glob(pattern, {
            cwd: directory,
            ignore: [
              'node_modules/**',
              'dist/**',
              'build/**',
              '.git/**',
              'coverage/**',
              '.next/**',
              '.nuxt/**'
            ]
          });
          files.push(...matches);
        } catch (error) {
          // Pattern failed, continue
        }
      }

      return files.sort();
    } catch (error) {
      throw new Error(`Failed to list files in ${directory}: ${error}`);
    }
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
    } catch (error) {
      throw new Error(`Failed to copy file from ${source} to ${destination}: ${error}`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.remove(filePath);
    } catch (error) {
      throw new Error(`Failed to delete file ${filePath}: ${error}`);
    }
  }
} 