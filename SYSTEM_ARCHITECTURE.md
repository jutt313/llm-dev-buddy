
# 🏗️ CodeXI System Architecture Documentation

**Complete System Overview: Database → Backend → Frontend → CLI → Agents**

---

## 🗄️ **DATABASE LAYER (Foundation)**

### **Core Tables Structure**

#### **1. Agent System Tables**
```sql
agent_registry          -- Core agent definitions and capabilities
agent_memory           -- Long-term learning and context storage
agent_task_logs        -- Task execution tracking and history
agent_validations      -- Cross-agent validation system
agent_checklists       -- Task management and completion tracking
```

#### **2. User & Authentication Tables**
```sql
profiles               -- User profile information
personal_tokens        -- CLI access tokens (CXI_ prefixed)
user_llm_credentials   -- User's LLM API keys and configurations
```

#### **3. File System Tables**
```sql
user_files            -- Uploaded files metadata and tracking
agent_file_access     -- Agent access logs for user files
github_repositories   -- Connected GitHub repos for codebase access
```

#### **4. Communication Tables**
```sql
chat_sessions         -- User-agent conversation sessions
chat_messages         -- Individual messages in conversations
cli_commands          -- CLI command execution history
usage_analytics       -- System usage and performance metrics
```

### **Storage Buckets**
```
user-uploads/         -- General file uploads (50MB limit)
screenshots/          -- UI/UX screenshots (10MB limit) 
codebase-files/       -- Source code files (100MB limit)
```

### **Row Level Security (RLS)**
- **User Isolation**: Users can only access their own data
- **Agent Context**: Agents access files through user permissions
- **Token Validation**: Personal tokens provide secure CLI access
- **File Privacy**: Uploaded files are private to each user

---

## ⚡ **BACKEND LAYER (Supabase Edge Functions)**

### **Core Agent Functions**

#### **1. ArchMaster Agent** (`/archmaster-agent`)
- **Role**: Supreme manager and coordinator
- **File Access**: Full access to user uploads, screenshots, codebase
- **Capabilities**: 
  - Task delegation to specialized agents
  - Strategic planning and architecture guidance
  - File analysis and context integration
  - Cross-agent coordination

#### **2. ValidationCore Agent** (`/validation-core`)
- **Role**: Quality assurance and validation orchestrator
- **Capabilities**:
  - Cross-agent validation requests
  - Quality control and standards enforcement
  - Task completion verification

#### **3. Specialized Agents** (8 Active)
```
frontend-master-agent      -- Frontend development (React, Vue, Angular)
backend-forge-agent        -- Backend architecture (APIs, databases)
code-architect-agent       -- System design and patterns
debug-wizard-agent         -- Debugging and optimization
security-guard-agent       -- Cybersecurity and vulnerabilities
test-sentinel-agent        -- Testing and quality assurance
data-handler-agent         -- Data processing and analytics
style-maestro-agent        -- Design consistency and brand management
```

### **Authentication & Utilities**
```
generate-personal-token    -- Create CLI access tokens
validate-personal-token    -- Verify token permissions
get-agent-registry        -- Return available agents list
test-llm-credential       -- Test user's LLM API keys
```

### **File Processing Pipeline**
1. **Upload**: Files stored in appropriate buckets
2. **Metadata**: File info saved to `user_files` table
3. **Processing**: Background analysis and indexing
4. **Agent Access**: Files available for agent analysis
5. **Logging**: All access tracked in `agent_file_access`

---

## 🎯 **FRONTEND LAYER (React/TypeScript)**

### **Core Pages**

#### **1. Dashboard** (`/dashboard`)
- User overview and system status
- Recent agent interactions
- File upload statistics
- Usage analytics display

#### **2. Agent Manager** (`/agents`)
- Agent registry and status display
- Individual agent communication
- ArchMaster coordination interface
- System status monitoring

#### **3. File Manager** (`/files`)
- **Upload Tab**: File, screenshot, and codebase uploads
- **GitHub Tab**: Repository connection and sync
- **Access Tab**: Agent file access logs and permissions

#### **4. Authentication** (`/auth`)
- Sign in/sign up forms
- Password recovery
- Profile management

