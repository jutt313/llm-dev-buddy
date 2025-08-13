
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Activity, TrendingUp, CreditCard, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CredentialDetailCardProps {
  credential: {
    id: string;
    credential_name: string;
    provider_id: string;
  };
}

interface AnalyticsData {
  totalRequests: number;
  successRate: number;
  errorRate: number;
  creditsUsed: number;
  usageOverTime: Array<{ date: string; requests: number; success: number; errors: number }>;
  responseTypes: Array<{ name: string; value: number; color: string }>;
  recentHistory: Array<{
    id: string;
    timestamp: string;
    status: string;
    model: string;
    tokens: number;
    cost: number;
  }>;
}

export const CredentialDetailCard = ({ credential }: CredentialDetailCardProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRequests: 0,
    successRate: 0,
    errorRate: 0,
    creditsUsed: 0,
    usageOverTime: [],
    responseTypes: [],
    recentHistory: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [credential.id]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch usage analytics
      const { data: usageData, error: usageError } = await supabase
        .from('usage_analytics')
        .select('*')
        .eq('provider_id', credential.provider_id)
        .order('recorded_at', { ascending: false });

      if (usageError) throw usageError;

      // Fetch chat sessions and messages related to this provider
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          chat_messages(*)
        `)
        .eq('provider_id', credential.provider_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (sessionsError) throw sessionsError;

      // Process the data
      const processedData = processAnalyticsData(usageData || [], sessionsData || []);
      setAnalytics(processedData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (usageData: any[], sessionsData: any[]): AnalyticsData => {
    const totalRequests = sessionsData.reduce((sum, session) => sum + (session.total_messages || 0), 0);
    const totalTokens = sessionsData.reduce((sum, session) => sum + (session.total_tokens_used || 0), 0);
    const totalCost = sessionsData.reduce((sum, session) => sum + (session.total_cost || 0), 0);

    // Calculate success rate (assuming active sessions are successful)
    const successfulSessions = sessionsData.filter(s => s.status === 'active').length;
    const successRate = sessionsData.length > 0 ? (successfulSessions / sessionsData.length) * 100 : 0;
    const errorRate = 100 - successRate;

    // Generate usage over time data (last 7 days)
    const usageOverTime = generateUsageOverTime(sessionsData);

    // Generate response types data
    const responseTypes = [
      { name: 'Success', value: successRate, color: '#10B981' },
      { name: 'Errors', value: errorRate, color: '#EF4444' }
    ];

    // Generate recent history
    const recentHistory = sessionsData.slice(0, 10).map(session => ({
      id: session.id,
      timestamp: session.created_at,
      status: session.status === 'active' ? 'Success' : 'Error',
      model: session.model_name || 'N/A',
      tokens: session.total_tokens_used || 0,
      cost: session.total_cost || 0
    }));

    return {
      totalRequests,
      successRate: Math.round(successRate),
      errorRate: Math.round(errorRate),
      creditsUsed: Math.round(totalCost * 100) / 100, // Convert to dollars
      usageOverTime,
      responseTypes,
      recentHistory
    };
  };

  const generateUsageOverTime = (sessionsData: any[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayData = sessionsData.filter(session => 
        session.created_at.startsWith(date)
      );
      
      const requests = dayData.length;
      const success = dayData.filter(s => s.status === 'active').length;
      const errors = requests - success;

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        requests,
        success,
        errors
      };
    });
  };

  if (loading) {
    return (
      <div className="p-8 bg-white/5 rounded-2xl border border-white/10">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-700 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-6">
      {/* Mini Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border-cyan-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.totalRequests.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.successRate}%</div>
            <p className="text-xs text-slate-400">
              {analytics.errorRate}% errors
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Credits Used</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${analytics.creditsUsed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.usageOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="requests" stroke="#06B6D4" strokeWidth={2} />
                <Line type="monotone" dataKey="success" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Response Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.responseTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {analytics.responseTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* History Panel */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recentHistory.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {analytics.recentHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'Success' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <p className="text-white font-medium">{item.model}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{item.tokens} tokens</p>
                    <p className="text-xs text-slate-400">${item.cost.toFixed(4)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
