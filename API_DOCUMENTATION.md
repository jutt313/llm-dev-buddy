
# 🔌 CodeXI API Documentation

**Complete API Reference for Developers and Integrators**

---

## 🌐 **API Overview**

### **Base Configuration**
- **Production URL**: `https://feefiyeqczhynxniuqxe.supabase.co/functions/v1`
- **Protocol**: HTTPS only
- **Authentication**: Personal tokens (CXI_ prefix)
- **Content-Type**: `application/json`
- **CORS**: Enabled for web applications

### **Authentication System**
```typescript
interface AuthRequest {
  token: string;              // CXI_xxxxx format
  requiredPermissions?: string[];  // Optional permission check
}
```

---

## 🤖 **Agent API Endpoints**

### **1. ArchMaster Agent**
**Endpoint**: `/archmaster-agent`
**Method**: POST

#### **Request Format**:
```typescript
interface ArchMasterRequest {
  message: string;           // User task/question
  token?: string;           // Personal token for user context
  llm_mode?: 'codexi' | 'custom';  // LLM provider preference
  session_id?: string;      // Session continuity
  include_files?: boolean;  // Include user file access (default: true)
}
```

#### **Response Format**:
```typescript
interface ArchMasterResponse {
  analysis: string;         // Comprehensive analysis and recommendations
  session_id: string;      // Session identifier
  agent_id: number;        // Always 11 for ArchMaster
  agent_name: string;      // "ArchMaster"
  files_accessed: number;  // Count of user files accessed
  timestamp: string;       // ISO 8601 timestamp
}
```

#### **Example Usage**:
```bash
curl -X POST https://feefiyeqczhynxniuqxe.supabase.co/functions/v1/archmaster-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analyze my uploaded codebase and suggest improvements",
    "token": "CXI_your_token_here",
    "llm_mode": "codexi",
    "include_files": true
  }'
```

### **2. Specialized Agent Endpoints**

#### **FrontendMaster** (`/frontend-master-agent`)
```typescript
interface FrontendRequest {
  task: string;            // Frontend development task
  token?: string;         // Authentication token
  context?: {             // Optional context
    framework?: string;   // React, Vue, Angular
    styling?: string;     // Tailwind, CSS-in-JS, etc.
    requirements?: string[];
  };
}
```

#### **BackendForge** (`/backend-forge-agent`)
```typescript
interface BackendRequest {
  task: string;           // Backend development task
  token?: string;        // Authentication token
  context?: {            // Optional context
    language?: string;   // Node.js, Python, Go
    database?: string;   // PostgreSQL, MongoDB
    architecture?: string; // REST, GraphQL, microservices
  };
}
```

#### **SecurityGuard** (`/security-guard-agent`)
```typescript
interface SecurityRequest {
  task: string;          // Security analysis task
  token?: string;       // Authentication token
  context?: {           // Optional context
    audit_type?: string; // vulnerability, compliance, penetration
    frameworks?: string[];
    environment?: string; // development, staging, production
  };
}
```

### **3. ValidationCore Agent**
**Endpoint**: `/validation-core`
**Method**: POST

#### **Request Format**:
```typescript
interface ValidationRequest {
  request_type: string;     // Type of validation needed
  request_data: any;        // Data to validate
  requesting_agent_id: number; // Agent requesting validation
  token?: string;          // Authentication token
  session_id?: string;     // Session context
}
```

---

## 🗂️ **File Management API**

### **File Upload Process**

#### **1. Storage Upload** (via Supabase Storage)
```typescript
// Upload file to appropriate bucket
const { data, error } = await supabase.storage
  .from(bucketName)
  .upload(fileName, file);
```

#### **2. Metadata Registration** (via Database)
```typescript
interface UserFileRecord {
  user_id: string;         // UUID of file owner
  file_name: string;       // Original filename
  file_path: string;       // Storage path
  file_size: number;       // File size in bytes
  mime_type: string;       // MIME type
  bucket_name: string;     // Storage bucket
  file_type: 'upload' | 'screenshot' | 'codebase' | 'github';
  metadata: {              // Additional file information
    original_name: string;
    upload_timestamp: string;
    file_extension?: string;
  };
}
```

