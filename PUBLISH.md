# 发布指南

本项目提供了多种方式来发布NPM包，适合不同的使用场景和需求。

## 🚀 快速开始

### 最简单的方式 - 快速发布脚本

```bash
# 发布补丁版本 (推荐用于日常发布)
./scripts/quick-publish.sh

# 发布次版本
./scripts/quick-publish.sh --minor

# 发布主版本
./scripts/quick-publish.sh --major
```

### 使用NPM脚本

```bash
# 发布补丁版本
pnpm run publish:patch

# 发布次版本
pnpm run publish:minor

# 发布主版本
pnpm run publish:major

# 发布Beta版本
pnpm run publish:beta

# 干运行（测试发布流程但不实际发布）
pnpm run publish:dry
```

## 📋 发布选项说明

### 版本类型

- `--patch` (x.x.1): 补丁版本，用于Bug修复
- `--minor` (x.1.x): 次版本，用于新功能添加
- `--major` (1.x.x): 主版本，用于重大更改或破坏性变更

### 发布标签

- `--tag latest`: 正式版本（默认）
- `--tag beta`: Beta测试版本
- `--tag alpha`: Alpha测试版本

### 其他选项

- `--dry-run`: 干运行模式，不实际发布
- `--skip-tests`: 跳过测试步骤
- `--skip-build`: 跳过构建步骤
- `--registry <url>`: 指定NPM注册表

## 🛠️ 详细使用方法

### 1. 使用主发布脚本 (scripts/publish.js)

主发布脚本提供了最全面的功能和选项：

```bash
# 基本用法
node scripts/publish.js [选项]

# 示例
node scripts/publish.js --patch
node scripts/publish.js --minor --dry-run
node scripts/publish.js --version 1.2.3
node scripts/publish.js --beta --minor
node scripts/publish.js --registry https://npm.your-company.com
```

#### 可用选项

| 选项 | 说明 | 示例 |
|------|------|------|
| `--patch` | 发布补丁版本 | `--patch` |
| `--minor` | 发布次版本 | `--minor` |
| `--major` | 发布主版本 | `--major` |
| `--version <ver>` | 指定版本号 | `--version 1.2.3` |
| `--tag <tag>` | 发布标签 | `--tag beta` |
| `--registry <url>` | NPM注册表 | `--registry https://npm.company.com` |
| `--dry-run` | 干运行模式 | `--dry-run` |
| `--skip-tests` | 跳过测试 | `--skip-tests` |
| `--skip-build` | 跳过构建 | `--skip-build` |
| `--beta` | 发布Beta版本 | `--beta` |
| `--alpha` | 发布Alpha版本 | `--alpha` |

### 2. 使用快速发布脚本 (scripts/quick-publish.sh)

快速发布脚本适合日常使用，提供简化的发布流程：

```bash
# 基本用法
./scripts/quick-publish.sh [选项]

# 示例
./scripts/quick-publish.sh --patch
./scripts/quick-publish.sh --minor --dry-run
./scripts/quick-publish.sh --beta
```

### 3. 使用配置文件

创建或修改 `publish.config.js` 文件来自定义发布行为：

```javascript
export default {
  package: {
    name: 'your-package-name',
    author: 'Your Name',
    license: 'MIT'
  },
  publish: {
    build: true,
    runTests: true,
    dryRun: false
  }
};
```

## 🔄 发布流程

标准的发布流程包括以下步骤：

1. **环境检查**: 检查Node.js、pnpm、Git等依赖
2. **工作目录检查**: 确保没有未提交的更改
3. **依赖安装**: 安装项目依赖
4. **代码检查**: 运行ESLint和TypeScript检查
5. **测试**: 运行单元测试
6. **构建**: 编译TypeScript代码
7. **版本升级**: 更新package.json中的版本号
8. **发布**: 推送到NPM注册表
9. **Git标签**: 创建并推送Git标签

## 📦 发布预设

项目提供了多个预设配置：

### development (开发环境)
- 运行构建和测试
- 不实际发布
- 干运行模式

### testing (测试环境)
- 运行构建和测试
- 发布到beta标签
- 干运行模式

### production (生产环境)
- 运行构建和测试
- 发布到latest标签
- 实际发布

### beta/alpha (预发布)
- 发布到对应标签
- 实际发布

## 🔧 常见用例

### 日常开发发布

```bash
# 修复Bug后发布补丁版本
./scripts/quick-publish.sh --patch

# 添加新功能后发布次版本
./scripts/quick-publish.sh --minor
```

### 测试发布流程

```bash
# 干运行测试发布流程
pnpm run publish:dry

# 或者
./scripts/quick-publish.sh --dry-run
```

### 发布预发布版本

```bash
# 发布Beta版本
pnpm run publish:beta

# 发布Alpha版本
./scripts/quick-publish.sh --alpha
```

### 发布到私有注册表

```bash
node scripts/publish.js --patch --registry https://npm.your-company.com
```

## ⚠️ 注意事项

1. **确保测试通过**: 发布前确保所有测试都通过
2. **检查版本号**: 确认版本号符合语义化版本规范
3. **更新文档**: 重要更改记得更新README和文档
4. **备份重要数据**: 发布前建议提交所有更改到Git

## 🐛 故障排除

### 权限问题

如果遇到NPM权限问题：

```bash
# 登录NPM
npm login

# 检查登录状态
npm whoami

# 检查包权限
npm access list packages
```

### 网络问题

如果遇到网络问题：

```bash
# 切换NPM注册表
npm config set registry https://registry.npmjs.org

# 或使用代理
npm config set proxy http://proxy.company.com:8080
```

### 构建失败

如果构建失败：

```bash
# 清理并重新安装依赖
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 清理构建缓存
rm -rf dist
pnpm build
```

## 📚 相关文档

- [NPM发布指南](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [语义化版本](https://semver.org/lang/zh-CN/)
- [项目README](./README.md)

## 💡 提示

- 使用 `--dry-run` 选项来测试发布流程
- 重大更改前考虑发布Beta版本进行测试
- 定期更新依赖并测试兼容性
- 使用有意义的提交消息和版本说明