#!/usr/bin/env node

import { Command } from 'commander';
import { ConfigManager } from './config/ConfigManager';
import { AgentLoop } from './agent/AgentLoop';
import { ChatMode } from './ui/ChatMode';
import { InitCommand } from './commands/InitCommand';
import { ConfigCommand } from './commands/ConfigCommand';

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

program.parse(); 