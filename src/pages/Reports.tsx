import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  FileText,
  PieChart,
  Calendar,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";

// Sample data - will be replaced with real data from database
const testStatusData = [
  { name: "Passed", value: 145, color: "hsl(var(--chart-1))" },
  { name: "Failed", value: 32, color: "hsl(var(--destructive))" },
  { name: "Blocked", value: 18, color: "hsl(var(--chart-4))" },
  { name: "Not Run", value: 51, color: "hsl(var(--chart-5))" },
];

const defectTrendData = [
  { week: "Week 1", open: 12, resolved: 8 },
  { week: "Week 2", open: 15, resolved: 10 },
  { week: "Week 3", open: 18, resolved: 14 },
  { week: "Week 4", open: 14, resolved: 16 },
  { week: "Week 5", open: 10, resolved: 12 },
  { week: "Week 6", open: 8, resolved: 9 },
];

const executionByPriorityData = [
  { priority: "Critical", passed: 45, failed: 5 },
  { priority: "High", passed: 62, failed: 12 },
  { priority: "Medium", passed: 38, failed: 10 },
  { priority: "Low", passed: 20, failed: 5 },
];

const coverageData = [
  { module: "Authentication", coverage: 92 },
  { module: "Dashboard", coverage: 78 },
  { module: "User Management", coverage: 85 },
  { module: "Reporting", coverage: 65 },
  { module: "Settings", coverage: 88 },
];

const summaryStats = [
  {
    title: "Total Test Cases",
    value: "246",
    change: "+12%",
    trend: "up",
    icon: FileText,
  },
  {
    title: "Pass Rate",
    value: "81.9%",
    change: "+3.2%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    title: "Open Defects",
    value: "24",
    change: "-8",
    trend: "down",
    icon: TrendingDown,
  },
  {
    title: "Test Coverage",
    value: "76%",
    change: "+5%",
    trend: "up",
    icon: PieChart,
  },
];

export default function Reports() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">
              View testing analytics and generate reports
            </p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all-projects">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-projects">All Projects</SelectItem>
                <SelectItem value="project-1">E-commerce Platform</SelectItem>
                <SelectItem value="project-2">Mobile App</SelectItem>
                <SelectItem value="project-3">Admin Dashboard</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="last-30">
              <SelectTrigger className="w-[150px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7">Last 7 days</SelectItem>
                <SelectItem value="last-30">Last 30 days</SelectItem>
                <SelectItem value="last-90">Last 90 days</SelectItem>
                <SelectItem value="all-time">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryStats.map((stat) => (
            <Card key={stat.title} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className={`text-xs ${stat.trend === "up" ? "text-primary" : "text-chart-1"}`}>
                  {stat.change} from last period
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Test Status Distribution */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Test Status Distribution</CardTitle>
              <CardDescription>Current test execution results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="h-[250px] w-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={testStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {testStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {testStatusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">{item.name}:</span>
                      <span className="font-semibold text-foreground">{item.value}</span>
                      <Badge variant="secondary" className="text-xs">
                        {((item.value / 246) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Defect Trend */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Defect Trend</CardTitle>
              <CardDescription>Open vs Resolved defects over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={defectTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="week"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="open"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--destructive))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-1))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Execution by Priority */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Execution by Priority</CardTitle>
              <CardDescription>Pass/fail distribution by test priority</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={executionByPriorityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      type="number"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="priority"
                      type="category"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="passed" fill="hsl(var(--chart-1))" stackId="a" />
                    <Bar dataKey="failed" fill="hsl(var(--destructive))" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Test Coverage by Module */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Test Coverage by Module</CardTitle>
              <CardDescription>Percentage of features covered by tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coverageData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="module"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`${value}%`, "Coverage"]}
                    />
                    <Bar dataKey="coverage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Reports */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Saved Reports</CardTitle>
              <CardDescription>Your generated and scheduled reports</CardDescription>
            </div>
            <Button>
              <BarChart3 className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No saved reports yet</p>
              <p className="text-sm">Generate a report to save it for future reference</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
