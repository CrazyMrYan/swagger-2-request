# s2r-package-npm

API client

## 📋 API Information

- **API Title**: API
- **API Version**: 1.0.0
- **Generated**: 2025-09-01

## 🚀 Installation

```bash
npm install s2r-package-npm
```

## 📖 Usage

### Basic Usage

```typescript
import { ApiClient } from 's2r-package-npm';

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
```

### Configuration

```typescript
import { ApiClient } from 's2r-package-npm';

const client = new ApiClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Authorization': 'Bearer your-token'
  }
});
```

### Error Handling

```typescript
import { ApiClient, ApiError } from 's2r-package-npm';

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
```

## 🔧 Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run build:watch
```

### Regenerate API Client

```bash
npm run generate
```

### Start Mock Server

```bash
npm run mock
```

### Validate API Document

```bash
npm run validate
```

## 📁 Project Structure

```
s2r-package-npm/
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
```

## 🔄 Updating the Client

When the API changes, you can regenerate the client:

```bash
# Update the swagger source in .s2r.json if needed
# Then regenerate
npm run generate
npm run build
```

## 📝 Configuration

The project uses `.s2r.json` for configuration. Key settings:

- `swagger.source`: API document URL or file path
- `generation.outputDir`: Where to generate code (default: `./src`)
- `generation.excludeFiles`: Files to preserve during regeneration

For more configuration options, see the [S2R documentation](https://s2r.dev).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [S2R Documentation](https://s2r.dev)
- [API Documentation](#)
- [Report Issues](https://github.com/your-org/s2r-package-npm/issues)

---

*Generated with [S2R](https://s2r.dev) - Swagger to Request*
