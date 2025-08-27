/**
 * AI 友好文档转换器模块主入口
 * 提供 Swagger 到 AI 优化文档的转换功能
 */

// 核心类型
export type {
  AIEndpoint,
  AIParameter,
  AIRequestBody,
  AIResponse,
  AISchema,
  AISchemaProperty,
  AIExample,
  AIFriendlyDoc,
  AIMetadata,
  AISearchIndex,
  AIFullTextIndex,
  AIStatistics,
  AIDocConfig,
  AIDocResult,
} from './types';

// 核心转换器
export { AIDocConverter } from './converter';

// 便利函数
import { AIDocConverter } from './converter';
import type { AIDocConfig, AIDocResult } from './types';
import type { ParsedSwagger } from '../types';

/**
 * 创建 AI 文档转换器实例
 */
export function createAIDocConverter(): AIDocConverter {
  return new AIDocConverter();
}

/**
 * 便利函数：快速转换为 AI 友好格式
 */
export function convertToAIFormat(swagger: ParsedSwagger) {
  const converter = new AIDocConverter();
  return converter.convertToAIFormat(swagger);
}

/**
 * 便利函数：生成 AI 友好文档
 */
export async function generateAIDoc(
  swagger: ParsedSwagger,
  config: AIDocConfig
): Promise<AIDocResult> {
  const converter = new AIDocConverter();
  return converter.generateAIDoc(swagger, config);
}

/**
 * 默认配置
 */
export const defaultAIDocConfig: AIDocConfig = {
  format: 'markdown',
  includeExamples: true,
  optimizeForSearch: true,
  includeCodeExamples: true,
  generateTOC: true,
  language: 'zh',
  verbosity: 'normal',
};

/**
 * 预设配置
 */
export const aiDocPresets = {
  /**
   * 开发者文档 - 详细的 Markdown 格式
   */
  developer: {
    format: 'markdown' as const,
    includeExamples: true,
    optimizeForSearch: true,
    includeCodeExamples: true,
    generateTOC: true,
    language: 'zh' as const,
    verbosity: 'detailed' as const,
  },

  /**
   * API 参考 - 简洁的 JSON 格式
   */
  reference: {
    format: 'json' as const,
    includeExamples: false,
    optimizeForSearch: true,
    includeCodeExamples: false,
    generateTOC: false,
    language: 'en' as const,
    verbosity: 'minimal' as const,
  },

  /**
   * AI 训练 - 优化搜索的 JSON 格式
   */
  training: {
    format: 'json' as const,
    includeExamples: true,
    optimizeForSearch: true,
    includeCodeExamples: true,
    generateTOC: false,
    language: 'en' as const,
    verbosity: 'detailed' as const,
  },

  /**
   * 快速预览 - 最小化信息
   */
  preview: {
    format: 'markdown' as const,
    includeExamples: false,
    optimizeForSearch: false,
    includeCodeExamples: false,
    generateTOC: true,
    language: 'zh' as const,
    verbosity: 'minimal' as const,
  },
} satisfies Record<string, AIDocConfig>;

/**
 * AI 文档搜索工具
 */
export class AIDocSearcher {
  private aiDoc: any;

  constructor(aiDoc: any) {
    this.aiDoc = aiDoc;
  }

  /**
   * 按关键词搜索端点
   */
  searchByKeyword(keyword: string): any[] {
    const lowerKeyword = keyword.toLowerCase();
    const endpointIds = this.aiDoc.searchIndex.keywords[lowerKeyword] || [];
    return this.getEndpointsByIds(endpointIds);
  }

  /**
   * 按标签搜索端点
   */
  searchByTag(tag: string): any[] {
    const endpointIds = this.aiDoc.searchIndex.tags[tag] || [];
    return this.getEndpointsByIds(endpointIds);
  }

  /**
   * 按方法搜索端点
   */
  searchByMethod(method: string): any[] {
    const endpointIds = this.aiDoc.searchIndex.methods[method.toUpperCase()] || [];
    return this.getEndpointsByIds(endpointIds);
  }

  /**
   * 全文搜索
   */
  fullTextSearch(query: string): any[] {
    const lowerQuery = query.toLowerCase();
    const matches = this.aiDoc.searchIndex.fullText.filter((item: any) =>
      item.text.toLowerCase().includes(lowerQuery)
    );

    // 按权重排序
    matches.sort((a: any, b: any) => b.weight - a.weight);

    const endpointIds = matches.map((match: any) => match.endpointId);
    return this.getEndpointsByIds([...new Set(endpointIds)]);
  }

