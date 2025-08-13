
import { useState } from "react";
import { Terminal, Download, Key, CheckCircle, Copy, ExternalLink, ChevronRight, Play, Book, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const CLISetupGuide = () => {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const CodeBlock = ({ code, label }: { code: string; label: string }) => (
    <div className="relative group">
      <pre className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-300 overflow-x-auto backdrop-blur-sm">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copyToClipboard(code, label)}
      >
        <Copy className="h-4 w-4" />
        {copiedCommand === label ? "Copied!" : "Copy"}
      </Button>
    </div>
  );

  const shortcuts = [
    {
      category: "🚀 Workflow & Project",
      commands: [
        { cmd: "codexi workflow init", desc: "Initialize new project with full setup" },
        { cmd: "codexi workflow sync", desc: "Sync project state across all agents" },
        { cmd: "codexi workflow clean", desc: "Clean temporary files and reset workspace" },
        { cmd: "codexi docs", desc: "Generate comprehensive documentation" },
        { cmd: "codexi build", desc: "Build project using appropriate agents" },
        { cmd: "codexi test", desc: "Run comprehensive tests via TestSentinel" }
      ]
    },
    {
      category: "📚 Session & History",
      commands: [
        { cmd: "codexi session history", desc: "View past CLI commands and chat sessions" },
        { cmd: "codexi session repeat <id>", desc: "Re-run previous command by index" },
        { cmd: "codexi session resume <id>", desc: "Resume paused multi-turn session" },
        { cmd: "codexi session list", desc: "List all active sessions" },
        { cmd: "codexi session clear", desc: "Clear session history" }
      ]
    },
    {
      category: "🤖 Agent Management",
      commands: [
        { cmd: "codexi agent list", desc: "List all 20 agents with capabilities" },
        { cmd: "codexi agent status <id>", desc: "Check specific agent availability" },
        { cmd: "codexi agent info <name>", desc: "Get detailed agent information" },
        { cmd: "codexi llm use <provider>", desc: "Switch default LLM provider" },
        { cmd: "codexi llm test <provider>", desc: "Test LLM credentials" }
      ]
    },
    {
      category: "🔍 Debug & Monitoring",
      commands: [
        { cmd: "codexi monitoring monitor", desc: "Real-time task monitoring dashboard" },
        { cmd: "codexi monitoring logs <agent>", desc: "Fetch recent logs for specific agent" },
        { cmd: "codexi monitoring retry <task>", desc: "Retry failed task without retyping" },
        { cmd: "codexi status", desc: "Quick system and project status" },
        { cmd: "codexi monitoring health", desc: "Comprehensive system health check" }
      ]
    },
    {
      category: "⚡ Productivity Boosters",
      commands: [
        { cmd: "codexi productivity alias set <name> <cmd>", desc: "Create custom CLI shortcuts" },
        { cmd: "codexi productivity stream <task>", desc: "Stream responses in real-time" },
        { cmd: "codexi shortcuts", desc: "Show all smart command shortcuts" },
        { cmd: "codexi productivity template <type>", desc: "Generate project templates" },
        { cmd: "codexi productivity workflow-preset <name>", desc: "Execute predefined workflows" }
      ]
    },
    {
      category: "⌨️ Terminal Controls",
      commands: [
        { cmd: "Ctrl+C", desc: "Cancel current command or action" },
        { cmd: "Ctrl+L", desc: "Clear terminal screen" },
        { cmd: "Ctrl+D", desc: "Exit CodeXI CLI gracefully" },
        { cmd: "↑/↓ Keys", desc: "Cycle through command history" },
        { cmd: "Tab", desc: "Auto-complete commands and options" }
      ]
    }
  ];

  const smartShortcuts = [
    { cmd: "codexi docs", expanded: "Generate comprehensive documentation including API docs, README, code comments, architecture diagrams" },
    { cmd: "codexi optimize", expanded: "Analyze and optimize project for performance, code quality, and best practices" },
    { cmd: "codexi security", expanded: "Perform comprehensive security audit with vulnerability scanning" },
    { cmd: "codexi deploy", expanded: "Deploy project with CI/CD pipeline setup and monitoring" },
    { cmd: "codexi refactor", expanded: "Refactor codebase for better structure and maintainability" },
    { cmd: "codexi api", expanded: "Design and implement RESTful API endpoints with documentation" },
    { cmd: "codexi frontend", expanded: "Create modern, responsive frontend components and UI" },
    { cmd: "codexi database", expanded: "Design and optimize database schema with migrations" }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-500/30">
            <Terminal className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">CodeXI CLI Setup Guide</h1>
        </div>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Complete guide to install, configure, and master the CodeXI command-line interface
        </p>
      </div>

      <Tabs defaultValue="installation" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="installation">Installation</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
          <TabsTrigger value="shortcuts">Smart Shortcuts</TabsTrigger>
        </TabsList>

        <TabsContent value="installation" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Download className="h-5 w-5 text-cyan-400" />
                Installation Steps
              </CardTitle>
              <CardDescription>
                Install CodeXI CLI globally on your system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                    <span className="text-sm font-bold text-cyan-400">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">Prerequisites</h3>
                    <p className="text-slate-400 mb-3">Ensure Node.js 18 or higher is installed on your system</p>
                    <CodeBlock code="node --version" label="Node version check" />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                    <span className="text-sm font-bold text-cyan-400">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">Install CodeXI CLI</h3>
                    <p className="text-slate-400 mb-3">Install globally using npm</p>
                    <CodeBlock code="npm install -g @codexi/cli" label="Install command" />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                    <span className="text-sm font-bold text-cyan-400">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">Verify Installation</h3>
                    <p className="text-slate-400 mb-3">Confirm CodeXI CLI is installed correctly</p>
                    <CodeBlock code="codexi --version" label="Version check" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-medium text-green-300">Success!</span>
                </div>
                <p className="text-green-200 mt-1">
                  CodeXI CLI is now installed and ready to use. Proceed to authentication.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Key className="h-5 w-5 text-cyan-400" />
                Authentication Setup
              </CardTitle>
              <CardDescription>
                Connect your CodeXI account using a personal access token
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                    <span className="text-sm font-bold text-cyan-400">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">Generate Personal Token</h3>
                    <p className="text-slate-400 mb-3">
                      Create a personal access token from your CodeXI dashboard
                    </p>
                    <Button variant="outline" className="border-slate-600 hover:bg-slate-800">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Go to Personal Tokens
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                    <span className="text-sm font-bold text-cyan-400">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">Login with Token</h3>
                    <p className="text-slate-400 mb-3">Use the login command and enter your token when prompted</p>
                    <CodeBlock code="codexi auth login" label="Login command" />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                    <span className="text-sm font-bold text-cyan-400">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">Verify Authentication</h3>
                    <p className="text-slate-400 mb-3">Check your authentication status</p>
                    <CodeBlock code="codexi auth status" label="Status check" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-blue-400" />
                  <span className="font-medium text-blue-300">Token Permissions</span>
                </div>
                <p className="text-blue-200 mt-1">
                  Ensure your token has CLI execution permissions to use all features.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">First Steps</CardTitle>
              <CardDescription>
                Try these commands after authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <CodeBlock code='codexi chat "Hello ArchMaster! Show me what you can do."' label="First chat" />
                <CodeBlock code="codexi agent list" label="List agents" />
                <CodeBlock code="codexi shortcuts" label="Show shortcuts" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commands" className="space-y-6">
          {shortcuts.map((section, index) => (
            <Card key={index} className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">{section.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {section.commands.map((command, cmdIndex) => (
                    <div
                      key={cmdIndex}
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <code className="text-cyan-400 font-mono text-sm bg-slate-700/30 px-2 py-1 rounded">
                          {command.cmd}
                        </code>
                        <p className="text-slate-300 mt-1 text-sm">{command.desc}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                        onClick={() => copyToClipboard(command.cmd, command.cmd)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Book className="h-5 w-5 text-cyan-400" />
                Usage Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">Initialize a React project:</h4>
                  <CodeBlock code='codexi workflow init --name "My React App" --type web --framework react' label="React init" />
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">Chat with specific agent:</h4>
                  <CodeBlock code='codexi agent chat 2 "Create a responsive navbar component"' label="Agent chat" />
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">Monitor CodeArchitect agent:</h4>
                  <CodeBlock code="codexi monitoring monitor --agent CodeArchitect --refresh 3" label="Monitor agent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shortcuts" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-cyan-400" />
                Smart Command Shortcuts
              </CardTitle>
              <CardDescription>
                Powerful one-word commands that expand into comprehensive instructions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {smartShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <code className="text-cyan-400 font-mono text-sm bg-slate-700/50 px-3 py-1 rounded-lg">
                          {shortcut.cmd}
                        </code>
                      </div>
                      <div className="flex-1">
                        <ChevronRight className="h-4 w-4 text-slate-500 mb-2" />
                        <p className="text-slate-300 text-sm leading-relaxed">{shortcut.expanded}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(shortcut.cmd, shortcut.cmd)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6 bg-slate-700/50" />

              <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="h-5 w-5 text-cyan-400" />
                  <span className="font-medium text-cyan-300">Pro Tip</span>
                </div>
                <p className="text-cyan-200 text-sm">
                  Use <code className="bg-slate-700/50 px-2 py-1 rounded">--verbose</code> with any shortcut 
                  to see the full expanded command before execution. Example: <code className="bg-slate-700/50 px-2 py-1 rounded">codexi docs --verbose</code>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Custom Aliases</CardTitle>
              <CardDescription>
                Create your own shortcuts for frequently used commands
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-white mb-2">Create a custom alias:</h4>
                  <CodeBlock code='codexi productivity alias set mytest "codexi workflow test --type unit --coverage"' label="Set alias" />
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">List your aliases:</h4>
                  <CodeBlock code="codexi productivity alias list" label="List aliases" />
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">Use your alias:</h4>
                  <CodeBlock code="codexi mytest" label="Use alias" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white text-center">Ready to Get Started?</CardTitle>
          <CardDescription className="text-center">
            You now have everything needed to master the CodeXI CLI
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
              20 AI Agents
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              Smart Shortcuts
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              Real-time Monitoring
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              Session Management
            </Badge>
          </div>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => copyToClipboard('codexi auth login', 'login command')}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Terminal className="h-4 w-4 mr-2" />
              Start with Login
            </Button>
            <Button 
              variant="outline" 
              onClick={() => copyToClipboard('codexi shortcuts', 'shortcuts command')}
              className="border-slate-600 hover:bg-slate-800"
            >
              <Zap className="h-4 w-4 mr-2" />
              View Shortcuts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CLISetupGuide;