### **File Access by Agents**

#### **Access Logging**:
```typescript
interface AgentFileAccess {
  agent_id: number;        // Accessing agent ID
  user_id: string;         // File owner UUID
  file_id: string;         // File UUID
  access_type: 'read' | 'analyze' | 'process';
  access_context: {        // Context for access
    message_snippet: string;
    analysis_type: string;
  };
  session_id?: string;     // Optional session ID
}
```

#### **File Context Integration**:
Agents automatically receive file context when processing user requests:
```typescript
interface FileContext {
  total_files: number;
  file_types: {
    screenshots: number;
    codebase: number;
    uploads: number;
  };
  recent_uploads: UserFileRecord[];
  processing_status: {
    processed: number;
    pending: number;
    failed: number;
  };
}
```

---

## 🔐 **Authentication API**

### **Personal Token Generation**
**Endpoint**: `/generate-personal-token`
**Method**: POST

#### **Request**:
```typescript
interface TokenGenerationRequest {
  token_name: string;      // Human-readable token name
  permissions: {           // Permission scopes
    cli: string[];         // CLI permissions
    agent: string[];       // Agent access permissions
    project: string[];     // Project management permissions
  };
  expires_at?: string;     // Optional expiration (ISO 8601)
}
```

#### **Response**:
```typescript
interface TokenGenerationResponse {
  token: string;           // Full CXI_ token
  token_prefix: string;    // First 8 characters for identification
  permissions: object;     // Granted permissions
  expires_at?: string;     // Expiration timestamp
}
```

### **Token Validation**
**Endpoint**: `/validate-personal-token`
**Method**: POST

#### **Request**:
```typescript
interface TokenValidationRequest {
  token: string;                    // CXI_ token to validate
  requiredPermissions?: string[];   // Optional permission check
}
```

#### **Response**:
```typescript
interface TokenValidationResponse {
  valid: boolean;          // Token validity
  user_id?: string;        // User UUID if valid
  permissions?: object;    // Available permissions
  expires_at?: string;     // Token expiration
  last_used_at?: string;   // Last usage timestamp
}
```

---

## 📊 **Registry and Status APIs**

### **Agent Registry**
**Endpoint**: `/get-agent-registry`
**Method**: POST

#### **Response**:
```typescript
interface AgentRegistryResponse {
  agents: Array<{
    id: string;              // Agent UUID
    agent_number: number;    // Agent ID (1-20)
    agent_name: string;      // Agent name
    agent_codename: string;  // Technical codename
    team_name: string;       // Team assignment
    basic_role: string;      // Primary function
    capabilities: string[];  // Capability list
    specializations: string[]; // Specialized skills
    is_built: boolean;       // Implementation status
    is_active: boolean;      // Current availability
    performance_metrics: {   // Performance data
      tasks_completed: number;
      success_rate: number;
      avg_response_time: number;
      errors_count: number;
    };
  }>;
}
```

### **System Status Monitoring**

#### **Agent Performance Tracking**:
```typescript
interface AgentMetrics {
  agent_id: number;
  response_time_ms: number;
  success_rate: number;
  error_count: number;
  last_active: string;
  current_load: number;
}
```

#### **File System Status**:
```typescript
interface FileSystemStatus {
  total_files: number;
  storage_used_mb: number;
  processing_queue: number;
  recent_uploads: number;
  error_count: number;
}
```

---

## 🔄 **Integration Patterns**

### **1. Webhook Integration**

#### **GitHub Repository Sync**:
```typescript
interface GitHubWebhook {
  repository: {
    name: string;
    url: string;
    branch: string;
  };
  commits: Array<{
    id: string;
    message: string;
    author: string;
    timestamp: string;
  }>;
  user_id: string;         // CodeXI user mapping
}
```

