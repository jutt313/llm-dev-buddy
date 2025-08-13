
import { Activity, DollarSign, MessageSquare, Terminal } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              AI Development Hub
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your AI projects, credentials, and analytics in one place
            </p>
          </div>
          <ProfileDropdown />
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            title="Total Spent"
            value={statsLoading ? "..." : `$${(stats?.cost || 0).toFixed(2)}`}
            icon={DollarSign}
            description="API usage cost"
            trend={{ value: 5, isPositive: false }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <DashboardChart
            title="API Calls"
            data={charts?.apiCalls || []}
            type="line"
            color="hsl(142, 76%, 36%)"
            description="Daily API requests"
          />
          <DashboardChart
            title="Token Usage"
            data={charts?.tokenUsage || []}
            type="area"
            color="hsl(221, 83%, 53%)"
            description="Tokens consumed daily"
          />
          <DashboardChart
            title="Daily Costs"
            data={charts?.cost || []}
            type="bar"
            color="hsl(262, 83%, 58%)"
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
