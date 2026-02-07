# Test-Rig

Multi-agent testing infrastructure for monoliths and microservices. Works seamlessly with both Node.js and Python projects.

## Features

- 🤖 **Multi-Agent Parallel Execution** - Run tests across multiple agents simultaneously
- 🧪 **Framework Support** - Vitest, Pytest, Playwright
- 🐳 **Testcontainers** - Real database instances for integration tests
- 📝 **Component Specs** - YAML-based test organization
- 🎯 **AI-Powered Generation** - Auto-generate tests from code analysis
- 🚀 **Zero Config** - Auto-detect project type and setup

## Installation

### Global Installation (Recommended)

```bash
npm install -g @hcb-consulting/test-rig
```

### From Source (Development)

```bash
git clone https://github.com/HCB-Consulting-ME/test-rig
cd test-rig
npm install
npm run build
npm link
```

### Server Deployment

```bash
# Clone and install
git clone https://github.com/HCB-Consulting-ME/test-rig /opt/test-rig
cd /opt/test-rig
npm install --production
npm link

# Verify installation
test-rig --version
```

## Quick Start

```bash
# Navigate to your project
cd ~/projects/your-project

# Setup test infrastructure
test-rig setup

# Generate tests for a component
test-rig generate user-service

# Run tests
test-rig run

# Run tests in parallel (multi-agent)
test-rig run --parallel --agents 4

# Check coverage
test-rig coverage
```

## Commands

### `test-rig setup`
Initialize test infrastructure for the current project.
- Auto-detects project type (Node.js/Python)
- Installs appropriate test frameworks
- Creates folder structure
- Generates configuration files

### `test-rig generate <component>`
Generate tests for a specific component.
- Analyzes component code
- Creates component spec (YAML)
- Generates unit tests
- Generates integration tests
- Creates test data factories

### `test-rig run [type]`
Run tests.
- `test-rig run` - Run all tests
- `test-rig run unit` - Unit tests only
- `test-rig run integration` - Integration tests only
- `test-rig run e2e` - E2E tests only
- `test-rig run --parallel` - Multi-agent parallel execution

### `test-rig coverage`
Generate coverage report.

### `test-rig analyze`
Analyze codebase for testability.

### `test-rig doctor`
Check test setup health.

## Configuration

Create `test-rig.config.yaml` in your project root:

```yaml
framework: vitest  # or pytest
parallel_agents: 4
containers:
  - postgres:5432
  - redis:6379
coverage_threshold:
  unit: 80
  integration: 60
```

## Component Specs

Component specs define testable units for parallel execution:

```yaml
# tests/specs/user-service.spec.yaml
component:
  name: user-service
  type: service

subcomponents:
  - name: repository
    test_file: tests/unit/user-service/repository.spec.ts
    dependencies: [database]

  - name: validator
    test_file: tests/unit/user-service/validator.spec.ts
    dependencies: []

  - name: service
    test_file: tests/unit/user-service/service.spec.ts
    dependencies: [repository, validator]
```

## Multi-Agent Parallel Execution

Test-rig spawns multiple agents to run tests in parallel:

```bash
test-rig run --parallel --agents 4
```

Each agent:
1. Picks a component from the queue
2. Starts its own testcontainers
3. Runs component tests
4. Reports results

**Result:** 3-4x faster test execution with no conflicts.

## Project Structure

```
your-project/
├── tests/
│   ├── specs/              # Component specs (YAML)
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   ├── e2e/               # End-to-end tests
│   ├── factories/         # Test data factories
│   ├── fixtures/          # Static test data
│   ├── mocks/             # Mock objects
│   └── utils/             # Test utilities
└── test-rig.config.yaml   # Configuration
```

## Supported Projects

### Monoliths
- Node.js (Express, Fastify, Nest.js)
- Python (FastAPI, Flask, Django)
- Mixed tech stacks

### Microservices
- Service-by-service testing
- Contract testing
- Cross-service integration tests

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install -g @hcb-consulting/test-rig
      - run: test-rig run --parallel
```

### GitLab CI

```yaml
test:
  image: node:18
  before_script:
    - npm install -g @hcb-consulting/test-rig
  script:
    - test-rig run --parallel
```

## Server Deployment Setup

### SystemD Service (Optional)

```ini
# /etc/systemd/system/test-rig-api.service
[Unit]
Description=Test-Rig API Server
After=network.target

[Service]
Type=simple
User=testrig
WorkingDirectory=/opt/test-rig
ExecStart=/usr/bin/node /opt/test-rig/dist/server/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build

CMD ["node", "dist/cli/index.js", "serve"]
```

## API Server Mode (Optional)

Run test-rig as an API server:

```bash
test-rig serve --port 8080
```

API endpoints:
- `POST /test/run` - Run tests
- `POST /test/generate` - Generate tests
- `GET /test/status` - Get test status
- `GET /coverage` - Get coverage report

## Development

```bash
# Clone repository
git clone https://github.com/HCB-Consulting-ME/test-rig
cd test-rig

# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Link locally
npm link

# Test
npm test
```

## Documentation

- [Full Documentation](./docs/README.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Examples](./docs/examples/)
- [Quick Reference](./docs/QUICK_REFERENCE.md)

## License

MIT

## Support

- Issues: https://github.com/HCB-Consulting-ME/test-rig/issues
- Docs: https://github.com/HCB-Consulting-ME/test-rig/wiki
