/**
 * 参数过滤和验证工具
 * 使用 lodash-es 进行轻量级参数处理
 */

import { pick, isPlainObject, isArray, isString, isNumber, isBoolean } from 'lodash-es';
import { Parameter } from '../types';

export class ParameterFilter {
  /**
   * 根据 API 定义过滤查询参数
   * @param params 用户传入的参数
   * @param schema 参数定义
   * @returns 过滤后的参数
   */
  filterQueryParams(
    params: Record<string, any> | undefined,
    schema: Parameter[]
  ): Record<string, any> {
    if (!params || !schema) return {};

    // 获取允许的查询参数名称
    const allowedParams = schema
      .filter(p => p.in === 'query')
      .map(p => p.name);

    // 使用 lodash pick 提取允许的参数
    const filtered = pick(params, allowedParams);

    // 移除 undefined 和 null 值
    return Object.fromEntries(
      Object.entries(filtered).filter(
        ([, value]) => value !== undefined && value !== null
      )
    );
  }

  /**
   * 根据 API 定义过滤路径参数
   * @param params 用户传入的参数
   * @param schema 参数定义
   * @returns 过滤后的参数
   */
  filterPathParams(
    params: Record<string, any> | undefined,
    schema: Parameter[]
  ): Record<string, any> {
    if (!params || !schema) return {};

    const allowedParams = schema
      .filter(p => p.in === 'path')
      .map(p => p.name);

    return pick(params, allowedParams);
  }

  /**
   * 验证并转换参数
   * @param data 要验证的数据
   * @param schema 参数或请求体定义
   * @returns 验证和转换后的数据
   */
  validateAndTransform(data: any, schema: any): any {
    if (!schema) return data;

    try {
      return this.transformByType(data, schema);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Parameter validation failed: ${errorMessage}`);
    }
  }

  /**
   * 根据类型转换数据
   * @param data 要转换的数据
   * @param schema 类型定义
   * @returns 转换后的数据
   */
  private transformByType(data: any, schema: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    switch (schema.type) {
      case 'object':
        return this.validateObject(data, schema);
      case 'array':
        return this.validateArray(data, schema);
      case 'string':
        return this.validateString(data, schema);
      case 'number':
      case 'integer':
        return this.validateNumber(data, schema);
      case 'boolean':
        return this.validateBoolean(data, schema);
      default:
        return data;
    }
  }

  /**
   * 验证对象类型
   */
  private validateObject(data: any, schema: any): any {
    if (!isPlainObject(data)) {
      throw new Error('Expected object type');
    }

    const { properties = {}, required = [] } = schema;
    const result: any = {};

    // 检查必填字段
    required.forEach((field: string) => {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    });

    // 验证和转换每个属性
    Object.entries(properties).forEach(([key, propSchema]) => {
      if (key in data) {
        result[key] = this.transformByType(data[key], propSchema);
      }
    });

    return result;
  }

  /**
   * 验证数组类型
   */
  private validateArray(data: any, schema: any): any {
    if (!isArray(data)) {
      throw new Error('Expected array type');
    }

    if (schema.items) {
      return data.map(item => this.transformByType(item, schema.items));
    }

    return data;
  }

  /**
   * 验证字符串类型
   */
  private validateString(data: any, schema: any): string {
    if (!isString(data)) {
      // 尝试转换为字符串
      data = String(data);
    }

    // 验证枚举值
    if (schema.enum && !schema.enum.includes(data)) {
      throw new Error(`Value must be one of: ${schema.enum.join(', ')}`);
    }

    // 验证格式
    if (schema.format) {
      this.validateStringFormat(data, schema.format);
    }

    // 验证长度
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      throw new Error(`String must be at least ${schema.minLength} characters`);
    }
    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      throw new Error(`String must be at most ${schema.maxLength} characters`);
    }

    return data;
  }

  /**
   * 验证数字类型
   */
  private validateNumber(data: any, schema: any): number {
    if (!isNumber(data)) {
      const parsed = Number(data);
      if (isNaN(parsed)) {
        throw new Error('Expected number type');
      }
      data = parsed;
    }

    // 验证范围
    if (schema.minimum !== undefined && data < schema.minimum) {
      throw new Error(`Number must be >= ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && data > schema.maximum) {
      throw new Error(`Number must be <= ${schema.maximum}`);
    }

    return data;
  }

  /**
   * 验证布尔类型
   */
  private validateBoolean(data: any, _schema: any): boolean {
    if (!isBoolean(data)) {
      // 尝试转换为布尔值
      if (data === 'true' || data === '1' || data === 1) {
        return true;
      }
      if (data === 'false' || data === '0' || data === 0) {
        return false;
      }
      throw new Error('Expected boolean type');
    }

    return data;
  }

  /**
   * 验证字符串格式
   */
  private validateStringFormat(data: string, format: string): void {
    switch (format) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)) {
          throw new Error('Invalid email format');
        }
        break;
      case 'uri':
      case 'url':
        try {
          new URL(data);
        } catch {
          throw new Error('Invalid URL format');
        }
        break;
      case 'date':
        if (isNaN(Date.parse(data))) {
          throw new Error('Invalid date format');
        }
        break;
      case 'date-time':
        if (isNaN(Date.parse(data))) {
          throw new Error('Invalid date-time format');
        }
        break;
      // 可以添加更多格式验证
    }
  }

  /**
   * 清理对象，移除空值
   * @param obj 要清理的对象
   * @returns 清理后的对象
   */
  cleanObject(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(obj).filter(([, value]) => {
        if (value === null || value === undefined) return false;
        if (isString(value) && value.trim() === '') return false;
        if (isArray(value) && value.length === 0) return false;
        if (isPlainObject(value) && Object.keys(value).length === 0) return false;
        return true;
      })
    );
  }
}