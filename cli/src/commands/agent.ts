
import { Command } from 'commander';
import { config } from '../config';
import { api } from '../services/api';
import { terminal } from '../utils/terminal';
import chalk from 'chalk';

export const agentCommand = new Command()
  .name('agent')
  .description('Interact with CodeXI AI agents')
  .option('-s, --session <id>', 'Session ID for conversation continuity');

// ArchMaster agent command
agentCommand
  .command('archmaster')
  .description('Chat with ArchMaster, the enterprise architecture and system design agent')
  .argument('<message>', 'Message to send to ArchMaster')
  .option('-s, --session <id>', 'Session ID for conversation continuity')
  .action(async (message: string, options: any) => {
    const sessionId = options.session || agentCommand.opts().session;
    
    terminal.showSpinner('ArchMaster is analyzing your architecture requirements...');
    
    try {
      const response = await api.callArchMaster(message, sessionId);
      
      if (response.success) {
        terminal.hideSpinner();
        console.log(chalk.cyan('\n🏗️  ArchMaster Response:'));
        console.log(chalk.white(response.data.analysis));
        
        if (response.data.session_id) {
          console.log(chalk.gray(`\nSession ID: ${response.data.session_id}`));
          console.log(chalk.gray('Use --session flag to continue this conversation'));
        }
      } else {
        terminal.hideSpinner();
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }
    } catch (error: any) {
      terminal.hideSpinner();
      console.error(chalk.red(`Failed to communicate with ArchMaster: ${error.message}`));
      process.exit(1);
    }
  });

// Build analysis command for BuildOptimizer (Agent #9)
agentCommand
  .command('build-analysis')
  .description('Analyze and optimize build performance with BuildOptimizer')
  .argument('<task>', 'Build optimization task description')
  .option('-s, --session <id>', 'Session ID for conversation continuity')
  .option('--context <context>', 'Additional context for build analysis')
  .action(async (task: string, options: any) => {
    const sessionId = options.session || agentCommand.opts().session;
    
    terminal.showSpinner('BuildOptimizer is analyzing your build performance...');
    
    try {
      const context = options.context ? JSON.parse(options.context) : undefined;
      const response = await api.callAgent(9, task, sessionId, context);
      
      if (response.success) {
        terminal.hideSpinner();
        console.log(chalk.cyan('\n⚡ BuildOptimizer Analysis:'));
        console.log(chalk.white(response.data.analysis));
        
        if (response.data.optimization_results) {
          console.log(chalk.green('\n📊 Optimization Results:'));
          const results = response.data.optimization_results;
          console.log(chalk.white(`Build Speed: ${results.build_speed_improvement}`));
          console.log(chalk.white(`Bundle Size: ${results.bundle_size_reduction}`));
          console.log(chalk.white(`Cache Efficiency: ${results.cache_efficiency}`));
        }
        
        if (response.data.recommendations && response.data.recommendations.length > 0) {
          console.log(chalk.yellow('\n💡 Recommendations:'));
          response.data.recommendations.forEach((rec: string, index: number) => {
            console.log(chalk.white(`${index + 1}. ${rec}`));
          });
        }
        
        if (response.data.session_id) {
          console.log(chalk.gray(`\nSession ID: ${response.data.session_id}`));
        }
      } else {
        terminal.hideSpinner();
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }
    } catch (error: any) {
      terminal.hideSpinner();
      console.error(chalk.red(`Failed to communicate with BuildOptimizer: ${error.message}`));
      process.exit(1);
    }
  });

// Accessibility audit command for AccessibilityChampion (Agent #10)
agentCommand
  .command('accessibility-audit')
  .description('Perform comprehensive accessibility analysis with AccessibilityChampion')
  .argument('<task>', 'Accessibility audit task description')
  .option('-s, --session <id>', 'Session ID for conversation continuity')
  .option('--context <context>', 'Additional context for accessibility analysis')
  .action(async (task: string, options: any) => {
    const sessionId = options.session || agentCommand.opts().session;
    
    terminal.showSpinner('AccessibilityChampion is performing comprehensive accessibility analysis...');
    
    try {
      const context = options.context ? JSON.parse(options.context) : undefined;
      const response = await api.callAgent(10, task, sessionId, context);
      
      if (response.success) {
        terminal.hideSpinner();
        console.log(chalk.cyan('\n♿ AccessibilityChampion Analysis:'));
        console.log(chalk.white(response.data.analysis));
        
        if (response.data.accessibility_analysis) {
          console.log(chalk.green('\n📊 Accessibility Metrics:'));
          const analysis = response.data.accessibility_analysis;
          console.log(chalk.white(`WCAG Compliance: ${analysis.wcag_compliance.score}%`));
          console.log(chalk.white(`Screen Reader Compatibility: ${analysis.assistive_technology.screen_reader_compatibility}%`));
          console.log(chalk.white(`Overall Accessibility Score: ${analysis.compliance_metrics.overall_score}%`));
          console.log(chalk.white(`Legal Compliance: ${analysis.compliance_metrics.legal_compliance_status}`));
        }
        
        if (response.data.recommendations && response.data.recommendations.length > 0) {
          console.log(chalk.yellow('\n💡 Accessibility Recommendations:'));
          response.data.recommendations.forEach((rec: string, index: number) => {
            console.log(chalk.white(`${index + 1}. ${rec}`));
          });
        }
        
        if (response.data.next_steps && response.data.next_steps.length > 0) {
          console.log(chalk.blue('\n🚀 Next Steps:'));
          response.data.next_steps.forEach((step: string, index: number) => {
            console.log(chalk.white(`${index + 1}. ${step}`));
          });
        }
        
        if (response.data.session_id) {
          console.log(chalk.gray(`\nSession ID: ${response.data.session_id}`));
        }
      } else {
        terminal.hideSpinner();
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }
    } catch (error: any) {
      terminal.hideSpinner();
      console.error(chalk.red(`Failed to communicate with AccessibilityChampion: ${error.message}`));
      process.exit(1);
    }
  });

// Generic agent command for other agents
agentCommand
  .command('call')
  .description('Call a specific agent by number')
  .argument('<agent-id>', 'Agent ID number')
  .argument('<task>', 'Task description')
  .option('-s, --session <id>', 'Session ID for conversation continuity')
  .option('--context <context>', 'Additional context as JSON string')
  .action(async (agentId: string, task: string, options: any) => {
    const sessionId = options.session || agentCommand.opts().session;
    const agentNumber = parseInt(agentId);
    
    if (isNaN(agentNumber)) {
      console.error(chalk.red('Agent ID must be a number'));
      process.exit(1);
    }
    
    terminal.showSpinner(`Agent ${agentNumber} is processing your request...`);
    
    try {
      const context = options.context ? JSON.parse(options.context) : undefined;
      const response = await api.callAgent(agentNumber, task, sessionId, context);
      
      if (response.success) {
        terminal.hideSpinner();
        console.log(chalk.cyan(`\n🤖 Agent ${agentNumber} Response:`));
        console.log(chalk.white(response.data.analysis || response.data.response));
        
        if (response.data.session_id) {
          console.log(chalk.gray(`\nSession ID: ${response.data.session_id}`));
        }
      } else {
        terminal.hideSpinner();
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }
    } catch (error: any) {
      terminal.hideSpinner();
      console.error(chalk.red(`Failed to communicate with Agent ${agentNumber}: ${error.message}`));
      process.exit(1);
    }
  });
