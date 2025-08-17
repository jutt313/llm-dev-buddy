
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
  .description('Chat with ArchMaster (Agent #11), the enterprise architecture and system design agent')
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
  .description('Analyze and optimize build performance with BuildOptimizer (Agent #9)')
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
  .description('Perform comprehensive accessibility analysis with AccessibilityChampion (Agent #10)')
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

// List available agents command
agentCommand
  .command('list')
  .description('List all available agents in the system')
  .action(async () => {
    terminal.showSpinner('Fetching agent registry...');
    
    try {
      const response = await api.getAgentRegistry();
      
      if (response.success) {
        terminal.hideSpinner();
        const agents = response.data;
        
        console.log(chalk.cyan('\n🤖 Available Agents:\n'));
        
        if (agents.length === 0) {
          console.log(chalk.yellow('No agents are currently registered in the system.'));
          return;
        }
        
        // Group agents by team
        const agentsByTeam: Record<string, any[]> = {};
        agents.forEach((agent: any) => {
          const teamKey = `Team ${agent.team_number}: ${agent.team_name}`;
          if (!agentsByTeam[teamKey]) {
            agentsByTeam[teamKey] = [];
          }
          agentsByTeam[teamKey].push(agent);
        });
        
        Object.entries(agentsByTeam).forEach(([teamName, teamAgents]) => {
          console.log(chalk.blue(`\n${teamName}`));
          console.log(chalk.blue('='.repeat(teamName.length)));
          
          teamAgents.forEach((agent: any) => {
            const statusIcon = agent.is_active && agent.is_built ? '✅' : agent.is_built ? '⚠️ ' : '❌';
            console.log(`${statusIcon} Agent #${agent.agent_number}: ${chalk.white(agent.agent_name)}`);
            console.log(`   ${chalk.gray(agent.basic_role)}`);
            console.log(`   Status: ${agent.is_active && agent.is_built ? chalk.green('Active') : agent.is_built ? chalk.yellow('Built but Inactive') : chalk.red('Not Built')}`);
            console.log('');
          });
        });
        
        console.log(chalk.gray(`\nTotal: ${agents.length} agents registered`));
        console.log(chalk.gray('Use "codexi agent call <agent-number> <task>" to interact with an agent'));
        
      } else {
        terminal.hideSpinner();
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }
    } catch (error: any) {
      terminal.hideSpinner();
      console.error(chalk.red(`Failed to fetch agent registry: ${error.message}`));
      process.exit(1);
    }
  });

// Generic agent command for other agents
agentCommand
  .command('call')
  .description('Call a specific agent by number')
  .argument('<agent-id>', 'Agent ID number')
  .argument '<task>', 'Task description')
  .option('-s, --session <id>', 'Session ID for conversation continuity')
  .option('--context <context>', 'Additional context as JSON string')
  .action(async (agentId: string, task: string, options: any) => {
    const sessionId = options.session || agentCommand.opts().session;
    const agentNumber = parseInt(agentId);
    
    if (isNaN(agentNumber)) {
      console.error(chalk.red('Agent ID must be a number'));
      process.exit(1);
    }
    
    terminal.showSpinner(`Agent #${agentNumber} is processing your request...`);
    
    try {
      const context = options.context ? JSON.parse(options.context) : undefined;
      const response = await api.callAgent(agentNumber, task, sessionId, context);
      
      if (response.success) {
        terminal.hideSpinner();
        console.log(chalk.cyan(`\n🤖 Agent #${agentNumber} Response:`));
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
      console.error(chalk.red(`Failed to communicate with Agent #${agentNumber}: ${error.message}`));
      process.exit(1);
    }
  });
