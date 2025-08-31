import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import path from 'path';
import chalk from 'chalk';
import { GenerateCommand } from './generate-command';
import { PackageGenerator } from '../publisher/package-generator';
import { SwaggerAnalyzer } from '../core/swagger-parser';

export interface CreateOptions {
  output?: string;
  config?: string;
  template?: 'basic' | 'full';
  registry?: string;
  private?: boolean;
  verbose?: boolean;
  force?: boolean;
}

export class CreateCommand {
  private generateCommand: GenerateCommand;
  private packageGenerator: PackageGenerator;
  private analyzer: SwaggerAnalyzer;

  constructor() {
    this.generateCommand = new GenerateCommand();
    this.packageGenerator = new PackageGenerator();
    this.analyzer = new SwaggerAnalyzer();
  }

  async execute(packageName: string, swaggerSource: string, options: CreateOptions): Promise<void> {
    if (!packageName) {
      throw new Error('Package name is required');
    }

    if (!swaggerSource) {
      throw new Error('Swagger document source is required');
    }

    const outputDir = options.output || `./${packageName}`;
    const absoluteOutputDir = path.resolve(outputDir);

    // 检查目录是否存在
    if (fsSync.existsSync(absoluteOutputDir)) {
      if (!options.force) {
        throw new Error(`Directory ${outputDir} already exists. Use --force to overwrite.`);
      }
      await fs.rm(absoluteOutputDir, { recursive: true, force: true });
    }

    console.log(chalk.blue('🚀 Creating API client project...'));
    console.log(chalk.gray(`Package name: ${packageName}`));
    console.log(chalk.gray(`Output directory: ${outputDir}`));
    console.log(chalk.gray(`Swagger source: ${swaggerSource}`));

    try {
      // 1. 创建项目目录结构
      await this.createProjectStructure(absoluteOutputDir, packageName, options);

      // 2. 解析 Swagger 文档
      const parsedSwagger = await this.analyzer.parseSwagger(swaggerSource);
      const swaggerDoc = parsedSwagger.info;
      
      // 3. 生成 API 代码
      const apiOutputDir = path.join(absoluteOutputDir, 'src');
      const generateOptions = {
        output: apiOutputDir,
        config: options.config,
        verbose: options.verbose,
        clean: true
      };
      
      await this.generateCommand.execute(swaggerSource, generateOptions);

      // 4. 生成 package.json
      await this.generatePackageJson(absoluteOutputDir, packageName, swaggerDoc, options);

      // 5. 生成其他配置文件
      await this.generateConfigFiles(absoluteOutputDir, swaggerSource, options);

      // 6. 生成 README.md
      await this.generateReadme(absoluteOutputDir, packageName, swaggerDoc, options);

      console.log(chalk.green('✅ API client project created successfully!'));
      console.log('');
      console.log(chalk.yellow('Next steps:'));
      console.log(chalk.gray(`  cd ${outputDir}`));
      console.log(chalk.gray('  npm install'));
      console.log(chalk.gray('  npm run build'));
      console.log(chalk.gray('  npm publish'));
      console.log('');
      console.log(chalk.blue('📖 Documentation:'));
      console.log(chalk.gray('  - README.md - Project overview and usage'));
      console.log(chalk.gray('  - .s2r.json - S2R configuration'));
      console.log(chalk.gray('  - src/ - Generated API client code'));

    } catch (error) {
      // 清理失败的目录
      if (fsSync.existsSync(absoluteOutputDir)) {
        await fs.rm(absoluteOutputDir, { recursive: true, force: true });
      }
      throw error;
    }
  }

  private async createProjectStructure(outputDir: string, packageName: string, options: CreateOptions): Promise<void> {
    // 创建基础目录结构
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(path.join(outputDir, 'src'), { recursive: true });
    await fs.mkdir(path.join(outputDir, 'dist'), { recursive: true });
    
    if (options.template === 'full') {
      await fs.mkdir(path.join(outputDir, 'docs'), { recursive: true });
      await fs.mkdir(path.join(outputDir, 'examples'), { recursive: true });
      await fs.mkdir(path.join(outputDir, 'tests'), { recursive: true });
    }
  }

  private async generatePackageJson(outputDir: string, packageName: string, swaggerDoc: any, options: CreateOptions): Promise<void> {
    const packageJson: any = {
      name: packageName,
      version: '1.0.0',
      description: swaggerDoc.info?.description || `API client for ${swaggerDoc.info?.title || 'API'}`,
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      files: [
        'dist/**/*',
        'README.md'
      ],
      scripts: {
        build: 'tsc',
        'build:watch': 'tsc --watch',
        clean: 'rimraf dist',
        'prebuild': 'npm run clean',
        'prepare': 'npm run build',
        'generate': 's2r generate',
        'mock': 's2r mock',
        'validate': 's2r validate'
      },
      keywords: [
        'api-client',
        'swagger',
        'openapi',
        'typescript',
        's2r'
      ],
      author: '',
      license: 'MIT',
      dependencies: {
        'axios': '^1.6.0'
      },
      devDependencies: {
        'typescript': '^5.0.0',
        'rimraf': '^5.0.0',
        's2r': 'latest'
      },
      engines: {
        node: '>=16.0.0'
      },
      private: options.private || false
    };

    if (options.registry) {
      packageJson.publishConfig = {
        registry: options.registry
      };
    }

    if (options.template === 'full') {
      packageJson.scripts = {
        ...packageJson.scripts,
        test: 'jest',
        'test:watch': 'jest --watch',
        'test:coverage': 'jest --coverage',
        lint: 'eslint src --ext .ts',
        'lint:fix': 'eslint src --ext .ts --fix',
        docs: 'typedoc src/index.ts'
      };
      
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        '@types/jest': '^29.0.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
        'eslint': '^8.0.0',
        'jest': '^29.0.0',
        'ts-jest': '^29.0.0',
        'typedoc': '^0.25.0'
      };
    }

