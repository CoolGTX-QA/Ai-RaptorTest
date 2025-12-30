import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Target,
  Link2,
  CheckCircle2,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

const requirementTraceability = [
  { requirement: "REQ-001", description: "User Registration", testCases: 12, executed: 12, passed: 11, coverage: 100 },
  { requirement: "REQ-002", description: "Login/Authentication", testCases: 18, executed: 18, passed: 17, coverage: 100 },
  { requirement: "REQ-003", description: "Product Catalog", testCases: 24, executed: 20, passed: 18, coverage: 83 },
  { requirement: "REQ-004", description: "Shopping Cart", testCases: 15, executed: 15, passed: 14, coverage: 100 },
  { requirement: "REQ-005", description: "Payment Processing", testCases: 22, executed: 18, passed: 16, coverage: 82 },
  { requirement: "REQ-006", description: "Order Management", testCases: 20, executed: 16, passed: 15, coverage: 80 },
  { requirement: "REQ-007", description: "User Profile", testCases: 10, executed: 10, passed: 10, coverage: 100 },
  { requirement: "REQ-008", description: "Notifications", testCases: 8, executed: 6, passed: 6, coverage: 75 },
];

const coverageByModule = requirementTraceability.map(req => ({
  name: req.requirement,
  coverage: req.coverage,
  color: req.coverage >= 90 ? "hsl(var(--chart-1))" : req.coverage >= 75 ? "hsl(var(--chart-4))" : "hsl(var(--destructive))"
}));

export default function RequirementTraceability() {
  const totalRequirements = requirementTraceability.length;
  const fullCoverage = requirementTraceability.filter(r => r.coverage === 100).length;
  const avgCoverage = Math.round(requirementTraceability.reduce((acc, r) => acc + r.coverage, 0) / totalRequirements);
  const totalTestCases = requirementTraceability.reduce((acc, r) => acc + r.testCases, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Requirement Traceability</h1>
            <p className="text-muted-foreground">
              Coverage matrix linking requirements to test cases
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Requirements</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalRequirements}</div>
              <p className="text-xs text-muted-foreground">Tracked in system</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Full Coverage</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{fullCoverage}/{totalRequirements}</div>
              <p className="text-xs text-primary">{Math.round((fullCoverage / totalRequirements) * 100)}% complete</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Coverage</CardTitle>
              <Target className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{avgCoverage}%</div>
              <Progress value={avgCoverage} className="mt-2 h-2" />
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Linked Test Cases</CardTitle>
              <Link2 className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalTestCases}</div>
              <p className="text-xs text-muted-foreground">Total linked</p>
            </CardContent>
          </Card>
        </div>

        {/* Coverage Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Coverage by Requirement</CardTitle>
            <CardDescription>Test coverage percentage for each requirement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coverageByModule}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} domain={[0, 100]} unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    formatter={(value: number) => [`${value}%`, "Coverage"]}
                  />
                  <Bar dataKey="coverage" radius={[4, 4, 0, 0]}>
                    {coverageByModule.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Traceability Matrix */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Traceability Matrix</CardTitle>
            <CardDescription>Detailed requirement to test case mapping</CardDescription>
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
                        <Progress value={req.coverage} className="h-2 w-16" />
                        <span className="text-sm">{req.coverage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={req.coverage === 100 ? "default" : req.coverage >= 80 ? "secondary" : "destructive"}
                      >
                        {req.coverage === 100 ? "Complete" : req.coverage >= 80 ? "Partial" : "Low"}
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
