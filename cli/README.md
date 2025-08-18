
# 🚀 CodeXI CLI - Complete Guide

**The official command-line interface for CodeXI's multi-agent AI development platform**

---

## 📦 **Installation & Setup**

### **Global Installation**
```bash
npm install -g @codexi/cli
```

### **Authentication Setup**
```bash
# Login with your personal token
codexi auth login

# Check authentication status
codexi auth status

# View current configuration
codexi config show
```

---

## 🔑 **Authentication System**

### **Personal Token Generation**
1. **Web Interface**: Navigate to Profile → Personal Tokens
2. **Generate Token**: Click "Generate New Token"
3. **Configure Permissions**: Set CLI, agent, and project permissions
4. **Copy Token**: Save your CXI_ prefixed token securely

### **Authentication Commands**
```bash
codexi auth login           # Interactive token input
codexi auth status          # Check current authentication
codexi auth logout          # Clear stored credentials
```

### **Token Management**
```bash
# View current token info
codexi auth status

# Use different token for different environments
codexi config set token "CXI_production_token"
codexi config set baseUrl "https://production.codexi.com"
```

---

## 🤖 **Agent System Commands**

### **Available Agents (12 Active)**

| ID | Name | Team | Specialization |
|----|------|------|----------------|
| **1** | **FrontendMaster** | Development Hub | React, Vue, Angular, UI/UX |
| **2** | **BackendForge** | Development Hub | APIs, databases, microservices |
| **3** | **CodeArchitect** | Development Hub | System design, architecture patterns |
| **4** | **DebugWizard** | Development Hub | Debugging, optimization, troubleshooting |
| **5** | **SecurityGuard** | Security Hub | Cybersecurity, vulnerability scanning |
| **6** | **TestSentinel** | QA Hub | Testing, quality assurance, automation |
| **7** | **DataHandler** | Analytics Hub | Data processing, transformation, analytics |
| **8** | **StyleMaestro** | Design Hub | Design systems, brand consistency |
| **9** | **BuildOptimizer** | DevOps Hub | Build performance, deployment optimization |
| **10** | **AccessibilityChampion** | UX Hub | Accessibility, inclusive design |
| **11** | **ArchMaster** | Management | Supreme agent coordinator and manager |
| **19** | **ValidationCore** | QA Hub | Validation, quality control, coordination |

### **Agent Commands**

#### **List All Agents**
```bash
codexi agent list
```
**Output Example**:
```
CodeXI Agent Registry (12 Active Agents)

Development Hub:
  #1  FrontendMaster        - Frontend development & UI/UX design
  #2  BackendForge          - Backend architecture & API development  
  #3  CodeArchitect         - System architecture & design patterns
  #4  DebugWizard           - Debugging & performance optimization

Security & QA Hub:
  #5  SecurityGuard         - Cybersecurity & vulnerability assessment
  #6  TestSentinel          - Testing & quality assurance
  #19 ValidationCore        - Validation & quality control

Specialized Hub:
  #7  DataHandler           - Data processing & analytics
  #8  StyleMaestro          - Design systems & brand management
  #9  BuildOptimizer        - Build performance & deployment
  #10 AccessibilityChampion - Accessibility & inclusive design

Management:
  #11 ArchMaster           - Supreme agent coordinator (MANAGER)
```

#### **Direct Agent Communication**
```bash
# Chat with specific agent
codexi agent chat <agent-id> "<message>"

# Examples:
codexi agent chat 1 "Create a responsive React navbar component"
codexi agent chat 2 "Design a REST API for user authentication"  
codexi agent chat 5 "Audit my application for security vulnerabilities"
```

#### **ArchMaster Coordination**
```bash
# Send task to ArchMaster for delegation and coordination
codexi agent archmaster "<complex-task>"

# Examples:
codexi agent archmaster "Build a complete e-commerce platform with React and Node.js"
codexi agent archmaster "Analyze my uploaded codebase and create improvement plan"
codexi agent archmaster "Set up CI/CD pipeline with automated testing and security scanning"
```

---

## 🏗️ **Project Management**

### **Project Initialization**
```bash
# Initialize new CodeXI project
codexi project init

# Initialize with parameters
codexi project init --name "My App" --description "A new CodeXI project" --type "fullstack"
```

