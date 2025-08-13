
import { Activity, DollarSign, MessageSquare, Terminal, Code } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import ProfileDropdown from "@/components/dashboard/ProfileDropdown";
import DashboardChart from "@/components/dashboard/DashboardChart";
import ProjectHistoryTable from "@/components/dashboard/ProjectHistoryTable";
import { useDashboardStats, useDashboardCharts, useRecentActivity } from "@/hooks/useDashboardData";

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: charts, isLoading: chartsLoading } = useDashboardCharts();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Glowing background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
              CodeXI
            </h1>
            <p className="text-slate-400 text-lg font-medium">
              Build, Deploy & Scale AI-Powered Applications Effortlessly
            </p>
          </div>
          <ProfileDropdown />
        </div>

        {/* Stats Cards Row - 4 mini cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Projects"
            value={statsLoading ? "..." : stats?.projects || 0}
            icon={Activity}
            description="Active projects"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Chat Sessions"
            value={statsLoading ? "..." : stats?.sessions || 0}
            icon={MessageSquare}
            description="Conversations started"
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="CLI Commands"
            value={statsLoading ? "..." : stats?.commands || 0}
            icon={Terminal}
            description="Commands executed"
            trend={{ value: 15, isPositive: true }}
          />
          <StatsCard
            title="Total Spent"
            value={statsLoading ? "..." : `$${(stats?.cost || 0).toFixed(2)}`}
            icon={DollarSign}
            description="API usage cost"
            trend={{ value: 5, isPositive: false }}
          />
        </div>

        {/* Charts Row - Made larger and more prominent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <DashboardChart
            title="API Calls"
            data={charts?.apiCalls || []}
            type="line"
            color="#06b6d4"
            description="Daily API requests"
          />
          <DashboardChart
            title="Token Usage"
            data={charts?.tokenUsage || []}
            type="area"
            color="#3b82f6"
            description="Tokens consumed daily"
          />
          <DashboardChart
            title="Daily Costs"
            data={charts?.cost || []}
            type="bar"
            color="#8b5cf6"
            description="Spending per day"
          />
        </div>

        {/* Recent Activity Table */}
        <ProjectHistoryTable 
          data={recentActivity || []}
        />
      </div>
    </div>
  );
};

export default Dashboard;
