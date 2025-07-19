import * as readline from 'readline';

export class ApprovalPrompt {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async askForApproval(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.rl.question(`${message} (y/N): `, (answer) => {
        const normalized = answer.toLowerCase().trim();
        const approved = normalized === 'y' || normalized === 'yes';
        resolve(approved);
      });
    });
  }

  async askForConfirmation(message: string, defaultValue: boolean = false): Promise<boolean> {
    const defaultText = defaultValue ? 'Y/n' : 'y/N';
    
    return new Promise((resolve) => {
      this.rl.question(`${message} (${defaultText}): `, (answer) => {
        const normalized = answer.toLowerCase().trim();
        
        if (normalized === '') {
          resolve(defaultValue);
        } else if (normalized === 'y' || normalized === 'yes') {
          resolve(true);
        } else if (normalized === 'n' || normalized === 'no') {
          resolve(false);
        } else {
          console.log('Please answer with y/yes or n/no');
          this.askForConfirmation(message, defaultValue).then(resolve);
        }
      });
    });
  }

  async askForInput(message: string, defaultValue?: string): Promise<string> {
    const defaultText = defaultValue ? ` (default: ${defaultValue})` : '';
    
    return new Promise((resolve) => {
      this.rl.question(`${message}${defaultText}: `, (answer) => {
        const trimmed = answer.trim();
        if (trimmed === '' && defaultValue) {
          resolve(defaultValue);
        } else {
          resolve(trimmed);
        }
      });
    });
  }

  async askForChoice(message: string, choices: string[]): Promise<number> {
    console.log(message);
    choices.forEach((choice, index) => {
      console.log(`  ${index + 1}. ${choice}`);
    });

    return new Promise((resolve) => {
      this.rl.question('Enter your choice (number): ', (answer) => {
        const choice = parseInt(answer.trim());
        if (choice >= 1 && choice <= choices.length) {
          resolve(choice - 1);
        } else {
          console.log(`Please enter a number between 1 and ${choices.length}`);
          this.askForChoice(message, choices).then(resolve);
        }
      });
    });
  }

  async askForMultipleChoice(message: string, choices: string[]): Promise<number[]> {
    console.log(message);
    choices.forEach((choice, index) => {
      console.log(`  ${index + 1}. ${choice}`);
    });

    return new Promise((resolve) => {
      this.rl.question('Enter your choices (comma-separated numbers): ', (answer) => {
        const selected = answer.trim().split(',').map(s => parseInt(s.trim()));
        const validChoices = selected.filter(choice => choice >= 1 && choice <= choices.length);
        
        if (validChoices.length > 0) {
          resolve(validChoices.map(choice => choice - 1));
        } else {
          console.log(`Please enter valid numbers between 1 and ${choices.length}`);
          this.askForMultipleChoice(message, choices).then(resolve);
        }
      });
    });
  }

  async askForPassword(message: string): Promise<string> {
    // Note: This is a basic implementation. In production, you might want to use a more secure method
    return new Promise((resolve) => {
      this.rl.question(`${message}: `, (answer) => {
        resolve(answer);
      });
    });
  }

  close(): void {
    this.rl.close();
  }
} 