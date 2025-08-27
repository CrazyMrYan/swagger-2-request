/**
 * PetStore API 客户端完整示例
 * 展示如何在真实项目中使用 Swagger-2-Request 生成的 API 客户端
 */

import { 
  petsGet, 
  petsPost, 
  petsPetIdGet,
  APIClient,
  createAPIClient,
  interceptorPresets,
  createAuthInterceptor,
  createRetryInterceptor,
  createLogInterceptors,
  createErrorHandlerInterceptor,
  globalAuthManager,
  type Pet,
  type NewPet,
  type PetsGetParams
} from './api/index.js';

// 示例配置
const API_CONFIG = {
  baseURL: process.env.API_BASE_URL || 'https://petstore.swagger.io/v2',
  timeout: 10000,
  authToken: process.env.AUTH_TOKEN || 'demo-token-123'
};

/**
 * 基础 API 使用示例
 */
class PetStoreService {
  private client: APIClient;

  constructor() {
    // 创建配置了拦截器的客户端
    this.client = createAPIClient({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      preset: process.env.NODE_ENV === 'production' ? 'production' : 'development'
    });

    // 设置认证
    this.setupAuthentication();
  }

  /**
   * 设置认证信息
   */
  private setupAuthentication(): void {
    // 方式1: 使用全局认证管理器
    globalAuthManager.setBearerToken(API_CONFIG.authToken);
    
    // 方式2: 直接设置客户端头部
    this.client.setHeader('Authorization', `Bearer ${API_CONFIG.authToken}`);
  }

  /**
   * 获取宠物列表
   */
  async getAllPets(limit?: number): Promise<Pet[]> {
    try {
      console.log('📋 获取宠物列表...');
      
      const params: PetsGetParams = {};
      if (limit) {
        params.limit = limit;
      }

      const pets = await petsGet(params);
      console.log(`✅ 成功获取 ${pets.length} 只宠物`);
      return pets;
    } catch (error) {
      console.error('❌ 获取宠物列表失败:', error);
      throw error;
    }
  }

  /**
   * 创建新宠物
   */
  async createPet(petData: NewPet): Promise<Pet> {
    try {
      console.log('🐕 创建新宠物:', petData.name);
      
      const newPet = await petsPost(petData);
      console.log('✅ 宠物创建成功, ID:', newPet.id);
      return newPet;
    } catch (error) {
      console.error('❌ 创建宠物失败:', error);
      throw error;
    }
  }

  /**
   * 获取指定宠物信息
   */
  async getPetById(petId: string): Promise<Pet> {
    try {
      console.log('🔍 查找宠物 ID:', petId);
      
      const pet = await petsPetIdGet(petId);
      console.log('✅ 找到宠物:', pet.name);
      return pet;
    } catch (error) {
      console.error('❌ 获取宠物信息失败:', error);
      throw error;
    }
  }

