import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
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
import { ReportHeader } from "@/components/reports/ReportHeader";
import { StatCard } from "@/components/reports/StatCard";
import { ChartCard } from "@/components/reports/ChartCard";

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

export default function RequirementTraceability() {
  const [selectedProject, setSelectedProject] = useState("all-projects");
  const [selectedTimeRange, setSelectedTimeRange] = useState("last-30");

  const coverageByModule = useMemo(() => {
    return requirementTraceability.map(req => ({
      name: req.requirement,
      coverage: req.coverage,
      color: req.coverage >= 90 ? "hsl(var(--chart-1))" : req.coverage >= 75 ? "hsl(var(--chart-4))" : "hsl(var(--destructive))"
    }));
  }, []);

  const stats = useMemo(() => {
    const totalRequirements = requirementTraceability.length;
    const fullCoverage = requirementTraceability.filter(r => r.coverage === 100).length;
    const avgCoverage = Math.round(requirementTraceability.reduce((acc, r) => acc + r.coverage, 0) / totalRequirements);
    const totalTestCases = requirementTraceability.reduce((acc, r) => acc + r.testCases, 0);
    return { totalRequirements, fullCoverage, avgCoverage, totalTestCases };
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <ReportHeader
          title="Requirement Traceability"
          description="Coverage matrix linking requirements to test cases"
          selectedProject={selectedProject}
          selectedTimeRange={selectedTimeRange}
          onProjectChange={setSelectedProject}
          onTimeRangeChange={setSelectedTimeRange}
        />

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Requirements"
            value={stats.totalRequirements}
            description="Tracked in system"
            icon={FileText}
          />
          <StatCard
            title="Full Coverage"
            value={`${stats.fullCoverage}/${stats.totalRequirements}`}
            description={`${Math.round((stats.fullCoverage / stats.totalRequirements) * 100)}% complete`}
            icon={CheckCircle2}
            iconClassName="text-chart-1"
            descriptionClassName="text-primary"
          />
          <StatCard
            title="Avg Coverage"
            value={`${stats.avgCoverage}%`}
            icon={Target}
            iconClassName="text-chart-2"
          />
          <StatCard
            title="Linked Test Cases"
            value={stats.totalTestCases}
            description="Total linked"
            icon={Link2}
            iconClassName="text-chart-3"
          />
        </div>

        {/* Coverage Chart */}
        <ChartCard title="Coverage by Requirement" description="Test coverage percentage for each requirement">
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
        </ChartCard>

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