    await fs.writeFile(path.join(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  }

  private async generateConfigFiles(outputDir: string, swaggerSource: string, options: CreateOptions): Promise<void> {
    // 生成 tsconfig.json
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: false,
        sourceMap: false,
        removeComments: false,
        moduleResolution: 'node',
        resolveJsonModule: true,
        allowSyntheticDefaultImports: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', 'tests']
    };
    
    await fs.writeFile(path.join(outputDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));

    // 生成 .s2r.json 配置文件
    const s2rConfig = {
      swagger: {
        source: swaggerSource,
        version: '3.0'
      },
      generation: {
        outputDir: './src',
        functionNaming: 'pathMethod',
        includeComments: true,
        generateTypes: true,
        cleanOutput: false,
        excludeFiles: ['client.ts', 'index.ts'],
        forceOverride: false
      },
      runtime: {
        timeout: 10000,
        validateParams: true,
        filterParams: true
      },
      aiDocs: {
        enabled: true,
        format: 'markdown',
        includeExamples: true,
        optimizeForSearch: true,
        includeCodeExamples: true,
        generateTOC: true,
        language: 'zh',
        verbosity: 'normal',
        outputDir: './docs',
        filename: 'api-docs.md'
      }
    };

    await fs.writeFile(path.join(outputDir, '.s2r.json'), JSON.stringify(s2rConfig, null, 2));

    // 生成 .gitignore
    const gitignore = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Coverage
coverage/
.nyc_output/

# Temporary
.tmp/
.temp/
`;
    
    await fs.writeFile(path.join(outputDir, '.gitignore'), gitignore);

    if (options.template === 'full') {
      // 生成 jest.config.js
      const jestConfig = `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
`;
      
      await fs.writeFile(path.join(outputDir, 'jest.config.js'), jestConfig);

      // 生成 .eslintrc.js
      const eslintConfig = `module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off'
  },
  env: {
    node: true,
    es6: true
  }
};
`;
      
      await fs.writeFile(path.join(outputDir, '.eslintrc.js'), eslintConfig);
    }
  }

  private async generateReadme(outputDir: string, packageName: string, swaggerDoc: any, options: CreateOptions): Promise<void> {
    const apiTitle = swaggerDoc.info?.title || 'API';
    const apiDescription = swaggerDoc.info?.description || 'API client';
    const apiVersion = swaggerDoc.info?.version || '1.0.0';
    
    const readme = `# ${packageName}

${apiDescription}

## 📋 API Information

- **API Title**: ${apiTitle}
- **API Version**: ${apiVersion}
- **Generated**: ${new Date().toISOString().split('T')[0]}

## 🚀 Installation

\`\`\`bash
npm install ${packageName}
\`\`\`

## 📖 Usage

### Basic Usage

\`\`\`typescript
import { ApiClient } from '${packageName}';

// Create client instance
const client = new ApiClient({
  baseURL: 'https://api.example.com',
  timeout: 10000
});

// Use API methods
try {
  const response = await client.someApiMethod(params);
  console.log(response.data);
} catch (error) {
  console.error('API Error:', error);
}
\`\`\`

### Configuration

\`\`\`typescript
import { ApiClient } from '${packageName}';

const client = new ApiClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Authorization': 'Bearer your-token'
  }
});
\`\`\`

### Error Handling

\`\`\`typescript
import { ApiClient, ApiError } from '${packageName}';

try {
  const response = await client.someApiMethod(params);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Response:', error.response);
  } else {
    console.error('Network Error:', error);
  }
}
\`\`\`

## 🔧 Development

### Build

\`\`\`bash
npm run build
\`\`\`

### Watch Mode

\`\`\`bash
npm run build:watch
\`\`\`

### Regenerate API Client

\`\`\`bash
npm run generate
\`\`\`

### Start Mock Server

\`\`\`bash
npm run mock
\`\`\`

### Validate API Document

\`\`\`bash
npm run validate
\`\`\`

${options.template === 'full' ? `### Testing

\`\`\`bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
\`\`\`

### Linting

\`\`\`bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix
\`\`\`

### Documentation

\`\`\`bash
# Generate API documentation
npm run docs
\`\`\`

` : ''}## 📁 Project Structure

\`\`\`
${packageName}/
├── src/                 # Generated API client code
│   ├── api.ts          # API methods
│   ├── types.ts        # TypeScript types
│   ├── client.ts       # HTTP client
│   └── index.ts        # Main exports
├── dist/               # Compiled JavaScript
├── .s2r.json          # S2R configuration
├── tsconfig.json      # TypeScript configuration
├── package.json       # Package configuration
└── README.md          # This file
\`\`\`

## 🔄 Updating the Client

When the API changes, you can regenerate the client:

\`\`\`bash
# Update the swagger source in .s2r.json if needed
# Then regenerate
npm run generate
npm run build
\`\`\`

## 📝 Configuration

The project uses \`.s2r.json\` for configuration. Key settings:

- \`swagger.source\`: API document URL or file path
- \`generation.outputDir\`: Where to generate code (default: \`./src\`)
- \`generation.excludeFiles\`: Files to preserve during regeneration

For more configuration options, see the [S2R documentation](https://s2r.dev).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [S2R Documentation](https://s2r.dev)
- [API Documentation](${swaggerDoc.info?.contact?.url || '#'})
- [Report Issues](https://github.com/your-org/${packageName}/issues)

---

*Generated with [S2R](https://s2r.dev) - Swagger to Request*
`;

    await fs.writeFile(path.join(outputDir, 'README.md'), readme);
  }
}