### **Key Components**

#### **File Management System**
```tsx
FileUploadManager.tsx     -- Multi-type file upload interface
GitHubRepoManager.tsx     -- Repository connection and sync
AgentFileAccess.tsx       -- File access monitoring and logs
```

#### **Agent System**
```tsx
ArchMasterManager.tsx     -- Supreme agent interface
AgentSystemStatus.tsx     -- Real-time agent status display
```

#### **Authentication & Security**
```tsx
ProtectedRoute.tsx        -- Route access control
PersonalTokensDialog.tsx  -- CLI token management
LLMCredentialsDialog.tsx  -- API key management
```

### **State Management**
- **TanStack Query**: Server state and caching
- **Supabase Client**: Real-time database connections
- **React Hook Form**: Form validation and submission
- **Zustand/Context**: Local component state

---

## 💻 **CLI LAYER (Command Line Interface)**

### **Installation & Setup**
```bash
npm install -g @codexi/cli
codexi auth login    # Authenticate with personal token
```

### **Core Commands**

#### **Authentication**
```bash
codexi auth login           # Login with CXI_ token
codexi auth status          # Check authentication
codexi auth logout          # Clear credentials
```

#### **Agent Interaction**
```bash
codexi agent list                           # List all 12 agents
codexi agent chat <agent-id> "<message>"    # Direct agent communication
codexi agent archmaster "<task>"            # ArchMaster delegation
```

#### **Project Management**
```bash
codexi project init         # Initialize CodeXI project
codexi project deploy       # Deploy via CloudOps agent
codexi project analyze      # Project structure analysis
```

#### **Configuration**
```bash
codexi config show         # Display current settings
codexi config set <key> <value>  # Update configuration
codexi llm use <provider>  # Set default LLM provider
```

### **CLI Architecture**
```typescript
cli/src/
├── commands/           # Command implementations
├── services/          # API communication layer
├── config/           # Configuration management
└── utils/            # Terminal utilities
```

### **API Integration**
- **Base URL**: `https://feefiyeqczhynxniuqxe.supabase.co/functions/v1`
- **Authentication**: Personal tokens (CXI_ prefix)
- **Agent Mapping**: Direct function calls to Supabase Edge Functions
- **Error Handling**: Comprehensive error reporting and recovery

---

## 🤖 **AGENT SYSTEM ARCHITECTURE**

### **Agent Hierarchy**
```
ArchMaster (#11)              -- Supreme Manager
    ├── ValidationCore (#19)  -- Quality Assurance
    └── Specialized Agents (8)
        ├── FrontendMaster (#1)
        ├── BackendForge (#2) 
        ├── CodeArchitect (#3)
        ├── DebugWizard (#4)
        ├── SecurityGuard (#5)
        ├── TestSentinel (#6)
        ├── DataHandler (#7)
        └── StyleMaestro (#8)
```

### **Agent Capabilities Matrix**

| Agent | Primary Role | File Access | Specializations |
|-------|-------------|-------------|-----------------|
| **ArchMaster** | System Coordination | Full Access | Task delegation, strategic planning |
| **ValidationCore** | Quality Control | Read Access | Validation, quality assurance |
| **FrontendMaster** | UI Development | UI Files | React, Vue, Angular, responsive design |
| **BackendForge** | Server Architecture | API Files | Node.js, Python, database design |
| **CodeArchitect** | System Design | All Code | Architecture patterns, code review |
| **DebugWizard** | Debugging | Error Logs | Performance optimization, troubleshooting |
| **SecurityGuard** | Cybersecurity | Security Files | Vulnerability assessment, compliance |
| **TestSentinel** | Quality Assurance | Test Files | Automated testing, quality metrics |
| **DataHandler** | Data Processing | Data Files | Analytics, transformation, storage |
| **StyleMaestro** | Design Systems | Design Files | Brand consistency, accessibility |

### **Agent Communication Protocol**
1. **User Request** → ArchMaster receives task
2. **Task Analysis** → ArchMaster analyzes requirements
3. **Agent Delegation** → Specialized agents assigned
4. **File Access** → Agents access relevant user files
5. **Validation** → ValidationCore ensures quality
6. **Response Synthesis** → ArchMaster coordinates final output

