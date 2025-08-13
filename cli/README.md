
# CodeXI CLI

The official command-line interface for CodeXI - a multi-agent AI development platform.

## Installation

```bash
npm install -g @codexi/cli
```

## Authentication

Before using the CLI, you need to authenticate with your CodeXI personal token:

```bash
codexi auth login
```

You can generate a personal token from the CodeXI web interface at: https://your-codexi-instance.com

## Commands

### Authentication
- `codexi auth login` - Login with your personal token
- `codexi auth status` - Check authentication status  
- `codexi auth logout` - Logout and clear credentials

### Agents
- `codexi agent list` - List all 20 available agents
- `codexi agent chat <agent-id> "<message>"` - Chat with a specific agent
- `codexi agent archmaster "<task>"` - Send task to ArchMaster for delegation

### Project Management
- `codexi project init` - Initialize a new CodeXI project
- `codexi project deploy` - Deploy project using CloudOps agent
- `codexi project analyze` - Analyze project structure and dependencies

### Configuration
- `codexi config show` - Show current configuration
- `codexi config reset` - Reset all configuration
- `codexi config set <key> <value>` - Set configuration value

### LLM Management
- `codexi llm status` - Show current LLM configuration
- `codexi llm use <provider>` - Set default LLM provider

## Examples

```bash
# Login
codexi auth login

# List agents
codexi agent list

# Chat with CodeArchitect
codexi agent chat 1 "Design a microservices architecture for an e-commerce platform"

# Send task to ArchMaster
codexi agent archmaster "Create a complete authentication system with JWT tokens"

# Initialize project
codexi project init --name "My App" --description "A new CodeXI project"

# Deploy to staging
codexi project deploy --environment staging

# Analyze current project
codexi project analyze
```

## Agent Reference

| ID | Name | Team | Role |
|----|------|------|------|
| 1 | CodeArchitect | Development Hub | System design & architecture |
| 2 | FrontendMaster | Development Hub | UI/UX & component design |
| 3 | BackendForge | Development Hub | APIs & integrations |
| 4 | DebugWizard | Development Hub | Debugging & optimization |
| 5 | DocCrafter | Content & QA Hub | Documentation |
| 6 | TestSentinel | Content & QA Hub | QA & automated tests |
| 7 | ConfigMaster | Content & QA Hub | Configurations & deployment |
| 8 | DataDesigner | Content & QA Hub | Database modeling |
| 9 | SecurityGuard | Security & Integration Hub | Vulnerability scanning |
| 10 | APIConnector | Security & Integration Hub | Third-party APIs |
| 11 | CloudOps | Security & Integration Hub | Infrastructure & CI/CD |
| 12 | PerformanceOptimizer | Security & Integration Hub | Performance tuning |
| 13 | ProjectAnalyzer | Support & Analytics Hub | Project analysis |
| 14 | ResourceManager | Support & Analytics Hub | Assets & repository organization |
| 15 | MonitoringAgent | Support & Analytics Hub | Logging & alerts |
| 16 | MigrationSpecialist | Support & Analytics Hub | Data/system migrations |
| 17 | CustomAgentBuilder | Custom & Simulation Hub | Creates specialized agents |
| 18 | SimulationEngine | Custom & Simulation Hub | Testing & sandbox simulations |
| 19 | ValidationCore | Custom & Simulation Hub | QA, validation, strategic feedback |
| 20 | ArchMaster | Management | Supreme Manager Agent |

## Configuration

The CLI stores configuration in your home directory under `.config/codexi-cli/`.

Default configuration:
- Base URL: `https://feefiyeqczhynxniuqxe.supabase.co/functions/v1`
- LLM Mode: `codexi` (OpenAI GPT-4o-mini)

## Support

For issues and support, visit: https://github.com/codexi/cli
