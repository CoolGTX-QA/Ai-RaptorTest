import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

const riskDistribution = [
  { name: "High Risk", value: 3, color: "hsl(var(--destructive))" },
  { name: "Medium Risk", value: 12, color: "hsl(var(--chart-4))" },
  { name: "Low Risk", value: 8, color: "hsl(var(--chart-1))" },
];

const riskCoverageData = [
  { category: "Functional", covered: 85, uncovered: 15 },
  { category: "Security", covered: 65, uncovered: 35 },
  { category: "Performance", covered: 70, uncovered: 30 },
  { category: "Integration", covered: 50, uncovered: 50 },
];

const testCaseRisks = [
  {
    name: "User Login Authentication",
    type: "Functional",
    complexity: "Low",
    riskLevel: "Medium",
    riskScore: 70,
  },
  {
    name: "Password Reset Function",
    type: "Functional",
    complexity: "Low",
    riskLevel: "Medium",
    riskScore: 70,
  },
  {
    name: "Security - SQL Injection Prevention",
    type: "Security",
    complexity: "High",
    riskLevel: "High",
    riskScore: 89,
  },
  {
    name: "Shopping Cart Total",
    type: "Functional",
    complexity: "Medium",
    riskLevel: "Medium",
    riskScore: 65,
  },
  {
    name: "API Response Time",
    type: "Performance",
    complexity: "Medium",
    riskLevel: "Medium",
    riskScore: 65,
  },
  {
    name: "Performance Test - Home Page Load",
    type: "Performance",
    complexity: "Low",
    riskLevel: "Low",
    riskScore: 49,
  },
  {
    name: "Product Search",
    type: "Functional",
    complexity: "Low",
    riskLevel: "Low",
    riskScore: 48,
  },
  {
    name: "Cross-Browser Compatibility",
    type: "Compatibility",
    complexity: "Low",
    riskLevel: "Low",
    riskScore: 34,
  },
];

const riskLevelColors: Record<string, string> = {
  High: "bg-destructive text-destructive-foreground",
  Medium: "bg-chart-4 text-foreground",
  Low: "bg-chart-1 text-foreground",
};

export default function RiskAssessment() {
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

        {/* Risk Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                  <p className="text-3xl font-bold text-destructive">3</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-destructive">
                <TrendingUp className="mr-1 h-4 w-4" />
                +1 from last week
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Medium Risk</p>
                  <p className="text-3xl font-bold text-chart-4">12</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-4/10">
                  <Shield className="h-6 w-6 text-chart-4" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-chart-1">
                <TrendingDown className="mr-1 h-4 w-4" />
                -2 from last week
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Risk</p>
                  <p className="text-3xl font-bold text-chart-1">8</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-1/10">
                  <Shield className="h-6 w-6 text-chart-1" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-muted-foreground">
                No change from last week
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
              <CardDescription>Overview of test cases by risk level</CardDescription>
            </CardHeader>
            <CardContent>
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
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">{item.name}:</span>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Coverage */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Risk Coverage by Category</CardTitle>
              <CardDescription>Test coverage across different test types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskCoverageData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis
                      dataKey="category"
                      type="category"
                      width={80}
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
            </CardContent>
          </Card>
        </div>

        {/* Risk Factors */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Risk Factors</CardTitle>
            <CardDescription>
              Configure risk calculation parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <Label>Test Type Weight</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                Risk scores are calculated based on multiple factors weighted according to
                their impact on testing effectiveness and project stability.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test Case Risk Analysis */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Risk Assessment by Test Case</CardTitle>
            <CardDescription>
              Analyze risk levels for individual test cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Test Case</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Complexity</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead className="text-right">Risk Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testCaseRisks.map((testCase, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-foreground">
                      {testCase.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{testCase.type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {testCase.complexity}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(riskLevelColors[testCase.riskLevel])}
                      >
                        {testCase.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress
                          value={testCase.riskScore}
                          className="w-24 h-2"
                        />
                        <span className="text-sm font-medium text-foreground w-10">
                          {testCase.riskScore}%
                        </span>
                      </div>
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