### **Memory System**
```sql
agent_memory:
- Context retention across sessions
- File reference tracking
- Learning from user interactions
- Cross-agent knowledge sharing
```

---

## 🔄 **DATA FLOW ARCHITECTURE**

### **File Upload to Agent Analysis Flow**
```
1. User Upload → Storage Bucket
2. File Metadata → user_files table
3. Processing Queue → Background analysis
4. Agent Request → File access through ArchMaster
5. Agent Analysis → Context integration
6. Access Logging → agent_file_access table
7. Memory Storage → agent_memory table
8. Response Generation → Contextual output
```

### **CLI to Agent Communication Flow**
```
1. CLI Command → Personal token validation
2. Token Verification → validate-personal-token function
3. Agent Selection → Map to edge function
4. Request Processing → Agent execution
5. File Context → Access user files if needed
6. Response Generation → Formatted output
7. Usage Logging → Command history storage
```

### **GitHub Integration Flow**
```
1. Repository Connection → GitHub API
2. File Synchronization → Codebase analysis
3. Metadata Storage → github_repositories table
4. Agent Access → Repository content availability
5. Sync Monitoring → Status tracking
6. Update Detection → Automatic refresh
```

---

## 🔒 **SECURITY ARCHITECTURE**

### **Authentication Layers**
1. **Web Authentication**: Supabase Auth (email/password)
2. **CLI Authentication**: Personal tokens (CXI_ prefix)
3. **Agent Authentication**: Token validation per request
4. **File Access**: RLS policies and user isolation

### **Permission System**
```json
{
  "cli": ["execute", "config", "deploy"],
  "agent": ["chat", "delegate", "analyze"],
  "project": ["create", "manage", "deploy"],
  "files": ["upload", "access", "delete"]
}
```

### **Data Protection**
- **Encryption**: API keys encrypted at rest
- **Isolation**: User data completely isolated
- **Audit Logs**: All agent file access tracked
- **Token Security**: Time-limited, revocable tokens

---

## 📊 **MONITORING & ANALYTICS**

### **System Metrics**
```sql
usage_analytics:
- Agent performance metrics
- Response time tracking
- Success/failure rates
- Resource utilization
- User engagement patterns
```

### **Agent Performance Tracking**
```sql
agent_registry.performance_metrics:
- tasks_completed: Task success count
- success_rate: Completion percentage
- avg_response_time: Performance metrics
- errors_count: Failure tracking
```

### **File Access Auditing**
```sql
agent_file_access:
- Which agents accessed which files
- Access timestamps and duration
- Context and purpose tracking
- User permission verification
```

---

## 🚀 **DEPLOYMENT ARCHITECTURE**

### **Infrastructure Stack**
- **Database**: Supabase PostgreSQL with RLS
- **Functions**: Supabase Edge Functions (Deno runtime)
- **Storage**: Supabase Storage with CDN
- **Frontend**: React/TypeScript with Vite
- **CLI**: Node.js npm package

### **Environment Configuration**
```
Production: https://feefiyeqczhynxniuqxe.supabase.co
Development: Local Supabase instance
CLI Base: Configurable endpoint
```

### **Scaling Considerations**
- **Database**: Auto-scaling PostgreSQL
- **Functions**: Serverless edge compute
- **Storage**: Global CDN distribution
- **CLI**: Stateless, distributed usage

---

## 🎯 **INTEGRATION POINTS**

### **External Services**
- **OpenAI**: LLM provider integration
- **GitHub**: Repository synchronization
- **Custom LLMs**: User-provided endpoints
- **Third-party APIs**: Agent-specific integrations

### **API Boundaries**
```
Frontend ↔ Supabase Client ↔ Edge Functions
CLI ↔ HTTP API ↔ Edge Functions  
Agents ↔ File System ↔ Storage API
GitHub ↔ Webhook ↔ Sync Functions
```

---

This architecture provides a complete, secure, and scalable system for multi-agent AI development with comprehensive file access, real-time communication, and enterprise-grade security. Every component is designed for extensibility and performance at scale.
