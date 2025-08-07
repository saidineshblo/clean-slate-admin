import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface DashboardStats {
  totalUsers: number;
  adminUsers: number;
  totalProjects: number;
  activeRate: number;
  userStats: { active: number; inactive: number };
  projectGrowth: number;
  activeRateChange: number;
}

interface SystemStatus {
  version: string;
  database: { status: string; health: string };
  emailService: { status: string; health: string };
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, statusData, activityData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getSystemStatus(),
        dashboardApi.getRecentActivity(),
      ]);
      
      setStats(statsData);
      setSystemStatus(statusData);
      setRecentActivity(activityData);
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Loading...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2"></div>
                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, admin</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" asChild>
            <Link to="/admin/users/create">
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {stats?.userStats.active || 0} active, {stats?.userStats.inactive || 0} inactive
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats?.projectGrowth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.adminUsers || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                Platform administrators
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Full platform access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                Avg {stats?.totalUsers ? Math.round((stats?.totalProjects || 0) / stats.totalUsers) : 0} per user
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats?.projectGrowth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeRate || 0}%</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className={`h-3 w-3 ${(stats?.activeRateChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <Badge variant="secondary" className="text-xs">
                User activation rate
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(stats?.activeRateChange || 0) >= 0 ? 'Increased' : 'Decreased'} by {Math.abs(stats?.activeRateChange || 0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Status and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Platform version {systemStatus?.version || '1.0.0'}</span>
              <Badge variant="secondary">Latest</Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className={`h-4 w-4 ${systemStatus?.database.health === 'healthy' ? 'text-green-600' : 'text-red-600'}`} />
                  <span className="text-sm">Database</span>
                </div>
                <Badge className={
                  systemStatus?.database.health === 'healthy' 
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-red-100 text-red-800 border-red-200"
                }>
                  {systemStatus?.database.status || 'Unknown'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className={`h-4 w-4 ${systemStatus?.emailService.health === 'healthy' ? 'text-green-600' : 'text-red-600'}`} />
                  <span className="text-sm">Email Service</span>
                </div>
                <Badge className={
                  systemStatus?.emailService.health === 'healthy' 
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-red-100 text-red-800 border-red-200"
                }>
                  {systemStatus?.emailService.status || 'Unknown'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-muted-foreground">Common administrative tasks</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/admin/users">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/admin/users/create">
                <UserPlus className="h-4 w-4 mr-2" />
                Create New User
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/admin/settings">
                <Settings className="h-4 w-4 mr-2" />
                System Information
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <p className="text-sm text-muted-foreground">Latest system events and user actions</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    {activity.type === 'user_registered' ? (
                      <UserPlus className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Settings className="h-4 w-4 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}