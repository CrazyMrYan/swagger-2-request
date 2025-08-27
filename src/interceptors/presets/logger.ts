/**
 * 日志拦截器
 * 记录请求和响应的详细信息，支持多种日志级别和自定义日志函数
 */

import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type { RequestInterceptor, ResponseInterceptor, LogConfig, InterceptorFactory } from '../types';

/**
 * 默认日志函数
 */
const defaultLogger = (level: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  switch (level) {
    case 'error':
      console.error(logMessage, data || '');
      break;
    case 'warn':
      console.warn(logMessage, data || '');
      break;
    case 'debug':
      console.debug(logMessage, data || '');
      break;
    case 'info':
    default:
      console.log(logMessage, data || '');
      break;
  }
};

/**
 * 创建请求日志拦截器
 */
export const createRequestLogInterceptor: InterceptorFactory<LogConfig> = (
  config: LogConfig
): RequestInterceptor => {
  const {
    logRequests = true,
    logRequestBody = false,
    level = 'info',
    logger = defaultLogger,
  } = config;

  return {
    name: 'request-logger',
    priority: 90, // 较低优先级，确保在其他拦截器之后执行
    onRequest: (requestConfig: AxiosRequestConfig) => {
      if (!logRequests) return requestConfig;

      const context = (requestConfig as any).__interceptorContext || {};
      const requestId = context.requestId || 'unknown';
      
      const logData: any = {
        requestId,
        method: requestConfig.method?.toUpperCase(),
        url: requestConfig.url,
        baseURL: requestConfig.baseURL,
        headers: sanitizeHeaders(requestConfig.headers),
      };

      if (requestConfig.params) {
        logData.params = requestConfig.params;
      }

      if (logRequestBody && requestConfig.data) {
        logData.body = sanitizeRequestBody(requestConfig.data);
      }

      logger(level, `Sending ${logData.method} request to ${logData.url}`, logData);

      return requestConfig;
    },
    onRequestError: (error) => {
      logger('error', 'Request setup failed', {
        error: error.message,
        stack: error.stack,
      });
      return Promise.reject(error);
    },
  };
};

/**
 * 创建响应日志拦截器
 */
export const createResponseLogInterceptor: InterceptorFactory<LogConfig> = (
  config: LogConfig
): ResponseInterceptor => {
  const {
    logResponses = true,
    logResponseBody = false,
    level = 'info',
    logger = defaultLogger,
  } = config;

  return {
    name: 'response-logger',
    priority: 90, // 较低优先级
    onResponse: (response: AxiosResponse) => {
      if (!logResponses) return response;

      const context = (response.config as any).__interceptorContext || {};
      const requestId = context.requestId || 'unknown';
      const duration = context.duration || 'unknown';

      const logData: any = {
        requestId,
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`,
        headers: sanitizeHeaders(response.headers),
      };

      if (logResponseBody && response.data) {
        logData.body = sanitizeResponseBody(response.data);
      }

      const logLevel = response.status >= 400 ? 'warn' : level;
      logger(logLevel, `Received response ${response.status}`, logData);

      return response;
    },
    onResponseError: (error: AxiosError) => {
      const context = (error.config as any)?.__interceptorContext || {};
      const requestId = context.requestId || 'unknown';
      const duration = context.duration || 'unknown';

      const logData: any = {
        requestId,
        duration: `${duration}ms`,
        error: error.message,
        code: error.code,
      };

      if (error.response) {
        logData.status = error.response.status;
        logData.statusText = error.response.statusText;
        logData.headers = sanitizeHeaders(error.response.headers);
        
        if (config.logResponseBody && error.response.data) {
          logData.responseBody = sanitizeResponseBody(error.response.data);
        }
      }

      logger('error', `Request failed: ${error.message}`, logData);

      return Promise.reject(error);
    },
  };
};

/**
 * 创建组合日志拦截器（包含请求和响应日志）
 */
export const createLogInterceptors = (config: LogConfig) => {
  return {
    request: createRequestLogInterceptor(config),
    response: createResponseLogInterceptor(config),
  };
};

/**
 * 清理敏感的请求头信息
 */
function sanitizeHeaders(headers: any): any {
  if (!headers) return {};

  const sanitized = { ...headers };
  const sensitiveKeys = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];

  sensitiveKeys.forEach(key => {
    const headerKey = Object.keys(sanitized).find(
      k => k.toLowerCase() === key.toLowerCase()
    );
    if (headerKey && sanitized[headerKey]) {
      sanitized[headerKey] = '***REDACTED***';
    }
  });

  return sanitized;
}

/**
 * 清理请求体中的敏感信息
 */
function sanitizeRequestBody(body: any): any {
  if (!body) return body;

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return '[RAW DATA]';
    }
  }

  if (typeof body === 'object') {
    const sanitized = { ...body };
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];

    sensitiveKeys.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '***REDACTED***';
      }
    });

    return sanitized;
  }

  return body;
}

/**
 * 清理响应体中的敏感信息
 */
function sanitizeResponseBody(body: any): any {
  if (!body) return body;

  // 限制日志大小
  const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
  if (bodyString.length > 1000) {
    return `[TRUNCATED - ${bodyString.length} chars]`;
  }

  return body;
}

/**
 * 性能日志拦截器
 */
export const createPerformanceLogInterceptor = (): ResponseInterceptor => {
  return {
    name: 'performance-logger',
    priority: 95,
    onResponse: (response: AxiosResponse) => {
      const context = (response.config as any).__interceptorContext || {};
      const duration = context.duration;

      if (duration) {
        const logLevel = duration > 5000 ? 'warn' : duration > 1000 ? 'info' : 'debug';
        defaultLogger(
          logLevel,
          `Request completed in ${duration}ms`,
          {
            method: response.config.method?.toUpperCase(),
            url: response.config.url,
            status: response.status,
            duration: `${duration}ms`,
          }
        );
      }

      return response;
    },
  };
};