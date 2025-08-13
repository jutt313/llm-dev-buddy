
import { Command } from 'commander';
import { config } from '../config';
import { api } from '../services/api';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

export const AuthCommand = new Command('auth')
  .description('Authentication commands');

AuthCommand
  .command('login')
  .description('Login with your CodeXI personal token')
  .option('-t, --token <token>', 'Personal token (CXI_...)')
  .action(async (options) => {
    let token = options.token;

    if (!token) {
      const answers = await inquirer.prompt([
        {
          type: 'password',
          name: 'token',
          message: 'Enter your CodeXI personal token:',
          mask: '*',
          validate: (input) => {
            if (!input.startsWith('CXI_')) {
              return 'Token must start with CXI_';
            }
            if (input.length !== 36) {
              return 'Token must be exactly 36 characters';
            }
            return true;
          }
        }
      ]);
      token = answers.token;
    }

    const spinner = ora('Validating token...').start();

    try {
      const result = await api.validateToken(token);
      
      if (result.success) {
        config.set('token', token);
        config.set('userId', result.data.user_id);
        spinner.succeed(chalk.green('Successfully authenticated!'));
        console.log(chalk.gray(`User ID: ${result.data.user_id}`));
        console.log(chalk.gray(`Token: ${token.substring(0, 8)}...`));
      } else {
        spinner.fail(chalk.red(`Authentication failed: ${result.error}`));
        process.exit(1);
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

AuthCommand
  .command('status')
  .description('Check authentication status')
  .action(() => {
    if (config.isAuthenticated()) {
      const token = config.get('token');
      const userId = config.get('userId');
      console.log(chalk.green('✓ Authenticated'));
      console.log(chalk.gray(`Token: ${token?.substring(0, 8)}...`));
      console.log(chalk.gray(`User ID: ${userId}`));
    } else {
      console.log(chalk.red('✗ Not authenticated'));
      console.log(chalk.gray('Run "codexi auth login" to authenticate'));
    }
  });

AuthCommand
  .command('logout')
  .description('Logout and clear stored credentials')
  .action(() => {
    config.delete('token');
    config.delete('userId');
    console.log(chalk.green('Successfully logged out'));
  });
