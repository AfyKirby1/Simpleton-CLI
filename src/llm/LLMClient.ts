import axios, { AxiosInstance } from 'axios';
import { Agent } from 'http';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamingChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export interface LLMClientStats {
  requestCount: number;
  totalTokens: number;
  avgResponseTime: number;
  errorCount: number;
  cacheHits: number;
}

export class LLMClient {
  private client: AxiosInstance;
  private endpoint: string;
  private model: string;
  private stats: LLMClientStats;
  private responseCache = new Map<string, { response: ChatCompletionResponse; timestamp: number }>();
  private readonly cacheTTL = 5 * 60 * 1000; // 5 minutes cache for identical requests

  constructor(endpoint: string, model: string) {
    this.endpoint = endpoint;
    this.model = model;
    this.stats = {
      requestCount: 0,
      totalTokens: 0,
      avgResponseTime: 0,
      errorCount: 0,
      cacheHits: 0
    };
    
    // Create HTTP agent with optimized settings
    const httpAgent = new Agent({
      keepAlive: true,
      maxSockets: 5,        // Max concurrent connections
      maxFreeSockets: 2,    // Keep 2 connections open
      timeout: 60000,       // 60 second timeout
    });
    
    this.client = axios.create({
      baseURL: endpoint,
      timeout: 120000, // Increased timeout for larger models
      httpAgent,
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
      },
      // Retry configuration
      validateStatus: (status) => status < 500, // Don't retry on 4xx errors
    });

    // Add request interceptor for stats
    this.client.interceptors.request.use((config) => {
      (config as any).metadata = { startTime: Date.now() };
      return config;
    });

    // Add response interceptor for stats and error handling
    this.client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - (response.config as any).metadata.startTime;
        this.updateStats(duration, response.data.usage?.total_tokens || 0);
        return response;
      },
      (error) => {
        this.stats.errorCount++;
        return Promise.reject(this.enhanceError(error));
      }
    );
  }

  async chatCompletion(
    messages: ChatMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
      useCache?: boolean;
    } = {}
  ): Promise<ChatCompletionResponse> {
    const request: ChatCompletionRequest = {
      model: this.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4000,
      stream: options.stream ?? false,
    };

    // Check cache for non-streaming requests
    if (!request.stream && (options.useCache !== false)) {
      const cacheKey = this.generateCacheKey(request);
      const cached = this.getCachedResponse(cacheKey);
      if (cached) {
        this.stats.cacheHits++;
        return cached;
      }
    }

    try {
      this.stats.requestCount++;
      const response = await this.client.post('/chat/completions', request);
      
      // Cache successful non-streaming responses
      if (!request.stream && response.data && (options.useCache !== false)) {
        const cacheKey = this.generateCacheKey(request);
        this.cacheResponse(cacheKey, response.data);
      }

      return response.data;
    } catch (error) {
      throw error; // Error handling is done in interceptor
    }
  }

  async *streamChatCompletion(
    messages: ChatMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
      bufferSize?: number;
    } = {}
  ): AsyncGenerator<string, void, unknown> {
    const request: ChatCompletionRequest = {
      model: this.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4000,
      stream: true,
    };

    try {
      this.stats.requestCount++;
      const response = await this.client.post('/chat/completions', request, {
        responseType: 'stream',
        // Optimize streaming settings
        timeout: 0, // No timeout for streaming
        maxRedirects: 0,
      });

      const stream = response.data;
      let buffer = '';
      const bufferSize = options.bufferSize || 100; // Buffer size for chunk processing
      
      for await (const chunk of stream) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            
            if (data === '[DONE]') {
              return;
            }
            
            try {
              const parsed: StreamingChatCompletionResponse = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              
              if (content) {
                yield content;
              }
            } catch (error) {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      throw error; // Error handling is done in interceptor
    }
  }

  async testConnection(timeoutMs: number = 10000): Promise<{ success: boolean; error?: string; timeout?: boolean }> {
    const source = axios.CancelToken.source();
    const timeout = setTimeout(() => {
      source.cancel('Connection timed out');
    }, timeoutMs);

    try {
      const response = await this.client.get('/models', { 
        cancelToken: source.token 
      });
      clearTimeout(timeout);
      
      if (response.status === 200) {
        return { success: true };
      } else {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      clearTimeout(timeout);
      
      if (axios.isCancel(error)) {
        return { success: false, error: 'Connection timed out', timeout: true };
      }
      
      if (error instanceof Error) {
        if (error.message.includes('ECONNREFUSED')) {
          return { success: false, error: 'Connection refused - Ollama server not running' };
        } else if (error.message.includes('ENOTFOUND')) {
          return { success: false, error: 'Host not found - Check endpoint URL' };
        } else if (error.message.includes('ETIMEDOUT')) {
          return { success: false, error: 'Connection timed out', timeout: true };
        } else {
          return { success: false, error: error.message };
        }
      }
      
      return { success: false, error: 'Unknown connection error' };
    }
  }

  // Batch multiple requests efficiently
  async batchChatCompletion(
    requests: Array<{
      messages: ChatMessage[];
      options?: { temperature?: number; maxTokens?: number };
    }>,
    concurrency = 3
  ): Promise<ChatCompletionResponse[]> {
    const results: ChatCompletionResponse[] = [];
    
    // Process requests in batches to avoid overwhelming the server
    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      const batchPromises = batch.map(req => 
        this.chatCompletion(req.messages, req.options)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  private generateCacheKey(request: ChatCompletionRequest): string {
    // Create a hash of the request for caching
    const key = JSON.stringify({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens
    });
    
    return Buffer.from(key).toString('base64').slice(0, 32);
  }

  private getCachedResponse(key: string): ChatCompletionResponse | null {
    const cached = this.responseCache.get(key);
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.responseCache.delete(key);
      return null;
    }
    
    return cached.response;
  }

  private cacheResponse(key: string, response: ChatCompletionResponse): void {
    // Limit cache size
    if (this.responseCache.size > 100) {
      // Remove oldest entries
      const oldest = Array.from(this.responseCache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)
        .slice(0, 20);
      
      oldest.forEach(([key]) => this.responseCache.delete(key));
    }
    
    this.responseCache.set(key, {
      response,
      timestamp: Date.now()
    });
  }

  private updateStats(duration: number, tokens: number): void {
    this.stats.totalTokens += tokens;
    
    // Update average response time using exponential moving average
    const alpha = 0.1;
    this.stats.avgResponseTime = this.stats.avgResponseTime === 0 
      ? duration
      : (alpha * duration) + ((1 - alpha) * this.stats.avgResponseTime);
  }

  private enhanceError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;
      
      switch (status) {
        case 404:
          return new Error(`Model '${this.model}' not found. Please check if the model is installed.`);
        case 503:
          return new Error('LLM service is temporarily unavailable. Please try again later.');
        case 413:
          return new Error('Request too large. Try reducing the message length or max_tokens.');
        case 429:
          return new Error('Rate limit exceeded. Please wait a moment before trying again.');
        default:
          return new Error(`LLM API error (${status || 'unknown'}): ${message}`);
      }
    }
    
    return error instanceof Error ? error : new Error(String(error));
  }

  getEndpoint(): string {
    return this.endpoint;
  }

  getModel(): string {
    return this.model;
  }

  getStats(): LLMClientStats {
    return { ...this.stats };
  }

  clearCache(): void {
    this.responseCache.clear();
  }

  // Cleanup method to close connections
  destroy(): void {
    this.clearCache();
    // Note: Axios doesn't have a direct way to destroy agents,
    // but they will be garbage collected when the instance is disposed
  }
} 