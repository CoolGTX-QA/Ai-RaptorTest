import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Shield,
  AlertTriangle,
  ChevronRight,
  Info,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";
import { useRiskScoring } from "@/hooks/useRiskData";
import { useProjects } from "@/hooks/useProjects";
import { useState, useMemo } from "react";

const riskLevelColors: Record<string, string> = {
  High: "bg-destructive text-destructive-foreground",
  Medium: "bg-chart-4 text-foreground",
  Low: "bg-chart-1 text-foreground",
};

export default function RiskAssessment() {
  const { data: projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all-projects");
  const { data: riskModules, isLoading } = useRiskScoring(selectedProjectId === "all-projects" ? undefined : selectedProjectId);

  const riskDistribution = useMemo(() => {
    if (!riskModules?.length) return [
      { name: "No Data", value: 1, color: "hsl(var(--muted))" },
    ];
    const high = riskModules.filter((m) => m.level === "High").length;
    const medium = riskModules.filter((m) => m.level === "Medium").length;
    const low = riskModules.filter((m) => m.level === "Low").length;
    return [
      { name: "High Risk", value: high, color: "hsl(var(--destructive))" },
      { name: "Medium Risk", value: medium, color: "hsl(var(--chart-4))" },
      { name: "Low Risk", value: low, color: "hsl(var(--chart-1))" },
    ].filter(d => d.value > 0);
  }, [riskModules]);

  const coverageData = useMemo(() => {
    if (!riskModules?.length) return [];
    return riskModules.slice(0, 4).map((m) => ({
      category: m.module,
      covered: m.coverage,
      uncovered: 100 - m.coverage,
    }));
  }, [riskModules]);

  const highCount = riskModules?.filter((m) => m.level === "High").length || 0;
  const mediumCount = riskModules?.filter((m) => m.level === "Medium").length || 0;
  const lowCount = riskModules?.filter((m) => m.level === "Low").length || 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>AI Tools</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Risk Assessment</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              Risk Analysis Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Identify high-risk areas in your test coverage
            </p>
          </div>
          {projects && projects.length > 0 && (
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-projects">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Risk Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                  {isLoading ? <Skeleton className="h-9 w-8 mt-1" /> : (
                    <p className="text-3xl font-bold text-destructive">{highCount}</p>
                  )}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-muted-foreground">
                <Shield className="mr-1 h-4 w-4" />
                {highCount} module{highCount !== 1 ? "s" : ""} need attention
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Medium Risk</p>
                  {isLoading ? <Skeleton className="h-9 w-8 mt-1" /> : (
                    <p className="text-3xl font-bold text-chart-4">{mediumCount}</p>
                  )}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-4/10">
                  <Shield className="h-6 w-6 text-chart-4" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-muted-foreground">
                <TrendingDown className="mr-1 h-4 w-4" />
                Monitor these areas
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Risk</p>
                  {isLoading ? <Skeleton className="h-9 w-8 mt-1" /> : (
                    <p className="text-3xl font-bold text-chart-1">{lowCount}</p>
                  )}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-1/10">
                  <Shield className="h-6 w-6 text-chart-1" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-muted-foreground">
                Well covered areas
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Risk Distribution */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Risk Distribution</CardTitle>
              <CardDescription>Overview of modules by risk level</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Skeleton className="h-40 w-40 rounded-full" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="h-[200px] w-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {riskDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-muted-foreground">{item.name}:</span>
                        <span className="font-semibold text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Coverage */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Risk Coverage by Module</CardTitle>
              <CardDescription>Test coverage across different modules</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[200px] flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : coverageData.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                  No data available
                </div>
              ) : (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={coverageData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis
                        dataKey="category"
                        type="category"
                        width={100}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="covered" stackId="a" fill="hsl(var(--chart-1))" />
                      <Bar dataKey="uncovered" stackId="a" fill="hsl(var(--muted))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Risk Factors */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Risk Factors</CardTitle>
            <CardDescription>Configure risk calculation parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <Label>Test Type Weight</Label>
                <Select defaultValue="medium">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Automation Status Weight</Label>
                <Select defaultValue="medium">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Risk Threshold: 70%</Label>
                <Slider defaultValue={[70]} max={100} step={5} />
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-md bg-accent p-3">
              <Info className="h-4 w-4 text-accent-foreground mt-0.5" />
              <p className="text-sm text-accent-foreground">
                Risk scores are calculated based on test coverage, execution results, and defect density for each module.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Module Risk Analysis Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Risk Assessment by Module</CardTitle>
            <CardDescription>Analyze risk levels for application modules</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !riskModules?.length ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No risk data available. Create test cases and run executions to generate risk scores.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Module</TableHead>
                    <TableHead>Tests</TableHead>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead className="text-right">Risk Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riskModules.map((module, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-foreground">{module.module}</TableCell>
                      <TableCell className="text-muted-foreground">{module.tests}</TableCell>
                      <TableCell className="text-muted-foreground">{module.coverage}%</TableCell>
                      <TableCell>
                        <Badge className={cn(riskLevelColors[module.level])}>{module.level}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={module.score} className="w-24 h-2" />
                          <span className="text-sm font-medium text-foreground w-10">{module.score}%</span>
                        </div>
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
