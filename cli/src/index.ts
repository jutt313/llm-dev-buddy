
#!/usr/bin/env node

import { Command } from 'commander';
import { AuthCommand } from './commands/auth';
import { AgentCommand } from './commands/agent';
import { ProjectCommand } from './commands/project';
import { LLMCommand } from './commands/llm';
import { ConfigCommand } from './commands/config';
import chalk from 'chalk';

const program = new Command();

program
  .name('codexi')
  .description('CodeXI CLI - Multi-agent AI development platform')
  .version('1.0.0');

// ASCII Art Banner
const banner = `
${chalk.cyan('╔═══════════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.white('CodeXI CLI')} ${chalk.gray('- Multi-Agent AI Development Platform')}      ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray('Orchestrate 20 specialized AI agents for development tasks')}  ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════════════════════════════╝')}
`;

program.addHelpText('beforeAll', banner);

// Register commands
program.addCommand(AuthCommand);
program.addCommand(AgentCommand);
program.addCommand(ProjectCommand);
program.addCommand(LLMCommand);
program.addCommand(ConfigCommand);

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error);
  process.exit(1);
});

program.parse();
