import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  FileText,
  PieChart,
  Calendar,
  Play,
  Bug,
  Search,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers,
  Activity,
  Zap,
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";

// ==================== TEST EXECUTION REPORT DATA ====================
const testExecutionData = [
  { id: "TR-001", name: "Sprint 23 Regression", total: 85, passed: 72, failed: 8, blocked: 3, skipped: 2, date: "2024-01-15", duration: "4h 32m" },
  { id: "TR-002", name: "Login Module Tests", total: 24, passed: 22, failed: 1, blocked: 1, skipped: 0, date: "2024-01-14", duration: "1h 15m" },
  { id: "TR-003", name: "Payment Integration", total: 45, passed: 38, failed: 5, blocked: 2, skipped: 0, date: "2024-01-13", duration: "2h 45m" },
  { id: "TR-004", name: "API Smoke Tests", total: 120, passed: 115, failed: 3, blocked: 0, skipped: 2, date: "2024-01-12", duration: "45m" },
  { id: "TR-005", name: "UI Regression Suite", total: 65, passed: 55, failed: 6, blocked: 2, skipped: 2, date: "2024-01-11", duration: "3h 20m" },
];

const executionTrendData = [
  { sprint: "Sprint 18", passed: 180, failed: 15, blocked: 5 },
  { sprint: "Sprint 19", passed: 195, failed: 12, blocked: 3 },
  { sprint: "Sprint 20", passed: 210, failed: 18, blocked: 4 },
  { sprint: "Sprint 21", passed: 225, failed: 10, blocked: 2 },
  { sprint: "Sprint 22", passed: 240, failed: 8, blocked: 3 },
  { sprint: "Sprint 23", passed: 302, failed: 23, blocked: 8 },
];

// ==================== TEST ANALYTICS DATA ====================
const testTypeDistribution = [
  { name: "Functional", value: 145, color: "hsl(var(--chart-1))" },
  { name: "Integration", value: 68, color: "hsl(var(--chart-2))" },
  { name: "Performance", value: 32, color: "hsl(var(--chart-3))" },
  { name: "Security", value: 24, color: "hsl(var(--chart-4))" },
  { name: "Usability", value: 18, color: "hsl(var(--chart-5))" },
];

const testEfficiencyData = [
  { month: "Aug", automationRate: 45, defectDetection: 78, testCoverage: 65 },
  { month: "Sep", automationRate: 52, defectDetection: 82, testCoverage: 68 },
  { month: "Oct", automationRate: 58, defectDetection: 85, testCoverage: 72 },
  { month: "Nov", automationRate: 65, defectDetection: 88, testCoverage: 75 },
  { month: "Dec", automationRate: 72, defectDetection: 91, testCoverage: 78 },
  { month: "Jan", automationRate: 78, defectDetection: 94, testCoverage: 82 },
];

const qualityMetricsRadar = [
  { metric: "Test Coverage", value: 82, fullMark: 100 },
  { metric: "Pass Rate", value: 91, fullMark: 100 },
  { metric: "Automation", value: 78, fullMark: 100 },
  { metric: "Defect Detection", value: 94, fullMark: 100 },
  { metric: "Execution Speed", value: 85, fullMark: 100 },
  { metric: "Requirements Coverage", value: 88, fullMark: 100 },
];

// ==================== DEFECT LEAKAGE DATA ====================
const defectLeakageData = [
  { phase: "Unit Testing", found: 45, leaked: 12 },
  { phase: "Integration", found: 32, leaked: 8 },
  { phase: "System Testing", found: 28, leaked: 5 },
  { phase: "UAT", found: 15, leaked: 3 },
  { phase: "Production", found: 8, leaked: 0 },
];

const defectLeakageTrend = [
  { month: "Aug", leakageRate: 18 },
  { month: "Sep", leakageRate: 15 },
  { month: "Oct", leakageRate: 12 },
  { month: "Nov", leakageRate: 10 },
  { month: "Dec", leakageRate: 8 },
  { month: "Jan", leakageRate: 6 },
];

