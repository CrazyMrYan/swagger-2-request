/**
 * 拦截器系统类型定义
 * 提供请求和响应拦截器的接口定义
 */

import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/** 请求拦截器接口 */
export interface RequestInterceptor {
  /** 拦截器名称 */
  name: string;
  /** 请求成功时的处理函数 */
  onRequest?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
  /** 请求错误时的处理函数 */
  onRequestError?: (error: any) => any;
  /** 拦截器优先级，数字越小优先级越高 */
  priority?: number;
}

/** 响应拦截器接口 */
export interface ResponseInterceptor {
  /** 拦截器名称 */
  name: string;
  /** 响应成功时的处理函数 */
  onResponse?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
  /** 响应错误时的处理函数 */
  onResponseError?: (error: AxiosError) => any;
  /** 拦截器优先级，数字越小优先级越高 */
  priority?: number;
}

/** 拦截器配置 */
export interface InterceptorConfig {
  /** 请求拦截器列表 */
  request?: RequestInterceptor[];
  /** 响应拦截器列表 */
  response?: ResponseInterceptor[];
}

/** 拦截器上下文信息 */
export interface InterceptorContext {
  /** 请求开始时间 */
  startTime?: number;
  /** 请求 ID */
  requestId?: string;
  /** 自定义元数据 */
  metadata?: Record<string, any>;
}

/** 认证配置 */
export interface AuthConfig {
  /** 认证类型 */
  type: 'bearer' | 'apikey' | 'basic' | 'custom';
  /** 认证令牌 */
  token?: string;
  /** API Key 配置 */
  apiKey?: {
    name: string;
    value: string;
    in: 'header' | 'query';
  };
  /** Basic 认证配置 */
  basic?: {
    username: string;
    password: string;
  };
  /** 自定义认证函数 */
  custom?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
}

/** 重试配置 */
export interface RetryConfig {
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试延迟（毫秒） */
  delay: number;
  /** 重试延迟增长因子 */
  delayFactor?: number;
  /** 可重试的状态码 */
  retryableStatusCodes?: number[];
  /** 重试条件判断函数 */
  shouldRetry?: (error: AxiosError) => boolean;
}

/** 日志配置 */
export interface LogConfig {
  /** 是否启用请求日志 */
  logRequests?: boolean;
  /** 是否启用响应日志 */
  logResponses?: boolean;
  /** 是否记录请求体 */
  logRequestBody?: boolean;
  /** 是否记录响应体 */
  logResponseBody?: boolean;
  /** 日志级别 */
  level?: 'debug' | 'info' | 'warn' | 'error';
  /** 自定义日志函数 */
  logger?: (level: string, message: string, data?: any) => void;
}

/** 拦截器工厂函数类型 */
export type InterceptorFactory<T = any> = (config: T) => RequestInterceptor | ResponseInterceptor;