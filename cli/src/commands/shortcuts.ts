
import { Command } from 'commander';
import { config } from '../config';
import { api } from '../services/api';
import chalk from 'chalk';
import ora from 'ora';

// Smart command shortcuts with automatic translation to full ArchMaster instructions
export const registerSmartShortcuts = (program: Command) => {
  // Smart shortcuts that auto-expand to detailed instructions
  const smartCommands = [
    {
      name: 'docs',
      description: 'Generate comprehensive documentation',
      expand: 'Generate comprehensive documentation for this project including API docs, README files, code comments, architecture diagrams, setup instructions, usage examples, and deployment guides. Use DocCrafter agent to create professional, well-structured documentation with proper formatting and examples.'
    },
    {
      name: 'optimize',
      description: 'Optimize project performance and code quality',
      expand: 'Analyze and optimize the project for performance, code quality, and best practices. Use PerformanceOptimizer agent to identify bottlenecks, DebugWizard to clean up code issues, and SecurityGuard to ensure security compliance. Provide detailed optimization recommendations and implement improvements.'
    },
    {
      name: 'deploy',
      description: 'Deploy project using CloudOps agent',
      expand: 'Deploy the project using CloudOps agent. Set up CI/CD pipeline, configure deployment environments, ensure proper security measures, and provide deployment status. Include rollback procedures and monitoring setup.'
    },
    {
      name: 'security',
      description: 'Perform comprehensive security audit',
      expand: 'Perform comprehensive security audit using SecurityGuard agent. Scan for vulnerabilities, check dependencies for security issues, review authentication and authorization, validate input sanitization, and provide detailed security recommendations with remediation steps.'
    },
    {
      name: 'refactor',
      description: 'Refactor and improve code structure',
      expand: 'Refactor the codebase to improve structure, readability, and maintainability. Use CodeArchitect for architectural improvements, DebugWizard for code cleanup, and apply best practices. Ensure no functionality is broken and provide refactoring summary.'
    },
    {
      name: 'api',
      description: 'Design and implement API endpoints',
      expand: 'Design and implement RESTful API endpoints using BackendForge agent. Include proper routing, validation, error handling, authentication, rate limiting, and comprehensive API documentation. Follow REST best practices and provide testing examples.'
    },
    {
      name: 'frontend',
      description: 'Create modern frontend components and UI',
      expand: 'Create modern, responsive frontend components and user interface using FrontendMaster agent. Implement modern design patterns, ensure accessibility, optimize for performance, and provide component documentation with usage examples.'
    },
    {
      name: 'database',
      description: 'Design and optimize database schema',
      expand: 'Design and optimize database schema using DataDesigner agent. Create efficient table structures, define relationships, set up indexes for performance, implement data validation, and provide migration scripts with rollback procedures.'
    },
    {
      name: 'migrate',
      description: 'Handle data and system migrations',
      expand: 'Handle data and system migrations using MigrationSpecialist agent. Plan migration strategy, create backup procedures, implement data transformation scripts, validate data integrity, and provide rollback mechanisms.'
    },
    {
      name: 'monitor',
      description: 'Set up monitoring and logging',
      expand: 'Set up comprehensive monitoring, logging, and alerting using MonitoringAgent. Implement application performance monitoring, error tracking, log aggregation, health checks, and alert notifications for system maintenance.'
    }
  ];

  // Register each smart command
  smartCommands.forEach(cmd => {
    program
      .command(cmd.name)
      .description(cmd.description)
      .option('-v, --verbose', 'Show expanded command details')
      .action(async (options) => {
        if (!config.isAuthenticated()) {
          console.log(chalk.red('Please login first: codexi auth login'));
          return;
        }

        if (options.verbose) {
          console.log(chalk.blue(`📝 Expanded command: ${cmd.name}`));
          console.log(chalk.gray('─'.repeat(50)));
          console.log(chalk.white(cmd.expand));
          console.log(chalk.gray('─'.repeat(50)));
        }

        const spinner = ora(`Executing ${cmd.name} workflow...`).start();

        try {
          const result = await api.callArchMaster(cmd.expand);
          
          if (result.success) {
            spinner.succeed(chalk.green(`${cmd.name} completed:`));
            console.log('\n' + chalk.white(result.data.response));
            
            if (result.data.tokens_used) {
              console.log(chalk.gray(`\nTokens used: ${result.data.tokens_used}`));
            }
          } else {
            spinner.fail(chalk.red(`Error: ${result.error}`));
          }
        } catch (error: any) {
          spinner.fail(chalk.red(`Error: ${error.message}`));
        }
      });
  });

  // Quick status command
  program
    .command('status')
    .description('Show quick system and project status')
    .action(async () => {
      if (!config.isAuthenticated()) {
        console.log(chalk.red('Please login first: codexi auth login'));
        return;
      }

      const spinner = ora('Checking status...').start();
      
      const message = "Provide a quick status overview including: current project state, active agents, recent activity, system health, and any pending tasks or issues. Keep it concise and informative.";

      try {
        const result = await api.callArchMaster(message);
        
        if (result.success) {
          spinner.succeed(chalk.green('System Status:'));
          console.log('\n' + chalk.white(result.data.response));
        } else {
          spinner.fail(chalk.red(`Error: ${result.error}`));
        }
      } catch (error: any) {
        spinner.fail(chalk.red(`Error: ${error.message}`));
      }
    });

  // Quick help for shortcuts
  program
    .command('shortcuts')
    .description('Show available smart shortcuts')
    .action(() => {
      console.log(chalk.cyan('\n⚡ Smart Command Shortcuts:'));
      console.log(chalk.gray('─'.repeat(60)));
      
      smartCommands.forEach(cmd => {
        console.log(`${chalk.green(cmd.name.padEnd(15))} ${chalk.white(cmd.description)}`);
      });

      console.log(chalk.gray('\n💡 Use --verbose with any shortcut to see the full expanded command'));
      console.log(chalk.gray('📖 Use "codexi help" for complete command reference'));
    });
};
