
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
  9: { name: 'BuildOptimizer', team: 'Security & Integration Hub', role: 'Build pipeline optimization & performance' },
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
  .description('List all available agents (managed by ArchMaster)')
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

    console.log('\n' + table(data));
    console.log(chalk.yellow('\nNote: All agents are managed by ArchMaster. Use "codexi chat" to interact.'));
  });

// Add BuildOptimizer-specific command for build analysis
AgentCommand
  .command('build-analysis')
  .description('Get build optimization analysis from BuildOptimizer (Agent #9)')
  .option('-f, --frameworks <frameworks>', 'Target frameworks (comma-separated)', 'react,vite,typescript')
  .option('-t, --targets <targets>', 'Build targets (comma-separated)', 'frontend,backend')
  .option('-g, --goals <goals>', 'Performance goals as JSON string', '{"build_time_reduction":"50%","bundle_size_reduction":"30%"}')
  .action(async (options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.red('Please login first: codexi auth login'));
      return;
    }

    const spinner = ora('Analyzing build pipeline with BuildOptimizer...').start();

    try {
      const frameworks = options.frameworks.split(',').map((f: string) => f.trim());
      const targets = options.targets.split(',').map((t: string) => t.trim());
      let goals;
      
      try {
        goals = JSON.parse(options.goals);
      } catch {
        goals = { build_time_reduction: '50%', bundle_size_reduction: '30%' };
      }

      const context = {
        optimization_focus: 'comprehensive',
        build_targets: targets,
        performance_goals: goals,
        frameworks: frameworks,
        ci_cd_platform: 'github_actions'
      };

      const result = await api.callAgent(9, 'Analyze current build pipeline and provide comprehensive optimization recommendations with performance metrics and implementation steps', undefined, context);

      if (result.success) {
        spinner.succeed(chalk.green('Build analysis completed by BuildOptimizer:'));
        console.log('\n' + chalk.white(result.data.response));
        
        if (result.data.performance_metrics) {
          console.log(chalk.cyan('\n📊 Performance Metrics:'));
          Object.entries(result.data.performance_metrics).forEach(([key, value]) => {
            console.log(`  ${chalk.yellow(key)}: ${chalk.green(value)}`);
          });
        }

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
