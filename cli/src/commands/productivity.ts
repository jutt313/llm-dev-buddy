
import { Command } from 'commander';
import { config } from '../config';
import { api } from '../services/api';
import chalk from 'chalk';
import ora from 'ora';

export const ProductivityCommand = new Command('productivity')
  .description('Productivity boosters and automation');

// Set custom alias
ProductivityCommand
  .command('alias')
  .description('Manage custom CLI shortcuts')
  .addCommand(
    new Command('set')
      .argument('<shortcut>', 'Alias shortcut name')
      .argument('<command>', 'Full command to execute')
      .option('-d, --description <desc>', 'Alias description')
      .description('Create a custom CLI shortcut')
      .action(async (shortcut: string, command: string, options) => {
        if (!config.isAuthenticated()) {
          console.log(chalk.red('Please login first: codexi auth login'));
          return;
        }

        const spinner = ora(`Creating alias "${shortcut}"...`).start();
        
        const message = `Create a custom CLI alias "${shortcut}" that executes the command "${command}"${options.description ? ` with description: "${options.description}"` : ''}. Store this alias in my personal shortcuts and confirm the creation.`;

        try {
          const result = await api.callArchMaster(message);
          
          if (result.success) {
            spinner.succeed(chalk.green(`Alias "${shortcut}" created successfully:`));
            console.log('\n' + chalk.white(result.data.response));
          } else {
            spinner.fail(chalk.red(`Error: ${result.error}`));
          }
        } catch (error: any) {
          spinner.fail(chalk.red(`Error: ${error.message}`));
        }
      })
  )
  .addCommand(
    new Command('list')
      .description('List all custom aliases')
      .action(async () => {
        if (!config.isAuthenticated()) {
          console.log(chalk.red('Please login first: codexi auth login'));
          return;
        }

        const spinner = ora('Fetching custom aliases...').start();
        
        const message = "List all my custom CLI aliases with their shortcuts, commands, descriptions, and usage statistics. Display in a formatted table.";

        try {
          const result = await api.callArchMaster(message);
          
          if (result.success) {
            spinner.succeed(chalk.green('Custom aliases:'));
            console.log('\n' + chalk.white(result.data.response));
          } else {
            spinner.fail(chalk.red(`Error: ${result.error}`));
          }
        } catch (error: any) {
          spinner.fail(chalk.red(`Error: ${error.message}`));
        }
      })
  );

// Stream responses
ProductivityCommand
  .command('stream <task>')
  .description('Stream responses from agents in real-time')
  .option('-a, --agent <name>', 'Target specific agent')
  .action(async (task: string, options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    console.log(chalk.blue(`🔄 Streaming task: "${task}"`));
    console.log(chalk.gray('─'.repeat(50)));
    
    const message = `Execute the following task with real-time streaming response${options.agent ? ` using ${options.agent} agent` : ''}: "${task}". Provide live updates and progress indicators as the task is processed.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        console.log('\n' + chalk.green('✅ Task completed:'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        console.log('\n' + chalk.red(`❌ Error: ${result.error}`));
      }
    } catch (error: any) {
      console.log('\n' + chalk.red(`❌ Error: ${error.message}`));
    }
  });

// Quick help
ProductivityCommand
  .command('help-quick')
  .description('Show a one-line cheat sheet of all commands')
  .action(() => {
    console.log(chalk.cyan('\n📋 CodeXI CLI Quick Reference:'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const quickCommands = [
      'codexi chat "<message>" - Chat with ArchMaster',
      'codexi workflow init - Initialize new project',
      'codexi workflow docs - Generate documentation',
      'codexi workflow build - Build project',
      'codexi workflow test - Run tests',
      'codexi session history - View command history',
      'codexi session resume - Resume last session',
      'codexi monitoring status - Check system status',
      'codexi monitoring logs <agent> - View agent logs',
      'codexi productivity stream "<task>" - Stream task execution',
      'codexi agent list - List all agents',
      'codexi llm use <provider> - Switch LLM provider',
      'codexi config show - Show configuration',
      'codexi auth login - Authenticate with token'
    ];

    quickCommands.forEach(cmd => {
      const [command, description] = cmd.split(' - ');
      console.log(`${chalk.green(command.padEnd(35))} ${chalk.white(description)}`);
    });

    console.log(chalk.gray('\n💡 Use "codexi <command> --help" for detailed options'));
    console.log(chalk.gray('🔄 Ctrl+C: Cancel | Ctrl+L: Clear | Ctrl+D: Exit | ↑↓: History'));
  });

// Project templates
ProductivityCommand
  .command('template <type>')
  .description('Generate project templates')
  .option('-n, --name <name>', 'Template name')
  .option('-f, --framework <framework>', 'Specific framework/library')
  .action(async (type: string, options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora(`Generating ${type} project template...`).start();
    
    const message = `Generate a complete ${type} project template${options.name ? ` named "${options.name}"` : ''}${options.framework ? ` using ${options.framework} framework` : ''}. Include project structure, configuration files, dependencies, boilerplate code, documentation, and setup instructions. Use appropriate agents for comprehensive template creation.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green(`${type} template generated:`));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Workflow presets
ProductivityCommand
  .command('workflow-preset <preset>')
  .description('Execute predefined workflow presets')
  .option('-p, --params <params>', 'Workflow parameters (JSON format)')
  .action(async (preset: string, options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora(`Executing ${preset} workflow preset...`).start();
    
    const message = `Execute the predefined "${preset}" workflow preset${options.params ? ` with parameters: ${options.params}` : ''}. This should trigger a series of coordinated actions across multiple agents to complete a common development workflow efficiently.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green(`${preset} workflow completed:`));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });
