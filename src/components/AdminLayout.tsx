import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Settings,
  LogOut,
  Menu,
  BarChart3,
  X,
  Bell,
  Search
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";

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
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden dark">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen opacity-50 animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen opacity-50 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 lg:w-64 flex flex-col glass-panel border-r-0 lg:border-r border-white/10 lg:bg-transparent lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-20 px-6">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
              <span className="text-xl font-bold text-white tracking-tighter">K</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Kubrik Admin
            </span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden text-white/70 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                to={item.href}
                className="relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                onMouseEnter={() => setIsHovered(item.name)}
                onMouseLeave={() => setIsHovered(null)}
                onClick={() => setSidebarOpen(false)}
              >
                {/* Active Indicator & Hover Background */}
                <AnimatePresence>
                  {(isActive || isHovered === item.name) && (
                    <motion.div
                      layoutId="sidebar-hover"
                      className={cn(
                        "absolute inset-0 rounded-xl z-0",
                        isActive ? "bg-primary/20 border border-primary/30" : "bg-white/5"
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

                {/* Left Active Bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full z-10 box-shadow-glow"
                  />
                )}

                <item.icon className={cn("h-5 w-5 z-10 transition-colors duration-200", isActive ? "text-primary shadow-primary" : "text-muted-foreground")} />
                <span className={cn("z-10 transition-colors duration-200", isActive ? "text-white font-semibold" : "text-muted-foreground hover:text-white/90")}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 m-4 rounded-2xl glass-panel relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex items-center gap-3 relative z-10 mb-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-sm font-bold text-white">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.username || 'Admin User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || 'admin@example.com'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-muted-foreground hover:text-white hover:bg-white/10 relative z-10 transition-all duration-300"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0 relative z-10">
        {/* Top Navbar */}
        <header className="h-20 glass-panel border-b border-white/5 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden text-white/70 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>

            {/* Global Search - Hidden on very small screens */}
            <div className="hidden sm:flex relative items-center w-64 lg:w-96 group">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search..."
                className="pl-10 bg-white/5 border-white/10 focus-visible:ring-primary/50 focus-visible:border-primary/50 text-white placeholder:text-muted-foreground/70 rounded-full h-10 transition-all duration-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            </Button>
          </div>
        </header>

        {/* Page Content with smooth entry animation */}
        <main className="flex-1 p-6 lg:p-10 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}