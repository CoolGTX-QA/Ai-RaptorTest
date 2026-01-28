import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Activity,
  Plus,
  Pencil,
  Trash2,
  Play,
  FileText,
  Bug,
  FolderKanban,
  Settings,
  Users,
  RefreshCw,
  Filter,
} from "lucide-react";
import { format, formatDistanceToNow, subDays } from "date-fns";

interface ActivityLog {
  id: string;
  user_id: string;
  workspace_id: string | null;
  project_id: string | null;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  details: Record<string, unknown>;
  created_at: string;
  user_name?: string;
  user_email?: string;
  project_name?: string;
  workspace_name?: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  create: <Plus className="h-4 w-4 text-emerald-500" />,
  update: <Pencil className="h-4 w-4 text-sky-500" />,
  delete: <Trash2 className="h-4 w-4 text-destructive" />,
  execute: <Play className="h-4 w-4 text-violet-500" />,
};

const entityIcons: Record<string, React.ReactNode> = {
  test_case: <FileText className="h-4 w-4" />,
  test_run: <Play className="h-4 w-4" />,
  defect: <Bug className="h-4 w-4" />,
  project: <FolderKanban className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  member: <Users className="h-4 w-4" />,
};

const actionLabels: Record<string, string> = {
  create: "created",
  update: "updated",
  delete: "deleted",
  execute: "executed",
};

const entityLabels: Record<string, string> = {
  test_case: "Test Case",
  test_run: "Test Run",
  defect: "Defect",
  project: "Project",
  settings: "Settings",
  member: "Member",
  workspace: "Workspace",
};

export default function ActivityLog() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("7");

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user, filter, dateRange]);

  const fetchActivities = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const daysAgo = subDays(new Date(), parseInt(dateRange));
      
      let query = supabase
        .from("activity_logs")
        .select("*")
        .gte("created_at", daysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(100);

      if (filter !== "all") {
        query = query.eq("action_type", filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch user profiles for activities
      const userIds = [...new Set(data?.map((a) => a.user_id) || [])];
      const projectIds = [...new Set(data?.filter((a) => a.project_id).map((a) => a.project_id) || [])];
      const workspaceIds = [...new Set(data?.filter((a) => a.workspace_id).map((a) => a.workspace_id) || [])];

      const [profilesResult, projectsResult, workspacesResult] = await Promise.all([
        userIds.length > 0
          ? supabase.from("profiles").select("id, full_name, email").in("id", userIds)
          : Promise.resolve({ data: [] as { id: string; full_name: string | null; email: string }[] }),
        projectIds.length > 0
          ? supabase.from("projects").select("id, name").in("id", projectIds)
          : Promise.resolve({ data: [] as { id: string; name: string }[] }),
        workspaceIds.length > 0
          ? supabase.from("workspaces").select("id, name").in("id", workspaceIds)
          : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      ]);

      const profileMap = new Map<string, { name: string | null; email: string }>(
        (profilesResult.data || []).map((p) => [p.id, { name: p.full_name, email: p.email }])
      );
      const projectMap = new Map<string, string>(
        (projectsResult.data || []).map((p) => [p.id, p.name])
      );
      const workspaceMap = new Map<string, string>(
        (workspacesResult.data || []).map((w) => [w.id, w.name])
      );

      const enrichedActivities: ActivityLog[] = (data || []).map((activity) => ({
        id: activity.id,
        user_id: activity.user_id,
        workspace_id: activity.workspace_id,
        project_id: activity.project_id,
        action_type: activity.action_type,
        entity_type: activity.entity_type,
        entity_id: activity.entity_id,
        entity_name: activity.entity_name,
        details: (activity.details || {}) as Record<string, unknown>,
        created_at: activity.created_at,
        user_name: profileMap.get(activity.user_id)?.name || "Unknown User",
        user_email: profileMap.get(activity.user_id)?.email || "",
        project_name: activity.project_id ? projectMap.get(activity.project_id) : undefined,
        workspace_name: activity.workspace_id ? workspaceMap.get(activity.workspace_id) : undefined,
      }));

      setActivities(enrichedActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case "create":
        return "default";
      case "update":
        return "secondary";
      case "delete":
        return "destructive";
      case "execute":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatActivityMessage = (activity: ActivityLog) => {
    const action = actionLabels[activity.action_type] || activity.action_type;
    const entity = entityLabels[activity.entity_type] || activity.entity_type;
    const name = activity.entity_name || "an item";
    
    return `${action} ${entity.toLowerCase()}: "${name}"`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Activity Log
              </h1>
              <p className="text-muted-foreground">
                Track recent activities across your workspaces and projects
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={fetchActivities} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Action Type</label>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Created</SelectItem>
                    <SelectItem value="update">Updated</SelectItem>
                    <SelectItem value="delete">Deleted</SelectItem>
                    <SelectItem value="execute">Executed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Time Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Last 7 days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 24 hours</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity List */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Showing activities from the last {dateRange} day{dateRange !== "1" ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No activities found</h3>
                <p className="text-sm text-muted-foreground">
                  Activities will appear here as you work on your projects
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {activity.user_name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">
                            {activity.user_name}
                          </span>
                          <Badge variant={getActionBadgeVariant(activity.action_type)}>
                            {actionIcons[activity.action_type]}
                            <span className="ml-1">{activity.action_type}</span>
                          </Badge>
                          <span className="text-muted-foreground flex items-center gap-1">
                            {entityIcons[activity.entity_type]}
                            {entityLabels[activity.entity_type] || activity.entity_type}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mt-1">
                          {formatActivityMessage(activity)}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span title={format(new Date(activity.created_at), "PPpp")}>
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </span>
                          {activity.project_name && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <FolderKanban className="h-3 w-3" />
                                {activity.project_name}
                              </span>
                            </>
                          )}
                          {activity.workspace_name && (
                            <>
                              <span>•</span>
                              <span>{activity.workspace_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
