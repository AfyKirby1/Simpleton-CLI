import * as diff from 'diff';
import chalk from 'chalk';

export class DiffRenderer {
  renderDiff(oldContent: string, newContent: string, filename: string): string {
    const differences = diff.diffLines(oldContent, newContent, {
      ignoreWhitespace: false,
      ignoreCase: false
    });

    let output = `\n📄 Changes for ${chalk.blue(filename)}:\n`;
    output += '─'.repeat(50) + '\n';

    differences.forEach((part, index) => {
      if (part.added) {
        output += chalk.green(`+ ${part.value}`);
      } else if (part.removed) {
        output += chalk.red(`- ${part.value}`);
      } else {
        // Show context (unchanged lines)
        const lines = part.value.split('\n');
        if (lines.length <= 3) {
          output += chalk.gray(`  ${part.value}`);
        } else {
          // Show only first and last few lines for context
          output += chalk.gray(`  ${lines[0]}\n`);
          if (lines.length > 2) {
            output += chalk.gray(`  ... (${lines.length - 2} lines unchanged) ...\n`);
          }
          output += chalk.gray(`  ${lines[lines.length - 1]}\n`);
        }
      }
    });

    output += '─'.repeat(50) + '\n';
    return output;
  }

  renderUnifiedDiff(oldContent: string, newContent: string, filename: string): string {
    // Note: createUnifiedDiff is not available in the diff library
    // Using simple diff instead
    return this.renderDiff(oldContent, newContent, filename);
  }

  renderSimpleDiff(oldContent: string, newContent: string, filename: string): string {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    
    let output = `\n📄 Simple diff for ${chalk.blue(filename)}:\n`;
    output += '─'.repeat(50) + '\n';

    const maxLines = Math.max(oldLines.length, newLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';
      
      if (oldLine !== newLine) {
        output += chalk.red(`- ${oldLine}\n`);
        output += chalk.green(`+ ${newLine}\n`);
      } else {
        output += chalk.gray(`  ${oldLine}\n`);
      }
    }

    output += '─'.repeat(50) + '\n';
    return output;
  }

  renderSummary(oldContent: string, newContent: string, filename: string): string {
    const oldLines = oldContent.split('\n').length;
    const newLines = newContent.split('\n').length;
    const added = newLines - oldLines;
    
    let output = `📄 ${chalk.blue(filename)}: `;
    
    if (added > 0) {
      output += chalk.green(`+${added} lines`);
    } else if (added < 0) {
      output += chalk.red(`${added} lines`);
    } else {
      output += chalk.gray('no line changes');
    }
    
    return output;
  }

  renderFileCreation(filename: string, content: string): string {
    const lines = content.split('\n').length;
    
    let output = `\n📄 Creating new file ${chalk.blue(filename)}:\n`;
    output += '─'.repeat(50) + '\n';
    output += chalk.green(`+ ${content}`);
    output += '─'.repeat(50) + '\n';
    output += chalk.green(`✅ New file with ${lines} lines\n`);
    
    return output;
  }

  renderFileDeletion(filename: string): string {
    let output = `\n📄 Deleting file ${chalk.blue(filename)}:\n`;
    output += '─'.repeat(50) + '\n';
    output += chalk.red(`🗑️  File will be deleted\n`);
    output += '─'.repeat(50) + '\n';
    
    return output;
  }
} 