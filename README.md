# Sendlix Node.js Monorepo

A modern JavaScript/TypeScript monorepo with SDK and integration packages for the Sendlix API.

## Packages

This monorepo contains the following packages:

### [`sendlix`](./packages/sendlix)
The official **Node.js SDK for the Sendlix API**. Provides clients for:
- Email delivery
- Group management
- Authentication

**Installation:**
```bash
npm install sendlix
```

### [`@sendlix/nodemailer`](./packages/nodemailer)
A **Nodemailer transport** for the Sendlix API. Enables the use of Sendlix as a transport in Nodemailer applications.

**Installation:**
```bash
npm install @sendlix/nodemailer nodemailer
```

## Getting Started

### Prerequisites
- Node.js 18+ (recommended)
- npm 11.16.0+

### Installation

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Builds all packages |
| `npm test` | Runs all tests |
| `npm run nx` | Runs Nx commands |

## Technology Stack

- **TypeScript** - For type safety and better development experience
- **Nx** - Monorepo management and task automation
- **Jest** - Unit testing framework
- **gRPC** - Communication with Sendlix API
- **Semantic Release** - Automated versioning and publishing
- **Husky** - Git hooks for code quality

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Test a specific package only
npm test -- --projects=sendlix
```

## Development

### Workspace Setup
Each package has its own `package.json` and `tsconfig.json`, but is complemented by the root configuration.

### Build
```bash
# Build all packages
npm run build:workspace

# Build a specific package
npx nx build sendlix
```

### Commit Conventions
This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add new feature
fix: Fix a bug
docs: Update documentation
test: Add or update tests
chore: Update dependencies
```

These are validated by `commitlint`.

## License

See [LICENSE](./LICENSE) for details.

## Contributing

Contributions are welcome! Please note:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes with conventional commit messages
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

## Documentation

- [Sendlix SDK Documentation](./packages/sendlix/README.md)
- [Nodemailer Transport Documentation](./packages/nodemailer/README.md)

## Support

For questions and support regarding the Sendlix SDK or this integration, visit the [Sendlix website](https://sendlix.com).
