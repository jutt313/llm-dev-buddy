
import chalk from 'chalk';
import { config } from '../config';

export class TerminalUtils {
  static setupTerminalControls() {
    // Handle Ctrl+C for graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\n⚠️  Operation cancelled by user'));
      process.exit(0);
    });

    // Handle Ctrl+D for clean exit
    process.on('SIGTERM', () => {
      console.log(chalk.blue('\n\n👋 Goodbye!'));
      process.exit(0);
    });

    // Raw mode setup for arrow keys (simplified)
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
    }
  }

  static clearScreen() {
    console.clear();
    this.showBanner();
  }

  static showBanner() {
    const banner = `
${chalk.cyan('╔═══════════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.white('CodeXI CLI')} ${chalk.gray('- Multi-Agent AI Development Platform')}      ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray('Orchestrate 20 specialized AI agents for development tasks')}  ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════════════════════════════╝')}
`;
    console.log(banner);

    if (config.isAuthenticated()) {
      const userId = config.get('userId');
      const defaultLLM = config.get('defaultLLM') || 'codexi';
      console.log(chalk.green(`✅ Authenticated ${userId ? `(${userId})` : ''} | LLM: ${defaultLLM}\n`));
    } else {
      console.log(chalk.red('❌ Not authenticated - Run "codexi auth login" to get started\n'));
    }
  }

  static showQuickHelp() {
    console.log(chalk.cyan('\n📋 Quick Help (Terminal Controls):'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(`${chalk.green('Ctrl+C'.padEnd(15))} Cancel current operation`);
    console.log(`${chalk.green('Ctrl+L'.padEnd(15))} Clear terminal screen`);
    console.log(`${chalk.green('Ctrl+D'.padEnd(15))} Exit CodeXI CLI`);
    console.log(`${chalk.green('↑/↓ Keys'.padEnd(15))} Navigate command history`);
    console.log(`${chalk.green('Tab'.padEnd(15))} Auto-complete commands`);
    console.log(chalk.gray('\n💡 Use "codexi shortcuts" to see smart command shortcuts'));
  }

  static formatTable(data: any[][], headers?: string[]) {
    if (data.length === 0) return '';

    const widths = data[0].map((_, colIndex) => 
      Math.max(...data.map(row => String(row[colIndex] || '').length))
    );

    if (headers) {
      headers.forEach((header, index) => {
        widths[index] = Math.max(widths[index], header.length);
      });
    }

    let result = '';

    if (headers) {
      result += '┌' + widths.map(w => '─'.repeat(w + 2)).join('┬') + '┐\n';
      result += '│ ' + headers.map((header, i) => header.padEnd(widths[i])).join(' │ ') + ' │\n';
      result += '├' + widths.map(w => '─'.repeat(w + 2)).join('┼') + '┤\n';
    }

    data.forEach((row, rowIndex) => {
      if (rowIndex === 0 && !headers) {
        result += '┌' + widths.map(w => '─'.repeat(w + 2)).join('┬') + '┐\n';
      }
      result += '│ ' + row.map((cell, i) => String(cell || '').padEnd(widths[i])).join(' │ ') + ' │\n';
    });

    result += '└' + widths.map(w => '─'.repeat(w + 2)).join('┴') + '┘';

    return result;
  }

  static showProgress(message: string, current: number, total: number) {
    const percentage = Math.round((current / total) * 100);
    const barLength = 30;
    const filledLength = Math.round((barLength * current) / total);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    process.stdout.write(`\r${message} [${bar}] ${percentage}% (${current}/${total})`);
    
    if (current === total) {
      console.log(''); // New line when complete
    }
  }
}