### **Project Analysis**
```bash
# Analyze current project structure
codexi project analyze

# Analyze with specific focus
codexi project analyze --focus security
codexi project analyze --focus performance
codexi project analyze --focus architecture
```

### **Project Deployment**
```bash
# Deploy to different environments
codexi project deploy --environment staging
codexi project deploy --environment production

# Deploy with specific agent
codexi project deploy --agent 9  # BuildOptimizer
```

### **Project Status**
```bash
# Check project status
codexi project status

# View deployment history
codexi project history

# Monitor active deployments
codexi project monitor
```

---

## ⚙️ **Configuration Management**

### **Configuration Commands**
```bash
# View all configuration
codexi config show

# Set configuration values
codexi config set <key> <value>

# Reset to defaults
codexi config reset

# Export configuration
codexi config export > my-config.json

# Import configuration
codexi config import my-config.json
```

### **Key Configuration Options**
```bash
# Base URL configuration
codexi config set baseUrl "https://your-codexi-instance.com"

# Default LLM provider
codexi config set defaultLLM "openai"
codexi config set defaultLLM "custom"

# Session management
codexi config set sessionTimeout 480
codexi config set sessionLogging true

# CLI behavior
codexi config set autoComplete true
codexi config set historyLimit 1000
codexi config set terminalTheme "dark"
```

---

## 🔧 **LLM Provider Management**

### **LLM Commands**
```bash
# Check current LLM configuration
codexi llm status

# Set default LLM provider
codexi llm use openai
codexi llm use custom
codexi llm use codexi

# Test LLM connection
codexi llm test

# List available providers
codexi llm providers
```

### **LLM Configuration Examples**
```bash
# Use CodeXI's managed LLM (default)
codexi llm use codexi

# Use your own OpenAI account
codexi llm use openai
codexi config set openaiApiKey "sk-your-key"

# Use custom LLM endpoint
codexi llm use custom
codexi config set customLLMUrl "https://your-llm-endpoint.com"
codexi config set customLLMKey "your-api-key"
```

---

## 📊 **Session Management**

### **Session Commands**
```bash
# Start named session
codexi session start "project-alpha"

# List active sessions
codexi session list

# Switch to session
codexi session switch "project-alpha"

# End session
codexi session end

# Session history
codexi session history
```

### **Session Context**
```bash
# Sessions maintain context across:
# - Agent conversations
# - File uploads and access
# - Project state
# - Configuration preferences

# Example: Continue previous work
codexi session switch "e-commerce-build"
codexi agent archmaster "Continue where we left off with the payment integration"
```

---

## 📁 **File System Integration**

### **File Upload Support**
The CLI integrates with the web interface's file system:

```bash
# Agents can access your uploaded files automatically
codexi agent archmaster "Analyze my uploaded React components"
codexi agent chat 5 "Review security of uploaded configuration files"

# Reference specific uploads in conversations
codexi agent chat 3 "Review the architecture shown in my uploaded diagrams"
```

### **GitHub Integration**
```bash
# Agents access your connected GitHub repositories
codexi agent archmaster "Review my GitHub repository and suggest improvements"
codexi agent chat 2 "Optimize the database queries in my main branch"
```

---

## 🛠️ **Advanced Usage**

### **Productivity Commands**
```bash
# Quick shortcuts for common tasks
codexi shortcuts list
codexi shortcuts add "debug" "agent chat 4"
codexi shortcuts run "debug" "Help me fix this error: {error}"

# Workflow automation
codexi workflow create "deploy-stack" [
  "project analyze",
  "agent chat 6 'Run comprehensive tests'",
  "agent chat 9 'Optimize build configuration'", 
  "project deploy --environment staging"
]
```

### **Monitoring and Analytics**
```bash
# Monitor agent performance
codexi monitoring agents

# View usage analytics
codexi monitoring usage

# Check system health
codexi monitoring health

# Export analytics
codexi monitoring export --format json --period "last-week"
```

### **Batch Operations**
```bash
# Execute multiple agent tasks
codexi batch execute tasks.json

# Example tasks.json:
{
  "tasks": [
    {
      "agent": 1,
      "message": "Review frontend components for accessibility"
    },
    {
      "agent": 5, 
      "message": "Scan for security vulnerabilities"
    },
    {
      "agent": 6,
      "message": "Generate comprehensive test suite"
    }
  ]
}
```

---

