import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
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
import { ReportHeader } from "@/components/reports/ReportHeader";
import { StatCard } from "@/components/reports/StatCard";
import { ChartCard } from "@/components/reports/ChartCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const testExecutionData = [
  { id: "TR-001", name: "Sprint 23 Regression", total: 85, passed: 72, failed: 8, blocked: 3, skipped: 2, date: "2024-01-15", duration: "4h 32m", project: "project-1" },
  { id: "TR-002", name: "Login Module Tests", total: 24, passed: 22, failed: 1, blocked: 1, skipped: 0, date: "2024-01-14", duration: "1h 15m", project: "project-1" },
  { id: "TR-003", name: "Payment Integration", total: 45, passed: 38, failed: 5, blocked: 2, skipped: 0, date: "2024-01-13", duration: "2h 45m", project: "project-2" },
  { id: "TR-004", name: "API Smoke Tests", total: 120, passed: 115, failed: 3, blocked: 0, skipped: 2, date: "2024-01-12", duration: "45m", project: "project-1" },
  { id: "TR-005", name: "UI Regression Suite", total: 65, passed: 55, failed: 6, blocked: 2, skipped: 2, date: "2024-01-11", duration: "3h 20m", project: "project-2" },
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
  const [selectedProject, setSelectedProject] = useState("all-projects");
  const [selectedTimeRange, setSelectedTimeRange] = useState("last-30");

  const filteredData = useMemo(() => {
    return testExecutionData.filter((run) => {
      if (selectedProject !== "all-projects" && run.project !== selectedProject) {
        return false;
      }
      return true;
    });
  }, [selectedProject]);

  const stats = useMemo(() => {
    const totalExecuted = filteredData.reduce((acc, run) => acc + run.total, 0);
    const totalPassed = filteredData.reduce((acc, run) => acc + run.passed, 0);
    const totalFailed = filteredData.reduce((acc, run) => acc + run.failed, 0);
    const passRate = totalExecuted > 0 ? ((totalPassed / totalExecuted) * 100).toFixed(1) : "0";
    
    return { totalExecuted, totalPassed, totalFailed, passRate };
  }, [filteredData]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <ReportHeader
          title="Test Execution Report"
          description="Run details, pass rates, and execution trends by sprint"
          selectedProject={selectedProject}
          selectedTimeRange={selectedTimeRange}
          onProjectChange={setSelectedProject}
          onTimeRangeChange={setSelectedTimeRange}
        />

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Executed"
            value={stats.totalExecuted}
            description="+45 from last sprint"
            icon={Play}
            descriptionClassName="text-primary"
          />
          <StatCard
            title="Pass Rate"
            value={`${stats.passRate}%`}
            description="+2.3% improvement"
            icon={CheckCircle2}
            iconClassName="text-chart-1"
            descriptionClassName="text-primary"
          />
          <StatCard
            title="Failed Tests"
            value={stats.totalFailed}
            description="+5 from last sprint"
            icon={XCircle}
            iconClassName="text-destructive"
            descriptionClassName="text-destructive"
          />
          <StatCard
            title="Avg Duration"
            value="2h 31m"
            description="-15min faster"
            icon={Clock}
            descriptionClassName="text-primary"
          />
        </div>

        {/* Execution Trend Chart */}
        <ChartCard title="Execution Trend by Sprint" description="Test execution results across sprints">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={executionTrendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="sprint" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Legend />
              <Area type="monotone" dataKey="passed" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="Passed" />
              <Area type="monotone" dataKey="failed" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.6} name="Failed" />
              <Area type="monotone" dataKey="blocked" stackId="1" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.6} name="Blocked" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

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
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No test runs found for the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((run) => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
