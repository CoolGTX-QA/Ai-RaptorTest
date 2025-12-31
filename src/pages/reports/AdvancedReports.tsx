import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Bug,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ComposedChart,
  Line,
} from "recharts";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { StatCard } from "@/components/reports/StatCard";
import { ChartCard } from "@/components/reports/ChartCard";

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
  { cycle: "Cycle 1", planned: "2024-01-01", actual: "2024-01-02", tests: 120, passed: 95, duration: "3 days", passRate: 79 },
  { cycle: "Cycle 2", planned: "2024-01-08", actual: "2024-01-08", tests: 145, passed: 130, duration: "4 days", passRate: 90 },
  { cycle: "Cycle 3", planned: "2024-01-15", actual: "2024-01-16", tests: 168, passed: 155, duration: "5 days", passRate: 92 },
  { cycle: "Cycle 4", planned: "2024-01-22", actual: "2024-01-22", tests: 185, passed: 172, duration: "4 days", passRate: 93 },
];

export default function AdvancedReports() {
  const [selectedProject, setSelectedProject] = useState("all-projects");
  const [selectedTimeRange, setSelectedTimeRange] = useState("last-30");

  return (
    <AppLayout>
      <div className="space-y-6">
        <ReportHeader
          title="Advanced Reports"
          description="Test effort analysis, defect density, and test cycle summary"
          selectedProject={selectedProject}
          selectedTimeRange={selectedTimeRange}
          onProjectChange={setSelectedProject}
          onTimeRangeChange={setSelectedTimeRange}
        />

        <Tabs defaultValue="effort" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="effort" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Test Effort
            </TabsTrigger>
            <TabsTrigger value="density" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Defect Density
            </TabsTrigger>
            <TabsTrigger value="cycle" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Test Cycle
            </TabsTrigger>
          </TabsList>

          {/* Test Effort Analysis */}
          <TabsContent value="effort" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard title="Total Planned Hours" value="180h" />
              <StatCard title="Total Actual Hours" value="181h" />
              <StatCard 
                title="Variance" 
                value="+0.6%" 
                description="Within acceptable range"
                descriptionClassName="text-primary"
              />
            </div>

            <ChartCard title="Effort Variance by Module" description="Planned vs actual test effort comparison">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={testEffortData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="module" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                  <Bar dataKey="planned" name="Planned (hrs)" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual (hrs)" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Effort Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead className="text-center">Planned (hrs)</TableHead>
                      <TableHead className="text-center">Actual (hrs)</TableHead>
                      <TableHead className="text-center">Variance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testEffortData.map((item) => (
                      <TableRow key={item.module}>
                        <TableCell className="font-medium">{item.module}</TableCell>
                        <TableCell className="text-center">{item.planned}</TableCell>
                        <TableCell className="text-center">{item.actual}</TableCell>
                        <TableCell className="text-center">
                          <span className={item.variance < 0 ? "text-chart-1" : "text-destructive"}>
                            {item.variance > 0 ? "+" : ""}{item.variance}%
                          </span>
                        </TableCell>
                        <TableCell>
                          {item.variance <= 0 ? (
                            <Badge className="bg-chart-1 hover:bg-chart-1">
                              <TrendingDown className="mr-1 h-3 w-3" /> Under
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <TrendingUp className="mr-1 h-3 w-3" /> Over
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Defect Density */}
          <TabsContent value="density" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard title="Total LOC" value="27,400" />
              <StatCard title="Total Defects" value="43" />
              <StatCard 
                title="Avg Density" 
                value="1.57" 
                description="Defects per KLOC"
              />
            </div>

            <ChartCard title="Defect Density by Module" description="Defects per thousand lines of code">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={defectDensityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="module" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    formatter={(value: number, name: string) => {
                      if (name === "Density") return [value.toFixed(2), "Defects/KLOC"];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="defects" name="Defects" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="density" name="Density" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Density Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead className="text-center">Lines of Code</TableHead>
                      <TableHead className="text-center">Defects</TableHead>
                      <TableHead className="text-center">Density (per KLOC)</TableHead>
                      <TableHead>Risk Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defectDensityData.map((item) => (
                      <TableRow key={item.module}>
                        <TableCell className="font-medium">{item.module}</TableCell>
                        <TableCell className="text-center">{item.loc.toLocaleString()}</TableCell>
                        <TableCell className="text-center">{item.defects}</TableCell>
                        <TableCell className="text-center">{item.density.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={item.density < 1.5 ? "default" : item.density < 1.75 ? "secondary" : "destructive"}>
                            {item.density < 1.5 ? "Low" : item.density < 1.75 ? "Medium" : "High"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Cycle Summary */}
          <TabsContent value="cycle" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard title="Total Cycles" value="4" />
              <StatCard title="Tests Executed" value="618" />
              <StatCard title="Avg Pass Rate" value="88.5%" />
              <StatCard title="On-Time Delivery" value="50%" />
            </div>

            <ChartCard title="Test Cycle Progress" description="Pass rate improvement across cycles">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={testCycleData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="cycle" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} domain={[0, 100]} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="tests" name="Total Tests" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="passed" name="Passed" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="passRate" name="Pass Rate %" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Cycle Details</CardTitle>
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
                      <TableHead>Duration</TableHead>
                      <TableHead>Pass Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testCycleData.map((cycle) => (
                      <TableRow key={cycle.cycle}>
                        <TableCell className="font-medium">{cycle.cycle}</TableCell>
                        <TableCell>{cycle.planned}</TableCell>
                        <TableCell>{cycle.actual}</TableCell>
                        <TableCell className="text-center">{cycle.tests}</TableCell>
                        <TableCell className="text-center text-chart-1">{cycle.passed}</TableCell>
                        <TableCell>{cycle.duration}</TableCell>
                        <TableCell>
                          <Badge variant={cycle.passRate >= 90 ? "default" : "secondary"}>
                            {cycle.passRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={cycle.planned === cycle.actual ? "default" : "secondary"}>
                            {cycle.planned === cycle.actual ? "On Time" : "Delayed"}
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
