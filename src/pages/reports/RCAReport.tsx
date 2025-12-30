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
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  FileWarning,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

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
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">RCA Report</h1>
            <p className="text-muted-foreground">
              Root cause categories, preventive actions, and implementation tracking
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Total RCAs</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">30</div>
              <p className="text-xs text-muted-foreground">This quarter</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Implemented</CardTitle>
              <CheckCircle className="h-4 w-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">15</div>
              <p className="text-xs text-primary">50% completion</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">8</div>
              <p className="text-xs text-muted-foreground">Being worked on</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">7</div>
              <p className="text-xs text-destructive">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Root Cause Distribution */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Root Cause Categories</CardTitle>
              <CardDescription>Distribution of defects by root cause</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
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
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Action Status */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Preventive Action Status</CardTitle>
              <CardDescription>Implementation tracking overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={actionStatusData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis type="category" dataKey="status" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} width={100} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
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
                    <TableCell className="max-w-[150px] truncate">{rca.defect}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rca.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{rca.rootCause}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{rca.preventiveAction}</TableCell>
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
