
import { Command } from 'commander';
import { config } from '../config';
import { api } from '../services/api';
import chalk from 'chalk';
import ora from 'ora';
import { table } from 'table';

export const SessionCommand = new Command('session')
  .description('Session and history management commands');

// View command history
SessionCommand
  .command('history')
  .description('View past CLI commands and chat sessions')
  .option('-l, --limit <number>', 'Limit number of results', '20')
  .option('-s, --search <term>', 'Search in command history')
  .action(async (options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Fetching command history...').start();
    
    const message = `Retrieve my CLI command history${options.search ? ` filtered by search term: "${options.search}"` : ''}, limited to ${options.limit} entries. Show command, execution time, status, and results in a formatted table.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green('Command history:'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Repeat command by ID
SessionCommand
  .command('repeat <id>')
  .description('Re-run a previous command by its index')
  .action(async (id: string) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora(`Repeating command #${id}...`).start();
    
    const message = `Retrieve and re-execute the command with ID or index ${id} from my command history. Show the original command and execute it with the same parameters.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green(`Command #${id} repeated:`));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Resume session
SessionCommand
  .command('resume [sessionId]')
  .description('Resume a paused multi-turn session')
  .action(async (sessionId?: string) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Resuming session...').start();
    
    const message = sessionId 
      ? `Resume the conversation session with ID ${sessionId}. Restore the context and continue from where we left off.`
      : `Resume my most recent active conversation session. Show available sessions if multiple are active.`;

    try {
      const result = await api.callArchMaster(message, sessionId);
      
      if (result.success) {
        spinner.succeed(chalk.green('Session resumed:'));
        console.log('\n' + chalk.white(result.data.response));
        
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

// List sessions
SessionCommand
  .command('list')
  .description('List all active and recent sessions')
  .action(async () => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Fetching sessions...').start();
    
    const message = "List all my active and recent conversation sessions with their IDs, status, last activity time, and session titles. Show them in a formatted table.";

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green('Active sessions:'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Clear history
SessionCommand
  .command('clear')
  .description('Clear session history')
  .option('--all', 'Clear all history including active sessions')
  .action(async (options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Clearing session history...').start();
    
    const message = `Clear my session history${options.all ? ' including all active sessions' : ' but keep active sessions'}. Confirm the cleanup and show statistics of cleared data.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green('History cleared:'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });
