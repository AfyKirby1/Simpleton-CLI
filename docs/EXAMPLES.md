# 📖 AI CLI Examples and Tutorials

This document provides comprehensive examples and tutorials for using AI CLI effectively. From basic usage to advanced integrations, these examples will help you get the most out of your local AI coding assistant.

## 📋 Table of Contents

1. [Basic Usage Examples](#basic-usage-examples)
2. [Chat Mode Examples](#chat-mode-examples)
3. [Project Integration Examples](#project-integration-examples)
4. [Advanced Configuration](#advanced-configuration)
5. [Code Refactoring Examples](#code-refactoring-examples)
6. [Testing and Debugging](#testing-and-debugging)
7. [Custom Workflows](#custom-workflows)
8. [Performance Optimization](#performance-optimization)
9. [Troubleshooting Examples](#troubleshooting-examples)
10. [Integration with Other Tools](#integration-with-other-tools)

## 🚀 Basic Usage Examples

### Example 1: First Time Setup

```bash
# 1. Build the CLI
npm install
npm run build

# 2. Set up configuration
node dist/index.js config --set endpoint http://localhost:11434/v1
node dist/index.js config --set model deepseek-coder:1.3b-q4_K_M

# 3. Verify configuration
node dist/index.js config --list

# 4. Initialize your first project
cd ~/my-project
node dist/index.js init
```

### Example 2: Basic Code Help

```bash
# Ask for help with a specific task
node dist/index.js "Create a React component for a user profile card"

# Get suggestions for code improvement
node dist/index.js --suggest "Review this authentication function for security issues"

# Auto-apply changes with confirmation
node dist/index.js --auto-edit "Add TypeScript types to this JavaScript file"
```

### Example 3: Project Analysis

```bash
# Analyze project structure
node dist/index.js "Analyze this codebase and suggest improvements"

# Get help with specific files
node dist/index.js "Explain what src/components/Header.jsx does"

# Code review assistance
node dist/index.js "Review src/utils/api.js for potential bugs"
```

## 💬 Chat Mode Examples

### Example 1: Interactive Code Session

```bash
# Start chat mode
node dist/index.js chat

# Example conversation:
You: Help me refactor this function to be more performant

AI: I'd be happy to help you refactor for better performance! Please share the function you'd like me to review.

You: [paste your function]

AI: I can see several optimization opportunities. Here's a refactored version with explanations...

You: Can you also add error handling?

AI: Absolutely! Here's the updated version with comprehensive error handling...
```

### Example 2: Learning Session

```bash
node dist/index.js chat

# Example learning conversation:
You: I'm new to TypeScript. Can you explain interfaces vs types?

AI: Great question! Let me explain the differences with examples...

You: Can you show me a practical example in our codebase?

AI: Sure! Looking at your project, here's how we could improve the API types...

You: How would I test this?

AI: Here's a testing strategy for TypeScript interfaces...
```

### Example 3: Debugging Session

```bash
node dist/index.js chat

# Example debugging conversation:
You: I'm getting "Cannot read property 'map' of undefined" error

AI: This error typically means an array is undefined. Let me help you debug this...

You: It's happening in my React component when fetching data

AI: This sounds like a race condition. Let me show you how to handle async data loading...

You: That fixed it! Can you explain why?

AI: The issue was that your component was trying to render before the data loaded...
```

## 🏗️ Project Integration Examples

### Example 1: React Project Integration

```bash
# Initialize in React project
cd my-react-app
node dist/index.js init

# Common React tasks
node dist/index.js "Create a custom hook for API calls"
node dist/index.js "Add prop validation to my Button component"
node dist/index.js "Convert this class component to a functional component with hooks"
node dist/index.js "Add TypeScript support to this JavaScript component"
```

### Example 2: Node.js Backend Integration

```bash
# Initialize in Node.js project
cd my-api-server
node dist/index.js init

# Common backend tasks
node dist/index.js "Create an Express middleware for authentication"
node dist/index.js "Add input validation to this API endpoint"
node dist/index.js "Convert these callbacks to async/await"
node dist/index.js "Add error handling to this database query"
```

### Example 3: Full-Stack Project

```bash
# Initialize in monorepo
cd my-fullstack-app
node dist/index.js init

# Cross-stack tasks
node dist/index.js "Create matching TypeScript interfaces for frontend and backend"
node dist/index.js "Generate API client from OpenAPI specification"
node dist/index.js "Add end-to-end type safety between React and Express"
```

## ⚙️ Advanced Configuration

### Example 1: Model Switching

```bash
# List available models (assuming Ollama is running)
ollama list

# Switch to a larger model for complex tasks
node dist/index.js config --set model deepseek-coder:6.7b-q4_K_M

# Use model override for specific tasks
node dist/index.js --model codellama:13b-q4_K_M "Architect a microservices system"

# Switch back to smaller model for quick tasks
node dist/index.js config --set model deepseek-coder:1.3b-q4_K_M
```

### Example 2: Endpoint Configuration

```bash
# Configure for different LLM setups
node dist/index.js config --set endpoint http://localhost:11434/v1    # Ollama
node dist/index.js config --set endpoint http://localhost:8080/v1    # LiteLLM
node dist/index.js config --set endpoint http://localhost:1234/v1    # LM Studio

# Test endpoint connectivity
node dist/index.js "Hello, can you help me with a simple task?"
```

### Example 3: Behavior Modes

```bash
# Suggest-only mode (safe for exploring)
node dist/index.js config --set suggestOnly true
node dist/index.js "Refactor this entire module"

# Auto-edit mode (with confirmations)
node dist/index.js config --set autoApprove false
node dist/index.js --auto-edit "Fix all ESLint errors in this file"

# Full-auto mode (use with caution)
node dist/index.js --full-auto "Run tests and fix any failures"
```

## 🔧 Code Refactoring Examples

### Example 1: JavaScript to TypeScript Migration

```bash
# Start the migration
node dist/index.js "Convert this JavaScript file to TypeScript with proper types"

# Example input file: user.js
# The AI will suggest adding:
# - Interface definitions
# - Type annotations
# - Generic types where appropriate
# - Import/export type syntax

# Follow up with specific improvements
node dist/index.js "Add stricter TypeScript configuration for this file"
```

### Example 2: Performance Optimization

```bash
# Analyze performance bottlenecks
node dist/index.js "Analyze this component for performance issues"

# Specific optimizations
node dist/index.js "Optimize this React component using useMemo and useCallback"
node dist/index.js "Refactor this database query for better performance"
node dist/index.js "Add lazy loading to this component"
```

### Example 3: Security Improvements

```bash
# Security audit
node dist/index.js "Audit this authentication code for security vulnerabilities"

# Specific security fixes
node dist/index.js "Add input validation and sanitization to this API endpoint"
node dist/index.js "Implement proper error handling without information leakage"
node dist/index.js "Add rate limiting to this Express route"
```

## 🧪 Testing and Debugging

### Example 1: Test Generation

```bash
# Generate unit tests
node dist/index.js "Create comprehensive unit tests for this utility function"

# Generate integration tests
node dist/index.js "Create integration tests for this API endpoint"

# Generate React component tests
node dist/index.js "Create tests for this React component using Jest and React Testing Library"
```

### Example 2: Debugging Assistance

```bash
# Debug runtime errors
node dist/index.js "Help me debug this 'TypeError: Cannot read property' error"

# Debug performance issues
node dist/index.js "This function is running slowly, help me identify the bottleneck"

# Debug React issues
node dist/index.js "My React component is re-rendering too often, help me optimize it"
```

### Example 3: Test Improvement

```bash
# Improve existing tests
node dist/index.js "Improve the test coverage for this module"

# Add edge case testing
node dist/index.js "Add edge case tests for this validation function"

# Mock improvements
node dist/index.js "Improve the mocking strategy in these tests"
```

## ⚡ Custom Workflows

### Example 1: Code Review Workflow

```bash
# Pre-commit review
node dist/index.js "Review the changes in my staging area for potential issues"

# Post-development review
node dist/index.js "Perform a comprehensive code review of this feature branch"

# Security review
node dist/index.js "Review this code for security vulnerabilities and best practices"
```

### Example 2: Documentation Workflow

```bash
# Generate documentation
node dist/index.js "Generate JSDoc comments for all functions in this file"

# Update README
node dist/index.js "Update the README.md to reflect the new features added"

# API documentation
node dist/index.js "Generate API documentation for these Express routes"
```

### Example 3: Deployment Workflow

```bash
# Pre-deployment checks
node dist/index.js "Review this code for production readiness"

# Environment configuration
node dist/index.js "Help me set up environment-specific configurations"

# Monitoring setup
node dist/index.js "Add logging and monitoring to this application"
```

## 🎯 Performance Optimization

### Example 1: React Performance

```bash
# Component optimization
node dist/index.js "Optimize this React component for better rendering performance"

# Bundle optimization
node dist/index.js "Analyze and optimize the webpack bundle for this React app"

# State management optimization
node dist/index.js "Optimize this Redux store for better performance"
```

### Example 2: Node.js Performance

```bash
# API optimization
node dist/index.js "Optimize this Express API for better throughput"

# Database optimization
node dist/index.js "Optimize these MongoDB queries for better performance"

# Memory optimization
node dist/index.js "Identify and fix memory leaks in this Node.js application"
```

### Example 3: General Performance

```bash
# Algorithm optimization
node dist/index.js "Optimize this sorting algorithm for large datasets"

# Caching strategies
node dist/index.js "Implement an effective caching strategy for this application"

# Async optimization
node dist/index.js "Optimize these async operations to run in parallel"
```

## 🔍 Troubleshooting Examples

### Example 1: Connection Issues

```bash
# Test LLM connection
node dist/index.js config --get endpoint
curl -X GET $(node dist/index.js config --get endpoint)/models

# Check Ollama status
ollama list
ollama serve  # If not running

# Verify model availability
ollama pull deepseek-coder:1.3b-q4_K_M
```

### Example 2: Configuration Issues

```bash
# Reset configuration
node dist/index.js config --set endpoint http://localhost:11434/v1
node dist/index.js config --set model deepseek-coder:1.3b-q4_K_M

# Check current config
node dist/index.js config --list

# Test with simple prompt
node dist/index.js "Hello, are you working?"
```

### Example 3: Performance Issues

```bash
# Switch to smaller model
node dist/index.js config --set model tinyllama:1.1b-q4_K_M

# Use suggest mode to reduce processing
node dist/index.js --suggest "Simple code review task"

# Check system resources
# Monitor CPU and RAM usage while AI CLI is running
```

## 🔧 Integration with Other Tools

### Example 1: Git Integration

```bash
# Pre-commit hooks
node dist/index.js "Review my staged changes before commit"

# Commit message generation
node dist/index.js "Generate a good commit message for these changes"

# Merge conflict resolution
node dist/index.js "Help me resolve this merge conflict"
```

### Example 2: VS Code Integration

Create a VS Code task (`.vscode/tasks.json`):

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "AI CLI Review",
      "type": "shell",
      "command": "node",
      "args": ["dist/index.js", "Review the currently open file"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    }
  ]
}
```

### Example 3: CI/CD Integration

Add to `.github/workflows/ai-review.yml`:

```yaml
name: AI Code Review
on:
  pull_request:
    branches: [main]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install AI CLI
        run: |
          npm install -g ./path/to/ai-cli
      
      - name: Run AI Review
        run: |
          ai-cli "Review the changes in this pull request"
```

### Example 4: NPM Scripts Integration

Add to your `package.json`:

```json
{
  "scripts": {
    "ai:review": "node path/to/ai-cli/dist/index.js 'Review this codebase for issues'",
    "ai:test": "node path/to/ai-cli/dist/index.js 'Generate tests for modified files'",
    "ai:docs": "node path/to/ai-cli/dist/index.js 'Update documentation for recent changes'",
    "ai:optimize": "node path/to/ai-cli/dist/index.js 'Suggest performance optimizations'"
  }
}
```

Usage:
```bash
npm run ai:review
npm run ai:test
npm run ai:docs
npm run ai:optimize
```

## 🎨 Creative Use Cases

### Example 1: Code Generation

```bash
# Generate boilerplate
node dist/index.js "Create a complete CRUD API for a blog system using Express and MongoDB"

# Generate utilities
node dist/index.js "Create a utility library for date manipulation with comprehensive tests"

# Generate configurations
node dist/index.js "Create a complete webpack configuration for a React TypeScript project"
```

### Example 2: Learning and Exploration

```bash
# Understand complex code
node dist/index.js "Explain how this complex algorithm works step by step"

# Learn patterns
node dist/index.js "Show me different design patterns I could use for this problem"

# Explore alternatives
node dist/index.js "What are different ways I could implement this functionality?"
```

### Example 3: Architecture Assistance

```bash
# System design
node dist/index.js "Help me architect a scalable microservices system for this use case"

# Database design
node dist/index.js "Design an efficient database schema for this e-commerce application"

# API design
node dist/index.js "Design a RESTful API for this social media application"
```

## 📊 Success Metrics and Best Practices

### Measuring Success

1. **Time Saved**: Track how much development time AI CLI saves
2. **Code Quality**: Monitor improvements in code quality metrics
3. **Learning**: Note new concepts and patterns learned
4. **Productivity**: Measure tasks completed vs. time invested

### Best Practices

1. **Start Small**: Begin with simple tasks and gradually increase complexity
2. **Be Specific**: Provide clear, detailed prompts for better results
3. **Iterate**: Use follow-up questions to refine solutions
4. **Verify**: Always review AI suggestions before applying
5. **Learn**: Use AI CLI as a learning tool, not just a code generator

### Common Pitfalls to Avoid

1. **Over-reliance**: Don't lose fundamental coding skills
2. **Blind Trust**: Always understand the code before using it
3. **Wrong Model**: Use appropriate model size for task complexity
4. **Poor Prompts**: Vague prompts lead to vague solutions
5. **No Testing**: Always test AI-generated code thoroughly

---

## 🎯 Quick Reference

### Most Common Commands

```bash
# Basic usage
node dist/index.js "your prompt here"
node dist/index.js chat
node dist/index.js init

# Configuration
node dist/index.js config --list
node dist/index.js config --set key value
node dist/index.js config --get key

# Modes
node dist/index.js --suggest "prompt"
node dist/index.js --auto-edit "prompt"
node dist/index.js --full-auto "prompt"

# Model override
node dist/index.js --model model-name "prompt"
node dist/index.js --endpoint http://custom:port/v1 "prompt"
```

### Useful Prompt Templates

```bash
# Code review
"Review this [language] code for [specific concerns]: [paste code]"

# Refactoring
"Refactor this function to [specific goal]: [paste code]"

# Testing
"Create [unit/integration] tests for this [component/function]: [paste code]"

# Documentation
"Generate [JSDoc/comments] for this code: [paste code]"

# Debugging
"Help me debug this [error/issue]: [error message] in [context]"

# Optimization
"Optimize this code for [performance/memory/readability]: [paste code]"
```

---

**Examples Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: AI CLI 1.0.0+ 