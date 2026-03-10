import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Search,
  Filter,
  UserPlus,
  Download,
  Mail,
  Edit,
  Trash2,
  RefreshCw,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Link } from "react-router-dom";
import { usersApi } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
  project_count: number;
  last_login: string;
}

const tableVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Users");
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 10,
    total_pages: 1,
    has_next: false,
    has_prev: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Handle debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params: any = { page: pagination.page, per_page: pagination.per_page };

      if (debouncedSearch) params.query = debouncedSearch;
      if (statusFilter !== "All Users") params.is_active = statusFilter === "Active";
      if (statusFilter === "Admin") params.is_superuser = true;

      const response = await usersApi.getAll(params);

      if (response && response.users && Array.isArray(response.users)) {
        setUsers(response.users);
        setPagination({
          total: response.total || 0,
          page: response.page || 1,
          per_page: response.per_page || 10,
          total_pages: response.total_pages || 1,
          has_next: response.has_next || false,
          has_prev: response.has_prev || false
        });
      } else {
        setUsers([]);
        setPagination(prev => ({ ...prev, total: 0, total_pages: 1, has_next: false, has_prev: false }));
      }
    } catch (error: any) {
      toast({
        title: "Error Loading Users",
        description: error.message || "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 if filter or search changes
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, statusFilter, pagination.page]);

  const handleDeleteUser = async (userId: string) => {
    try {
      await usersApi.delete(userId);
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted.",
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      await usersApi.toggleStatus(userId, {
        is_active: !user?.is_active,
        reason: "Admin action"
      });
      toast({
        title: "Status Updated",
        description: "User status has been updated.",
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await usersApi.resetPassword(userId, {
        send_email: true,
        reason: "Admin requested password reset"
      });
      toast({
        title: "Password Reset",
        description: "New password has been sent to user's email.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("All Users");
  };

  const getStatusBadge = (user: User) => {
    if (user.is_superuser) {
      return <Badge className="bg-primary/20 text-primary border-primary/20">Admin</Badge>;
    }
    if (user.is_active) {
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20">Active</Badge>;
    }
    return <Badge className="bg-white/10 text-muted-foreground border-white/10">Inactive</Badge>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage platform access, roles, and user lifecycle ({pagination.total} total)</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchUsers} className="glass-card border-white/10 hover:bg-white/10">
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
      </div>

      {/* Filters Card */}
      <Card className="glass-card border-white/5 shadow-2xl relative z-10">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-primary" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 focus-visible:ring-primary/50 focus-visible:border-primary/50 text-white h-10 transition-all duration-300"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-3 text-muted-foreground hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 focus:ring-primary/50 text-white h-10">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="glass-panel border-white/10">
                  <SelectItem value="All Users">All Users</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || statusFilter !== "All Users") && (
                <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-white h-10 px-3">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table Card */}
      <Card className="glass-card border-white/5 shadow-2xl overflow-hidden relative z-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/5 pb-4">
          <div>
            <CardTitle className="text-lg font-medium text-white/90">
              Users Directory
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Page {pagination.page} of {pagination.total_pages}
            </p>
          </div>
          <Button variant="outline" size="sm" className="glass-panel border-white/10 text-white/80 hover:text-white">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full">
            <Table>
              <TableHeader className="bg-black/20 text-white hover:bg-black/20">
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="font-semibold text-white/70">User</TableHead>
                  <TableHead className="font-semibold text-white/70">Status</TableHead>
                  <TableHead className="font-semibold text-white/70">Projects</TableHead>
                  <TableHead className="font-semibold text-white/70">Created</TableHead>
                  <TableHead className="text-right font-semibold text-white/70 pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(pagination.per_page)].map((_, i) => (
                    <TableRow key={`skeleton-${i}`} className="border-white/5 border-b">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-white/10 animate-pulse rounded"></div>
                            <div className="h-3 w-40 bg-white/5 animate-pulse rounded"></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><div className="h-6 w-16 bg-white/10 animate-pulse rounded-full"></div></TableCell>
                      <TableCell><div className="h-4 w-12 bg-white/10 animate-pulse rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-24 bg-white/10 animate-pulse rounded"></div></TableCell>
                      <TableCell className="text-right">
                        <div className="h-8 w-8 bg-white/10 animate-pulse rounded-md ml-auto mr-2"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/80 to-purple-600/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 ring-2 ring-white/10">
                            <span className="text-sm font-bold text-white">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-white/90 group-hover:text-white transition-colors">{user.username}</div>
                            <div className="text-sm text-muted-foreground transition-colors group-hover:text-white/70">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-white/80">
                          <span className="font-semibold">{user.project_count}</span>
                          <span className="text-xs text-muted-foreground">projects</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-white/80 font-medium">
                          {new Date(user.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-white hover:bg-white/10 data-[state=open]:bg-white/10 data-[state=open]:text-white transition-colors">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-panel border-white/10 bg-background/95 min-w-[180px]">
                            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(user.id)}
                              className="cursor-pointer focus:bg-white/10 focus:text-white"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {user.is_active ? 'Deactivate User' : 'Activate User'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResetPassword(user.id)}
                              className="cursor-pointer focus:bg-white/10 focus:text-white"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                              className="text-red-400 focus:bg-red-500/20 focus:text-red-300 cursor-pointer"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground border-white/5">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Search className="h-8 w-8 text-muted-foreground/30" />
                        <p>No users found matching your criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Pagination Controls */}
        {pagination.total > 0 && (
          <div className="p-4 border-t border-white/5 bg-black/10">
            <Pagination className="justify-center sm:justify-between flex-wrap gap-4">
              <div className="hidden sm:block text-sm text-muted-foreground">
                Showing <span className="font-medium text-white/80">{((pagination.page - 1) * pagination.per_page) + 1}</span> to <span className="font-medium text-white/80">{Math.min(pagination.page * pagination.per_page, pagination.total)}</span> of <span className="font-medium text-white/80">{pagination.total}</span> users
              </div>

              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => pagination.has_prev && setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    className={`cursor-pointer ${!pagination.has_prev ? "opacity-50 pointer-events-none hover:bg-transparent" : "hover:bg-white/10 hover:text-white"}`}
                  />
                </PaginationItem>

                {/* Dynamically render page numbers. Just a simple current page view for brevity and robustness. */}
                <PaginationItem className="hidden md:block">
                  <PaginationLink isActive className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                    {pagination.page}
                  </PaginationLink>
                </PaginationItem>

                {pagination.total_pages > pagination.page && (
                  <PaginationItem className="hidden md:block">
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {pagination.total_pages > pagination.page && (
                  <PaginationItem className="hidden md:block">
                    <PaginationLink
                      onClick={() => setPagination(prev => ({ ...prev, page: pagination.total_pages }))}
                      className="cursor-pointer hover:bg-white/10 hover:text-white"
                    >
                      {pagination.total_pages}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => pagination.has_next && setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    className={`cursor-pointer ${!pagination.has_next ? "opacity-50 pointer-events-none hover:bg-transparent" : "hover:bg-white/10 hover:text-white"}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </motion.div>
  );
}