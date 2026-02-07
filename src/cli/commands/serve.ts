import chalk from 'chalk';
import { startServer } from '../../server/index.js';

interface ServeOptions {
  port?: string;
  host?: string;
}

export async function serveCommand(options: ServeOptions) {
  console.log(chalk.blue.bold('\n🚀 Starting Test-Rig API Server\n'));

  const port = parseInt(options.port || '8080');
  const host = options.host || '0.0.0.0';

  try {
    await startServer(host, port);
  } catch (error) {
    console.error(chalk.red(`\nError: ${(error as Error).message}\n`));
    process.exit(1);
  }
}
