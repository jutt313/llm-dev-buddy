
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, Zap } from 'lucide-react';

const Index = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Glowing background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <Zap className="h-8 w-8 text-cyan-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  CodeXI
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-slate-300">Welcome, {user?.email}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-slate-300 hover:bg-white/10"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="border-red-400/20 text-red-400 hover:bg-red-400/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Welcome to Your AI Development Hub
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Manage your LLM credentials, generate personal tokens, and integrate with your CLI development workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {/* Dashboard Card */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Dashboard</h3>
                  <p className="text-slate-400">Manage your account and view analytics</p>
                </div>
              </div>

              {/* LLM Credentials Card */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">LLM Credentials</h3>
                  <p className="text-slate-400">Securely store your AI API keys</p>
                </div>
              </div>

              {/* CLI Integration Card */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto">
                    <LogOut className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">CLI Setup</h3>
                  <p className="text-slate-400">Connect your development environment</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
