# 📦 发布指南

本项目提供了完整的NPM包发布解决方案，支持多种发布方式和环境。

## 🚀 快速发布

最简单的发布方式：

```bash
# 发布补丁版本（推荐用于日常发布）
./scripts/quick-publish.sh

# 发布次版本
./scripts/quick-publish.sh --minor

# 发布主版本  
./scripts/quick-publish.sh --major

# 干运行测试
./scripts/quick-publish.sh --dry-run
```

## 📋 使用NPM脚本

```bash
# 发布命令
pnpm run publish:patch     # 发布补丁版本
pnpm run publish:minor     # 发布次版本
pnpm run publish:major     # 发布主版本
pnpm run publish:beta      # 发布Beta版本
pnpm run publish:dry       # 干运行测试

# 版本管理
pnpm run version:patch     # 仅更新补丁版本号
pnpm run version:minor     # 仅更新次版本号
pnpm run version:major     # 仅更新主版本号
```

## 🎯 交互式发布

运行演示脚本，通过交互式界面选择发布方式：

```bash
./scripts/demo-publish.sh
```

## 🔧 高级发布选项

使用主发布脚本进行精细控制：

```bash
node scripts/publish.js [选项]

# 示例
node scripts/publish.js --patch --dry-run
node scripts/publish.js --version 1.2.3
node scripts/publish.js --beta --minor
node scripts/publish.js --registry https://npm.company.com
```

### 可用选项

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

## 📚 详细文档

查看完整的发布指南：[PUBLISH.md](./PUBLISH.md)

## ⚠️ 发布前检查

确保以下条件满足：

- ✅ 所有测试通过
- ✅ 代码已经提交到Git
- ✅ 版本号符合语义化版本规范
- ✅ 已登录NPM账号（`npm whoami`）
- ✅ 有发布权限

## 🔄 发布流程

标准发布流程包括：

1. 环境检查
2. 依赖安装
3. 代码检查 (ESLint)
4. 测试运行
5. 项目构建
6. 版本升级
7. NPM发布
8. Git标签创建

## 💡 提示

- 首次发布前使用 `--dry-run` 测试流程
- 重大更改建议先发布Beta版本
- 定期更新依赖并测试兼容性