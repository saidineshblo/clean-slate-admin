import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    ImageIcon,
    FolderOpen,
    Users,
    RefreshCw,
    ArrowUpDown,
} from "lucide-react";
import { analyticsApi, UserAnalyticsStats } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

// Service display names and colors
const SERVICE_DISPLAY: Record<string, { name: string; color: string }> = {
    nano_banana_pro: { name: "Nano Banana Pro", color: "bg-purple-100 text-purple-800 border-purple-200" },
    seedream: { name: "Seedream 4.5", color: "bg-blue-100 text-blue-800 border-blue-200" },
    flux_kontext: { name: "Flux Kontext", color: "bg-green-100 text-green-800 border-green-200" },
    nano_banana: { name: "Nano Banana", color: "bg-orange-100 text-orange-800 border-orange-200" },
    nano_banana_no_location: { name: "Nano Banana (No Location)", color: "bg-amber-100 text-amber-800 border-amber-200" },
    runwayml: { name: "RunwayML", color: "bg-pink-100 text-pink-800 border-pink-200" },
    unknown: { name: "Unknown", color: "bg-gray-100 text-gray-800 border-gray-200" },
};

export default function UserAnalytics() {
    const [analytics, setAnalytics] = useState<{
        users: UserAnalyticsStats[];
        total: number;
        page: number;
        per_page: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
        grand_total_cost: number;
        grand_total_generations: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState("total_cost");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true);
            const data = await analyticsApi.getUserAnalytics({
                page: currentPage,
                per_page: 20,
                sort_by: sortBy,
                sort_order: sortOrder,
            });
            setAnalytics(data);
        } catch (error: any) {
            toast({
                title: "Error Loading Analytics",
                description: error.message || "Failed to load user analytics",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [currentPage, sortBy, sortOrder]);

    const handleRefresh = () => {
        fetchAnalytics();
        toast({
            title: "Analytics Refreshed",
            description: "Data has been updated successfully.",
        });
    };

    const toggleRowExpand = (userId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(userId)) {
            newExpanded.delete(userId);
        } else {
            newExpanded.add(userId);
        }
        setExpandedRows(newExpanded);
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("desc");
        }
        setCurrentPage(1);
    };

    const getServiceDisplay = (serviceName: string) => {
        if (SERVICE_DISPLAY[serviceName]) {
            return SERVICE_DISPLAY[serviceName];
        }
        // For unknown services, display the actual name with formatting
        return {
            name: serviceName || "Unknown",
            color: "bg-gray-100 text-gray-800 border-gray-200"
        };
    };

    const formatCurrency = (amount: number) => {
        return `$${amount.toFixed(4)}`;
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">User Analytics</h1>
                        <p className="text-muted-foreground mt-1">Loading...</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                                <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 w-24 bg-muted animate-pulse rounded mb-2"></div>
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
                    <h1 className="text-3xl font-bold text-foreground">User Analytics</h1>
                    <p className="text-muted-foreground mt-1">
                        Generation statistics and costs per user
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.total || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all accounts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics?.grand_total_generations?.toLocaleString() || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            All services combined
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(analytics?.grand_total_cost || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Cumulative generation cost
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5" />
                        User Generation Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12"></TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort("project_count")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Projects
                                            <ArrowUpDown className="h-3 w-3" />
                                            {sortBy === "project_count" && (
                                                <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort("total_generations")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Generations
                                            <ArrowUpDown className="h-3 w-3" />
                                            {sortBy === "total_generations" && (
                                                <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort("total_cost")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Total Cost
                                            <ArrowUpDown className="h-3 w-3" />
                                            {sortBy === "total_cost" && (
                                                <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                                            )}
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analytics?.users.map((user) => (
                                    <>
                                        <TableRow
                                            key={user.user_id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => toggleRowExpand(user.user_id)}
                                        >
                                            <TableCell>
                                                {user.services_breakdown.length > 0 && (
                                                    expandedRows.has(user.user_id) ? (
                                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    )
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{user.username}</TableCell>
                                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.is_active ? "default" : "secondary"}>
                                                    {user.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{user.project_count}</TableCell>
                                            <TableCell>{user.total_generations.toLocaleString()}</TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(user.total_cost)}
                                            </TableCell>
                                        </TableRow>
                                        {expandedRows.has(user.user_id) && user.services_breakdown.length > 0 && (
                                            <TableRow key={`${user.user_id}-details`}>
                                                <TableCell colSpan={7} className="bg-muted/30 p-4">
                                                    <div className="space-y-2">
                                                        <h4 className="text-sm font-medium mb-3">Service Breakdown</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {user.services_breakdown.map((service) => {
                                                                const display = getServiceDisplay(service.service_name);
                                                                return (
                                                                    <div
                                                                        key={service.service_name}
                                                                        className="flex items-center justify-between p-3 rounded-lg border bg-background"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <Badge className={display.color}>
                                                                                {display.name}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-sm font-medium">
                                                                                {service.generation_count.toLocaleString()} generations
                                                                            </div>
                                                                            <div className="text-xs text-muted-foreground">
                                                                                {formatCurrency(service.total_cost)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                ))}
                                {analytics?.users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No user analytics data available
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {analytics && analytics.total_pages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-muted-foreground">
                                Page {analytics.page} of {analytics.total_pages} ({analytics.total} users)
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!analytics.has_prev}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!analytics.has_next}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