  /**
   * 批量操作示例
   */
  async batchOperations(): Promise<void> {
    try {
      console.log('\n🔄 开始批量操作示例...');

      // 1. 创建多只宠物
      const newPets: NewPet[] = [
        { name: '小白', tag: '可爱' },
        { name: '小黑', tag: '聪明' },
        { name: '小花', tag: '活泼' }
      ];

      const createdPets: Pet[] = [];
      for (const petData of newPets) {
        const pet = await this.createPet(petData);
        createdPets.push(pet);
        
        // 添加延迟避免请求过频
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // 2. 获取所有宠物
      const allPets = await this.getAllPets(10);

      // 3. 查询刚创建的宠物
      for (const pet of createdPets) {
        await this.getPetById(pet.id.toString());
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log('✅ 批量操作完成');
    } catch (error) {
      console.error('❌ 批量操作失败:', error);
    }
  }
}

/**
 * 高级配置示例 - 自定义拦截器
 */
class AdvancedPetStoreService {
  private client: APIClient;

  constructor() {
    this.client = new APIClient({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      interceptors: {
        request: [
          // 认证拦截器
          createAuthInterceptor({
            type: 'bearer',
            token: API_CONFIG.authToken
          }),
          
          // 请求日志
          createLogInterceptors({
            logRequests: true,
            logRequestBody: true,
            level: 'info',
            logger: (level, message, data) => {
              console.log(`[${level.toUpperCase()}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
            }
          }).request,

          // 自定义请求 ID
          {
            name: 'request-id',
            priority: 1,
            onRequest: (config) => {
              config.headers = {
                ...config.headers,
                'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              };
              return config;
            }
          }
        ],
        
        response: [
          // 重试拦截器
          createRetryInterceptor({
            maxRetries: 3,
            delay: 1000,
            delayFactor: 1.5,
            retryableStatusCodes: [408, 429, 500, 502, 503, 504],
            shouldRetry: (error) => {
              console.log('🔄 检查是否需要重试:', error.message);
              return true; // 自定义重试逻辑
            }
          }),
          
          // 响应日志
          createLogInterceptors({
            logResponses: true,
            logResponseBody: false,
            level: 'info'
          }).response,
          
          // 错误处理
          createErrorHandlerInterceptor({
            enableTransform: true,
            enableNotification: true,
            onError: (error) => {
              console.error('🚨 API 错误通知:', {
                code: error.code,
                message: error.message,
                status: error.status,
                timestamp: error.timestamp
              });
            },
            statusCodeMapping: {
              401: () => ({
                code: 'AUTHENTICATION_REQUIRED',
                message: '认证失败，请检查 Token',
                status: 401,
                timestamp: new Date().toISOString()
              }),
              404: () => ({
                code: 'RESOURCE_NOT_FOUND',
                message: '请求的资源不存在',
                status: 404,
                timestamp: new Date().toISOString()
              }),
              500: () => ({
                code: 'INTERNAL_SERVER_ERROR',
                message: '服务器内部错误，请稍后重试',
                status: 500,
                timestamp: new Date().toISOString()
              })
            }
          })
        ]
      }
    });
  }

  /**
   * 演示错误处理和重试机制
   */
  async demonstrateErrorHandling(): Promise<void> {
    try {
      console.log('\n🧪 演示错误处理和重试机制...');
      
      // 尝试获取不存在的宠物 - 会触发 404 错误
      await this.client.get('/pets/999999');
    } catch (error) {
      console.log('✅ 错误处理演示完成');
    }
  }

  /**
   * 演示性能监控
   */
  async demonstratePerformanceMonitoring(): Promise<void> {
    console.log('\n📊 演示性能监控...');
    
    const startTime = Date.now();
    
    try {
      await petsGet({ limit: 5 });
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`⏱️ 请求耗时: ${duration}ms`);
      
      // 模拟性能阈值检查
      if (duration > 2000) {
        console.warn('⚠️ 请求耗时过长，可能需要优化');
      } else {
        console.log('✅ 请求性能良好');
      }
    } catch (error) {
      console.error('❌ 性能监控演示失败:', error);
    }
  }
}

/**
 * 主函数 - 运行所有示例
 */
async function main(): Promise<void> {
  console.log('🚀 PetStore API 客户端完整示例');
  console.log('=====================================\n');

  // 基础使用示例
  console.log('📖 1. 基础使用示例');
  const basicService = new PetStoreService();
  
  try {
    // 获取宠物列表
    await basicService.getAllPets(5);
    
    // 创建新宠物
    const newPet = await basicService.createPet({
      name: '示例宠物',
      tag: '演示'
    });
    
    // 获取刚创建的宠物
    await basicService.getPetById(newPet.id.toString());
    
    // 批量操作
    await basicService.batchOperations();
  } catch (error) {
    console.error('基础示例执行失败:', error);
  }

  // 高级配置示例
  console.log('\n📖 2. 高级配置示例');
  const advancedService = new AdvancedPetStoreService();
  
  try {
    // 演示错误处理
    await advancedService.demonstrateErrorHandling();
    
    // 演示性能监控
    await advancedService.demonstratePerformanceMonitoring();
  } catch (error) {
    console.error('高级示例执行失败:', error);
  }

  console.log('\n🎉 示例运行完成！');
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

// 启动示例
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { PetStoreService, AdvancedPetStoreService };