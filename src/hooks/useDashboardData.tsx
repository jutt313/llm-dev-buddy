
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useDashboardStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      // Get total projects
      const { count: projectCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get total chat sessions
      const { count: sessionCount } = await supabase
        .from("chat_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get total CLI commands
      const { count: cliCount } = await supabase
        .from("cli_commands")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get total cost from usage analytics
      const { data: costData } = await supabase
        .from("usage_analytics")
        .select("metric_value")
        .eq("user_id", user.id)
        .eq("metric_type", "cost");

      const totalCost = costData?.reduce((sum, item) => sum + Number(item.metric_value), 0) || 0;

      return {
        projects: projectCount || 0,
        sessions: sessionCount || 0,
        commands: cliCount || 0,
        cost: totalCost,
      };
    },
    enabled: !!user,
  });
};

export const useDashboardCharts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-charts", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      // Get usage analytics for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: analyticsData } = await supabase
        .from("usage_analytics")
        .select("*")
        .eq("user_id", user.id)
        .gte("recorded_at", sevenDaysAgo.toISOString())
        .order("recorded_at", { ascending: true });

      // Process data for charts
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days.push(dateStr);
      }

      // API Calls Chart Data
      const apiCallsData = last7Days.map(date => {
        const dayData = analyticsData?.filter(item => 
          item.recorded_at.startsWith(date) && item.metric_type === "api_call"
        ) || [];
        return {
          name: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
          value: dayData.reduce((sum, item) => sum + Number(item.metric_value), 0)
        };
      });

      // Token Usage Chart Data
      const tokenUsageData = last7Days.map(date => {
        const dayData = analyticsData?.filter(item => 
          item.recorded_at.startsWith(date) && item.metric_type === "token_usage"
        ) || [];
        return {
          name: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
          value: dayData.reduce((sum, item) => sum + Number(item.metric_value), 0)
        };
      });

      // Cost Chart Data
      const costData = last7Days.map(date => {
        const dayData = analyticsData?.filter(item => 
          item.recorded_at.startsWith(date) && item.metric_type === "cost"
        ) || [];
        return {
          name: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
          value: dayData.reduce((sum, item) => sum + Number(item.metric_value), 0)
        };
      });

      return {
        apiCalls: apiCallsData,
        tokenUsage: tokenUsageData,
        cost: costData,
      };
    },
    enabled: !!user,
  });
};

export const useRecentActivity = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recent-activity", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      // Get recent chat sessions
      const { data: sessions } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Get recent CLI commands
      const { data: commands } = await supabase
        .from("cli_commands")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Get recent projects
      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Combine and sort all activities
      const allActivities = [
        ...(sessions?.map(s => ({
          id: s.id,
          type: "chat" as const,
          title: s.session_title || "Untitled Chat Session",
          description: `${s.total_messages} messages, ${s.total_tokens_used} tokens used`,
          status: s.status || "active",
          created_at: s.created_at,
          metadata: { model: s.model_name, cost: s.total_cost }
        })) || []),
        ...(commands?.map(c => ({
          id: c.id,
          type: "cli" as const,
          title: c.command,
          description: c.command_type || "CLI Command",
          status: c.execution_status || "pending",
          created_at: c.created_at,
          metadata: { execution_time: c.execution_time_ms, output: c.output }
        })) || []),
        ...(projects?.map(p => ({
          id: p.id,
          type: "project" as const,
          title: p.name,
          description: p.description || "No description provided",
          status: p.status || "active",
          created_at: p.created_at,
          metadata: { type: p.project_type }
        })) || [])
      ];

      // Sort by creation date and take the 10 most recent
      return allActivities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
    },
    enabled: !!user,
  });
};
