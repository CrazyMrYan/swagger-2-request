# AI 文档转换

S2R 提供了强大的 AI 友好文档转换功能，能够将传统的 Swagger/OpenAPI 文档转换为更适合大语言模型 (LLM) 理解和处理的格式。

## 核心特性

### 📊 智能优化

- **结构化组织**: 按功能模块组织 API 端点
- **语义增强**: 添加搜索关键词和描述
- **示例生成**: 自动生成代码示例和使用场景
- **复杂度分析**: 评估 API 端点的复杂程度

### 🤖 LLM 友好

- **上下文丰富**: 提供完整的上下文信息
- **示例驱动**: 包含详细的使用示例
- **分层组织**: 按重要性和复杂度分层
- **搜索优化**: 优化关键词和索引

## 快速开始

### 基础转换

```bash
# 转换为 Markdown 格式
s2r ai-docs ./swagger.json --output ./docs/api-ai.md

# 转换为 JSON 格式
s2r ai-docs ./swagger.json --output ./docs/api-ai.json --format json

# 使用预设配置
s2r ai-docs ./swagger.json --output ./docs/api-ai.md --preset developer
```

### 命令行选项

```bash
s2r ai-docs <swagger-source> [options]
```

**参数:**
- `<swagger-source>` - Swagger 文档路径或 URL

**选项:**
- `-o, --output <file>` - 输出文件路径
- `-f, --format <format>` - 输出格式 (markdown, json, yaml)
- `-p, --preset <preset>` - 预设配置 (developer, documentation, analysis)
- `--include-examples` - 包含代码示例
- `--include-schemas` - 包含详细的 Schema 定义
- `--include-search` - 包含搜索索引
- `--language <lang>` - 文档语言 (en, zh-CN)

## 预设配置

### Developer 预设

适合开发者使用，包含完整的代码示例和技术细节：

```bash
s2r ai-docs ./swagger.json --preset developer
```

**特点:**
- 🔧 完整的代码示例 (TypeScript, JavaScript, cURL)
- 📋 详细的参数说明和验证规则
- 🎯 错误处理示例
- 🚀 性能优化建议

### Documentation 预设

适合技术文档编写，专注于清晰的描述和结构：

```bash
s2r ai-docs ./swagger.json --preset documentation
```

**特点:**
- 📖 清晰的结构化描述
- 🎨 美观的格式化输出
- 📊 统计信息和概览
- 🔍 完整的搜索索引

### Analysis 预设

适合 API 分析和审查，包含详细的统计和分析信息：

```bash
s2r ai-docs ./swagger.json --preset analysis
```

**特点:**
- 📈 详细的统计分析
- 🏷️ 复杂度评估
- 🔗 依赖关系分析
- ⚡ 性能影响评估

## 输出格式

### Markdown 格式

最适合人类阅读和 LLM 处理的格式：

```markdown
# Pet Store API

## 概览

**API 版本**: 1.0.0  
**服务器**: https://petstore.swagger.io/v2  
**文档生成时间**: 2024-01-15T10:30:00Z

## 功能模块

### 宠物管理 (pet)

管理宠物信息的相关 API，包括创建、查询、更新和删除操作。

#### GET /pet/{petId} - 获取宠物信息

**复杂度**: 简单 🟢  
**功能**: 根据 ID 获取单个宠物的详细信息

**参数:**
- `petId` (path, required): 宠物 ID
  - 类型: integer
  - 示例: 1

**响应:**
- `200`: 成功返回宠物信息
  - 类型: Pet
  - 示例: `{ "id": 1, "name": "doggie", "status": "available" }`

**代码示例:**

```typescript
// 获取宠物信息
const pet = await petGet('1');
console.log('宠物名称:', pet.name);
```

**错误处理:**
```typescript
try {
  const pet = await petGet('1');
} catch (error) {
  if (error.status === 404) {
    console.log('宠物不存在');
  }
}
```
```

### JSON 格式

适合程序化处理和数据分析：

```json
{
  "metadata": {
    "title": "Pet Store API",
    "version": "1.0.0",
    "description": "This is a sample server Petstore server.",
    "servers": ["https://petstore.swagger.io/v2"],
    "generatedAt": "2024-01-15T10:30:00Z",
    "generator": {
      "name": "Swagger-2-Request AI Converter",
      "version": "1.0.0"
    }
  },
  "endpoints": [
    {
      "id": "get_pet_petid",
      "method": "GET",
      "path": "/pet/{petId}",
      "functionName": "petGet",
      "summary": "Find pet by ID",
      "description": "Returns a single pet",
      "tags": ["pet"],
      "complexity": "simple",
      "parameters": [
        {
          "name": "petId",
          "in": "path",
          "type": "integer",
          "required": true,
          "description": "ID of pet to return",
          "example": 1
        }
      ],
      "responses": [
        {
          "statusCode": "200",
          "description": "successful operation",
          "type": "Pet"
        }
      ],
      "examples": [
        {
          "name": "基础调用示例",
          "description": "获取指定 ID 的宠物信息",
          "code": {
            "typescript": "const pet = await petGet('1');",
            "curl": "curl -X GET 'https://api.example.com/pet/1'"
          }
        }
      ],
      "searchKeywords": ["pet", "get", "find", "id", "single"]
    }
  ],
  "schemas": {
    "Pet": {
      "type": "object",
      "description": "Pet object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "Pet ID"
        },
        "name": {
          "type": "string",
          "description": "Pet name",
          "example": "doggie"
        }
      },
      "required": ["name", "photoUrls"]
    }
  },
  "statistics": {
    "totalEndpoints": 20,
    "methodDistribution": {
      "GET": 12,
      "POST": 5,
      "PUT": 2,
      "DELETE": 1
    },
    "complexityDistribution": {
      "simple": 15,
      "medium": 4,
      "complex": 1
    }
  }
}
```

