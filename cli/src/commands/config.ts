
import { Command } from 'commander';
import { config } from '../config';
import chalk from 'chalk';
import { table } from 'table';

export const ConfigCommand = new Command('config')
  .description('Configuration management commands');

ConfigCommand
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const currentConfig = config.getAll();
    
    const data = [
      ['Setting', 'Value'],
      ['Base URL', currentConfig.baseUrl || 'Not set'],
      ['Authenticated', config.isAuthenticated() ? chalk.green('Yes') : chalk.red('No')],
      ['User ID', currentConfig.userId || 'Not set'],
      ['Default LLM', currentConfig.defaultLLM || 'codexi (default)'],
      ['Last Sync', currentConfig.lastSync || 'Never']
    ];

    console.log('\n' + table(data, {
      border: {
        topBody: '─',
        topJoin: '┬',
        topLeft: '┌',
        topRight: '┐',
        bottomBody: '─',
        bottomJoin: '┴',
        bottomLeft: '└',
        bottomRight: '┘',
        bodyLeft: '│',
        bodyRight: '│',
        bodyJoin: '│',
        joinBody: '─',
        joinLeft: '├',
        joinRight: '┤',
        joinJoin: '┼'
      }
    }));
  });

ConfigCommand
  .command('reset')
  .description('Reset all configuration')
  .action(() => {
    config.clear();
    console.log(chalk.green('Configuration reset successfully'));
    console.log(chalk.gray('You will need to login again'));
  });

ConfigCommand
  .command('set <key> <value>')
  .description('Set a configuration value')
  .action((key: string, value: string) => {
    config.set(key as any, value);
    console.log(chalk.green(`Set ${key} = ${value}`));
  });