const defectsBySeverity = [
  { severity: "Critical", devPhase: 5, testPhase: 2, production: 1 },
  { severity: "High", devPhase: 12, testPhase: 8, production: 2 },
  { severity: "Medium", devPhase: 25, testPhase: 15, production: 4 },
  { severity: "Low", devPhase: 18, testPhase: 10, production: 1 },
];

// ==================== RCA REPORT DATA ====================
const rcaCategoryData = [
  { name: "Code Defects", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Requirement Gaps", value: 22, color: "hsl(var(--chart-2))" },
  { name: "Environment Issues", value: 15, color: "hsl(var(--chart-3))" },
  { name: "Test Data Issues", value: 12, color: "hsl(var(--chart-4))" },
  { name: "Integration Failures", value: 10, color: "hsl(var(--chart-5))" },
  { name: "Configuration", value: 6, color: "hsl(var(--destructive))" },
];

const rcaDetailedData = [
  { id: "RCA-001", defect: "Payment failure on checkout", category: "Code Defects", rootCause: "Null pointer exception in payment service", preventiveAction: "Add null checks and input validation", status: "Implemented" },
  { id: "RCA-002", defect: "Login timeout issues", category: "Environment Issues", rootCause: "Database connection pool exhaustion", preventiveAction: "Increase pool size and add monitoring", status: "In Progress" },
  { id: "RCA-003", defect: "Missing order confirmation", category: "Requirement Gaps", rootCause: "Email trigger not specified in requirements", preventiveAction: "Update requirement review checklist", status: "Implemented" },
  { id: "RCA-004", defect: "Data mismatch in reports", category: "Test Data Issues", rootCause: "Stale test data in staging environment", preventiveAction: "Implement data refresh automation", status: "Pending" },
  { id: "RCA-005", defect: "API response delay", category: "Integration Failures", rootCause: "Third-party service timeout not handled", preventiveAction: "Add circuit breaker pattern", status: "In Progress" },
];

// ==================== ADVANCED REPORTS DATA ====================
const requirementTraceability = [
  { requirement: "REQ-001", description: "User Registration", testCases: 12, executed: 12, passed: 11, coverage: 100 },
  { requirement: "REQ-002", description: "Login/Authentication", testCases: 18, executed: 18, passed: 17, coverage: 100 },
  { requirement: "REQ-003", description: "Product Catalog", testCases: 24, executed: 20, passed: 18, coverage: 83 },
  { requirement: "REQ-004", description: "Shopping Cart", testCases: 15, executed: 15, passed: 14, coverage: 100 },
  { requirement: "REQ-005", description: "Payment Processing", testCases: 22, executed: 18, passed: 16, coverage: 82 },
  { requirement: "REQ-006", description: "Order Management", testCases: 20, executed: 16, passed: 15, coverage: 80 },
];

const testEffortData = [
  { module: "Authentication", planned: 40, actual: 38, variance: -5 },
  { module: "Dashboard", planned: 32, actual: 35, variance: 9 },
  { module: "Reports", planned: 48, actual: 52, variance: 8 },
  { module: "User Management", planned: 36, actual: 34, variance: -6 },
  { module: "Settings", planned: 24, actual: 22, variance: -8 },
];

const defectDensityData = [
  { module: "Authentication", loc: 5200, defects: 8, density: 1.54 },
  { module: "Dashboard", loc: 8400, defects: 15, density: 1.79 },
  { module: "Reports", loc: 6800, defects: 12, density: 1.76 },
  { module: "User Management", loc: 4200, defects: 5, density: 1.19 },
  { module: "Settings", loc: 2800, defects: 3, density: 1.07 },
];

const testCycleData = [
  { cycle: "Cycle 1", planned: "2024-01-01", actual: "2024-01-02", tests: 120, passed: 95, duration: "3 days" },
  { cycle: "Cycle 2", planned: "2024-01-08", actual: "2024-01-08", tests: 145, passed: 130, duration: "4 days" },
  { cycle: "Cycle 3", planned: "2024-01-15", actual: "2024-01-16", tests: 168, passed: 155, duration: "5 days" },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("execution");

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive testing analytics and insights
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
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Report Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
            <TabsTrigger value="execution" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Test Execution</span>
              <span className="sm:hidden">Execution</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="leakage" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              <span className="hidden sm:inline">Defect Leakage</span>
              <span className="sm:hidden">Leakage</span>
            </TabsTrigger>
            <TabsTrigger value="rca" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">RCA Report</span>
              <span className="sm:hidden">RCA</span>
            </TabsTrigger>
            <TabsTrigger value="traceability" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Traceability</span>
              <span className="sm:hidden">Trace</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
              <span className="sm:hidden">More</span>
            </TabsTrigger>
          </TabsList>

          {/* ==================== TEST EXECUTION REPORT ==================== */}
          <TabsContent value="execution" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Executed</CardTitle>
                  <Play className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">339</div>
                  <p className="text-xs text-primary">+45 from last sprint</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-chart-1" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">89.1%</div>
                  <p className="text-xs text-primary">+2.3% improvement</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Failed Tests</CardTitle>
                  <XCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">23</div>
                  <p className="text-xs text-destructive">+5 from last sprint</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">2h 31m</div>
                  <p className="text-xs text-primary">-15min faster</p>
                </CardContent>
              </Card>
            </div>

            {/* Execution Trend Chart */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Execution Trend by Sprint</CardTitle>
                <CardDescription>Test execution results across sprints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={executionTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="sprint" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Legend />
                      <Area type="monotone" dataKey="passed" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="failed" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="blocked" stackId="1" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Test Run Details Table */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Test Runs</CardTitle>
                <CardDescription>Detailed breakdown of test execution runs</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Run ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Passed</TableHead>
                      <TableHead className="text-center">Failed</TableHead>
                      <TableHead className="text-center">Blocked</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Pass Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testExecutionData.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell className="font-medium">{run.id}</TableCell>
                        <TableCell>{run.name}</TableCell>
                        <TableCell>{run.date}</TableCell>
                        <TableCell className="text-center">{run.total}</TableCell>
                        <TableCell className="text-center text-chart-1">{run.passed}</TableCell>
                        <TableCell className="text-center text-destructive">{run.failed}</TableCell>
                        <TableCell className="text-center text-chart-4">{run.blocked}</TableCell>
                        <TableCell>{run.duration}</TableCell>
                        <TableCell>
                          <Badge variant={run.passed / run.total > 0.9 ? "default" : "secondary"}>
                            {((run.passed / run.total) * 100).toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== TEST ANALYTICS REPORT ==================== */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Test Type Distribution */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Test Type Distribution</CardTitle>
                  <CardDescription>Breakdown by testing category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="h-[250px] w-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie data={testTypeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                            {testTypeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {testTypeDistribution.map((item) => (
                        <div key={item.name} className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-muted-foreground">{item.name}:</span>
                          <span className="font-semibold text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quality Metrics Radar */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Quality Metrics Overview</CardTitle>
                  <CardDescription>Key quality indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={qualityMetricsRadar}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                        <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Efficiency Trends */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Testing Efficiency Trends</CardTitle>
                <CardDescription>Automation rate, defect detection, and coverage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={testEfficiencyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(value) => [`${value}%`]} />
                      <Legend />
                      <Line type="monotone" dataKey="automationRate" name="Automation Rate" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-1))" }} />
                      <Line type="monotone" dataKey="defectDetection" name="Defect Detection" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-2))" }} />
                      <Line type="monotone" dataKey="testCoverage" name="Test Coverage" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-3))" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== DEFECT LEAKAGE REPORT ==================== */}
          <TabsContent value="leakage" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Defects Found</CardTitle>
                  <Bug className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">128</div>
                  <p className="text-xs text-muted-foreground">Across all phases</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Leaked to Production</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">8</div>
                  <p className="text-xs text-primary">-3 from last quarter</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Leakage Rate</CardTitle>
                  <TrendingDown className="h-4 w-4 text-chart-1" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">6.25%</div>
                  <p className="text-xs text-primary">-2.5% improvement</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Detection Efficiency</CardTitle>
                  <Target className="h-4 w-4 text-chart-1" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">93.75%</div>
                  <p className="text-xs text-primary">Above target</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Defect Leakage by Phase */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Defect Leakage by Phase</CardTitle>
                  <CardDescription>Defects found vs leaked at each testing phase</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={defectLeakageData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="phase" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                        <Legend />
                        <Bar dataKey="found" name="Defects Found" fill="hsl(var(--chart-1))" />
                        <Bar dataKey="leaked" name="Defects Leaked" fill="hsl(var(--destructive))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Leakage Rate Trend */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Leakage Rate Trend</CardTitle>
                  <CardDescription>Monthly defect leakage percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={defectLeakageTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} domain={[0, 25]} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(value) => [`${value}%`, "Leakage Rate"]} />
                        <Line type="monotone" dataKey="leakageRate" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ fill: "hsl(var(--destructive))" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Defects by Severity and Phase */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Defects by Severity & Detection Phase</CardTitle>
                <CardDescription>Where defects of each severity are being caught</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={defectsBySeverity} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis dataKey="severity" type="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Legend />
                      <Bar dataKey="devPhase" name="Dev Phase" fill="hsl(var(--chart-1))" stackId="a" />
                      <Bar dataKey="testPhase" name="Test Phase" fill="hsl(var(--chart-2))" stackId="a" />
                      <Bar dataKey="production" name="Production" fill="hsl(var(--destructive))" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== RCA REPORT ==================== */}
          <TabsContent value="rca" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* RCA Category Distribution */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Root Cause Categories</CardTitle>
                  <CardDescription>Distribution of defect root causes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="h-[280px] w-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie data={rcaCategoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                            {rcaCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {rcaCategoryData.map((item) => (
                        <div key={item.name} className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-muted-foreground">{item.name}:</span>
                          <span className="font-semibold text-foreground">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* RCA Summary Stats */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">RCA Summary</CardTitle>
                  <CardDescription>Root cause analysis metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total RCAs Completed</p>
                      <p className="text-3xl font-bold text-foreground">47</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
                      <p className="text-3xl font-bold text-foreground">3.2 days</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Preventive Actions</p>
                      <p className="text-3xl font-bold text-foreground">38</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Implementation Rate</p>
                      <p className="text-3xl font-bold text-chart-1">81%</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Actions Implemented</span>
                      <span className="font-medium text-foreground">31/38</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-chart-1 rounded-full" style={{ width: "81%" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RCA Details Table */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">RCA Details</CardTitle>
                <CardDescription>Detailed root cause analysis for recent defects</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RCA ID</TableHead>
                      <TableHead>Defect</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Root Cause</TableHead>
                      <TableHead>Preventive Action</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rcaDetailedData.map((rca) => (
                      <TableRow key={rca.id}>
                        <TableCell className="font-medium">{rca.id}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{rca.defect}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{rca.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{rca.rootCause}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{rca.preventiveAction}</TableCell>
                        <TableCell>
                          <Badge variant={rca.status === "Implemented" ? "default" : rca.status === "In Progress" ? "secondary" : "outline"}>
                            {rca.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== REQUIREMENT TRACEABILITY ==================== */}
          <TabsContent value="traceability" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Requirements</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">48</div>
                  <p className="text-xs text-muted-foreground">Active requirements</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Test Cases Linked</CardTitle>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">111</div>
                  <p className="text-xs text-primary">2.3 avg per requirement</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Coverage</CardTitle>
                  <Target className="h-4 w-4 text-chart-1" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">90.8%</div>
                  <p className="text-xs text-primary">+3.2% this month</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-chart-1" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">91.9%</div>
                  <p className="text-xs text-primary">Above target</p>
                </CardContent>
              </Card>
            </div>

            {/* Traceability Matrix */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Requirement Traceability Matrix</CardTitle>
                <CardDescription>Track test coverage and execution status for each requirement</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requirement ID</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Test Cases</TableHead>
                      <TableHead className="text-center">Executed</TableHead>
                      <TableHead className="text-center">Passed</TableHead>
                      <TableHead className="text-center">Coverage</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requirementTraceability.map((req) => (
                      <TableRow key={req.requirement}>
                        <TableCell className="font-medium">{req.requirement}</TableCell>
                        <TableCell>{req.description}</TableCell>
                        <TableCell className="text-center">{req.testCases}</TableCell>
                        <TableCell className="text-center">{req.executed}</TableCell>
                        <TableCell className="text-center text-chart-1">{req.passed}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${req.coverage}%` }} />
                            </div>
                            <span className="text-sm">{req.coverage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={req.coverage === 100 ? "default" : req.coverage >= 80 ? "secondary" : "destructive"}>
                            {req.coverage === 100 ? "Complete" : req.coverage >= 80 ? "In Progress" : "At Risk"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== ADVANCED REPORTS ==================== */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Test Effort Analysis */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Test Effort Analysis</CardTitle>
                  <CardDescription>Planned vs actual testing hours by module</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={testEffortData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="module" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                        <Legend />
                        <Bar dataKey="planned" name="Planned Hours" fill="hsl(var(--chart-1))" />
                        <Bar dataKey="actual" name="Actual Hours" fill="hsl(var(--chart-2))" />
                        <Line type="monotone" dataKey="variance" name="Variance %" stroke="hsl(var(--destructive))" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Defect Density */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Defect Density by Module</CardTitle>
                  <CardDescription>Defects per 1000 lines of code</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={defectDensityData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="module" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(value, name) => [name === "density" ? Number(value).toFixed(2) : value, name === "density" ? "Defects/KLOC" : name]} />
                        <Legend />
                        <Bar dataKey="density" name="Defect Density" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Test Cycle Summary */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Test Cycle Summary</CardTitle>
                <CardDescription>Overview of testing cycles and their outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cycle</TableHead>
                      <TableHead>Planned Start</TableHead>
                      <TableHead>Actual Start</TableHead>
                      <TableHead className="text-center">Tests</TableHead>
                      <TableHead className="text-center">Passed</TableHead>
                      <TableHead className="text-center">Pass Rate</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testCycleData.map((cycle) => (
                      <TableRow key={cycle.cycle}>
                        <TableCell className="font-medium">{cycle.cycle}</TableCell>
                        <TableCell>{cycle.planned}</TableCell>
                        <TableCell className={cycle.planned !== cycle.actual ? "text-destructive" : ""}>
                          {cycle.actual}
                        </TableCell>
                        <TableCell className="text-center">{cycle.tests}</TableCell>
                        <TableCell className="text-center text-chart-1">{cycle.passed}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={cycle.passed / cycle.tests > 0.9 ? "default" : "secondary"}>
                            {((cycle.passed / cycle.tests) * 100).toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>{cycle.duration}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Completed</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Defect Density Details */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Module Quality Metrics</CardTitle>
                <CardDescription>Detailed quality metrics by module</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead className="text-right">Lines of Code</TableHead>
                      <TableHead className="text-center">Defects</TableHead>
                      <TableHead className="text-center">Density (per KLOC)</TableHead>
                      <TableHead>Quality Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defectDensityData.map((module) => (
                      <TableRow key={module.module}>
                        <TableCell className="font-medium">{module.module}</TableCell>
                        <TableCell className="text-right">{module.loc.toLocaleString()}</TableCell>
                        <TableCell className="text-center">{module.defects}</TableCell>
                        <TableCell className="text-center">{module.density.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={module.density < 1.5 ? "default" : module.density < 1.8 ? "secondary" : "destructive"}>
                            {module.density < 1.5 ? "Excellent" : module.density < 1.8 ? "Good" : "Needs Improvement"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