### YAML 格式

适合配置管理和版本控制：

```yaml
metadata:
  title: Pet Store API
  version: 1.0.0
  description: This is a sample server Petstore server.
  generatedAt: "2024-01-15T10:30:00Z"

endpoints:
  - id: get_pet_petid
    method: GET
    path: "/pet/{petId}"
    functionName: petGet
    summary: Find pet by ID
    complexity: simple
    tags: [pet]
    searchKeywords: [pet, get, find, id, single]
```

## 配置文件

### 创建配置文件

创建 `ai-docs.config.js`：

```javascript
export default {
  // 输入配置
  input: {
    source: './swagger.json',
    validate: true
  },
  
  // 输出配置
  output: {
    format: 'markdown',
    file: './docs/api-ai.md',
    language: 'zh-CN'
  },
  
  // 内容配置
  content: {
    includeExamples: true,
    includeSchemas: true,
    includeSearchIndex: true,
    includeStatistics: true,
    
    // 示例配置
    examples: {
      languages: ['typescript', 'javascript', 'curl'],
      includeErrorHandling: true,
      includePerformance: true
    },
    
    // Schema 配置
    schemas: {
      expandDepth: 2,
      includeExamples: true,
      includeValidation: true
    }
  },
  
  // 格式化配置
  format: {
    codeHighlighting: true,
    tableOfContents: true,
    sectionNumbering: true,
    
    // Markdown 特定配置
    markdown: {
      headingPrefix: '#',
      codeBlockLanguage: 'typescript',
      includeMetadata: true
    }
  },
  
  // AI 优化配置
  ai: {
    // 增强描述
    enhanceDescriptions: true,
    
    // 生成搜索关键词
    generateKeywords: true,
    
    // 复杂度分析
    analyzeComplexity: true,
    
    // 关联性分析
    analyzeRelationships: true
  }
};
```

### 使用配置文件

```bash
s2r ai-docs --config ./ai-docs.config.js
```

## 高级功能

### 自定义模板

创建自定义输出模板：

```javascript
// custom-template.js
export const customTemplate = {
  markdown: {
    header: `# {{title}}

> **版本**: {{version}}  
> **生成时间**: {{generatedAt}}  
> **端点数量**: {{endpointCount}}

## 快速导航

