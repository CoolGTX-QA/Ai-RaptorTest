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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Calendar,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";

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

export default function TestExecutionReport() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Test Execution Report</h1>
            <p className="text-muted-foreground">
              Run details, pass rates, and execution trends by sprint
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
      </div>
    </AppLayout>
  );
}
