import http from 'http';
import chalk from 'chalk';

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
          // TODO: Implement test running
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'success',
            message: 'Tests running',
            data
          }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
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
          // TODO: Implement test generation
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'success',
            message: 'Tests generated',
            data
          }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (url === '/test/stream' && req.method === 'GET') {
      // Server-Sent Events (SSE) endpoint for test progress streaming
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      // Send initial connection message
      res.write(`data: ${JSON.stringify({ status: 'connected', progress: 0 })}\n\n`);

      // Simulate test progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5; // Increment 5-20%
        if (progress > 100) progress = 100;

        res.write(`data: ${JSON.stringify({ 
          status: progress === 100 ? 'complete' : 'running', 
          progress 
        })}\n\n`);

        if (progress === 100) {
          clearInterval(interval);
          res.end();
        }
      }, 1000);

      // Handle client disconnect
      req.on('close', () => {
        clearInterval(interval);
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
    console.log(chalk.gray('   GET /test/stream - Stream test progress'));
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
