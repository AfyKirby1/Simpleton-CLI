import chalk from 'chalk';

export class TerminalUtils {
  /**
   * Reset terminal colors and cursor state
   */
  static resetColors(): void {
    // ANSI escape codes to reset terminal state
    process.stdout.write('\x1b[0m');      // Reset all attributes
    process.stdout.write('\x1b[39m');     // Reset foreground color
    process.stdout.write('\x1b[49m');     // Reset background color
    process.stdout.write('\x1b[?25h');    // Show cursor
    process.stdout.write('\x1b[0J');      // Clear from cursor to end of screen
  }

  /**
   * Clear terminal screen
   */
  static clearScreen(): void {
    process.stdout.write('\x1b[2J\x1b[H');
  }

  /**
   * Reset terminal to a clean state
   */
  static resetTerminal(): void {
    this.resetColors();
    console.log(chalk.reset(''));
  }

  /**
   * Check if terminal supports colors
   */
  static supportsColor(): boolean {
    return process.stdout.isTTY !== false && process.env.NO_COLOR !== '1';
  }

  /**
   * Safe color wrapper that handles broken terminal states
   */
  static safeColor(text: string, colorFn?: (text: string) => string): string {
    try {
      if (colorFn && this.supportsColor()) {
        return colorFn(text);
      }
      return text;
    } catch (error) {
      // If color function fails, reset and return plain text
      this.resetColors();
      return text;
    }
  }

  /**
   * Fix broken terminal state (useful after interrupted commands)
   */
  static fixTerminal(): void {
    console.log(chalk.blue('🔧 Fixing terminal state...'));
    
    // Reset all terminal attributes
    this.resetColors();
    
    // Clear any stuck modes
    process.stdout.write('\x1b[?1l');     // Disable application cursor keys
    process.stdout.write('\x1b[?7h');     // Enable auto-wrap
    process.stdout.write('\x1b[?25h');    // Show cursor
    
    // Reset scroll region
    process.stdout.write('\x1b[r');
    
    // Move cursor to home and clear screen
    process.stdout.write('\x1b[H\x1b[2J');
    
    console.log(chalk.green('✅ Terminal state restored'));
  }

  /**
   * Display colored text safely with fallback
   */
  static colorText(text: string, color: 'red' | 'green' | 'blue' | 'yellow' | 'cyan' | 'magenta' | 'gray'): string {
    const colorMap = {
      red: chalk.red,
      green: chalk.green,
      blue: chalk.blue,
      yellow: chalk.yellow,
      cyan: chalk.cyan,
      magenta: chalk.magenta,
      gray: chalk.gray
    };

    return this.safeColor(text, colorMap[color]);
  }

  /**
   * Create a progress indicator that works with color issues
   */
  static createProgressSpinner(message: string): {
    start: () => void;
    stop: () => void;
    update: (newMessage: string) => void;
  } {
    let interval: NodeJS.Timeout | null = null;
    let current = 0;
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    
    return {
      start: () => {
        if (interval) return;
        
        interval = setInterval(() => {
          const frame = frames[current % frames.length];
          process.stdout.write(`\r${this.safeColor(frame, chalk.cyan)} ${message}`);
          current++;
        }, 100);
      },
      
      stop: () => {
        if (interval) {
          clearInterval(interval);
          interval = null;
          process.stdout.write('\r');
          console.log(this.safeColor('✅', chalk.green) + ` ${message}`);
        }
      },
      
      update: (newMessage: string) => {
        message = newMessage;
      }
    };
  }

  /**
   * Display a warning about terminal issues
   */
  static warnTerminalIssues(): void {
    console.log(this.colorText('⚠️  Terminal display issues detected', 'yellow'));
    console.log(this.colorText('💡 Run "ai-cli fix-terminal" to reset colors', 'gray'));
  }

  /**
   * Check for common terminal issues
   */
  static checkTerminalHealth(): {
    hasColorSupport: boolean;
    terminalType: string;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check color support
    const hasColorSupport = this.supportsColor();
    if (!hasColorSupport) {
      issues.push('No color support detected');
      recommendations.push('Use a terminal that supports ANSI colors');
    }
    
    // Check terminal type
    const terminalType = process.env.TERM || 'unknown';
    if (terminalType === 'dumb') {
      issues.push('Terminal type is "dumb"');
      recommendations.push('Use a more advanced terminal emulator');
    }
    
    // Check if inside certain environments
    if (process.env.CI) {
      issues.push('Running in CI environment');
      recommendations.push('Colors may be disabled in CI');
    }
    
    return {
      hasColorSupport,
      terminalType,
      issues,
      recommendations
    };
  }
} 