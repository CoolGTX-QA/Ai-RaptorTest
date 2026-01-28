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
import { useExecutionReport } from "@/hooks/useReportData";
import { Skeleton } from "@/components/ui/skeleton";

export default function TestExecutionReport() {
  const [selectedProject, setSelectedProject] = useState("all-projects");
  const [selectedTimeRange, setSelectedTimeRange] = useState("last-30");

  const { data: reportData, isLoading } = useExecutionReport(
    selectedProject !== "all-projects" ? selectedProject : undefined,
    selectedTimeRange
  );

  const stats = reportData?.stats || { totalExecuted: 0, totalPassed: 0, totalFailed: 0, passRate: "0" };
  const testRuns = reportData?.testRuns || [];
  const trendData = reportData?.trendData || [];

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
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="pt-6">
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Executed"
                value={stats.totalExecuted}
                description={`${testRuns.length} test runs`}
                icon={Play}
                descriptionClassName="text-primary"
              />
              <StatCard
                title="Pass Rate"
                value={`${stats.passRate}%`}
                description="Overall pass rate"
                icon={CheckCircle2}
                iconClassName="text-chart-1"
                descriptionClassName="text-primary"
              />
              <StatCard
                title="Failed Tests"
                value={stats.totalFailed}
                description="Requires attention"
                icon={XCircle}
                iconClassName="text-destructive"
                descriptionClassName="text-destructive"
              />
              <StatCard
                title="Avg Duration"
                value={testRuns.length > 0 ? testRuns[0].duration : "N/A"}
                description="Latest run"
                icon={Clock}
                descriptionClassName="text-muted-foreground"
              />
            </>
          )}
        </div>

        {/* Execution Trend Chart */}
        <ChartCard title="Execution Trend" description="Test execution results across periods">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-[250px] w-full" />
            </div>
          ) : trendData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No trend data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="period" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Legend />
                <Area type="monotone" dataKey="passed" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="Passed" />
                <Area type="monotone" dataKey="failed" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.6} name="Failed" />
                <Area type="monotone" dataKey="blocked" stackId="1" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.6} name="Blocked" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Test Run Details Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Test Runs</CardTitle>
            <CardDescription>Detailed breakdown of test execution runs</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : testRuns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No test runs found. Create test runs to see data here.
              </div>
            ) : (
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
                  {testRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">{run.id.slice(0, 8)}</TableCell>
                      <TableCell>{run.name}</TableCell>
                      <TableCell>{run.date}</TableCell>
                      <TableCell className="text-center">{run.total}</TableCell>
                      <TableCell className="text-center text-chart-1">{run.passed}</TableCell>
                      <TableCell className="text-center text-destructive">{run.failed}</TableCell>
                      <TableCell className="text-center text-chart-4">{run.blocked}</TableCell>
                      <TableCell>{run.duration}</TableCell>
                      <TableCell>
                        <Badge variant={run.total > 0 && run.passed / run.total > 0.9 ? "default" : "secondary"}>
                          {run.total > 0 ? ((run.passed / run.total) * 100).toFixed(1) : 0}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
