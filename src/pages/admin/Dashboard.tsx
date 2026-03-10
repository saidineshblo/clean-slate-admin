import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import {
  Users,
  Shield,
  FolderOpen,
  Activity,
  Server,
  UserPlus,
  Settings,
  Database,
  Mail,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { dashboardApi } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

// Standard framer-motion variants for staggered entry
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface DashboardStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  admin_users: number;
  total_projects: number;
  projects_this_month: number;
  users_this_month: number;
  avg_projects_per_user: number;
}

interface SystemStatus {
  platform_version: string;
  database_status: string;
  email_service_status: string;
  aws_ses_quota: any;
  uptime: string;
  active_sessions: number;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

// Helper to generate fake trend data for sparklines
const generateTrendData = (baseValue: number, trendUp: boolean = true) => {
  return Array.from({ length: 14 }).map((_, i) => ({
    value: Math.max(0, baseValue * (1 + (trendUp ? i : -i) * 0.05 + (Math.random() * 0.2 - 0.1)))
  }));
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, statusData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getSystemStatus(),
      ]);
      setStats(statsData);
      setSystemStatus(statusData);
      setRecentActivity([]); // No recent activity API in original spec
    } catch (error: any) {
      toast({
        title: "Error Loading Dashboard",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
    toast({
      title: "Dashboard Refreshed",
      description: "Data has been updated successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-white/10 rounded-lg mb-2"></div>
            <div className="h-4 w-48 bg-white/5 rounded-lg"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 glass-card rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const activeRate = stats?.total_users ? ((stats.active_users / stats.total_users) * 100).toFixed(1) : 0;

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Platform Overview
          </h1>
          <p className="text-muted-foreground mt-1">Real-time metrics and system health</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="glass-card border-white/10 hover:bg-white/10 transition-colors">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(124,58,ed,0.5)]">
            <Link to="/admin/users/create">
              <UserPlus className="h-4 w-4 mr-2" />
              New User
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="glass-card relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <div className="p-2 bg-primary/20 rounded-lg">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold tracking-tight text-white">{stats?.total_users || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">+{stats?.users_this_month || 0} this month</span>
            </div>

            {/* Sparkline */}
            <div className="h-12 w-full mt-4 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateTrendData(stats?.total_users || 10, true)}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Global Projects */}
        <Card className="glass-card relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FolderOpen className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold tracking-tight text-white">{stats?.total_projects || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">+{stats?.projects_this_month || 0} this month</span>
            </div>

            {/* Sparkline */}
            <div className="h-12 w-full mt-4 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateTrendData(stats?.total_projects || 10, true)}>
                  <defs>
                    <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProjects)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Active Rate */}
        <Card className="glass-card relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Rate</CardTitle>
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold tracking-tight text-white">{activeRate}%</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground font-medium">
                {stats?.active_users} active of {stats?.total_users}
              </span>
            </div>

            {/* Sparkline */}
            <div className="h-12 w-full mt-4 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateTrendData(Number(activeRate) || 50, false)}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorActivity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Admins */}
        <Card className="glass-card relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admin Users</CardTitle>
            <div className="p-2 bg-rose-500/20 rounded-lg">
              <Shield className="h-4 w-4 text-rose-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold tracking-tight text-white">{stats?.admin_users || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/20">Elevated Access</Badge>
            </div>

            {/* Sparkline */}
            <div className="h-12 w-full mt-4 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateTrendData(stats?.admin_users || 2, false)}>
                  <defs>
                    <linearGradient id="colorAdmins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#f43f5e" fillOpacity={1} fill="url(#colorAdmins)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* System Status and Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 bg-white/5 rounded-lg">
                <Server className="h-5 w-5 text-white/70" />
              </div>
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">Platform Version</p>
                <p className="text-xs text-muted-foreground">Current release deployed</p>
              </div>
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20">
                v{systemStatus?.platform_version || '1.0.0'}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p - 2 rounded - full ${systemStatus?.database_status === 'healthy' ? 'bg-emerald-500/20' : 'bg-destructive/20'} `}>
                    <Database className={`h - 4 w - 4 ${systemStatus?.database_status === 'healthy' ? 'text-emerald-400' : 'text-destructive'} `} />
                  </div>
                  <span className="text-sm font-medium text-white/90">Primary Database</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    {systemStatus?.database_status === 'healthy' && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    <span className={`relative inline - flex rounded - full h - 2 w - 2 ${systemStatus?.database_status === 'healthy' ? 'bg-emerald-500' : 'bg-destructive'} `}></span>
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{systemStatus?.database_status || 'Unknown'}</span>
                </div>
              </div>

              <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p - 2 rounded - full ${systemStatus?.email_service_status === 'operational' ? 'bg-emerald-500/20' : 'bg-destructive/20'} `}>
                    <Mail className={`h - 4 w - 4 ${systemStatus?.email_service_status === 'operational' ? 'text-emerald-400' : 'text-destructive'} `} />
                  </div>
                  <span className="text-sm font-medium text-white/90">Email Gateway</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    {systemStatus?.email_service_status === 'operational' && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    <span className={`relative inline - flex rounded - full h - 2 w - 2 ${systemStatus?.email_service_status === 'operational' ? 'bg-emerald-500' : 'bg-destructive'} `}></span>
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{systemStatus?.email_service_status || 'Unknown'}</span>
                </div>
              </div>

              <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-blue-500/20">
                    <Activity className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-white/90">Active Sessions</span>
                </div>
                <div className="text-sm font-bold text-white pr-2">{systemStatus?.active_sessions || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Activity */}
        <div className="space-y-6">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 glass-panel border-white/10 hover:bg-white/10 hover:border-white/20 transition-all" asChild>
                <Link to="/admin/users">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-sm">Manage Users</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 glass-panel border-white/10 hover:bg-white/10 hover:border-white/20 transition-all" asChild>
                <Link to="/admin/users/create">
                  <UserPlus className="h-6 w-6 text-emerald-400" />
                  <span className="text-sm">Invite User</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 glass-panel border-white/10 hover:bg-white/10 hover:border-white/20 transition-all" asChild>
                <Link to="/admin/analytics">
                  <Activity className="h-6 w-6 text-blue-400" />
                  <span className="text-sm">View Analytics</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 glass-panel border-white/10 hover:bg-white/10 hover:border-white/20 transition-all" asChild>
                <Link to="/admin/settings">
                  <Settings className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm">Settings</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Mini Activity Feed */}
          <Card className="glass-card border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="mt-0.5 h-2 w-2 rounded-full bg-primary ring-4 ring-primary/20"></div>
                      <div>
                        <p className="text-sm font-medium text-white/90">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 px-4 border border-dashed border-white/10 rounded-xl">
                  <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recent system activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}