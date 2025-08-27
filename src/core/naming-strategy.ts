/**
 * API 函数命名策略
 * 遵循 URL + HTTP Methods 的命名规则
 * 例如：/api/users + GET -> apiUsersGet
 */

import { HTTPMethod } from '../types';

export class NamingStrategy {
  /**
   * 根据路径和 HTTP 方法生成函数名
   * @param path API 路径，如 /api/users/{id}
   * @param method HTTP 方法，如 GET
   * @returns 生成的函数名，如 apiUsersIdGet
   */
  generateFunctionName(path: string, method: HTTPMethod): string {
    // 处理路径参数: /api/users/{id} -> /api/users/Id
    const pathWithParams = path.replace(/\{([^}]+)\}/g, (_, param) =>
      this.capitalize(this.camelCase(param))
    );

    // 分割路径并处理每个段
    const segments = pathWithParams
      .split('/')
      .filter(segment => segment.length > 0)
      .map((segment, index) => {
        // 先转换为驼峰命名（处理连字符和下划线）
        const camelCased = this.camelCase(segment);
        // 第一个段保持小写，后续段首字母大写
        return index === 0 ? camelCased : this.capitalize(camelCased);
      });

    // 组合路径部分
    const pathPart = segments.join('');

    // 添加方法后缀
    const methodSuffix = this.capitalize(method.toLowerCase());

    return `${pathPart}${methodSuffix}`;
  }

  /**
   * 将字符串转换为驼峰命名
   * @param str 输入字符串
   * @returns 驼峰命名的字符串
   */
  private camelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
      .replace(/^[A-Z]/, match => match.toLowerCase());
  }

  /**
   * 首字母大写
   * @param str 输入字符串
   * @returns 首字母大写的字符串
   */
  private capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 验证生成的函数名是否有效
   * @param functionName 函数名
   * @returns 是否有效
   */
  validateFunctionName(functionName: string): boolean {
    // 检查是否符合 JavaScript 标识符规范
    const identifierRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
    return identifierRegex.test(functionName);
  }

  /**
   * 生成类型名称
   * @param baseName 基础名称
   * @param suffix 后缀
   * @returns 类型名称
   */
  generateTypeName(baseName: string, suffix: string = ''): string {
    const pascalCaseName = this.capitalize(this.camelCase(baseName));
    return suffix ? `${pascalCaseName}${suffix}` : pascalCaseName;
  }

  /**
   * 为参数生成类型名称
   * @param path API 路径
   * @param method HTTP 方法
   * @param paramType 参数类型 (Query, Path, Body 等)
   * @returns 参数类型名称
   */
  generateParameterTypeName(
    path: string,
    method: HTTPMethod,
    paramType: string
  ): string {
    const baseName = this.generateFunctionName(path, method);
    return this.generateTypeName(baseName, paramType);
  }
}