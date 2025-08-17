
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

    const spinner = ora('Initializing project with ArchMaster (Agent #11)...').start();

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
  .description('Deploy project - Note: CloudOps agent is not yet implemented')
  .option('-e, --environment <env>', 'Target environment (dev/staging/prod)', 'dev')
  .action(async (options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    console.log(chalk.yellow('Note: CloudOps agent deployment is not yet implemented.'));
    console.log(chalk.gray('Available agents for deployment assistance:'));
    console.log(chalk.gray('- Agent #9: BuildOptimizer (build optimization)'));
    console.log(chalk.gray('- Agent #11: ArchMaster (architecture guidance)'));
    console.log(chalk.gray('\nUse: codexi agent call <agent-number> "help with deployment to ' + options.environment + '"'));
  });

ProjectCommand
  .command('analyze')
  .description('Analyze project - Note: ProjectAnalyzer agent is not yet implemented')
  .action(async () => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    console.log(chalk.yellow('Note: ProjectAnalyzer agent is not yet implemented.'));
    console.log(chalk.gray('Available agents for project analysis:'));
    console.log(chalk.gray('- Agent #3: CodeArchitect (system architecture)'));
    console.log(chalk.gray('- Agent #4: DebugWizard (performance debugging)'));
    console.log(chalk.gray('- Agent #11: ArchMaster (comprehensive analysis)'));
    console.log(chalk.gray('\nUse: codexi agent call <agent-number> "analyze my project"'));
  });
