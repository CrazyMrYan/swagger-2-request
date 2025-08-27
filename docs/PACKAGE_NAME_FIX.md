# 包名修复说明

## 问题描述

在尝试发布包到NPM时遇到以下错误：

```
npm error code E403
npm error 403 403 Forbidden - PUT https://registry.npmjs.org/swagger-2-request - Package name too similar to existing package swagger2request
```

## 解决方案

### 1. 修改包名

将包名从 `swagger-2-request` 改为 `@yjh1102/swagger-2-request`（带命名空间的包名）

**修改文件：**
- `package.json` - 更新 `name` 字段
- `publish.config.js` - 更新配置中的包名
- `README.md` - 更新安装示例
- `examples/basic-usage/README.md` - 更新示例

### 2. 修复发布配置

**添加 `--access=public` 参数：**
- 带命名空间的包默认是私有的，需要明确指定为公开访问
- 在 `scripts/publish.js` 和 `scripts/quick-publish.sh` 中添加该参数

**修复 repository.url 格式：**
- 从 `https://github.com/...` 改为 `git+https://github.com/...`
- 避免NPM的格式警告

### 3. 验证修复结果

✅ **干运行发布成功**
```bash
pnpm run publish:dry
# 输出显示: @yjh1102/swagger-2-request@0.1.3
# 状态: Publishing to https://registry.npmjs.org/ with tag latest and public access (dry-run)
```

## 更新后的使用方式

### 安装

```bash
# 全局安装
npm install -g @yjh1102/swagger-2-request

# 项目安装
npm install --save-dev @yjh1102/swagger-2-request
```

### 使用

CLI命令保持不变：
```bash
s2r generate ./swagger.json
s2r mock ./swagger.json --port 3001
```

### 发布命令

```bash
# 发布补丁版本
pnpm run publish:patch

# 快速发布
./scripts/quick-publish.sh

# 干运行测试
pnpm run publish:dry
```

## 注意事项

1. **命名空间包**：`@yjh1102/swagger-2-request` 是一个带命名空间的包
2. **公开访问**：发布时会自动添加 `--access=public` 参数
3. **文档更新**：所有相关文档中的安装示例已更新
4. **向后兼容**：CLI工具的使用方式保持不变

## 后续步骤

1. 执行实际发布：`pnpm run publish:patch`
2. 验证NPM页面：https://www.npmjs.com/package/@yjh1102/swagger-2-request
3. 测试全局安装：`npm install -g @yjh1102/swagger-2-request`