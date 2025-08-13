
#!/usr/bin/env node

import { Command } from 'commander';
import { AuthCommand } from './commands/auth';
import { AgentCommand } from './commands/agent';
import { ProjectCommand } from './commands/project';
import { LLMCommand } from './commands/llm';
import { ConfigCommand } from './commands/config';
import { api } from './services/api';
import { config } from './config';
import chalk from 'chalk';
import ora from 'ora';

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

// Main chat command - talks to ArchMaster
program
  .command('chat <message>')
  .description('Send a message to ArchMaster (manages all 20 agents)')
  .option('-s, --session <sessionId>', 'Continue existing session')
  .action(async (message: string, options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Sending message to ArchMaster...').start();

    try {
      const result = await api.callArchMaster(message, options.session);

      if (result.success) {
        spinner.succeed(chalk.green('Response from ArchMaster:'));
        console.log('\n' + chalk.white(result.data.response));
        
        if (result.data.tokens_used) {
          console.log(chalk.gray(`\nTokens used: ${result.data.tokens_used}`));
        }
        if (result.data.session_id) {
          console.log(chalk.gray(`Session ID: ${result.data.session_id}`));
        }
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

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
