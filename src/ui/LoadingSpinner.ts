export class LoadingSpinner {
  private interval: NodeJS.Timeout | null = null;
  private spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private currentIndex = 0;
  private message: string;

  constructor(message: string = 'Loading...') {
    this.message = message;
  }

  start(): void {
    if (this.interval) {
      return; // Already running
    }

    process.stdout.write('\x1B[?25l'); // Hide cursor
    this.interval = setInterval(() => {
      const spinner = this.spinnerChars[this.currentIndex];
      process.stdout.write(`\r${spinner} ${this.message}`);
      this.currentIndex = (this.currentIndex + 1) % this.spinnerChars.length;
    }, 100);
  }

  updateMessage(message: string): void {
    this.message = message;
  }

  stop(clearLine: boolean = true): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    if (clearLine) {
      process.stdout.write('\r\x1B[2K'); // Clear current line
    }
    process.stdout.write('\x1B[?25h'); // Show cursor
  }

  stopWithMessage(message: string): void {
    this.stop(false);
    process.stdout.write(`\r${message}\n`);
    process.stdout.write('\x1B[?25h'); // Show cursor
  }
} 