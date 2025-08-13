import { Command } from 'commander';
import { config } from '../config';
import { api } from '../services/api';
import chalk from 'chalk';
import ora from 'ora';

export const ProductivityCommand = new Command('productivity')
  .description('Productivity enhancement commands');

// Smart shortcuts
ProductivityCommand
  .command('shortcut <shortcut> <command>')
  .description('Create or execute smart shortcuts')
  .option('-s, --save', 'Save this shortcut for future use')
  .option('-l, --list', 'List all saved shortcuts')
  .action(async (shortcut: string, command: string, options: any) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    if (options.save) {
      config.set(`shortcut_${shortcut}`, command);
      console.log(chalk.green(`Shortcut "${shortcut}" saved for command "${command}"`));
    } else if (options.list) {
      const shortcuts = Object.keys(config.getAll())
        .filter(key => key.startsWith('shortcut_'))
        .map(key => ({ shortcut: key.replace('shortcut_', ''), command: config.get(key as any) }));

      if (shortcuts.length === 0) {
        console.log(chalk.yellow('No shortcuts saved.'));
        return;
      }

      console.log(chalk.bold('\nSaved Shortcuts:'));
      shortcuts.forEach(s => {
        console.log(chalk.cyan(`${s.shortcut}:`) + ` ${s.command}`);
      });
    } else {
      const spinner = ora(`Executing shortcut "${shortcut}"...`).start();
      try {
        const result = await api.callArchMaster(command);
        if (result.success) {
          spinner.succeed(chalk.green(`Shortcut "${shortcut}" executed:`));
          console.log('\n' + chalk.white(result.data.response));
        } else {
          spinner.fail(chalk.red(`Error: ${result.error}`));
        }
      } catch (error: any) {
        spinner.fail(chalk.red(`Error: ${error.message}`));
      }
    }
  });

// Task automation
ProductivityCommand
  .command('automate <task>')
  .description('Automate a complex task using AI agents')
  .option('-p, --priority <level>', 'Task priority (high, medium, low)', 'medium')
  .option('-d, --deadline <date>', 'Task deadline (YYYY-MM-DD)')
  .action(async (task: string, options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Automating task...').start();
    
    const message = `Automate the task: "${task}" with priority ${options.priority} and deadline ${options.deadline}. Use appropriate AI agents to complete the task efficiently.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green('Task automation started:'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Code generation
ProductivityCommand
  .command('generate <description>')
  .description('Generate code based on a description')
  .option('-l, --language <lang>', 'Target programming language', 'javascript')
  .option('-f, --framework <name>', 'Target framework (React, Angular, Vue)', 'React')
  .action(async (description: string, options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Generating code...').start();
    
    const message = `Generate code for: "${description}" in ${options.language} using ${options.framework} framework. Provide clean, well-documented, and efficient code.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green('Code generated:'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });

// Documentation generation
ProductivityCommand
  .command('document <source>')
  .description('Generate documentation for a code source')
  .option('-t, --type <format>', 'Documentation format (markdown, html)', 'markdown')
  .action(async (source: string, options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Generating documentation...').start();
    
    const message = `Generate documentation for the code source: "${source}" in ${options.type} format. Include clear explanations, examples, and API references.`;

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

// Meeting scheduler
ProductivityCommand
  .command('schedule <participants>')
  .description('Schedule a meeting with participants')
  .option('-d, --duration <minutes>', 'Meeting duration in minutes', '30')
  .option('-t, --title <name>', 'Meeting title')
  .action(async (participants: string, options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Scheduling meeting...').start();
    
    const message = `Schedule a meeting with participants: "${participants}" for ${options.duration} minutes with title: "${options.title || 'Meeting'}". Find an optimal time slot considering everyone's availability.`;

    try {
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        spinner.succeed(chalk.green('Meeting scheduled:'));
        console.log('\n' + chalk.white(result.data.response));
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });
