/**
 * Environment detection utilities for headless execution
 * Detects CI/automated environments and prevents interactive prompts
 */

export function isCI(): boolean {
  return !!(
    process.env.CI ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.JENKINS_HOME ||
    process.env.CIRCLECI ||
    process.env.TRAVIS ||
    process.env.BITBUCKET_BUILD_NUMBER ||
    process.env.BUILDKITE ||
    !process.stdout.isTTY
  );
}

export function isClaude(): boolean {
  // Detect if running under Claude Code agent or VSCode extension context
  return !!(
    process.env.ANTHROPIC_API_KEY ||
    process.env.CLAUDE_AGENT ||
    process.env.VSCODE_PID
  );
}

export function isAutomatedEnvironment(): boolean {
  // True if running in CI or Claude environment
  return isCI() || isClaude();
}

export function requireNonInteractive(commandName: string): void {
  if (isAutomatedEnvironment()) {
    console.error(`\n❌ Error: Interactive mode not allowed in CI/automated environments.`);
    console.error(`Command: ${commandName}`);
    console.error(`\nUse non-interactive flags:`);
    console.error(`  test-rig setup --yes`);
    console.error(`  test-rig generate <component> --non-interactive`);
    console.error(`  test-rig run --headless\n`);
    process.exit(1);
  }
}

export function shouldAutoYes(): boolean {
  // Auto-enable --yes flag in CI/agent environments
  return isAutomatedEnvironment();
}
