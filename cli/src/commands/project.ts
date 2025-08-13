
import { Command } from 'commander';
import { config } from '../config';
import { api } from '../services/api';
import chalk from 'chalk';
import ora from 'ora';

export const ProjectCommand = new Command('project')
  .description('Project management commands');

ProjectCommand
  .command('init')
  .description('Initialize a new CodeXI project')
  .option('-n, --name <name>', 'Project name')
  .option('-d, --description <description>', 'Project description')
  .action(async (options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const projectName = options.name || 'New CodeXI Project';
    const projectDescription = options.description || 'A project managed by CodeXI agents';

    const spinner = ora('Initializing project with ArchMaster...').start();

    try {
      const message = `Initialize a new project called "${projectName}" with description: "${projectDescription}". Set up the basic project structure and configuration.`;
      
      const result = await api.callArchMaster(message);

      if (result.success) {
        spinner.succeed(chalk.green('Project initialized successfully!'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

ProjectCommand
  .command('deploy')
  .description('Deploy project using CloudOps agent')
  .option('-e, --environment <env>', 'Target environment (dev/staging/prod)', 'dev')
  .action(async (options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora(`Deploying to ${options.environment} environment...`).start();

    try {
      const task = `Deploy the current project to ${options.environment} environment. Ensure proper CI/CD pipeline setup and deployment verification.`;
      
      const result = await api.callAgent(11, task); // CloudOps agent

      if (result.success) {
        spinner.succeed(chalk.green('Deployment completed successfully!'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

ProjectCommand
  .command('analyze')
  .description('Analyze project with ProjectAnalyzer agent')
  .action(async () => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Analyzing project...').start();

    try {
      const task = 'Analyze the current project structure, dependencies, and provide recommendations for improvements, optimizations, and best practices.';
      
      const result = await api.callAgent(13, task); // ProjectAnalyzer agent

      if (result.success) {
        spinner.succeed(chalk.green('Project analysis completed!'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });
