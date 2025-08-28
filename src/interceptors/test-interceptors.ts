/**
 * 拦截器系统测试示例
 * 演示如何使用各种拦截器功能
 */

import axios from 'axios';
import { InterceptorManager } from './manager';
import { createAuthInterceptor } from './presets/auth';
import { createLogInterceptors } from './presets/logger';
import { createRetryInterceptor, retryPresets } from './presets/retry';
import { createErrorHandlerInterceptor, errorHandlerPresets } from './presets/error-handler';

/**
 * 测试拦截器系统
 */
export async function testInterceptorSystem() {
  console.log('🧪 开始测试拦截器系统...\n');

  // 创建 Axios 实例
  const axiosInstance = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 5000,
  });

  // 创建拦截器管理器
  const interceptorManager = new InterceptorManager(axiosInstance);

  // 配置拦截器
  const logConfig = {
    logRequests: true,
    logResponses: true,
    logRequestBody: false,
    logResponseBody: false,
    level: 'info' as const,
  };

  const { request: requestLogger, response: responseLogger } = createLogInterceptors(logConfig);

  // 注册拦截器
  interceptorManager.register({
    request: [
      // 请求日志
      requestLogger,
      // 模拟认证
      createAuthInterceptor({
        type: 'bearer',
        token: 'test-token-12345'
      }),
    ],
    response: [
      // 保守重试策略
      createRetryInterceptor(retryPresets.conservative),
      // 响应日志
      responseLogger,
      // 错误处理
      createErrorHandlerInterceptor(errorHandlerPresets.development),
    ],
  });

  console.log('📊 拦截器统计:', interceptorManager.getStats());

  try {
    // 测试成功请求
    console.log('\n🟢 测试成功请求:');
    const response = await axiosInstance.get('/posts/1');
    console.log('✅ 成功获取数据:', response.data.title);

    // 测试 404 错误（不会重试）
    console.log('\n🔴 测试 404 错误:');
    try {
      await axiosInstance.get('/posts/999999');
    } catch (error: any) {
      console.log('❌ 预期的 404 错误:', error.message);
    }

    // 测试网络超时（会重试）
    console.log('\n⏱️ 测试超时重试:');
    const shortTimeoutInstance = axios.create({
      baseURL: 'https://httpbin.org',
      timeout: 100, // 很短的超时时间
    });

    const shortTimeoutManager = new InterceptorManager(shortTimeoutInstance);
    shortTimeoutManager.register({
      response: [
        createRetryInterceptor({
          maxRetries: 2,
          delay: 500,
          delayFactor: 1.5,
        }),
        responseLogger,
      ],
    });

    try {
      await shortTimeoutInstance.get('/delay/1'); // 延迟 1 秒的请求
    } catch (error: any) {
      console.log('❌ 最终超时错误:', error.message);
    }

    console.log('\n🎉 拦截器系统测试完成！');

  } catch (error: any) {
    console.error('❌ 测试过程中出现未预期的错误:', error.message);
  }
}

/**
 * 测试认证管理器
 */
export function testAuthManager() {
  console.log('\n🔐 测试认证管理器...');

  const { AuthManager } = require('./presets/auth');
  const authManager = new AuthManager();

  // 测试 Bearer Token
  authManager.setBearerToken('test-bearer-token');
  console.log('✅ Bearer Token 设置成功');

  // 测试 API Key
  authManager.setApiKey('X-API-Key', 'test-api-key', 'header');
  console.log('✅ API Key 设置成功');

  // 测试 Basic Auth
  authManager.setBasicAuth('username', 'password');
  console.log('✅ Basic Auth 设置成功');

  // 获取当前配置
  const currentAuth = authManager.getAuth();
  console.log('📋 当前认证配置:', currentAuth);

  // 清除认证
  authManager.clearAuth();
  console.log('🧹 认证配置已清除');
}

/**
 * 测试错误处理管理器
 */
export function testErrorHandlerManager() {
  console.log('\n❌ 测试错误处理管理器...');

  const { ErrorHandlerManager } = require('./presets/error-handler');
  const errorManager = new ErrorHandlerManager({
    enableTransform: true,
    enableNotification: false, // 测试时不显示通知
  });

  // 模拟一些错误
  const mockErrors = [
    { code: 'NETWORK_ERROR', message: 'Network error' },
    { code: 'UNAUTHORIZED', message: 'Auth error' },
    { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit' },
    { code: 'NETWORK_ERROR', message: 'Another network error' },
  ];

  mockErrors.forEach(error => {
    // 模拟记录错误（通常由拦截器调用）
    (errorManager as any).recordError(error);
  });

  // 获取错误统计
  const stats = errorManager.getErrorStats();
  console.log('📊 错误统计:', stats);

  // 测试错误恢复性检查
  const networkError = { code: 'NETWORK_ERROR', message: 'Network error', timestamp: new Date().toISOString() };
  const authError = { code: 'UNAUTHORIZED', message: 'Auth error', timestamp: new Date().toISOString() };

  console.log('🔄 网络错误可恢复:', errorManager.isRecoverableError(networkError));
  console.log('🚫 认证错误可恢复:', errorManager.isRecoverableError(authError));

  // 清除统计
  errorManager.clearErrorStats();
  console.log('🧹 错误统计已清除');
}

/**
 * 执行所有测试
 */
async function runTests() {
  try {
    await testInterceptorSystem();
    testAuthManager();
    testErrorHandlerManager();
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  runTests();
}