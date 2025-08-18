
# 📚 CodeXI Complete User Guide

**From Zero to AI-Powered Development in 10 Minutes**

---

## 🚀 **Quick Start Guide**

### **Step 1: Web Interface Setup**
1. **Visit**: Your CodeXI instance URL
2. **Sign Up**: Create account with email/password
3. **Profile**: Complete your developer profile
4. **Dashboard**: Explore the system overview

### **Step 2: CLI Installation**
```bash
# Install globally
npm install -g @codexi/cli

# Authenticate
codexi auth login
# Enter your personal token (generated from web interface)

# Verify installation
codexi agent list
```

### **Step 3: First Agent Interaction**
```bash
# Chat with ArchMaster
codexi agent archmaster "Help me plan a new web application"

# Or use web interface
# Navigate to /agents → ArchMaster → Start conversation
```

---

## 🎯 **Core Workflows**

### **1. Project Planning Workflow**

#### **Web Interface**:
1. **Navigate**: `/agents` → ArchMaster
2. **Request**: "I need to build an e-commerce platform"
3. **Analysis**: ArchMaster analyzes and delegates
4. **Planning**: Receive comprehensive project plan
5. **Files**: Upload any existing designs or requirements

#### **CLI**:
```bash
# Initialize project
codexi project init --name "E-commerce Platform"

# Get architectural guidance
codexi agent archmaster "Design microservices architecture for e-commerce"

# Analyze existing codebase
codexi project analyze
```

### **2. File Upload & Agent Analysis**

#### **Upload Process**:
1. **Navigate**: `/files` → Upload Tab
2. **Categories**:
   - **Screenshots**: UI mockups, designs, error screens
   - **Codebase**: Source files, configurations, documentation  
   - **General**: Requirements, specifications, assets

#### **Agent Integration**:
```bash
# After uploading files, agents automatically access them
codexi agent archmaster "Analyze my uploaded codebase and suggest improvements"

# Specific agent analysis
codexi agent chat 3 "Review the architecture in my uploaded files"
```

#### **File Access Monitoring**:
1. **Navigate**: `/files` → Access Tab
2. **View**: Which agents accessed which files
3. **Audit**: Complete access logs with timestamps
4. **Context**: See why agents accessed specific files

### **3. GitHub Integration Workflow**

#### **Repository Connection**:
1. **Navigate**: `/files` → GitHub Tab
2. **Add Repository**: Enter GitHub URL and branch
3. **Sync Status**: Monitor synchronization progress
4. **File Count**: View indexed files and analysis status

#### **Agent Codebase Access**:
```bash
# Agents can now analyze your connected repositories
codexi agent archmaster "Review my GitHub repository and suggest optimizations"
codexi agent chat 5 "Check my repository for security vulnerabilities"
```

### **4. Specialized Agent Workflows**

#### **Frontend Development**:
```bash
# FrontendMaster (Agent #1)
codexi agent chat 1 "Create a responsive React component for user profiles"
codexi agent chat 1 "Optimize my CSS for mobile devices"
```

#### **Backend Architecture**:
```bash
# BackendForge (Agent #2)  
codexi agent chat 2 "Design a REST API for user authentication"
codexi agent chat 2 "Set up database schema for e-commerce"
```

#### **Security Analysis**:
```bash
# SecurityGuard (Agent #5)
codexi agent chat 5 "Audit my application for security vulnerabilities"
codexi agent chat 5 "Implement JWT authentication securely"
```

#### **Testing Strategy**:
```bash
# TestSentinel (Agent #6)
codexi agent chat 6 "Create comprehensive test suite for my API"
codexi agent chat 6 "Set up automated testing pipeline"
```

---

## 🛠️ **Advanced Features**

### **1. Personal Token Management**

#### **Create Tokens** (Web Interface):
1. **Navigate**: Profile → Personal Tokens
2. **Generate**: Name your token and set permissions
3. **Copy**: Save the CXI_ token securely
4. **Permissions**: Configure CLI, agent, and project access

#### **Token Usage** (CLI):
```bash
# Set different tokens for different environments
codexi config set token "CXI_your_production_token"
codexi config set baseUrl "https://your-production-instance.com"
```

### **2. LLM Provider Configuration**

#### **Add Custom LLM** (Web Interface):
1. **Navigate**: Settings → LLM Providers
2. **Provider**: Add OpenAI, Anthropic, or custom endpoint
3. **API Key**: Securely store your credentials
4. **Test**: Verify connection and functionality
5. **Default**: Set preferred provider for agents

#### **CLI LLM Management**:
```bash
# Use custom LLM provider
codexi llm use openai
codexi config set defaultLLM custom

# Check current configuration
codexi llm status
```

### **3. Agent Memory & Context**

#### **Persistent Sessions**:
- Agents remember previous conversations
- File context preserved across sessions
- Learning from user preferences and patterns
- Cross-agent knowledge sharing

#### **Session Management**:
```bash
# Start named session
codexi config set sessionId "project-alpha"

# Continue previous session
codexi agent archmaster "Continue where we left off"
```

### **4. Project Deployment**

```bash
# Deploy through CloudOps agent (when implemented)
codexi project deploy --environment staging
codexi project deploy --environment production

# Monitor deployment status
codexi project status
```

---

## 🔧 **Configuration & Customization**

### **CLI Configuration**

#### **View Current Settings**:
```bash
codexi config show
```

