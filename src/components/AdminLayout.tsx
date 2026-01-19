import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Settings,
  LogOut,
  Menu,
  BarChart3
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "User Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Create User", href: "/admin/users/create", icon: UserPlus },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed positioning */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border bg-card">
            <h1 className="text-xl font-semibold text-foreground">Admin Panel</h1>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== "/admin" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => setSidebarOpen(false)} // Close mobile sidebar on navigation
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{user?.username || 'Admin'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || 'admin@example.com'}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Mobile header */}
        <div className="flex h-16 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 bg-background overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}