#### **File Processing Events**:
```typescript
interface FileProcessingEvent {
  event_type: 'upload' | 'process' | 'complete' | 'error';
  file_id: string;
  user_id: string;
  processing_results?: object;
  error_details?: string;
}
```

### **2. Third-Party LLM Integration**

#### **Custom LLM Endpoint**:
```typescript
interface CustomLLMRequest {
  model: string;           // Model identifier
  messages: Array<{       // Conversation history
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature?: number;    // Response randomness
  max_tokens?: number;     // Response length limit
}
```

### **3. CLI Integration Pattern**

#### **Command Execution Flow**:
```typescript
// 1. CLI authenticates with personal token
const authResponse = await validateToken(token);

// 2. Map command to appropriate agent endpoint
const agentEndpoint = getAgentEndpoint(agentId);

// 3. Execute request with user context
const response = await callAgent(agentEndpoint, {
  task: userMessage,
  token: token,
  session_id: sessionId
});

// 4. Format and display response
displayResponse(response);
```

---

## 🚨 **Error Handling**

### **Standard Error Responses**
```typescript
interface APIError {
  error: string;           // Error message
  code?: string;          // Error code
  details?: object;       // Additional error details
  timestamp: string;      // Error timestamp
  request_id?: string;    // Request identifier for tracking
}
```

### **Common Error Codes**
```typescript
enum ErrorCodes {
  AUTHENTICATION_FAILED = 'AUTH_001',
  INVALID_TOKEN = 'AUTH_002',
  INSUFFICIENT_PERMISSIONS = 'AUTH_003',
  AGENT_UNAVAILABLE = 'AGENT_001',
  FILE_NOT_FOUND = 'FILE_001',
  FILE_TOO_LARGE = 'FILE_002',
  PROCESSING_FAILED = 'PROC_001',
  RATE_LIMIT_EXCEEDED = 'RATE_001',
  INTERNAL_ERROR = 'SYS_001'
}
```

### **Error Handling Best Practices**
```typescript
try {
  const response = await callAgent(agentEndpoint, request);
  return response.data;
} catch (error) {
  if (error.response?.status === 401) {
    // Handle authentication failure
    throw new Error('Authentication failed. Check your token.');
  } else if (error.response?.status === 429) {
    // Handle rate limiting
    throw new Error('Rate limit exceeded. Please try again later.');
  } else {
    // Handle generic errors
    throw new Error(`API Error: ${error.message}`);
  }
}
```

---

## 🔧 **Rate Limiting**

### **Current Limits**
- **Agent Requests**: 100 per minute per user
- **File Uploads**: 50 per hour per user
- **Authentication**: 10 per minute per IP
- **Registry Queries**: 1000 per hour per user

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 60
```

---

## 📋 **API Response Examples**

### **Successful Agent Response**
```json
{
  "analysis": "Based on your uploaded codebase, I've identified several areas for improvement:\n\n1. **Architecture Optimization**: Your current monolithic structure could benefit from microservices separation...",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "agent_id": 11,
  "agent_name": "ArchMaster",
  "files_accessed": 15,
  "timestamp": "2024-01-14T10:30:00Z"
}
```

### **Error Response**
```json
{
  "error": "Authentication failed. Invalid token provided.",
  "code": "AUTH_002",
  "details": {
    "token_prefix": "CXI_abc123",
    "reason": "Token expired"
  },
  "timestamp": "2024-01-14T10:30:00Z",
  "request_id": "req_xyz789"
}
```

### **File Upload Success**
```json
{
  "file_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "file_name": "components.tsx",
  "file_size": 15420,
  "processing_status": "pending",
  "upload_timestamp": "2024-01-14T10:30:00Z"
}
```

---

This API documentation provides complete integration guidance for developers building on top of the CodeXI platform, ensuring seamless connectivity between external systems and the agent ecosystem.
