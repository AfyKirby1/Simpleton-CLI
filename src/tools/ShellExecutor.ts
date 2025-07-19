import { execa, ExecaReturnValue, ExecaError } from 'execa';
import * as path from 'path';

export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  command: string;
}

export class ShellExecutor {
  private allowedCommands: Set<string> = new Set([
    'npm', 'yarn', 'pnpm', 'node', 'git', 'ls', 'cat', 'echo', 'mkdir', 'rm', 'cp', 'mv',
    'grep', 'find', 'sed', 'awk', 'sort', 'uniq', 'wc', 'head', 'tail', 'diff', 'patch',
    'curl', 'wget', 'tar', 'zip', 'unzip', 'chmod', 'chown', 'touch', 'ln', 'which',
    'pwd', 'cd', 'env', 'export', 'source', 'bash', 'sh', 'zsh', 'fish'
  ]);

  private dangerousCommands: Set<string> = new Set([
    'rm -rf', 'sudo', 'su', 'chmod 777', 'chown root', 'dd', 'format', 'fdisk',
    'mkfs', 'mount', 'umount', 'shutdown', 'reboot', 'halt', 'poweroff'
  ]);

  async execute(command: string, workingDirectory: string): Promise<CommandResult> {
    // Security checks
    if (!this.isCommandAllowed(command)) {
      throw new Error(`Command not allowed: ${command}`);
    }

    if (this.isDangerousCommand(command)) {
      throw new Error(`Dangerous command detected: ${command}`);
    }

    // Ensure we're not trying to escape the working directory
    const normalizedPath = path.resolve(workingDirectory);
    if (!this.isPathSafe(normalizedPath, workingDirectory)) {
      throw new Error(`Unsafe path detected: ${workingDirectory}`);
    }

    try {
      const result: ExecaReturnValue = await execa(command, {
        shell: true,
        cwd: workingDirectory,
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024, // 1MB buffer
        env: {
          ...process.env,
          // Remove potentially dangerous environment variables
          SUDO_ASKPASS: undefined,
          SUDO_PASSWORD: undefined,
          SUDO_USER: undefined
        }
      });

      return {
        success: true,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        command
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'stdout' in error) {
        const execaError = error as ExecaError;
        return {
          success: false,
          stdout: execaError.stdout || '',
          stderr: execaError.stderr || '',
          exitCode: execaError.exitCode || 1,
          command
        };
      }
      
      throw new Error(`Failed to execute command: ${error}`);
    }
  }

  private isCommandAllowed(command: string): boolean {
    const baseCommand = command.split(' ')[0];
    return this.allowedCommands.has(baseCommand);
  }

  private isDangerousCommand(command: string): boolean {
    const lowerCommand = command.toLowerCase();
    for (const dangerous of this.dangerousCommands) {
      if (lowerCommand.includes(dangerous.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  private isPathSafe(normalizedPath: string, originalPath: string): boolean {
    // Prevent directory traversal attacks
    if (normalizedPath.includes('..')) {
      return false;
    }

    // Ensure the path is within the allowed working directory
    const allowedDir = path.resolve(process.cwd());
    return normalizedPath.startsWith(allowedDir);
  }

  async executeWithConfirmation(command: string, workingDirectory: string): Promise<CommandResult> {
    console.log(`🔧 About to execute: ${command}`);
    console.log(`📁 Working directory: ${workingDirectory}`);
    
    // Show what the command will do
    if (command.startsWith('git')) {
      console.log('📝 This is a git command');
    } else if (command.startsWith('npm') || command.startsWith('yarn') || command.startsWith('pnpm')) {
      console.log('📦 This is a package manager command');
    } else if (command.includes('rm') || command.includes('delete')) {
      console.log('⚠️  This command may delete files');
    }

    return this.execute(command, workingDirectory);
  }

  getAvailableCommands(): string[] {
    return Array.from(this.allowedCommands).sort();
  }

  addAllowedCommand(command: string): void {
    this.allowedCommands.add(command);
  }

  removeAllowedCommand(command: string): void {
    this.allowedCommands.delete(command);
  }
} 