## 🚀 **Real-World Examples**

### **1. Full-Stack Development Workflow**
```bash
# Initialize project
codexi project init --name "TaskManager" --type "fullstack"

# Architecture planning
codexi agent archmaster "Design a task management app with React frontend and Node.js API"

# Frontend development
codexi agent chat 1 "Create responsive React components for task lists and forms"

# Backend development  
codexi agent chat 2 "Build REST API with authentication and task CRUD operations"

# Security review
codexi agent chat 5 "Audit the authentication system and API endpoints"

# Testing strategy
codexi agent chat 6 "Create comprehensive test suite for frontend and backend"

# Deployment
codexi project deploy --environment production
```

### **2. Codebase Analysis and Optimization**
```bash
# Upload codebase via web interface, then:

# Comprehensive analysis
codexi agent archmaster "Analyze my uploaded codebase and create optimization plan"

# Architecture review
codexi agent chat 3 "Review architecture patterns and suggest improvements"

# Performance optimization
codexi agent chat 4 "Identify performance bottlenecks and optimization opportunities"

# Security audit
codexi agent chat 5 "Perform complete security audit of the codebase"

# Code quality
codexi agent chat 6 "Review code quality and suggest testing improvements"
```

### **3. Debugging Complex Issues**
```bash
# Start debugging session
codexi session start "debug-payment-flow"

# Initial analysis
codexi agent chat 4 "Help me debug payment processing failures in production"

# Security check
codexi agent chat 5 "Verify payment flow doesn't have security vulnerabilities"

# Data analysis
codexi agent chat 7 "Analyze payment failure logs and identify patterns"

# Frontend investigation
codexi agent chat 1 "Check frontend payment forms for validation issues"

# Coordination
codexi agent archmaster "Coordinate fix for payment processing based on team findings"
```

---

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Authentication Problems**
```bash
# Token expired or invalid
codexi auth status          # Check token status
codexi auth logout          # Clear credentials
codexi auth login           # Re-authenticate

# Permission issues
codexi config show          # Verify token permissions
# Generate new token with correct permissions in web interface
```

#### **Connection Issues**
```bash
# Network or endpoint problems
codexi config show          # Check baseUrl
codexi llm test            # Test LLM connectivity
codexi agent list          # Test agent registry access

# Reset configuration
codexi config reset
codexi config set baseUrl "https://feefiyeqczhynxniuqxe.supabase.co/functions/v1"
```

#### **Agent Response Issues**
```bash
# No response from agent
codexi agent list          # Verify agent availability
codexi session list        # Check session status
codexi monitoring health   # Check system health

# Unexpected responses
# Provide more context:
codexi agent chat 1 "Create a React navbar component with mobile menu, using Tailwind CSS and TypeScript"
```

### **Debug Mode**
```bash
# Enable verbose logging
codexi config set debug true
codexi config set logLevel "verbose"

# View detailed request/response logs
codexi agent chat 1 "test message" --verbose

# Export debug logs
codexi monitoring export --type logs --level debug
```

---

## 🔄 **Updates and Maintenance**

### **CLI Updates**
```bash
# Check current version
codexi --version

# Update to latest version
npm update -g @codexi/cli

# Check for updates
codexi update check

# View changelog
codexi update changelog
```

### **Configuration Backup**
```bash
# Backup current configuration
codexi config export > ~/.codexi-backup.json

# Restore configuration
codexi config import ~/.codexi-backup.json

# Sync configuration across machines
codexi config sync --export > shared-config.json
```

---

## 📚 **Additional Resources**

### **Help System**
```bash
# General help
codexi --help
codexi help

# Command-specific help
codexi agent --help
codexi project --help
codexi config --help

# Agent-specific guidance
codexi agent help 1        # FrontendMaster capabilities
codexi agent help 11       # ArchMaster usage patterns
```

### **Documentation Links**
- **Web Dashboard**: https://your-codexi-instance.com
- **API Documentation**: `/docs/api`
- **Agent Capabilities**: `/docs/agents`
- **GitHub Repository**: https://github.com/codexi/cli
- **Community Support**: https://discord.gg/codexi

---

The CodeXI CLI provides a powerful command-line interface to the entire multi-agent development ecosystem, enabling developers to leverage AI assistance directly from their terminal while maintaining full integration with the web-based file system and agent coordination platform.
