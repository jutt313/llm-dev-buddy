
import ArchMasterManager from "@/components/agents/ArchMasterManager";
import AgentSystemStatus from "@/components/agents/AgentSystemStatus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AgentManager = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">CodeXI Agent Management</h1>
          <p className="text-slate-400">Manage and monitor your multi-agent AI system</p>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">System Overview</TabsTrigger>
            <TabsTrigger value="registry" className="data-[state=active]:bg-white/20">Agent Registry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <AgentSystemStatus />
          </TabsContent>
          
          <TabsContent value="registry" className="space-y-6">
            <ArchMasterManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentManager;
