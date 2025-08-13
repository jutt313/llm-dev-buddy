
import { Command } from 'commander';
import { config } from '../config';
import chalk from 'chalk';

export const LLMCommand = new Command('llm')
  .description('LLM management commands');

LLMCommand
  .command('status')
  .description('Show current LLM configuration')
  .action(() => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const defaultLLM = config.get('defaultLLM') || 'codexi (OpenAI GPT-4o-mini)';
    console.log(chalk.green('Current LLM Configuration:'));
    console.log(chalk.gray(`Default LLM: ${defaultLLM}`));
    console.log(chalk.gray('Note: LLM credentials are managed through the web interface'));
  });

LLMCommand
  .command('use <provider>')
  .description('Set default LLM provider')
  .action((provider: string) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    config.set('defaultLLM', provider);
    console.log(chalk.green(`Default LLM set to: ${provider}`));
    console.log(chalk.gray('This will be used for future agent interactions'));
  });
