#!/usr/bin/env node

import { Command } from 'commander';
import { ConfigManager } from './config/ConfigManager';
import { AgentLoop } from './agent/AgentLoop';
import { ChatMode } from './ui/ChatMode';
import { InitCommand } from './commands/InitCommand';
import { ConfigCommand } from './commands/ConfigCommand';
import { OllamaCommand } from './commands/OllamaCommand';
import { AutoSetupCommand } from './commands/AutoSetupCommand';
import { PerformanceCommand } from './commands/PerformanceCommand';
import { ModelCommand } from './commands/ModelCommand';
import { TerminalUtils } from './tools/TerminalUtils';

const program = new Command();

program
  .name('ai-cli')
  .description('Local AI-powered coding agent CLI')
  .version('1.0.0');

// Main coding agent command
program
  .argument('[prompt]', 'What would you like the AI to do?')
  .option('--suggest', 'Only suggest changes, don\'t apply them')
  .option('--auto-edit', 'Apply changes automatically without confirmation')
  .option('--full-auto', 'Run in full automatic mode (use with caution)')
  .option('--model <model>', 'Override the configured model')
  .option('--endpoint <endpoint>', 'Override the configured endpoint')
  .action(async (prompt, options) => {
    const config = new ConfigManager();
    
    if (!prompt) {
      console.log('Starting interactive chat mode...');
      const chat = new ChatMode(config);
      await chat.start();
      return;
    }

    const agent = new AgentLoop(config, options);
    await agent.run(prompt);
  });

// Chat mode
program
  .command('chat')
  .description('Start interactive chat mode')
  .action(async () => {
    const config = new ConfigManager();
    const chat = new ChatMode(config);
    await chat.start();
  });

// Auto-setup command
program
  .command('setup')
  .description('Auto-detect and configure optimal settings')
  .option('--force', 'Force automatic setup (download models, start services)')
  .option('--skip-ollama', 'Skip Ollama setup')
  .option('--skip-project', 'Skip project detection')
  .action(async (options) => {
    const setupCmd = new AutoSetupCommand();
    await setupCmd.run(options);
  });

// Init command
program
  .command('init')
  .description('Initialize project context')
  .action(async () => {
    const init = new InitCommand();
    await init.run();
  });

// Config command
program
  .command('config')
  .description('Manage configuration')
  .option('--set <key> <value>', 'Set a configuration value')
  .option('--get <key>', 'Get a configuration value')
  .option('--list', 'List all configuration values')
  .action(async (options) => {
    const configCmd = new ConfigCommand();
    await configCmd.run(options);
  });

// Model command
program
  .command('model')
  .description('Switch and manage AI models')
  .option('--list', 'List all available models')
  .option('--switch', 'Interactive model switcher')
  .option('--current', 'Show current model information')
  .option('--set <model>', 'Set model directly')
  .action(async (options) => {
    const modelCmd = new ModelCommand();
    await modelCmd.run(options);
  });

// Ollama command
program
  .command('ollama')
  .description('Manage Ollama models')
  .option('--setup', 'Quick setup with Mistral 7B (recommended)')
  .option('--available', 'Show available models')
  .option('--list', 'List installed models')
  .option('--pull <model>', 'Download a specific model')
  .option('--serve', 'Start Ollama server')
  .action(async (options) => {
    const ollamaCmd = new OllamaCommand();
    await ollamaCmd.run(options);
  });

// Performance command
program
  .command('performance')
  .alias('perf')
  .description('Monitor and analyze performance')
  .option('--show', 'Show performance dashboard (default)')
  .option('--benchmark <type>', 'Run benchmark (file-ops, config, ollama, all)')
  .option('--export [path]', 'Export metrics to JSON file')
  .option('--clear', 'Clear all metrics and caches')
  .option('--enable', 'Enable performance monitoring')
  .option('--disable', 'Disable performance monitoring')
  .action(async (options) => {
    const perfCmd = new PerformanceCommand();
    await perfCmd.run(options);
  });

// Terminal fix command
program
  .command('fix-terminal')
  .description('Fix broken terminal colors and state')
  .action(() => {
    TerminalUtils.fixTerminal();
    
    const health = TerminalUtils.checkTerminalHealth();
    console.log('\n🔍 Terminal Health Check:');
    console.log(`  Color Support: ${health.hasColorSupport ? '✅' : '❌'}`);
    console.log(`  Terminal Type: ${health.terminalType}`);
    
    if (health.issues.length > 0) {
      console.log('\n⚠️ Issues found:');
      health.issues.forEach(issue => {
        console.log(`  • ${issue}`);
      });
      
      console.log('\n💡 Recommendations:');
      health.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    } else {
      console.log('\n✅ Terminal is healthy');
    }
  });

program.parse(); 