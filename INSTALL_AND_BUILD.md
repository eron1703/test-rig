# Test-Rig - Build and Install Guide

## Quick Start

```bash
cd ~/projects/test-rig
npm install
npm run build
npm link
```

Verify installation:
```bash
test-rig --version
```

## Development

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Watch Mode (Development)

```bash
npm run dev
```

### Link Globally for Local Testing

```bash
npm link
```

Now `test-rig` command is available globally.

### Test the CLI

```bash
test-rig --help
test-rig doctor
```

## Deployment

### Deploy to Server

```bash
./deploy/deploy-server.sh your-server-ip
```

### Build for Distribution

```bash
npm run build
npm pack
```

Creates `hcb-consulting-test-rig-1.0.0.tgz` for manual installation.

### Publish to NPM (if configured)

```bash
npm run deploy
```

## Project Structure

```
test-rig/
├── src/
│   ├── cli/              # CLI commands
│   ├── core/             # Core functionality
│   ├── agents/           # Multi-agent orchestration
│   ├── server/           # API server
│   ├── templates/        # Test templates
│   └── utils/            # Utilities
├── deploy/               # Deployment scripts
├── docs/                 # Documentation
├── dist/                 # Built output (after npm run build)
└── package.json
```

## Next Steps

After building and linking:

1. Navigate to a project: `cd ~/projects/resolver`
2. Setup tests: `test-rig setup`
3. Generate tests: `test-rig generate user-service`
4. Run tests: `test-rig run`

## Troubleshooting

### Command not found after `npm link`

```bash
# Check npm global bin directory
npm config get prefix

# Should be in PATH
echo $PATH

# Re-link
npm unlink
npm link
```

### Build errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### TypeScript errors

```bash
# Check TypeScript version
npx tsc --version

# Reinstall dependencies
npm install
```
