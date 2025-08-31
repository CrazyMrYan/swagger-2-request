/**
 * API 客户端工具函数
 * 提供参数过滤、验证、转换等实用功能
 */

import { pick, isPlainObject } from 'lodash-es';

/**
 * 过滤查询参数，移除无效值，并处理数组参数
 */
export function filterQueryParams(
  params: Record<string, any>,
  allowedKeys: string[] = []
): Record<string, any> {
  if (!params || typeof params !== 'object') {
    return {};
  }

  let filtered = params;

  // 如果指定了允许的键，则只保留这些键
  if (allowedKeys.length > 0) {
    filtered = pick(params, allowedKeys);
  }

  // 移除 undefined, null, 空字符串的值，并处理数组参数
  return Object.fromEntries(
    Object.entries(filtered)
      .filter(([, value]) => {
        if (value === undefined || value === null) {
          return false;
        }
        if (typeof value === 'string' && value.trim() === '') {
          return false;
        }
        if (Array.isArray(value) && value.length === 0) {
          return false;
        }
        return true;
      })
      .map(([key, value]) => {
        // 将数组参数转换为逗号分隔的字符串
        if (Array.isArray(value)) {
          return [key, value.join(',')];
        }
        return [key, value];
      })
  );
}

/**
 * 验证请求体数据
 */
export function validateRequestBody<T = any>(
  data: any,
  schema?: any
): T {
  if (!data) {
    return data;
  }

  // 基础验证 - 确保数据是有效的对象
  if (schema && schema.type === 'object' && !isPlainObject(data)) {
    throw new Error('Request body must be an object');
  }

  // 如果有 schema，进行更详细的验证
  if (schema) {
    return validateDataAgainstSchema(data, schema);
  }

  return data;
}

/**
 * 根据 JSON Schema 验证数据
 */
function validateDataAgainstSchema(data: any, schema: any): any {
  if (!schema) return data;

  switch (schema.type) {
    case 'object':
      return validateObjectSchema(data, schema);
    case 'array':
      return validateArraySchema(data, schema);
    case 'string':
      return validateStringSchema(data, schema);
    case 'number':
    case 'integer':
      return validateNumberSchema(data, schema);
    case 'boolean':
      return validateBooleanSchema(data, schema);
    default:
      return data;
  }
}

/**
 * 验证对象类型
 */