  /**
   * 复合搜索
   */
  search(options: {
    keyword?: string;
    tag?: string;
    method?: string;
    complexity?: string;
    query?: string;
  }): any[] {
    let results = this.aiDoc.endpoints;

    if (options.keyword) {
      const keywordResults = this.searchByKeyword(options.keyword);
      results = results.filter((endpoint: any) =>
        keywordResults.some(kr => kr.id === endpoint.id)
      );
    }

    if (options.tag) {
      results = results.filter((endpoint: any) =>
        endpoint.tags.includes(options.tag)
      );
    }

    if (options.method) {
      results = results.filter((endpoint: any) =>
        endpoint.method === options.method.toUpperCase()
      );
    }

    if (options.complexity) {
      results = results.filter((endpoint: any) =>
        endpoint.complexity === options.complexity
      );
    }

    if (options.query) {
      const queryResults = this.fullTextSearch(options.query);
      results = results.filter((endpoint: any) =>
        queryResults.some(qr => qr.id === endpoint.id)
      );
    }

    return results;
  }

  /**
   * 根据 ID 获取端点
   */
  private getEndpointsByIds(ids: string[]): any[] {
    return this.aiDoc.endpoints.filter((endpoint: any) =>
      ids.includes(endpoint.id)
    );
  }

  /**
   * 获取推荐端点
   */
  getRecommendations(endpointId: string, limit: number = 5): any[] {
    const endpoint = this.aiDoc.endpoints.find((e: any) => e.id === endpointId);
    if (!endpoint) return [];

    // 基于标签和路径相似性推荐
    const recommendations = this.aiDoc.endpoints
      .filter((e: any) => e.id !== endpointId)
      .map((e: any) => ({
        endpoint: e,
        score: this.calculateSimilarity(endpoint, e),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.endpoint);

    return recommendations;
  }

  /**
   * 计算端点相似性
   */
  private calculateSimilarity(endpoint1: any, endpoint2: any): number {
    let score = 0;

    // 标签匹配
    const commonTags = endpoint1.tags.filter((tag: string) =>
      endpoint2.tags.includes(tag)
    );
    score += commonTags.length * 2;

    // 路径相似性
    const path1Parts = endpoint1.path.split('/');
    const path2Parts = endpoint2.path.split('/');
    const commonParts = path1Parts.filter(part => path2Parts.includes(part));
    score += commonParts.length;

    // 复杂度相似性
    if (endpoint1.complexity === endpoint2.complexity) {
      score += 1;
    }

    return score;
  }
}

/**
 * AI 文档分析工具
 */
export class AIDocAnalyzer {
  private aiDoc: any;

  constructor(aiDoc: any) {
    this.aiDoc = aiDoc;
  }

  /**
   * 分析 API 覆盖率
   */
  analyzeCoverage(): {
    methodCoverage: Record<string, number>;
    tagCoverage: Record<string, number>;
    complexityCoverage: Record<string, number>;
    recommendations: string[];
  } {
    const { statistics } = this.aiDoc;
    const recommendations: string[] = [];

    // 方法覆盖率分析
    const totalEndpoints = statistics.totalEndpoints;
    const methodCoverage = Object.fromEntries(
      Object.entries(statistics.methodDistribution).map(([method, count]) => [
        method,
        ((count as number) / totalEndpoints) * 100,
      ])
    );

    // 推荐
    if (!methodCoverage.POST || methodCoverage.POST < 20) {
      recommendations.push('考虑增加更多的 POST 端点来支持数据创建');
    }
    if (!methodCoverage.PUT && !methodCoverage.PATCH) {
      recommendations.push('缺少数据更新端点（PUT/PATCH）');
    }
    if (!methodCoverage.DELETE) {
      recommendations.push('缺少数据删除端点（DELETE）');
    }

    return {
      methodCoverage,
      tagCoverage: statistics.tagDistribution,
      complexityCoverage: statistics.complexityDistribution,
      recommendations,
    };
  }

  /**
   * 分析文档质量
   */
  analyzeQuality(): {
    score: number;
    issues: string[];
    strengths: string[];
  } {
    const issues: string[] = [];
    const strengths: string[] = [];
    let score = 100;

    // 检查描述完整性
    const endpointsWithoutDescription = this.aiDoc.endpoints.filter(
      (e: any) => !e.description
    );
    if (endpointsWithoutDescription.length > 0) {
      issues.push(`${endpointsWithoutDescription.length} 个端点缺少描述`);
      score -= endpointsWithoutDescription.length * 2;
    } else {
      strengths.push('所有端点都有详细描述');
    }

    // 检查示例完整性
    const endpointsWithoutExamples = this.aiDoc.endpoints.filter(
      (e: any) => e.examples.length === 0
    );
    if (endpointsWithoutExamples.length > 0) {
      issues.push(`${endpointsWithoutExamples.length} 个端点缺少使用示例`);
      score -= endpointsWithoutExamples.length;
    } else {
      strengths.push('所有端点都有使用示例');
    }

    // 检查标签使用
    const untaggedEndpoints = this.aiDoc.endpoints.filter(
      (e: any) => e.tags.length === 0
    );
    if (untaggedEndpoints.length > 0) {
      issues.push(`${untaggedEndpoints.length} 个端点没有标签分类`);
      score -= untaggedEndpoints.length;
    } else {
      strengths.push('所有端点都有适当的标签分类');
    }

    return {
      score: Math.max(0, score),
      issues,
      strengths,
    };
  }
}