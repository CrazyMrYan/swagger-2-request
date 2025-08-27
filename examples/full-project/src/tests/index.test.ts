/**
 * PetStore API 客户端测试示例
 * 展示如何为生成的 API 客户端编写单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PetStoreService, AdvancedPetStoreService } from '../src/index.js';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() }
      }
    })),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() }
    }
  }
}));

// Mock 生成的 API 函数
vi.mock('../src/api/index.js', () => ({
  petsGet: vi.fn(),
  petsPost: vi.fn(),
  petsPetIdGet: vi.fn(),
  APIClient: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    post: vi.fn(),
    setHeader: vi.fn()
  })),
  createAPIClient: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    post: vi.fn(),
    setHeader: vi.fn()
  })),
  interceptorPresets: {},
  createAuthInterceptor: vi.fn(),
  createRetryInterceptor: vi.fn(),
  createLogInterceptors: vi.fn().mockReturnValue({ request: {}, response: {} }),
  createErrorHandlerInterceptor: vi.fn(),
  globalAuthManager: {
    setBearerToken: vi.fn()
  }
}));

describe('PetStoreService', () => {
  let service: PetStoreService;
  let mockPetsGet: any;
  let mockPetsPost: any;
  let mockPetsPetIdGet: any;

  beforeEach(async () => {
    // 重置所有 mock
    vi.clearAllMocks();
    
    // 导入 mock 的函数
    const apiModule = await import('../src/api/index.js');
    mockPetsGet = apiModule.petsGet as any;
    mockPetsPost = apiModule.petsPost as any;
    mockPetsPetIdGet = apiModule.petsPetIdGet as any;
    
    // 创建服务实例
    service = new PetStoreService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllPets', () => {
    it('应该成功获取宠物列表', async () => {
      // 模拟 API 响应
      const mockPets = [
        { id: 1, name: '小白', tag: '可爱' },
        { id: 2, name: '小黑', tag: '聪明' }
      ];
      mockPetsGet.mockResolvedValue(mockPets);

      // 执行测试
      const result = await service.getAllPets(10);

      // 验证结果
      expect(result).toEqual(mockPets);
      expect(mockPetsGet).toHaveBeenCalledWith({ limit: 10 });
    });

    it('应该正确处理无参数调用', async () => {
      // 模拟 API 响应
      const mockPets = [{ id: 1, name: '小白', tag: '可爱' }];
      mockPetsGet.mockResolvedValue(mockPets);

      // 执行测试
      const result = await service.getAllPets();

      // 验证结果
      expect(result).toEqual(mockPets);
      expect(mockPetsGet).toHaveBeenCalledWith({});
    });

    it('应该正确处理 API 错误', async () => {
      // 模拟 API 错误
      const mockError = new Error('Network error');
      mockPetsGet.mockRejectedValue(mockError);

      // 执行测试并验证错误
      await expect(service.getAllPets()).rejects.toThrow('Network error');
      expect(mockPetsGet).toHaveBeenCalledWith({});
    });
  });

  describe('createPet', () => {
    it('应该成功创建宠物', async () => {
      // 准备测试数据
      const newPetData = { name: '小花', tag: '活泼' };
      const mockCreatedPet = { id: 3, ...newPetData };
      mockPetsPost.mockResolvedValue(mockCreatedPet);

      // 执行测试
      const result = await service.createPet(newPetData);

      // 验证结果
      expect(result).toEqual(mockCreatedPet);
      expect(mockPetsPost).toHaveBeenCalledWith(newPetData);
    });

    it('应该正确处理创建失败', async () => {
      // 模拟创建失败
      const newPetData = { name: '小花', tag: '活泼' };
      const mockError = new Error('Validation error');
      mockPetsPost.mockRejectedValue(mockError);

      // 执行测试并验证错误
      await expect(service.createPet(newPetData)).rejects.toThrow('Validation error');
      expect(mockPetsPost).toHaveBeenCalledWith(newPetData);
    });
  });

  describe('getPetById', () => {
    it('应该成功获取指定宠物', async () => {
      // 准备测试数据
      const petId = '123';
      const mockPet = { id: 123, name: '小白', tag: '可爱' };
      mockPetsPetIdGet.mockResolvedValue(mockPet);

      // 执行测试
      const result = await service.getPetById(petId);

      // 验证结果
      expect(result).toEqual(mockPet);
      expect(mockPetsPetIdGet).toHaveBeenCalledWith(petId);
    });

    it('应该正确处理宠物不存在的情况', async () => {
      // 模拟宠物不存在
      const petId = '999';
      const mockError = new Error('Pet not found');
      mockPetsPetIdGet.mockRejectedValue(mockError);

      // 执行测试并验证错误
      await expect(service.getPetById(petId)).rejects.toThrow('Pet not found');
      expect(mockPetsPetIdGet).toHaveBeenCalledWith(petId);
    });
  });

  describe('batchOperations', () => {
    it('应该成功执行批量操作', async () => {
      // 模拟所有 API 调用
      const mockCreatedPets = [
        { id: 1, name: '小白', tag: '可爱' },
        { id: 2, name: '小黑', tag: '聪明' },
        { id: 3, name: '小花', tag: '活泼' }
      ];
      const mockAllPets = [...mockCreatedPets, { id: 4, name: '小灰', tag: '安静' }];

      mockPetsPost
        .mockResolvedValueOnce(mockCreatedPets[0])
        .mockResolvedValueOnce(mockCreatedPets[1])
        .mockResolvedValueOnce(mockCreatedPets[2]);

      mockPetsGet.mockResolvedValue(mockAllPets);
      mockPetsPetIdGet
        .mockResolvedValueOnce(mockCreatedPets[0])
        .mockResolvedValueOnce(mockCreatedPets[1])
        .mockResolvedValueOnce(mockCreatedPets[2]);

      // 执行测试
      await service.batchOperations();

      // 验证 API 调用次数
      expect(mockPetsPost).toHaveBeenCalledTimes(3);
      expect(mockPetsGet).toHaveBeenCalledTimes(1);
      expect(mockPetsPetIdGet).toHaveBeenCalledTimes(3);
    });

    it('应该正确处理批量操作中的错误', async () => {
      // 模拟第二个创建失败
      mockPetsPost
        .mockResolvedValueOnce({ id: 1, name: '小白', tag: '可爱' })
        .mockRejectedValueOnce(new Error('Creation failed'));

      // 执行测试 - 不应该抛出错误（错误被内部处理）
      await service.batchOperations();

      // 验证只调用了前两次
      expect(mockPetsPost).toHaveBeenCalledTimes(2);
    });
  });
});

describe('AdvancedPetStoreService', () => {
  let service: AdvancedPetStoreService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdvancedPetStoreService();
  });

  describe('demonstrateErrorHandling', () => {
    it('应该演示错误处理机制', async () => {
      // 这个测试主要验证方法能正常执行，不抛出未处理的错误
      await expect(service.demonstrateErrorHandling()).resolves.not.toThrow();
    });
  });

  describe('demonstratePerformanceMonitoring', () => {
    it('应该演示性能监控功能', async () => {
      // Mock petsGet 函数
      const apiModule = await import('../src/api/index.js');
      const mockPetsGet = apiModule.petsGet as any;
      mockPetsGet.mockResolvedValue([]);

      // 执行测试
      await expect(service.demonstratePerformanceMonitoring()).resolves.not.toThrow();
      
      // 验证 API 被调用
      expect(mockPetsGet).toHaveBeenCalledWith({ limit: 5 });
    });
  });
});

// 集成测试
describe('Integration Tests', () => {
  it('应该正确初始化服务并设置认证', async () => {
    const apiModule = await import('../src/api/index.js');
    const mockGlobalAuthManager = apiModule.globalAuthManager as any;
    
    // 创建服务实例会触发认证设置
    new PetStoreService();
    
    // 验证认证管理器被调用
    expect(mockGlobalAuthManager.setBearerToken).toHaveBeenCalled();
  });

  it('应该正确创建高级服务实例', () => {
    // 创建高级服务不应该抛出错误
    expect(() => new AdvancedPetStoreService()).not.toThrow();
  });
});

// 性能测试
describe('Performance Tests', () => {
  it('应该在合理时间内完成 API 调用', async () => {
    const apiModule = await import('../src/api/index.js');
    const mockPetsGet = apiModule.petsGet as any;
    
    // 模拟快速响应
    mockPetsGet.mockResolvedValue([]);
    
    const service = new PetStoreService();
    const startTime = Date.now();
    
    await service.getAllPets();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // 验证响应时间合理（考虑到是 mock，应该很快）
    expect(duration).toBeLessThan(100);
  });
});

// 错误处理测试
describe('Error Handling Tests', () => {
  it('应该正确格式化网络错误', async () => {
    const apiModule = await import('../src/api/index.js');
    const mockPetsGet = apiModule.petsGet as any;
    
    // 模拟网络错误
    const networkError = new Error('ECONNREFUSED');
    (networkError as any).code = 'ECONNREFUSED';
    mockPetsGet.mockRejectedValue(networkError);
    
    const service = new PetStoreService();
    
    await expect(service.getAllPets()).rejects.toThrow('ECONNREFUSED');
  });

  it('应该正确处理 HTTP 状态码错误', async () => {
    const apiModule = await import('../src/api/index.js');
    const mockPetsGet = apiModule.petsGet as any;
    
    // 模拟 HTTP 错误
    const httpError = new Error('Request failed with status code 404');
    (httpError as any).response = { status: 404, data: { message: 'Not found' } };
    mockPetsGet.mockRejectedValue(httpError);
    
    const service = new PetStoreService();
    
    await expect(service.getAllPets()).rejects.toThrow('Request failed with status code 404');
  });
});