{{#each tagGroups}}
- [{{@key}}](#{{slug @key}}) ({{this.length}} 个端点)
{{/each}}

---
`,

    endpoint: `### {{method}} {{path}} - {{summary}}

{{#if description}}
{{description}}
{{/if}}

**复杂度**: {{complexity}} {{complexityIcon}}  
**标签**: {{#each tags}}[{{this}}](#tag-{{this}}) {{/each}}

{{#if parameters}}
**参数:**
{{#each parameters}}
- \`{{name}}\` ({{in}}{{#if required}}, required{{/if}}): {{description}}
  - 类型: {{type}}
  {{#if example}}- 示例: \`{{example}}\`{{/if}}
{{/each}}
{{/if}}

{{#each examples}}
**{{name}}:**
\`\`\`{{language}}
{{code}}
\`\`\`
{{/each}}

---
`
  }
};
```

### 多语言支持

```javascript
// i18n.config.js
export const i18n = {
  'zh-CN': {
    complexity: {
      simple: '简单 🟢',
      medium: '中等 🟡', 
      complex: '复杂 🔴'
    },
    sections: {
      overview: '概览',
      endpoints: '端点',
      schemas: '数据模型',
      examples: '示例',
      statistics: '统计信息'
    }
  },
  'en': {
    complexity: {
      simple: 'Simple 🟢',
      medium: 'Medium 🟡',
      complex: 'Complex 🔴'
    },
    sections: {
      overview: 'Overview',
      endpoints: 'Endpoints', 
      schemas: 'Schemas',
      examples: 'Examples',
      statistics: 'Statistics'
    }
  }
};
```

### 插件系统

```javascript
// plugins/analytics.js
export const analyticsPlugin = {
  name: 'analytics',
  
  processEndpoint(endpoint, context) {
    // 分析端点使用频率
    endpoint.analytics = {
      estimatedUsage: calculateUsage(endpoint),
      performanceImpact: calculatePerformance(endpoint),
      securityRisk: calculateSecurity(endpoint)
    };
    
    return endpoint;
  },
  
  processDocument(document, context) {
    // 生成全局分析报告
    document.analytics = {
      totalComplexity: calculateTotalComplexity(document.endpoints),
      apiHealth: calculateAPIHealth(document.endpoints),
      recommendations: generateRecommendations(document.endpoints)
    };
    
    return document;
  }
};

// 使用插件
export default {
  plugins: [analyticsPlugin],
  // ... 其他配置
};
```

## 集成和自动化

### CI/CD 集成

```yaml
# .github/workflows/docs.yml
name: Generate AI Docs

on:
  push:
    paths:
      - 'api/swagger.json'

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install S2R
        run: npm install -g s2r
        
      - name: Generate AI Docs
        run: |
          s2r ai-docs ./api/swagger.json \
            --output ./docs/api-ai.md \
            --preset developer \
            --include-examples \
            --include-schemas
            
      - name: Commit and push
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add docs/api-ai.md
          git commit -m "Update AI docs" || exit 0
          git push
```

### 自动化脚本

```javascript
// scripts/generate-ai-docs.js
import { SwaggerAnalyzer, AIConverter } from 's2r';
import fs from 'fs/promises';

async function generateAIDocs() {
  const analyzer = new SwaggerAnalyzer();
  const converter = new AIConverter();
  
  // 支持多个 API 文档
  const apis = [
    { source: './api/v1/swagger.json', output: './docs/v1-ai.md' },
    { source: './api/v2/swagger.json', output: './docs/v2-ai.md' }
  ];
  
  for (const api of apis) {
    console.log(`处理 ${api.source}...`);
    
    const swagger = await analyzer.parseSwagger(api.source);
    const result = await converter.generateAIDoc(swagger, {
      format: 'markdown',
      preset: 'developer',
      includeExamples: true
    });
    
    await fs.writeFile(api.output, result.content);
    console.log(`✅ 生成完成: ${api.output}`);
  }
}

generateAIDocs().catch(console.error);
```

### 监控和更新

```javascript
// scripts/monitor-api-changes.js
import chokidar from 'chokidar';
import { generateAIDocs } from './generate-ai-docs.js';

// 监控 Swagger 文件变化
chokidar.watch('./api/**/*.json').on('change', async (path) => {
  console.log(`检测到 ${path} 变化，重新生成文档...`);
  await generateAIDocs();
  console.log('文档更新完成');
});
```

## 使用场景

### 1. LLM 训练数据

```bash
# 生成适合 LLM 训练的格式
s2r ai-docs ./swagger.json \
  --format json \
  --preset analysis \
  --include-examples \
  --include-schemas \
  --output ./training-data/api.json
```

### 2. 技术文档生成

```bash
# 生成用户友好的技术文档
s2r ai-docs ./swagger.json \
  --format markdown \
  --preset documentation \
  --language zh-CN \
  --output ./docs/api-guide.md
```

### 3. API 分析报告

```bash
# 生成 API 分析报告
s2r ai-docs ./swagger.json \
  --preset analysis \
  --include-statistics \
  --output ./reports/api-analysis.md
```

### 4. 代码生成辅助

```bash
# 为代码生成工具提供增强信息
s2r ai-docs ./swagger.json \
  --format json \
  --preset developer \
  --include-examples \
  --output ./codegen/enhanced-spec.json
```

## 最佳实践

### 1. 文档质量优化

```javascript
// 优化 Swagger 文档以获得更好的 AI 转换效果
const optimizationTips = {
  // 添加详细描述
  descriptions: {
    api: "为每个端点添加清晰的描述",
    parameters: "为每个参数添加详细说明",
    responses: "为每个响应添加完整说明"
  },
  
  // 使用有意义的标签
  tags: {
    grouping: "按功能模块组织端点",
    naming: "使用清晰的标签名称"
  },
  
  // 提供示例数据
  examples: {
    requests: "为请求参数提供示例",
    responses: "为响应数据提供示例"
  }
};
```

### 2. 版本管理

```bash
# 为不同版本生成不同的文档
s2r ai-docs ./api/v1.json --output ./docs/v1-ai.md
s2r ai-docs ./api/v2.json --output ./docs/v2-ai.md

# 生成版本对比报告
s2r ai-docs ./api/v2.json \
  --compare ./api/v1.json \
  --output ./docs/v1-to-v2-changes.md
```

### 3. 团队协作

```javascript
// 团队共享配置
// team-ai-docs.config.js
export default {
  // 统一的输出格式
  output: {
    format: 'markdown',
    language: 'zh-CN'
  },
  
  // 团队约定的内容标准
  content: {
    includeExamples: true,
    includeSchemas: true,
    examples: {
      languages: ['typescript', 'curl'],
      includeErrorHandling: true
    }
  },
  
  // 质量检查
  quality: {
    requireDescriptions: true,
    requireExamples: true,
    minimumComplexityLevel: 'medium'
  }
};
```

AI 文档转换功能让 S2R 生成的不仅仅是代码，更是智能的、结构化的、易于理解的文档。这些文档不仅适合人类阅读，更是为 AI 和自动化工具优化的格式，大大提升了 API 文档的价值和使用效率。