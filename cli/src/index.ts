#!/usr/bin/env node

import { Command } from 'commander';
import { AuthCommand } from './commands/auth';
import { AgentCommand } from './commands/agent';
import { ProjectCommand } from './commands/project';
import { LLMCommand } from './commands/llm';
import { ConfigCommand } from './commands/config';
import { WorkflowCommand } from './commands/workflow';
import { SessionCommand } from './commands/session';
import { MonitoringCommand } from './commands/monitoring';
import { ProductivityCommand } from './commands/productivity';
import { registerSmartShortcuts } from './commands/shortcuts';
import { api } from './services/api';
import { config } from './config';
import { TerminalUtils } from './utils/terminal';
import { historyService } from './services/history';
import chalk from 'chalk';
import ora from 'ora';

const program = new Command();

program
  .name('codexi')
  .description('CodeXI CLI - Multi-agent AI development platform')
  .version('1.0.0');

// Setup terminal controls
TerminalUtils.setupTerminalControls();

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

    const startTime = Date.now();
    const spinner = ora('Sending message to ArchMaster...').start();

    try {
      const result = await api.callArchMaster(message, options.session);

      const executionTime = Date.now() - startTime;

      if (result.success) {
        spinner.succeed(chalk.green('Response from ArchMaster:'));
        console.log('\n' + chalk.white(result.data.response));
        
        if (result.data.tokens_used) {
          console.log(chalk.gray(`\nTokens used: ${result.data.tokens_used}`));
        }
        if (result.data.session_id) {
          console.log(chalk.gray(`Session ID: ${result.data.session_id}`));
        }

        // Log successful command
        await historyService.addCommand({
          command: 'chat',
          args: [message],
          output: result.data.response,
          execution_status: 'success',
          execution_time_ms: executionTime,
          session_id: options.session || result.data.session_id
        });
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
        
        // Log failed command
        await historyService.addCommand({
          command: 'chat',
          args: [message],
          error_message: result.error,
          execution_status: 'error',
          execution_time_ms: executionTime,
          session_id: options.session
        });
      }
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      spinner.fail(chalk.red(`Error: ${error.message}`));
      
      // Log failed command
      await historyService.addCommand({
        command: 'chat',
        args: [message],
        error_message: error.message,
        execution_status: 'error',
        execution_time_ms: executionTime
      });
    }
  });

// Clear screen command
program
  .command('clear')
  .alias('cls')
  .description('Clear terminal screen and show banner')
  .action(() => {
    TerminalUtils.clearScreen();
  });

// Quick help command
program
  .command('help-terminal')
  .description('Show terminal controls and shortcuts')
  .action(() => {
    TerminalUtils.showQuickHelp();
  });

// Register all command groups
program.addCommand(AuthCommand);
program.addCommand(AgentCommand);
program.addCommand(ProjectCommand);
program.addCommand(LLMCommand);
program.addCommand(ConfigCommand);
program.addCommand(WorkflowCommand);
program.addCommand(SessionCommand);
program.addCommand(MonitoringCommand);
program.addCommand(ProductivityCommand);

// Register smart shortcuts (these become top-level commands)
registerSmartShortcuts(program);

// Enhanced error handling with command logging
const originalAction = program.action;
program.action = function(fn) {
  return originalAction.call(this, async (...args) => {
    const startTime = Date.now();
    try {
      await fn(...args);
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      console.error(chalk.red(`Command failed: ${error.message}`));
      
      // Log error for debugging
      await historyService.addCommand({
        command: process.argv[2] || 'unknown',
        args: process.argv.slice(3),
        error_message: error.message,
        execution_status: 'error',
        execution_time_ms: executionTime
      });
    }
  });
};

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error);
  process.exit(1);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n⚠️  Operation cancelled by user'));
  console.log(chalk.blue('👋 Goodbye!'));
  process.exit(0);
});

// Handle terminal resize
process.on('SIGWINCH', () => {
  // Terminal was resized - could trigger UI updates for monitoring
});

program.parse();
