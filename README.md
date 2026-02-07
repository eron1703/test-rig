# Test-Rig

Multi-agent testing infrastructure for monoliths and microservices. Works seamlessly with both Node.js and Python projects.

## Features

- 🤖 **Multi-Agent Parallel Execution** - Run tests across multiple agents simultaneously
- 🧪 **Framework Support** - Vitest, Pytest, Playwright
- 🐳 **Testcontainers** - Real database instances for integration tests
- 📝 **Component Specs** - YAML-based test organization
- 🎯 **AI-Powered Generation** - Auto-generate tests from code analysis
- 🚀 **Zero Config** - Auto-detect project type and setup

## 🤖 Autonomous Agent Execution

**IMPORTANT:** test-rig is designed for headless, background execution. All commands default to non-interactive mode.

For CI/CD and agent usage:
- Commands auto-detect CI environments
- Interactive prompts are disabled
- Use `--yes` flag to skip confirmations
- All tests run in background/headless mode

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

# Setup test infrastructure (non-interactive)
test-rig setup --yes

# Generate tests for a component (headless)
test-rig generate user-service --non-interactive

# Run tests (background)
test-rig run --headless

# Run tests in parallel (multi-agent)
test-rig run --parallel --agents 4 --headless

# Check coverage
test-rig coverage --headless
```

## Autonomous Agent Usage

### CRITICAL RULES FOR CODING AGENTS

All test-rig commands MUST run in headless mode:

✅ CORRECT - Non-interactive execution:
```bash
test-rig setup --yes
test-rig generate auth-service --non-interactive
test-rig run --headless
test-rig run --parallel --agents 4 --headless
```

❌ INCORRECT - Interactive prompts (blocks agents):
```bash
test-rig setup          # Will prompt for input
test-rig generate auth  # May ask questions
test-rig run            # Without --headless flag
```

### CI/CD Detection
test-rig auto-detects CI environments and disables interactive mode:
- GitHub Actions (GITHUB_ACTIONS)
- GitLab CI (GITLAB_CI)
- Jenkins (JENKINS_HOME)
- Generic CI (CI=true)
- Non-TTY environments

> **⚠️ WARNING:** Interactive mode is for manual use only. Coding agents and CI/CD pipelines must use `--yes` or `--headless` flags.

## Commands

### `test-rig setup`
Initialize test infrastructure for the current project.
- Auto-detects project type (Node.js/Python)
- Installs appropriate test frameworks
- Creates folder structure
- Generates configuration files

**Usage:**
```bash
test-rig setup --yes              # Non-interactive
test-rig setup --yes --verbose    # Non-interactive with logs
```

### `test-rig generate <component>`
Generate tests for a specific component.
- Analyzes component code
- Creates component spec (YAML)
- Generates unit tests
- Generates integration tests
- Creates test data factories

**Usage:**
```bash
test-rig generate user-service --non-interactive
test-rig generate auth-service --non-interactive --verbose
```

### `test-rig run [type]`
Run tests.
- `test-rig run --headless` - Run all tests (headless)
- `test-rig run unit --headless` - Unit tests only
- `test-rig run integration --headless` - Integration tests only
- `test-rig run e2e --headless` - E2E tests only
- `test-rig run --parallel --agents 4 --headless` - Multi-agent parallel execution

**Usage:**
```bash
test-rig run --headless
test-rig run --parallel --agents 4 --headless
```

### `test-rig coverage`
Generate coverage report.

**Usage:**
```bash
test-rig coverage --headless
```

### `test-rig analyze`
Analyze codebase for testability.

**Usage:**
```bash
test-rig analyze --headless
```

### `test-rig doctor`
Check test setup health.

**Usage:**
```bash
test-rig doctor --verbose --headless
```

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
test-rig run --parallel --agents 4 --headless
```

Each agent:
1. Picks a component from the queue
2. Starts its own testcontainers
3. Runs component tests
4. Reports results

**Result:** 3-4x faster test execution with no conflicts.

**For coding agents:** Always use `--headless` flag to ensure non-interactive execution.

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
      - run: test-rig setup --yes
      - run: test-rig run --parallel --agents 4 --headless
```

### GitLab CI

```yaml
test:
  image: node:18
  before_script:
    - npm install -g @hcb-consulting/test-rig
  script:
    - test-rig setup --yes
    - test-rig run --parallel --agents 4 --headless
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
