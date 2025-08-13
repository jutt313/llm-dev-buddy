
import { Command } from 'commander';
import { config } from '../config';
import { api } from '../services/api';
import chalk from 'chalk';
import ora from 'ora';

export const MonitoringCommand = new Command('monitoring')
  .description('Debug and monitoring commands');

// Real-time monitoring
MonitoringCommand
  .command('monitor')
  .description('View active agent tasks in real-time')
  .option('-a, --agent <name>', 'Monitor specific agent')
  .option('-r, --refresh <seconds>', 'Refresh interval in seconds', '5')
  .action(async (options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Starting real-time monitoring...').start();
    
    const message = `Start real-time monitoring of ${options.agent ? `${options.agent} agent` : 'all active agents'}. Show current tasks, queue status, performance metrics, and system health. Refresh every ${options.refresh} seconds and display in a dashboard format.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green('Monitoring started:'));
        console.log('\n' + chalk.white(result.data.response));
        console.log(chalk.gray(`\nMonitoring ${options.agent || 'all agents'} - Press Ctrl+C to stop`));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Fetch logs
MonitoringCommand
  .command('logs <agent>')
  .description('Fetch recent logs for a specific agent')
  .option('-l, --lines <number>', 'Number of log lines to fetch', '50')
  .option('-f, --follow', 'Follow logs in real-time')
  .option('--level <level>', 'Log level filter (error, warn, info, debug)', 'info')
  .action(async (agent: string, options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora(`Fetching logs for ${agent} agent...`).start();
    
    const message = `Retrieve the last ${options.lines} log entries for ${agent} agent${options.level !== 'info' ? ` filtered by ${options.level} level` : ''}${options.follow ? ' and start following new logs in real-time' : ''}. Format the logs with timestamps, severity levels, and messages.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green(`Logs for ${agent}:`));
        console.log('\n' + chalk.white(result.data.response));
        
        if (options.follow) {
          console.log(chalk.gray(`\nFollowing logs for ${agent} - Press Ctrl+C to stop`));
        }
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Retry failed task
MonitoringCommand
  .command('retry <taskId>')
  .description('Retry a failed task without retyping everything')
  .option('-f, --force', 'Force retry even if task is not in failed state')
  .action(async (taskId: string, options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora(`Retrying task ${taskId}...`).start();
    
    const message = `Retry the failed task with ID ${taskId}${options.force ? ' (forcing retry even if not failed)' : ''}. Retrieve the original task parameters and re-execute with the same configuration. Show the retry status and results.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green(`Task ${taskId} retried:`));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// System status
MonitoringCommand
  .command('status')
  .description('Show overall system status')
  .action(async () => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Checking system status...').start();
    
    const message = "Show comprehensive system status including all 20 agents' availability, current workload, recent performance metrics, system health indicators, and any alerts or issues. Display in a structured dashboard format.";

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green('System status:'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Health check
MonitoringCommand
  .command('health')
  .description('Perform comprehensive system health check')
  .option('--deep', 'Perform deep health analysis')
  .action(async (options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Performing health check...').start();
    
    const message = `Perform ${options.deep ? 'deep ' : ''}system health check. Test all agent connectivity, LLM provider status, database connections, API endpoints, and system resources. Provide health scores, identify bottlenecks, and suggest optimizations.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green('Health check completed:'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });
