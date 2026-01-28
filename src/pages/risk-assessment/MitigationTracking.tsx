import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight, ShieldCheck, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const mitigationItems = [
  {
    id: 1,
    title: "Add authentication rate limiting",
    module: "Authentication",
    status: "completed",
    progress: 100,
    assignee: "John Doe",
    dueDate: "2024-01-15",
    riskReduction: 25,
  },
  {
    id: 2,
    title: "Increase payment test coverage",
    module: "Payment Processing",
    status: "in_progress",
    progress: 65,
    assignee: "Jane Smith",
    dueDate: "2024-02-01",
    riskReduction: 18,
  },
  {
    id: 3,
    title: "Implement SQL injection tests",
    module: "Security",
    status: "in_progress",
    progress: 30,
    assignee: "Bob Johnson",
    dueDate: "2024-02-15",
    riskReduction: 35,
  },
  {
    id: 4,
    title: "Add integration test suite",
    module: "Integration",
    status: "pending",
    progress: 0,
    assignee: "Unassigned",
    dueDate: "2024-03-01",
    riskReduction: 20,
  },
];

const statusStyles = {
  completed: {
    badge: "bg-chart-1 text-foreground",
    icon: CheckCircle2,
  },
  in_progress: {
    badge: "bg-chart-4 text-foreground",
    icon: Clock,
  },
  pending: {
    badge: "bg-muted text-muted-foreground",
    icon: AlertCircle,
  },
};

export default function MitigationTracking() {
  const completedCount = mitigationItems.filter((i) => i.status === "completed").length;
  const inProgressCount = mitigationItems.filter((i) => i.status === "in_progress").length;
  const totalRiskReduction = mitigationItems
    .filter((i) => i.status === "completed")
    .reduce((sum, i) => sum + i.riskReduction, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Risk Assessment</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Mitigation Tracking</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <ShieldCheck className="h-6 w-6 text-primary-foreground" />
              </div>
              Mitigation Tracking
            </h1>
            <p className="text-muted-foreground mt-2">
              Track risk mitigation actions and their progress
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Mitigation
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-3xl font-bold text-foreground">{mitigationItems.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-chart-1">{completedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-chart-4">{inProgressCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Risk Reduced</p>
                <p className="text-3xl font-bold text-primary">{totalRiskReduction}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mitigation Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Mitigation Actions</CardTitle>
            <CardDescription>
              Track all risk mitigation activities and their progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Risk Reduction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mitigationItems.map((item) => {
                  const StatusIcon = statusStyles[item.status as keyof typeof statusStyles].icon;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-foreground">
                        {item.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.module}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            statusStyles[item.status as keyof typeof statusStyles].badge
                          )}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {item.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={item.progress} className="w-20 h-2" />
                          <span className="text-sm text-muted-foreground">
                            {item.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.assignee}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.dueDate}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-chart-1 font-medium">
                          -{item.riskReduction}%
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
