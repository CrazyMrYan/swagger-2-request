/**
 * 生成的 API 客户端工具函数
 */

/**
 * 根据允许的键过滤查询参数，并处理数组参数
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
    const result: Record<string, any> = {};
    allowedKeys.forEach(key => {
      if (key in params) {
        result[key] = params[key];
      }
    });
    filtered = result;
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
  if (schema && schema.type === 'object' && typeof data !== 'object') {
    throw new Error('Request body must be an object');
  }

  return data;
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
 * 处理 API 错误
 */
export function handleApiError(error: any): Error {
  if (error.response) {
    // 服务器响应错误
    const message = error.response.data?.message || error.response.statusText || 'API request failed';
    const apiError = new Error(message);
    (apiError as any).status = error.response.status;
    (apiError as any).data = error.response.data;
    return apiError;
  } else if (error.request) {
    // 网络错误
    return new Error('Network error: Unable to reach the server');
  } else {
    // 其他错误
    return new Error(error.message || 'An unknown error occurred');
  }
}

/**
 * 创建查询字符串
 */
export function createQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}
