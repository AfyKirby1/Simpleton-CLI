# 🚀 Deployment and Distribution Guide

This document provides comprehensive guidance for deploying, distributing, and maintaining AI CLI in various environments and use cases.

## 📋 Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Distribution Methods](#distribution-methods)
5. [Environment Configuration](#environment-configuration)
6. [Performance Optimization](#performance-optimization)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)
10. [Scaling and Enterprise](#scaling-and-enterprise)

## 🎯 Deployment Overview

AI CLI is designed as a **local-first application** that runs entirely on user machines. Unlike traditional web applications, AI CLI deployments focus on:

- **Local Installation**: Installing on individual developer machines
- **Team Distribution**: Sharing across development teams
- **Enterprise Rollout**: Large-scale deployment in organizations
- **CI/CD Integration**: Automated workflows and pipeline integration

### Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Developer      │    │  Team/Org       │    │  CI/CD          │
│  Machine        │    │  Distribution   │    │  Integration    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • AI CLI        │    │ • Package Repo  │    │ • GitHub Actions│
│ • Local LLM     │    │ • Docker Images │    │ • Jenkins       │
│ • Project Files │    │ • Scripts       │    │ • GitLab CI     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 💻 Local Development Setup

### Prerequisites Installation

1. **Node.js Setup**
   ```bash
   # Install Node.js 22+ (using nvm)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 22
   nvm use 22
   nvm alias default 22
   
   # Verify installation
   node --version  # Should be 22.x.x
   npm --version   # Should be 10.x.x
   ```

2. **Ollama Setup**
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Start Ollama service
   ollama serve
   
   # Pull recommended model
   ollama pull deepseek-coder:1.3b-q4_K_M
   
   # Verify model is available
   ollama list
   ```

3. **Git Configuration**
   ```bash
   # Configure Git (if not already done)
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   
   # Optional: Set up SSH keys for GitHub
   ssh-keygen -t ed25519 -C "your.email@example.com"
   ```

### AI CLI Installation

#### Method 1: From Source (Recommended for Development)

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-cli.git
cd ai-cli

# Install dependencies
npm install

# Build the project
npm run build

# Link globally (optional)
npm link

# Verify installation
node dist/index.js --help
# Or if linked globally:
ai-cli --help
```

#### Method 2: From NPM Package (When Available)

```bash
# Install globally from npm
npm install -g ai-cli

# Verify installation
ai-cli --help
```

#### Method 3: Using Local Binary

```bash
# Build and create local binary
npm run build

# Create alias in your shell profile (.bashrc, .zshrc, etc.)
echo 'alias ai-cli="node /path/to/ai-cli/dist/index.js"' >> ~/.bashrc
source ~/.bashrc

# Verify installation
ai-cli --help
```

### Initial Configuration

```bash
# Configure the CLI
ai-cli config --set endpoint http://localhost:11434/v1
ai-cli config --set model deepseek-coder:1.3b-q4_K_M

# Verify configuration
ai-cli config --list

# Test connection
ai-cli "Hello, can you help me with a simple task?"

# Initialize in a project
cd ~/your-project
ai-cli init
```

## 🏗️ Production Deployment

### Team Environment Setup

#### Shared Configuration Script

Create `setup-ai-cli.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Setting up AI CLI for team environment..."

# Check prerequisites
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 22+"
    exit 1
fi

if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found. Please install Ollama first"
    exit 1
fi

# Install AI CLI
if [ -d "ai-cli" ]; then
    echo "📂 Updating existing AI CLI installation..."
    cd ai-cli
    git pull origin main
else
    echo "📥 Cloning AI CLI repository..."
    git clone https://github.com/yourusername/ai-cli.git
    cd ai-cli
fi

# Install and build
npm install
npm run build

# Set up global command
if ! command -v ai-cli &> /dev/null; then
    echo "🔗 Setting up global ai-cli command..."
    npm link
fi

# Configure default settings
echo "⚙️ Configuring default settings..."
ai-cli config --set endpoint http://localhost:11434/v1
ai-cli config --set model deepseek-coder:1.3b-q4_K_M

# Pull recommended model
echo "🧠 Pulling recommended AI model..."
ollama pull deepseek-coder:1.3b-q4_K_M

# Verify installation
echo "✅ Verifying installation..."
ai-cli config --list

echo "🎉 AI CLI setup complete!"
echo "💡 Try: ai-cli 'Hello, are you working?'"
echo "📚 Documentation: https://github.com/yourusername/ai-cli/tree/main/docs"
```

Make it executable and run:

```bash
chmod +x setup-ai-cli.sh
./setup-ai-cli.sh
```

#### Docker-based Deployment

Create `Dockerfile`:

```dockerfile
FROM node:22-alpine

# Install system dependencies
RUN apk add --no-cache git curl bash

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S aiuser -u 1001

# Change ownership
RUN chown -R aiuser:nodejs /app
USER aiuser

# Expose port for Ollama
EXPOSE 11434

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/index.js config --list || exit 1

# Default command
CMD ["bash"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  ai-cli:
    build: .
    container_name: ai-cli-dev
    volumes:
      - ./projects:/workspace
      - ollama-data:/root/.ollama
    ports:
      - "11434:11434"
    environment:
      - NODE_ENV=development
      - AI_CLI_ENDPOINT=http://localhost:11434/v1
      - AI_CLI_MODEL=deepseek-coder:1.3b-q4_K_M
    working_dir: /workspace
    stdin_open: true
    tty: true

volumes:
  ollama-data:
```

Usage:

```bash
# Build and start
docker-compose up -d

# Enter the container
docker-compose exec ai-cli bash

# Use AI CLI inside container
ai-cli init
ai-cli "help me with this code"
```

## 📦 Distribution Methods

### Method 1: Git Repository

Best for open-source teams and development environments.

```bash
# Team members clone and set up
git clone https://github.com/yourorg/ai-cli.git
cd ai-cli
npm install && npm run build
npm link
```

### Method 2: NPM Package

Best for stable releases and easy installation.

```bash
# Publish to npm (maintainer only)
npm publish

# Users install globally
npm install -g @yourorg/ai-cli
```

### Method 3: Standalone Executables

Best for non-technical users or restricted environments.

```bash
# Using pkg to create executables
npm install -g pkg

# Create executables for different platforms
pkg package.json --output bin/ai-cli

# This creates:
# bin/ai-cli-linux
# bin/ai-cli-macos  
# bin/ai-cli-win.exe
```

### Method 4: Docker Images

Best for consistent environments and CI/CD.

```bash
# Build and push Docker image
docker build -t yourorg/ai-cli:latest .
docker push yourorg/ai-cli:latest

# Users pull and run
docker pull yourorg/ai-cli:latest
docker run -it yourorg/ai-cli:latest
```

### Method 5: Internal Package Registry

Best for enterprise environments.

```bash
# Configure npm to use internal registry
npm config set registry https://npm.yourcompany.com

# Publish to internal registry
npm publish

# Team members install
npm install -g @yourcompany/ai-cli
```

## ⚙️ Environment Configuration

### Development Environment

Create `.env.development`:

```bash
# Development configuration
NODE_ENV=development
AI_CLI_DEBUG=true
AI_CLI_ENDPOINT=http://localhost:11434/v1
AI_CLI_MODEL=deepseek-coder:1.3b-q4_K_M
AI_CLI_TIMEOUT=30000
AI_CLI_MAX_TOKENS=4000
AI_CLI_TEMPERATURE=0.7
```

### Production Environment

Create `.env.production`:

```bash
# Production configuration
NODE_ENV=production
AI_CLI_DEBUG=false
AI_CLI_ENDPOINT=http://localhost:11434/v1
AI_CLI_MODEL=deepseek-coder:6.7b-q4_K_M
AI_CLI_TIMEOUT=60000
AI_CLI_MAX_TOKENS=8000
AI_CLI_TEMPERATURE=0.5
```

### Team Environment

Create `team-config.json`:

```json
{
  "defaultEndpoint": "http://ai-server.company.com:11434/v1",
  "recommendedModels": [
    "deepseek-coder:1.3b-q4_K_M",
    "deepseek-coder:6.7b-q4_K_M",
    "codellama:7b-q4_K_M"
  ],
  "securitySettings": {
    "allowedCommands": ["npm", "yarn", "git", "node"],
    "maxFileSize": "10MB",
    "timeoutMs": 30000
  },
  "projectTemplates": {
    "react": {
      "model": "deepseek-coder:6.7b-q4_K_M",
      "temperature": 0.3
    },
    "nodejs": {
      "model": "deepseek-coder:1.3b-q4_K_M", 
      "temperature": 0.5
    }
  }
}
```

### Configuration Management Script

Create `configure-ai-cli.js`:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function configureAICli() {
  console.log('🔧 Configuring AI CLI...');

  // Load team configuration
  const configPath = path.join(__dirname, 'team-config.json');
  const teamConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Set default endpoint
  execSync(`ai-cli config --set endpoint ${teamConfig.defaultEndpoint}`);
  
  // Set recommended model
  const defaultModel = teamConfig.recommendedModels[0];
  execSync(`ai-cli config --set model ${defaultModel}`);

  // Set security settings
  const security = teamConfig.securitySettings;
  execSync(`ai-cli config --set timeout ${security.timeoutMs}`);

  console.log('✅ AI CLI configured successfully!');
  console.log('📋 Current configuration:');
  execSync('ai-cli config --list', { stdio: 'inherit' });
}

configureAICli().catch(console.error);
```

Usage:

```bash
node configure-ai-cli.js
```

## 🚀 Performance Optimization

### Model Selection by Hardware

```bash
# Script to auto-select model based on available RAM
#!/bin/bash

# Get available RAM in GB
RAM_GB=$(free -g | awk '/^Mem:/{print $2}')

if [ $RAM_GB -lt 8 ]; then
    MODEL="tinyllama:1.1b-q4_K_M"
    echo "🔧 Selected TinyLlama for systems with <8GB RAM"
elif [ $RAM_GB -lt 16 ]; then
    MODEL="deepseek-coder:1.3b-q4_K_M"
    echo "🔧 Selected DeepSeek Coder 1.3B for systems with 8-16GB RAM"
else
    MODEL="deepseek-coder:6.7b-q4_K_M"
    echo "🔧 Selected DeepSeek Coder 6.7B for systems with 16GB+ RAM"
fi

# Configure AI CLI with optimal model
ai-cli config --set model $MODEL
echo "✅ Configured AI CLI with model: $MODEL"
```

### Caching Configuration

```bash
# Enable project context caching
ai-cli config --set enableCaching true

# Set cache duration (in minutes)
ai-cli config --set cacheDuration 30

# Set max cache size (in MB)
ai-cli config --set maxCacheSize 100
```

### Resource Limits

```bash
# Set timeouts
ai-cli config --set timeout 30000          # 30 seconds
ai-cli config --set maxTokens 4000         # Token limit
ai-cli config --set temperature 0.7        # Sampling temperature

# Set file operation limits
ai-cli config --set maxFileSize 10485760   # 10MB max file size
ai-cli config --set maxFiles 1000          # Max files to process
```

## 📊 Monitoring and Maintenance

### Health Check Script

Create `health-check.sh`:

```bash
#!/bin/bash

echo "🏥 AI CLI Health Check"
echo "====================="

# Check Node.js
echo -n "Node.js: "
if command -v node &> /dev/null; then
    echo "✅ $(node --version)"
else
    echo "❌ Not installed"
fi

# Check AI CLI
echo -n "AI CLI: "
if command -v ai-cli &> /dev/null; then
    echo "✅ Available"
else
    echo "❌ Not available"
fi

# Check Ollama
echo -n "Ollama: "
if command -v ollama &> /dev/null; then
    echo "✅ $(ollama --version)"
else
    echo "❌ Not installed"
fi

# Check Ollama service
echo -n "Ollama Service: "
if curl -s http://localhost:11434/api/version &> /dev/null; then
    echo "✅ Running"
else
    echo "❌ Not running"
fi

# Check AI CLI configuration
echo -n "AI CLI Config: "
if ai-cli config --list &> /dev/null; then
    echo "✅ Valid"
else
    echo "❌ Invalid"
fi

# Check model availability
echo -n "AI Model: "
MODEL=$(ai-cli config --get model)
if ollama list | grep -q "$MODEL"; then
    echo "✅ $MODEL available"
else
    echo "❌ $MODEL not available"
fi

# Test AI CLI functionality
echo -n "AI CLI Test: "
if echo "hello" | ai-cli "respond with 'ok'" &> /dev/null; then
    echo "✅ Working"
else
    echo "❌ Not working"
fi

echo ""
echo "📊 System Resources:"
echo "CPU: $(nproc) cores"
echo "RAM: $(free -h | awk '/^Mem:/{print $2}') total, $(free -h | awk '/^Mem:/{print $7}') available"
echo "Disk: $(df -h / | awk 'NR==2{print $4}') available"
```

### Automatic Updates

Create `update-ai-cli.sh`:

```bash
#!/bin/bash

echo "🔄 Updating AI CLI..."

# Navigate to AI CLI directory
cd ~/ai-cli

# Backup current configuration
ai-cli config --list > ~/.ai-cli-config-backup.txt

# Pull latest changes
git fetch origin
git pull origin main

# Install dependencies and rebuild
npm install
npm run build

# Restore configuration if needed
# (configuration should persist automatically)

# Pull latest model if needed
MODEL=$(ai-cli config --get model)
ollama pull "$MODEL"

echo "✅ AI CLI updated successfully!"
echo "📋 Current version info:"
ai-cli --version
```

### Usage Analytics (Optional)

Create `analytics.js`:

```javascript
// Simple usage tracking (privacy-respecting)
const fs = require('fs');
const path = require('path');
const os = require('os');

class Analytics {
  constructor() {
    this.logFile = path.join(os.homedir(), '.ai-cli-usage.json');
    this.data = this.loadData();
  }

  loadData() {
    try {
      return JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
    } catch (error) {
      return {
        totalCommands: 0,
        commandsByType: {},
        modelUsage: {},
        lastUsed: null
      };
    }
  }

  saveData() {
    fs.writeFileSync(this.logFile, JSON.stringify(this.data, null, 2));
  }

  logCommand(commandType, model) {
    this.data.totalCommands++;
    this.data.commandsByType[commandType] = (this.data.commandsByType[commandType] || 0) + 1;
    this.data.modelUsage[model] = (this.data.modelUsage[model] || 0) + 1;
    this.data.lastUsed = new Date().toISOString();
    this.saveData();
  }

  generateReport() {
    console.log('📊 AI CLI Usage Report');
    console.log('=====================');
    console.log(`Total commands: ${this.data.totalCommands}`);
    console.log(`Last used: ${this.data.lastUsed}`);
    console.log('\nCommands by type:');
    Object.entries(this.data.commandsByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    console.log('\nModel usage:');
    Object.entries(this.data.modelUsage).forEach(([model, count]) => {
      console.log(`  ${model}: ${count}`);
    });
  }
}

module.exports = Analytics;
```

## 🔒 Security Considerations

### Secure Installation

```bash
# Verify checksums (when available)
curl -O https://releases.ai-cli.com/checksums.txt
sha256sum -c checksums.txt

# Install from trusted sources only
npm install ai-cli --registry https://registry.npmjs.org

# Verify package integrity
npm audit
```

### Network Security

```bash
# Configure firewall for Ollama (if needed)
sudo ufw allow 11434/tcp comment "Ollama AI CLI"

# Use localhost-only binding
ollama serve --host 127.0.0.1
```

### File System Security

```bash
# Set appropriate permissions for AI CLI directory
chmod 755 ~/ai-cli
chmod -R 644 ~/ai-cli/src/

# Protect configuration files
chmod 600 ~/.config/ai-cli/config.json
```

### Access Control

```bash
# Add AI CLI to restricted group (enterprise)
sudo groupadd ai-cli-users
sudo usermod -a -G ai-cli-users $USER

# Configure sudo rules for Ollama service
echo '%ai-cli-users ALL=(ALL) NOPASSWD: /usr/local/bin/ollama' | sudo tee /etc/sudoers.d/ai-cli
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue: Command Not Found

```bash
# Solution 1: Check PATH
echo $PATH | grep -q "$(npm global bin)" || echo "Add $(npm global bin) to PATH"

# Solution 2: Use full path
alias ai-cli="node /path/to/ai-cli/dist/index.js"

# Solution 3: Reinstall globally
npm uninstall -g ai-cli
npm install -g ai-cli
```

#### Issue: LLM Connection Failed

```bash
# Check Ollama status
systemctl status ollama  # On systemd systems
ps aux | grep ollama      # Check if running

# Restart Ollama
ollama serve

# Test connection
curl http://localhost:11434/api/version
```

#### Issue: Model Not Found

```bash
# List available models
ollama list

# Pull missing model
MODEL=$(ai-cli config --get model)
ollama pull "$MODEL"

# Reset to default model
ai-cli config --set model deepseek-coder:1.3b-q4_K_M
```

#### Issue: Permission Denied

```bash
# Fix file permissions
chmod +x dist/index.js

# Fix npm permissions (if needed)
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Diagnostic Script

Create `diagnose.sh`:

```bash
#!/bin/bash

echo "🔍 AI CLI Diagnostic Information"
echo "================================"

echo "System Information:"
echo "OS: $(uname -s) $(uname -r)"
echo "Architecture: $(uname -m)"
echo "Shell: $SHELL"

echo -e "\nNode.js Information:"
node --version
npm --version

echo -e "\nAI CLI Information:"
ai-cli --version 2>/dev/null || echo "AI CLI not found in PATH"
which ai-cli 2>/dev/null || echo "ai-cli command not found"

echo -e "\nOllama Information:"
ollama --version 2>/dev/null || echo "Ollama not installed"
curl -s http://localhost:11434/api/version 2>/dev/null || echo "Ollama service not running"

echo -e "\nConfiguration:"
ai-cli config --list 2>/dev/null || echo "Cannot read AI CLI configuration"

echo -e "\nEnvironment Variables:"
env | grep -E "(AI_CLI|NODE|PATH)" | sort

echo -e "\nProcess Information:"
ps aux | grep -E "(ollama|node)" | grep -v grep

echo -e "\nNetwork Information:"
netstat -tlnp 2>/dev/null | grep :11434 || echo "Port 11434 not listening"

echo -e "\nDisk Space:"
df -h ~

echo -e "\nMemory Usage:"
free -h

echo ""
echo "📝 Please share this output when reporting issues"
```

## 🏢 Scaling and Enterprise

### Multi-User Setup

```bash
# Create shared installation directory
sudo mkdir -p /opt/ai-cli
sudo chown root:ai-cli-users /opt/ai-cli
sudo chmod 775 /opt/ai-cli

# Install AI CLI system-wide
cd /opt/ai-cli
sudo git clone https://github.com/yourorg/ai-cli.git .
sudo npm install
sudo npm run build

# Create wrapper script
sudo tee /usr/local/bin/ai-cli > /dev/null << 'EOF'
#!/bin/bash
exec node /opt/ai-cli/dist/index.js "$@"
EOF
sudo chmod +x /usr/local/bin/ai-cli
```

### Centralized Model Management

```bash
# Set up shared model directory
sudo mkdir -p /opt/models
sudo chown ollama:ai-cli-users /opt/models
sudo chmod 775 /opt/models

# Configure Ollama to use shared directory
export OLLAMA_MODELS=/opt/models

# Pull models once for all users
ollama pull deepseek-coder:1.3b-q4_K_M
ollama pull deepseek-coder:6.7b-q4_K_M
ollama pull codellama:7b-q4_K_M
```

### Automated Deployment with Ansible

Create `deploy-ai-cli.yml`:

```yaml
---
- name: Deploy AI CLI to development machines
  hosts: developers
  become: yes
  vars:
    ai_cli_version: "1.0.0"
    node_version: "22"
    
  tasks:
    - name: Install Node.js
      shell: |
        curl -fsSL https://deb.nodesource.com/setup_{{ node_version }}.x | sudo -E bash -
        apt-get install -y nodejs
      when: ansible_os_family == "Debian"

    - name: Install Ollama
      shell: |
        curl -fsSL https://ollama.com/install.sh | sh
      args:
        creates: /usr/local/bin/ollama

    - name: Clone AI CLI repository
      git:
        repo: https://github.com/yourorg/ai-cli.git
        dest: /opt/ai-cli
        version: "v{{ ai_cli_version }}"

    - name: Install AI CLI dependencies
      npm:
        path: /opt/ai-cli
        state: present

    - name: Build AI CLI
      command: npm run build
      args:
        chdir: /opt/ai-cli

    - name: Create AI CLI wrapper script
      copy:
        content: |
          #!/bin/bash
          exec node /opt/ai-cli/dist/index.js "$@"
        dest: /usr/local/bin/ai-cli
        mode: '0755'

    - name: Start Ollama service
      systemd:
        name: ollama
        state: started
        enabled: yes

    - name: Pull default AI model
      command: ollama pull deepseek-coder:1.3b-q4_K_M
      become_user: ollama
```

Run with:

```bash
ansible-playbook -i inventory deploy-ai-cli.yml
```

---

## 📈 Success Metrics

### Deployment Success Indicators

- ✅ **Installation Success Rate**: >95% successful installations
- ✅ **Configuration Accuracy**: Correct endpoint and model setup
- ✅ **Functionality Tests**: Basic AI CLI operations working
- ✅ **Performance Benchmarks**: Response times within acceptable limits
- ✅ **User Adoption**: Active usage across team members

### Monitoring Dashboard

```bash
# Simple monitoring script
#!/bin/bash

echo "📊 AI CLI Deployment Status"
echo "=========================="

TOTAL_MACHINES=0
SUCCESSFUL_INSTALLS=0
ACTIVE_USERS=0

for host in $(cat deployment-inventory.txt); do
    TOTAL_MACHINES=$((TOTAL_MACHINES + 1))
    
    echo -n "Checking $host... "
    
    if ssh $host "ai-cli --version" &>/dev/null; then
        echo "✅"
        SUCCESSFUL_INSTALLS=$((SUCCESSFUL_INSTALLS + 1))
        
        # Check for recent usage (last 7 days)
        if ssh $host "find ~/.ai-cli* -mtime -7" 2>/dev/null | grep -q .; then
            ACTIVE_USERS=$((ACTIVE_USERS + 1))
        fi
    else
        echo "❌"
    fi
done

echo ""
echo "📈 Deployment Summary:"
echo "Total machines: $TOTAL_MACHINES"
echo "Successful installs: $SUCCESSFUL_INSTALLS"
echo "Active users (7 days): $ACTIVE_USERS"
echo "Success rate: $(( SUCCESSFUL_INSTALLS * 100 / TOTAL_MACHINES ))%"
echo "Adoption rate: $(( ACTIVE_USERS * 100 / SUCCESSFUL_INSTALLS ))%"
```

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: December 2024  
**Next Review**: Q1 2025 