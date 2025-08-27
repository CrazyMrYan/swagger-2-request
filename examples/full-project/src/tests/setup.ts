/**
 * 测试环境设置
 * 配置全局测试环境和 Mock 设置
 */

import { vi } from 'vitest';

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.API_BASE_URL = 'https://test-api.example.com';
process.env.AUTH_TOKEN = 'test-token-123';

// 全局 Mock console 方法，避免测试时输出过多日志
global.console = {
  ...console,
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock setTimeout 和 setInterval 用于测试
vi.stubGlobal('setTimeout', vi.fn((fn, delay) => {
  // 在测试中立即执行，避免实际延迟
  if (delay && delay > 0) {
    return setTimeout(fn, 0);
  }
  return setTimeout(fn, delay);
}));

// 设置全局测试超时
const originalTimeout = global.setTimeout;
global.setTimeout = (fn: any, delay: number = 0) => {
  // 在测试环境中，将长延迟缩短
  if (delay > 1000) {
    delay = 10; // 将超过 1 秒的延迟缩短到 10ms
  }
  return originalTimeout(fn, delay);
};

// 在每个测试前重置 Mock
beforeEach(() => {
  vi.clearAllMocks();
});

// 在每个测试后清理
afterEach(() => {
  vi.clearAllTimers();
});

export {};