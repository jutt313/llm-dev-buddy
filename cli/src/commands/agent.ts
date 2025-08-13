
import { Command } from 'commander';
import { config } from '../config';
import { api } from '../services/api';
import chalk from 'chalk';
import ora from 'ora';
import { table } from 'table';

export const AgentCommand = new Command('agent')
  .description('Agent management commands');

const AGENTS = {
  1: { name: 'CodeArchitect', team: 'Development Hub', role: 'System design & architecture' },
  2: { name: 'FrontendMaster', team: 'Development Hub', role: 'UI/UX & component design' },
  3: { name: 'BackendForge', team: 'Development Hub', role: 'APIs & integrations' },
  4: { name: 'DebugWizard', team: 'Development Hub', role: 'Debugging & optimization' },
  5: { name: 'DocCrafter', team: 'Content & QA Hub', role: 'Documentation' },
  6: { name: 'TestSentinel', team: 'Content & QA Hub', role: 'QA & automated tests' },
  7: { name: 'ConfigMaster', team: 'Content & QA Hub', role: 'Configurations & deployment scripts' },
  8: { name: 'DataDesigner', team: 'Content & QA Hub', role: 'Database modeling' },
  9: { name: 'SecurityGuard', team: 'Security & Integration Hub', role: 'Vulnerability scanning' },
  10: { name: 'APIConnector', team: 'Security & Integration Hub', role: 'Third-party APIs' },
  11: { name: 'CloudOps', team: 'Security & Integration Hub', role: 'Infrastructure & CI/CD' },
  12: { name: 'PerformanceOptimizer', team: 'Security & Integration Hub', role: 'Performance tuning' },
  13: { name: 'ProjectAnalyzer', team: 'Support & Analytics Hub', role: 'Project analysis' },
  14: { name: 'ResourceManager', team: 'Support & Analytics Hub', role: 'Assets & repository organization' },
  15: { name: 'MonitoringAgent', team: 'Support & Analytics Hub', role: 'Logging & alerts' },
  16: { name: 'MigrationSpecialist', team: 'Support & Analytics Hub', role: 'Data/system migrations' },
  17: { name: 'CustomAgentBuilder', team: 'Custom & Simulation Hub', role: 'Creates specialized agents' },
  18: { name: 'SimulationEngine', team: 'Custom & Simulation Hub', role: 'Testing & sandbox simulations' },
  19: { name: 'ValidationCore', team: 'Custom & Simulation Hub', role: 'QA, validation, strategic feedback' },
  20: { name: 'ArchMaster', team: 'Management', role: 'Supreme Manager Agent' }
};

AgentCommand
  .command('list')
  .description('List all available agents')
  .action(() => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const data = [
      ['ID', 'Name', 'Team', 'Role']
    ];

    Object.entries(AGENTS).forEach(([id, agent]) => {
      data.push([
        chalk.cyan(`#${id}`),
        chalk.bold(agent.name),
        chalk.gray(agent.team),
        agent.role
      ]);
    });

    console.log('\n' + table(data, {
      border: {
        topBody: '─',
        topJoin: '┬',
        topLeft: '┌',
        topRight: '┐',
        bottomBody: '─',
        bottomJoin: '┴',
        bottomLeft: '└',
        bottomRight: '┘',
        bodyLeft: '│',
        bodyRight: '│',
        bodyJoin: '│',
        joinBody: '─',
        joinLeft: '├',
        joinRight: '┤',
        joinJoin: '┼'
      }
    }));
  });

AgentCommand
  .command('chat <agent-id> <message>')
  .description('Send a message to a specific agent')
  .option('-c, --context <context>', 'Additional context for the agent')
  .action(async (agentId: string, message: string, options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const id = parseInt(agentId);
    if (isNaN(id) || id < 1 || id > 20) {
      console.log(chalk.red('Invalid agent ID. Use 1-20.'));
      return;
    }

    const agent = AGENTS[id as keyof typeof AGENTS];
    const spinner = ora(`Sending message to ${chalk.bold(agent.name)}...`).start();

    try {
      let result;
      if (id === 20) {
        // ArchMaster
        result = await api.callArchMaster(message);
      } else {
        // Individual agent
        result = await api.callAgent(id, message, options.context);
      }

      if (result.success) {
        spinner.succeed(chalk.green(`Response from ${chalk.bold(agent.name)}:`));
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

AgentCommand
  .command('archmaster <message>')
  .description('Send a task to ArchMaster for delegation')
  .action(async (message: string) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Sending task to ArchMaster...').start();

    try {
      const result = await api.callArchMaster(message);

      if (result.success) {
        spinner.succeed(chalk.green('Response from ArchMaster:'));
        console.log('\n' + chalk.white(result.data.response));
        
        if (result.data.tokens_used) {
          console.log(chalk.gray(`\nTokens used: ${result.data.tokens_used}`));
        }
        if (result.data.session_id) {
          console.log(chalk.gray(`Session ID: ${result.data.session_id}`));
        }
      } else {
        spinner.fail(chalk.red(`Error: ${result.error}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
    }
  });
