import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
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
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { StatCard } from "@/components/reports/StatCard";
import { ChartCard } from "@/components/reports/ChartCard";

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

const actionStatusData = [
  { status: "Implemented", count: 15 },
  { status: "In Progress", count: 8 },
  { status: "Pending", count: 5 },
  { status: "Blocked", count: 2 },
];

export default function RCAReport() {
  const [selectedProject, setSelectedProject] = useState("all-projects");
  const [selectedTimeRange, setSelectedTimeRange] = useState("last-30");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Implemented":
        return <Badge className="bg-chart-1 hover:bg-chart-1">{status}</Badge>;
      case "In Progress":
        return <Badge variant="secondary">{status}</Badge>;
      case "Pending":
        return <Badge variant="outline">{status}</Badge>;
      default:
        return <Badge variant="destructive">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <ReportHeader
          title="RCA Report"
          description="Root cause categories, preventive actions, and implementation tracking"
          selectedProject={selectedProject}
          selectedTimeRange={selectedTimeRange}
          onProjectChange={setSelectedProject}
          onTimeRangeChange={setSelectedTimeRange}
        />

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total RCAs"
            value="30"
            description="This quarter"
            icon={Search}
          />
          <StatCard
            title="Implemented"
            value="15"
            description="50% completion"
            icon={CheckCircle}
            iconClassName="text-chart-1"
            descriptionClassName="text-primary"
          />
          <StatCard
            title="In Progress"
            value="8"
            description="Being worked on"
            icon={Clock}
            iconClassName="text-chart-4"
          />
          <StatCard
            title="Pending"
            value="7"
            description="Requires attention"
            icon={AlertCircle}
            iconClassName="text-destructive"
            descriptionClassName="text-destructive"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Root Cause Distribution */}
          <ChartCard title="Root Cause Categories" description="Distribution of defects by root cause">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={rcaCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {rcaCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Action Status */}
          <ChartCard title="Preventive Action Status" description="Implementation tracking overview">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis type="category" dataKey="status" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} width={100} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* RCA Details Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">RCA Details</CardTitle>
            <CardDescription>Detailed root cause analysis and preventive actions</CardDescription>
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
                    <TableCell className="max-w-[150px] truncate" title={rca.defect}>{rca.defect}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rca.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={rca.rootCause}>{rca.rootCause}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={rca.preventiveAction}>{rca.preventiveAction}</TableCell>
                    <TableCell>{getStatusBadge(rca.status)}</TableCell>
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
