import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HealthProgressBar } from "@/components/HealthProgressBar";
import {
  Layers,
  FolderKanban,
  TestTube2,
  TrendingUp,
  Plus,
  Clock,
  ArrowRight,
  Sparkles,
  Play,
  BarChart3,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useMemo } from "react";
import { format, subMonths, startOfMonth } from "date-fns";

interface Project {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  status: string;
  workspace_id: string;
  workspace_name: string;
  passedCount: number;
  totalExecuted: number;
  healthPercentage: number;
}

interface DashboardStats {
  workspaceCount: number;
  projectCount: number;
  testCaseCount: number;
  executionRate: number;
  executedCount: number;
  totalExecutions: number;
}

interface ExecutionStatusCounts {
  passed: number;
  failed: number;
  blocked: number;
  notRun: number;
}

interface ActivityItem {
  id: string;
  entityName: string;
  actionType: string;
  userEmail: string;
  userName: string | null;
  createdAt: string;
}

const quickLinks = [
  {
    title: "My Workspaces",
    description: "Manage your workspaces",
    icon: Layers,
    href: "/workspaces",
  },
  {
    title: "Test Repository",
    description: "Create and manage test cases",
    icon: TestTube2,
    href: "/test-repository",
  },
  {
    title: "Test Execution",
    description: "Run and track test executions",
    icon: Play,
    href: "/test-execution",
  },
  {
    title: "Reports",
    description: "View testing analytics",
    icon: BarChart3,
    href: "/reports",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    workspaceCount: 0,
    projectCount: 0,
    testCaseCount: 0,
    executionRate: 0,
    executedCount: 0,
    totalExecutions: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statusCounts, setStatusCounts] = useState<ExecutionStatusCounts>({ passed: 0, failed: 0, blocked: 0, notRun: 0 });
  const [trendData, setTrendData] = useState<{ month: string; passed: number; failed: number; blocked: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const pieData = useMemo(() => {
    const total = statusCounts.passed + statusCounts.failed + statusCounts.blocked + statusCounts.notRun;
    if (total === 0) return [
      { name: "No Data", value: 100, color: "hsl(var(--muted))" },
    ];
    return [
      { name: "Passed", value: Math.round((statusCounts.passed / total) * 100), color: "hsl(var(--chart-1))" },
      { name: "Not Run", value: Math.round((statusCounts.notRun / total) * 100), color: "hsl(var(--chart-5))" },
      { name: "Failed", value: Math.round((statusCounts.failed / total) * 100), color: "hsl(var(--destructive))" },
      { name: "Blocked", value: Math.round((statusCounts.blocked / total) * 100), color: "hsl(var(--chart-4))" },
    ].filter(d => d.value > 0);
  }, [statusCounts]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setLoadingProjects(true);
      setLoadingStats(true);
      setLoadingActivity(true);
      
      try {
        // Get all workspaces user is a member of
        const { data: memberships, error: memberError } = await supabase
          .from("workspace_members")
          .select("workspace_id, workspaces(name)")
          .eq("user_id", user.id)
          .not("accepted_at", "is", null);

        if (memberError) throw memberError;

        const workspaceCount = memberships?.length || 0;

        if (!memberships || memberships.length === 0) {
          setProjects([]);
          setStats({ workspaceCount: 0, projectCount: 0, testCaseCount: 0, executionRate: 0, executedCount: 0, totalExecutions: 0 });
          setLoadingStats(false);
          setLoadingProjects(false);
          setLoadingActivity(false);
          return;
        }

        const workspaceIds = memberships.map((m) => m.workspace_id);
        const workspaceMap = new Map(
          memberships.map((m) => [
            m.workspace_id,
            (m.workspaces as any)?.name || "Unknown Workspace",
          ])
        );

        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("id, name, description, logo_url, status, workspace_id")
          .in("workspace_id", workspaceIds)
          .order("created_at", { ascending: false });

        if (projectsError) throw projectsError;

        const projectCount = projectsData?.length || 0;
        const projectIds = projectsData?.map((p) => p.id) || [];

        // Fetch test cases count
        let testCaseCount = 0;
        if (projectIds.length > 0) {
          const { count } = await supabase
            .from("test_cases")
            .select("*", { count: "exact", head: true })
            .in("project_id", projectIds);
          testCaseCount = count || 0;
        }

        // Fetch test executions for status counts, trends, and project health
        let executedCount = 0;
        let totalExecutions = 0;
        const projectHealthMap = new Map<string, { passed: number; total: number }>();
        let allStatusCounts: ExecutionStatusCounts = { passed: 0, failed: 0, blocked: 0, notRun: 0 };
        const monthlyData = new Map<string, { passed: number; failed: number; blocked: number }>();
        
        if (projectIds.length > 0) {
          const { data: testRuns } = await supabase
            .from("test_runs")
            .select("id, project_id, created_at")
            .in("project_id", projectIds);

          if (testRuns && testRuns.length > 0) {
            const runIds = testRuns.map((r) => r.id);
            const runToProjectMap = new Map(testRuns.map((r) => [r.id, r.project_id]));
            const runToDateMap = new Map(testRuns.map((r) => [r.id, r.created_at]));

            const { data: executions } = await supabase
              .from("test_executions")
              .select("test_run_id, status")
              .in("test_run_id", runIds);
            
            if (executions) {
              totalExecutions = executions.length;
              executions.forEach((exec) => {
                const projectId = runToProjectMap.get(exec.test_run_id);
                const runDate = runToDateMap.get(exec.test_run_id);

                // Overall status counts
                if (exec.status === "passed") allStatusCounts.passed++;
                else if (exec.status === "failed") allStatusCounts.failed++;
                else if (exec.status === "blocked") allStatusCounts.blocked++;
                else allStatusCounts.notRun++;

                if (exec.status !== "not_run") executedCount++;

                // Per-project health
                if (projectId) {
                  const current = projectHealthMap.get(projectId) || { passed: 0, total: 0 };
                  if (exec.status !== "not_run") {
                    current.total += 1;
                    if (exec.status === "passed") current.passed += 1;
                  }
                  projectHealthMap.set(projectId, current);
                }

                // Monthly trend
                if (runDate) {
                  const monthKey = format(new Date(runDate), "MMM");
                  const current = monthlyData.get(monthKey) || { passed: 0, failed: 0, blocked: 0 };
                  if (exec.status === "passed") current.passed++;
                  else if (exec.status === "failed") current.failed++;
                  else if (exec.status === "blocked") current.blocked++;
                  monthlyData.set(monthKey, current);
                }
              });
            }
          }
        }

        setStatusCounts(allStatusCounts);

        // Build trend data for last 6 months
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const d = subMonths(new Date(), i);
          const key = format(d, "MMM");
          const data = monthlyData.get(key) || { passed: 0, failed: 0, blocked: 0 };
          last6Months.push({ month: key, ...data });
        }
        setTrendData(last6Months);

        // Build projects with health data
        const projectsWithWorkspace = (projectsData || []).map((p) => {
          const health = projectHealthMap.get(p.id) || { passed: 0, total: 0 };
          const healthPercentage = health.total > 0 
            ? Math.round((health.passed / health.total) * 100) 
            : 0;
          return {
            ...p,
            workspace_name: workspaceMap.get(p.workspace_id) || "Unknown",
            passedCount: health.passed,
            totalExecuted: health.total,
            healthPercentage,
          };
        });

        setProjects(projectsWithWorkspace);

        const executionRate = totalExecutions > 0 
          ? Math.round((executedCount / totalExecutions) * 100) 
          : 0;

        setStats({ workspaceCount, projectCount, testCaseCount, executionRate, executedCount, totalExecutions });

        // Fetch real recent activity
        try {
          const { data: activities } = await supabase
            .from("activity_logs")
            .select("id, entity_name, action_type, user_id, created_at")
            .order("created_at", { ascending: false })
            .limit(8);

          if (activities && activities.length > 0) {
            const userIds = [...new Set(activities.map((a) => a.user_id))];
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, full_name, email")
              .in("id", userIds);
            const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

            setRecentActivity(activities.map((a) => ({
              id: a.id,
              entityName: a.entity_name || "Unknown",
              actionType: a.action_type,
              userEmail: profileMap.get(a.user_id)?.email || "Unknown",
              userName: profileMap.get(a.user_id)?.full_name || null,
              createdAt: a.created_at,
            })));
          }
        } catch {}

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoadingProjects(false);
        setLoadingStats(false);
        setLoadingActivity(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your testing activities.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/ai-generation">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Generate
              </Link>
            </Button>
            <Button asChild>
              <Link to="/test-repository">
                <Plus className="mr-2 h-4 w-4" />
                New Test Case
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card 
            className="border-border cursor-pointer hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300 group"
            onClick={() => navigate("/workspaces")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Workspaces</CardTitle>
              <Layers className="h-4 w-4 text-primary transition-transform duration-200 group-hover:scale-125" />
            </CardHeader>
            <CardContent>
              {loadingStats ? <Skeleton className="h-8 w-16" /> : (
                <>
                  <div className="text-2xl font-bold text-foreground">{stats.workspaceCount}</div>
                  <p className="text-xs text-primary">Click to view all</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card 
            className="border-border cursor-pointer hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300 group"
            onClick={() => navigate("/projects")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-primary transition-transform duration-200 group-hover:scale-125" />
            </CardHeader>
            <CardContent>
              {loadingStats ? <Skeleton className="h-8 w-16" /> : (
                <>
                  <div className="text-2xl font-bold text-foreground">{stats.projectCount}</div>
                  <p className="text-xs text-primary">Click to view all</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card 
            className="border-border cursor-pointer hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300 group"
            onClick={() => navigate("/test-repository")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Test Cases</CardTitle>
              <TestTube2 className="h-4 w-4 text-primary transition-transform duration-200 group-hover:scale-125" />
            </CardHeader>
            <CardContent>
              {loadingStats ? <Skeleton className="h-8 w-16" /> : (
                <>
                  <div className="text-2xl font-bold text-foreground">{stats.testCaseCount}</div>
                  <p className="text-xs text-primary">Click to manage</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card 
            className="border-border cursor-pointer hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300 group"
            onClick={() => navigate("/test-execution")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Execution Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary transition-transform duration-200 group-hover:scale-125" />
            </CardHeader>
            <CardContent>
              {loadingStats ? <Skeleton className="h-8 w-16" /> : (
                <>
                  <div className="text-2xl font-bold text-foreground">{stats.executionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.executedCount} of {stats.totalExecutions} executed
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All Projects Section */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">All Projects</CardTitle>
              <CardDescription>Projects from workspaces you have access to</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/projects">View All Projects</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/workspaces">Workspaces</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No projects found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a workspace and add projects to get started
                </p>
                <Button asChild>
                  <Link to="/workspaces">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Workspace
                  </Link>
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[280px]">
                <div className="space-y-2 pr-4">
                  {projects.slice(0, 10).map((project) => (
                    <div
                      key={project.id}
                      onClick={() => navigate(`/workspaces/${project.workspace_id}`)}
                      className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent group cursor-pointer"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 rounded-lg shrink-0">
                          <AvatarImage src={project.logo_url || undefined} alt={project.name} />
                          <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                            {project.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{project.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {project.workspace_name}
                          </p>
                          <div className="mt-2">
                            <HealthProgressBar 
                              percentage={project.healthPercentage}
                              totalExecuted={project.totalExecuted}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge
                          variant={project.status === "active" ? "default" : "secondary"}
                        >
                          {project.status}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Test Status Overview */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Test Status Overview</CardTitle>
              <CardDescription>Current test execution results</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Skeleton className="h-40 w-40 rounded-full" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="h-[200px] w-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {pieData.map((item) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">{item.name}:</span>
                        <span className="font-semibold text-foreground">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Execution Trend */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Test Execution Trend</CardTitle>
              <CardDescription>Last 6 months execution data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="month"
                      className="text-muted-foreground"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis
                      className="text-muted-foreground"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area type="monotone" dataKey="passed" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="failed" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="blocked" stackId="1" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links - Glowing Grid */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>
          <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-4">
            {quickLinks.map((link) => (
              <li key={link.title} className="min-h-[8rem] list-none">
                <div className="relative h-full rounded-xl border border-border p-2">
                  <GlowingEffect
                    spread={40}
                    glow
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={2}
                  />
                  <Link
                    to={link.href}
                    className="relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-lg border-0.75 border-border bg-card p-4 shadow-sm"
                  >
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                      <div className="w-fit rounded-lg border border-border p-2">
                        <link.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          {link.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-1">
          {/* Recent Activity */}
          <Card className="border-border">
      </div>
    </AppLayout>
  );
}