function validateObjectSchema(data: any, schema: any): any {
  if (!isPlainObject(data)) {
    throw new Error(`Expected object, got ${typeof data}`);
  }

  const result: any = { ...data };
  const { properties = {}, required = [] } = schema;

  // 检查必填字段
  for (const field of required) {
    if (!(field in result)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // 验证字段类型
  for (const [key, propSchema] of Object.entries(properties)) {
    if (key in result) {
      try {
        result[key] = validateDataAgainstSchema(result[key], propSchema);
      } catch (error: any) {
        throw new Error(`Field "${key}": ${error.message}`);
      }
    }
  }

  return result;
}

/**
 * 验证数组类型
 */
function validateArraySchema(data: any, schema: any): any {
  if (!Array.isArray(data)) {
    throw new Error(`Expected array, got ${typeof data}`);
  }

  const { items, minItems, maxItems } = schema;

  // 检查数组长度
  if (minItems !== undefined && data.length < minItems) {
    throw new Error(`Array must have at least ${minItems} items`);
  }
  if (maxItems !== undefined && data.length > maxItems) {
    throw new Error(`Array must have at most ${maxItems} items`);
  }

  // 验证数组项
  if (items) {
    return data.map((item, index) => {
      try {
        return validateDataAgainstSchema(item, items);
      } catch (error: any) {
        throw new Error(`Item ${index}: ${error.message}`);
      }
    });
  }

  return data;
}

/**
 * 验证字符串类型
 */
function validateStringSchema(data: any, schema: any): string {
  if (typeof data !== 'string') {
    throw new Error(`Expected string, got ${typeof data}`);
  }

  const { minLength, maxLength, pattern, enum: enumValues } = schema;

  // 检查长度
  if (minLength !== undefined && data.length < minLength) {
    throw new Error(`String must be at least ${minLength} characters long`);
  }
  if (maxLength !== undefined && data.length > maxLength) {
    throw new Error(`String must be at most ${maxLength} characters long`);
  }

  // 检查模式
  if (pattern && !new RegExp(pattern).test(data)) {
    throw new Error(`String does not match pattern: ${pattern}`);
  }

  // 检查枚举值
  if (enumValues && !enumValues.includes(data)) {
    throw new Error(`String must be one of: ${enumValues.join(', ')}`);
  }

  return data;
}

/**
 * 验证数字类型
 */
function validateNumberSchema(data: any, schema: any): number {
  const num = typeof data === 'string' ? parseFloat(data) : data;
  
  if (typeof num !== 'number' || isNaN(num)) {
    throw new Error(`Expected number, got ${typeof data}`);
  }

  const { minimum, maximum, multipleOf } = schema;

  // 检查范围
  if (minimum !== undefined && num < minimum) {
    throw new Error(`Number must be at least ${minimum}`);
  }
  if (maximum !== undefined && num > maximum) {
    throw new Error(`Number must be at most ${maximum}`);
  }

  // 检查倍数
  if (multipleOf !== undefined && num % multipleOf !== 0) {
    throw new Error(`Number must be a multiple of ${multipleOf}`);
  }

  // 检查整数类型
  if (schema.type === 'integer' && !Number.isInteger(num)) {
    throw new Error('Expected integer');
  }

  return num;
}

/**
 * 验证布尔类型
 */
function validateBooleanSchema(data: any, _schema: any): boolean {
  if (typeof data === 'boolean') {
    return data;
  }

  // 尝试从字符串转换
  if (typeof data === 'string') {
    const lower = data.toLowerCase();
    if (lower === 'true' || lower === '1') return true;
    if (lower === 'false' || lower === '0') return false;
  }

  throw new Error(`Expected boolean, got ${typeof data}`);
}

/**
 * 格式化错误消息
 */
export function formatErrorMessage(error: any): string {
  if (error.response) {
    // HTTP 错误
    const status = error.response.status;
    const statusText = error.response.statusText;
    const data = error.response.data;
    
    let message = `HTTP ${status}`;
    if (statusText) {
      message += ` ${statusText}`;
    }
    
    if (data && typeof data === 'object') {
      if (data.message) {
        message += `: ${data.message}`;
      } else if (data.error) {
        message += `: ${data.error}`;
      }
    }
    
    return message;
  } else if (error.request) {
    // 网络错误
    return 'Network error: Unable to reach the server';
  } else {
    // 其他错误
    return error.message || 'An unknown error occurred';
  }
}

/**
 * 创建请求配置
 */
export function createRequestConfig(
  method: string,
  url: string,
  options: {
    params?: Record<string, any>;
    data?: any;
    headers?: Record<string, string>;
    timeout?: number;
    signal?: AbortSignal;
  } = {}
): any {
  const config: any = {
    method: method.toUpperCase(),
    url,
    ...options,
  };

  // 过滤查询参数
  if (config.params) {
    config.params = filterQueryParams(config.params);
  }

  return config;
}

/**
 * 生成请求 ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as any;
  }

  const cloned = {} as any;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
}

/**
 * 合并配置对象
 */
export function mergeConfigs<T extends Record<string, any>>(
  defaultConfig: T,
  userConfig: Partial<T>
): T {
  const merged = deepClone(defaultConfig);
  
  for (const key in userConfig) {
    if (Object.prototype.hasOwnProperty.call(userConfig, key)) {
      const userValue = userConfig[key];
      const defaultValue = merged[key];
      
      if (isPlainObject(userValue) && isPlainObject(defaultValue)) {
        merged[key] = mergeConfigs(defaultValue, userValue);
      } else {
        merged[key] = userValue as any;
      }
    }
  }
  
  return merged;
}