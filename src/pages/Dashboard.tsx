import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Layers,
  FolderKanban,
  TestTube2,
  TrendingUp,
  Plus,
  Clock,
  ArrowRight,
  Sparkles,
  Shield,
  Play,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
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

const stats = [
  {
    title: "Total Workspaces",
    value: "3",
    icon: Layers,
    change: "+1 this month",
  },
  {
    title: "Total Projects",
    value: "12",
    icon: FolderKanban,
    change: "+3 this month",
  },
  {
    title: "Test Cases",
    value: "246",
    icon: TestTube2,
    change: "+24 this week",
  },
  {
    title: "Execution Rate",
    value: "72%",
    icon: TrendingUp,
    change: "+5% vs last week",
  },
];

const pieData = [
  { name: "Passed", value: 58, color: "hsl(var(--chart-1))" },
  { name: "Not Run", value: 20, color: "hsl(var(--chart-5))" },
  { name: "Failed", value: 14, color: "hsl(var(--destructive))" },
  { name: "Blocked", value: 8, color: "hsl(var(--chart-4))" },
];

const trendData = [
  { month: "Jan", passed: 30, failed: 8, blocked: 2 },
  { month: "Feb", passed: 35, failed: 6, blocked: 4 },
  { month: "Mar", passed: 28, failed: 10, blocked: 3 },
  { month: "Apr", passed: 42, failed: 5, blocked: 2 },
  { month: "May", passed: 38, failed: 7, blocked: 1 },
  { month: "Jun", passed: 45, failed: 4, blocked: 2 },
];

const recentActivity = [
  {
    testCase: "User profile update validation",
    action: "was updated",
    user: "Alex Morgan",
    time: "3 hours ago",
  },
  {
    testCase: "Login authentication flow",
    action: "was executed",
    user: "Sarah Chen",
    time: "5 hours ago",
  },
  {
    testCase: "Payment gateway integration",
    action: "failed",
    user: "James Wilson",
    time: "6 hours ago",
  },
  {
    testCase: "API response validation",
    action: "was approved",
    user: "Emily Davis",
    time: "1 day ago",
  },
];

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
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, Demo User! Here's an overview of your testing activities.
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
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-primary">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Test Status Overview */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Test Status Overview</CardTitle>
              <CardDescription>Current test execution results</CardDescription>
            </CardHeader>
            <CardContent>
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
                    <Area
                      type="monotone"
                      dataKey="passed"
                      stackId="1"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="failed"
                      stackId="1"
                      stroke="hsl(var(--destructive))"
                      fill="hsl(var(--destructive))"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="blocked"
                      stackId="1"
                      stroke="hsl(var(--chart-4))"
                      fill="hsl(var(--chart-4))"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <CardDescription>Latest updates from your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-accent"
                  >
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        Test case{" "}
                        <span className="font-medium">"{activity.testCase}"</span>{" "}
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.user} • {activity.time}
                      </p>
                    </div>
                    {activity.action === "failed" && (
                      <Badge variant="destructive">Failed</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Links</CardTitle>
              <CardDescription>Navigate to key sections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  to={link.href}
                  className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent group"
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{link.title}</p>
                      <p className="text-xs text-muted-foreground">{link.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
