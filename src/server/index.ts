import http from 'http';
import chalk from 'chalk';
import { loadConfig } from '../core/config-loader.js';
import { runTestsSequential } from '../core/test-runner.js';
import { runTestsParallel } from '../agents/orchestrator.js';
import { generateTests, type ComponentAnalysis } from '../agents/test-generator.js';

interface RequestBody {
  type?: string;
  component?: string;
  parallel?: boolean;
  agents?: number;
}

export async function startServer(host: string, port: number) {
  const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Routes
    const url = req.url || '/';

    if (url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'healthy', version: '1.0.0' }));
      return;
    }

    if (url === '/test/run' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const data: RequestBody = JSON.parse(body);
          
          // Load configuration
          const config = await loadConfig(process.cwd());
          
          // Execute tests based on parallel flag
          const result = data.parallel
            ? await runTestsParallel({ config, agents: data.agents || 4 })
            : await runTestsSequential({ config, type: data.type });
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            data: result
          }));
        } catch (error: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: error.message || 'Failed to run tests'
          }));
        }
      });
      return;
    }

    if (url === '/test/generate' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const { component, type } = data;
          
          if (!component) {
            throw new Error('component parameter is required');
          }
          
          // Create analysis object for test generation
          const analysis: ComponentAnalysis = {
            component,
            files: [],
            subcomponents: [{
              name: component,
              file: `src/${component}.ts`,
              type: type || 'unit'
            }]
          };
          
          // Generate tests
          const files = await generateTests(analysis, process.cwd());
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            data: { files }
          }));
        } catch (error: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: error.message || 'Failed to generate tests'
          }));
        }
      });
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  server.listen(port, host, () => {
    console.log(chalk.green.bold(`\n✅ Test-Rig API Server running\n`));
    console.log(chalk.gray(`   Host: ${host}`));
    console.log(chalk.gray(`   Port: ${port}`));
    console.log(chalk.gray(`   Health: http://${host}:${port}/health\n`));
    console.log(chalk.gray('API Endpoints:'));
    console.log(chalk.gray('   POST /test/run - Run tests'));
    console.log(chalk.gray('   POST /test/generate - Generate tests'));
    console.log(chalk.gray('   GET /health - Health check\n'));
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log(chalk.yellow('\n⚠️  Shutting down gracefully...'));
    server.close(() => {
      console.log(chalk.gray('✅ Server closed\n'));
      process.exit(0);
    });
  });
}
