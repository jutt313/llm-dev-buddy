
import { Command } from 'commander';
import { config } from '../config';
import { api } from '../services/api';
import chalk from 'chalk';
import ora from 'ora';

export const WorkflowCommand = new Command('workflow')
  .description('Project workflow and management commands');

// Project initialization
WorkflowCommand
  .command('init')
  .description('Initialize a new CodeXI project')
  .option('-n, --name <name>', 'Project name')
  .option('-d, --description <description>', 'Project description')
  .option('-t, --type <type>', 'Project type (web, mobile, api, etc.)', 'web')
  .action(async (options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Initializing new CodeXI project...').start();
    
    const message = `Initialize a new ${options.type} project${options.name ? ` named "${options.name}"` : ''}${options.description ? ` with description: "${options.description}"` : ''}. Set up the complete project structure, dependencies, configuration files, and development environment. Provide step-by-step setup instructions and best practices for this project type.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green('Project initialization plan ready:'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Project sync
WorkflowCommand
  .command('sync')
  .description('Sync project state across all agents')
  .action(async () => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Syncing project state across agents...').start();
    
    const message = "Analyze the current project structure, dependencies, and configuration. Synchronize the project state across all 20 agents and ensure they have up-to-date context about the codebase, architecture, and current development status. Provide a sync report.";

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green('Project sync completed:'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Project cleanup
WorkflowCommand
  .command('clean')
  .description('Clean temporary files and reset workspace')
  .option('--deep', 'Perform deep cleanup including dependencies')
  .action(async (options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Cleaning project workspace...').start();
    
    const message = `Clean the project workspace by removing temporary files, build artifacts, cache directories, and unused dependencies${options.deep ? '. Perform a deep cleanup including node_modules, package-lock files, and rebuild from scratch' : ''}. Provide a list of cleaned items and optimization suggestions.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green('Project cleanup completed:'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Documentation generation
WorkflowCommand
  .command('docs')
  .description('Generate comprehensive project documentation')
  .option('-t, --type <type>', 'Documentation type (api, readme, full)', 'full')
  .action(async (options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Generating project documentation...').start();
    
    const message = `Generate comprehensive ${options.type} documentation for this project. Include API documentation, README files, code comments, architecture diagrams, setup instructions, usage examples, and deployment guides. Use DocCrafter agent to create professional, well-structured documentation with proper formatting and examples.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green('Documentation generated:'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Build project
WorkflowCommand
  .command('build')
  .description('Build project using appropriate agents')
  .option('-e, --env <environment>', 'Build environment (dev, staging, prod)', 'prod')
  .action(async (options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora(`Building project for ${options.env} environment...`).start();
    
    const message = `Build the project for ${options.env} environment. Use BackendForge, FrontendMaster, and CloudOps agents to compile, optimize, and package the application. Include build optimization, testing, and deployment preparation. Provide build status and any optimization recommendations.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green('Build completed:'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Run tests
WorkflowCommand
  .command('test')
  .description('Run comprehensive tests using TestSentinel')
  .option('-t, --type <type>', 'Test type (unit, integration, e2e, all)', 'all')
  .option('-c, --coverage', 'Generate coverage report')
  .action(async (options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora(`Running ${options.type} tests...`).start();
    
    const message = `Run ${options.type} tests using TestSentinel agent. Execute comprehensive testing including unit tests, integration tests, and end-to-end testing${options.coverage ? ' with detailed coverage reports' : ''}. Provide test results, coverage statistics, and recommendations for improving test quality.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green('Tests completed:'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });
