/**
 * API service for communicating with the Python backend
 */

const API_BASE_URL = 'http://localhost:5000/api';

export interface ScrapedContent {
  url: string;
  title: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  word_count: number;
  scraped_at: string;
}

export interface SummaryData {
  summary: string;
  key_concepts: string[];
  method: string;
  generated_at: string;
}

export interface MindMapData {
  title: string;
  type: string;
  mindmap: {
    visual?: string;
    network?: string;
    hierarchical?: string;
    structured: {
      root: {
        name: string;
        type: string;
      };
      nodes: Array<{
        id: string;
        name: string;
        type: string;
        parent: string;
      }>;
    };
  };
  key_concepts: string[];
  generated_at: string;
}

export interface ProcessedUrlData {
  url: string;
  title: string;
  content: {
    sections: Array<{
      title: string;
      content: string;
    }>;
    word_count: number;
  };
  summary: {
    text: string;
    key_concepts: string[];
    method: string;
  };
  mindmap: {
    visual?: string;
    network?: string;
    hierarchical?: string;
    structured: {
      root: {
        name: string;
        type: string;
      };
      nodes: Array<{
        id: string;
        name: string;
        type: string;
        parent: string;
      }>;
    };
  };
  processed_at: string;
}

export interface MindMapType {
  id: string;
  name: string;
  description: string;
}

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      return data.data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Check if the API server is healthy
   */
  static async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    version: string;
  }> {
    return this.request('/health');
  }

  /**
   * Scrape content from a URL
   */
  static async scrapeContent(url: string): Promise<ScrapedContent> {
    return this.request('/scrape', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  /**
   * Generate summary from scraped content
   */
  static async summarizeContent(
    content: ScrapedContent,
    maxLength: number = 300
  ): Promise<SummaryData> {
    return this.request('/summarize', {
      method: 'POST',
      body: JSON.stringify({ 
        content: {
          title: content.title,
          sections: content.sections,
          full_text: content.sections.map(s => `${s.title} ${s.content}`).join(' '),
          word_count: content.word_count
        }, 
        max_length: maxLength 
      }),
    });
  }

  /**
   * Generate mind map from title and key concepts
   */
  static async generateMindMap(
    title: string,
    keyConcepts: string[],
    summary: string = '',
    type: string = 'all'
  ): Promise<MindMapData> {
    return this.request('/mindmap', {
      method: 'POST',
      body: JSON.stringify({
        title,
        key_concepts: keyConcepts,
        summary,
        type,
      }),
    });
  }

  /**
   * Process a complete URL pipeline: scrape, summarize, and generate mind map
   */
  static async processUrl(
    url: string,
    maxLength: number = 300,
    mindmapType: string = 'all'
  ): Promise<ProcessedUrlData> {
    return this.request('/process-url', {
      method: 'POST',
      body: JSON.stringify({
        url,
        max_length: maxLength,
        mindmap_type: mindmapType,
      }),
    });
  }

  /**
   * Get available mind map types
   */
  static async getMindMapTypes(): Promise<{ types: MindMapType[] }> {
    return this.request('/mindmap/types');
  }
}

export default ApiService;