#### **Common Configuration**:
```bash
# Set base URL for custom instance
codexi config set baseUrl "https://your-codexi-instance.com"

# Set default LLM provider
codexi config set defaultLLM "openai"

# Set command history limit
codexi config set historyLimit 1000

# Set session timeout
codexi config set sessionTimeout 480
```

### **Web Interface Settings**

#### **Profile Customization**:
1. **Avatar**: Upload profile picture
2. **Preferences**: Theme, notifications, defaults
3. **Tokens**: Manage CLI access tokens
4. **LLM**: Configure AI providers and API keys

#### **Agent Preferences**:
1. **Default Agent**: Set preferred agent for quick access
2. **File Access**: Configure automatic file sharing with agents
3. **Notifications**: Set up alerts for agent responses

---

## 🎯 **Best Practices**

### **1. Effective Agent Communication**

#### **Clear Requests**:
```bash
# ✅ Good: Specific and actionable
codexi agent chat 1 "Create a responsive navbar component with mobile menu toggle using React and Tailwind CSS"

# ❌ Poor: Vague and unclear  
codexi agent chat 1 "Make something for navigation"
```

#### **Context Provision**:
- Upload relevant files before asking for analysis
- Provide specific requirements and constraints
- Mention technology stack and preferences
- Include error messages or specific problems

### **2. File Organization**

#### **Upload Strategy**:
- **Screenshots**: UI mockups, error screens, design references
- **Codebase**: Source files, config files, documentation
- **Documentation**: Requirements, specifications, user stories

#### **Naming Conventions**:
- Use descriptive filenames
- Include version numbers when relevant
- Group related files logically
- Keep file sizes reasonable (under limits)

### **3. Security Best Practices**

#### **Token Management**:
- Keep personal tokens secure and private
- Use different tokens for different environments
- Regularly rotate tokens for enhanced security
- Set appropriate permissions for each token

#### **File Sharing**:
- Only upload files necessary for analysis
- Remove sensitive data before uploading
- Monitor agent file access logs regularly
- Delete files when no longer needed

### **4. Collaboration Workflows**

#### **Team Usage**:
- Share project configurations through CLI
- Use consistent naming conventions
- Document agent interactions and decisions
- Leverage agent memory for team continuity

---

## 🚨 **Troubleshooting**

### **Common CLI Issues**

#### **Authentication Problems**:
```bash
# Check token status
codexi auth status

# Re-authenticate
codexi auth logout
codexi auth login

# Verify token permissions
codexi config show
```

#### **Connection Issues**:
```bash
# Check base URL
codexi config show

# Test connection
codexi agent list

# Reset configuration
codexi config reset
```

### **File Upload Issues**

#### **Upload Failures**:
1. **Check file size**: Ensure under bucket limits
2. **File type**: Verify supported MIME types
3. **Network**: Confirm stable internet connection
4. **Authentication**: Ensure logged into web interface

#### **Agent Access Issues**:
1. **File processing**: Wait for processing to complete
2. **Permissions**: Verify file upload succeeded
3. **Agent status**: Check if specific agent is active
4. **Session context**: Ensure agent has file context

### **Agent Response Issues**

#### **No Response**:
1. **Agent status**: Check if agent is active
2. **Token permissions**: Verify CLI permissions
3. **Request format**: Ensure proper message format
4. **System status**: Check overall system health

#### **Unexpected Responses**:
1. **Context clarity**: Provide more specific requests
2. **File context**: Ensure relevant files are uploaded
3. **Agent selection**: Use most appropriate specialist agent
4. **Session continuity**: Reference previous conversations

---

## 📊 **Usage Analytics & Monitoring**

### **Web Interface Analytics**

#### **Dashboard Metrics**:
- Agent interaction frequency
- File upload and processing stats
- Response time analytics
- Success/failure rates

#### **File Access Logs**:
- Which agents accessed your files
- When and why files were accessed
- File processing status and results
- Agent performance with your content

### **CLI Usage Tracking**

```bash
# View command history
codexi config show

# Check usage statistics
codexi agent list --stats

# Monitor session activity
codexi config set sessionLogging true
```

---

## 🔮 **Advanced Use Cases**

### **1. Enterprise Development**

#### **Large Codebase Analysis**:
```bash
# Upload entire project structure
# Connect multiple GitHub repositories  
# Use ArchMaster for comprehensive analysis
codexi agent archmaster "Analyze my microservices architecture and suggest improvements"
```

#### **Security Auditing**:
```bash
# Upload security configurations
# Connect production repositories
# Use SecurityGuard for comprehensive audit
codexi agent chat 5 "Perform complete security audit of my application stack"
```

### **2. Continuous Integration**

#### **Automated Code Review**:
```bash
# In CI/CD pipeline
codexi agent chat 3 "Review this pull request for architecture compliance"
codexi agent chat 6 "Validate test coverage for new features"
```

#### **Deployment Validation**:
```bash
# Pre-deployment checks
codexi agent chat 5 "Verify deployment security configuration"
codexi agent chat 12 "Analyze performance impact of new release"
```

### **3. Learning & Development**

#### **Code Mentorship**:
```bash
# Learning-focused interactions
codexi agent chat 3 "Explain the architecture patterns in my code"
codexi agent chat 1 "Suggest improvements for my React components"
```

#### **Technology Exploration**:
```bash
# Explore new technologies
codexi agent chat 2 "Help me migrate from REST to GraphQL"
codexi agent chat 7 "Implement machine learning data pipeline"
```

---

This guide covers the complete CodeXI ecosystem from basic setup to advanced enterprise usage. Each feature is designed to enhance your development workflow through intelligent AI assistance with full access to your project context and files.
