import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Play,
  ChevronRight,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const testCycles = [
  {
    id: "TC-1",
    name: "Regression 2.1",
    startDate: "2025-01-15",
    progress: 45,
    total: 20,
    passed: 6,
    failed: 2,
    blocked: 1,
    notRun: 11,
  },
  {
    id: "TC-2",
    name: "Milestone 3 Sprint 2",
    startDate: "2025-01-10",
    progress: 80,
    total: 15,
    passed: 10,
    failed: 1,
    blocked: 1,
    notRun: 3,
  },
  {
    id: "TC-3",
    name: "Smoke Test Release 5.0",
    startDate: "2025-01-08",
    progress: 100,
    total: 10,
    passed: 9,
    failed: 1,
    blocked: 0,
    notRun: 0,
  },
];

const cycleTestCases = [
  { id: "TR-1", name: "User Login Authentication", priority: "High", status: "Not Run" },
  { id: "TR-2", name: "Add Product to Cart", priority: "High", status: "Not Run" },
  { id: "TR-3", name: "Checkout Process", priority: "Critical", status: "Pass" },
  { id: "TR-4", name: "Password Reset Function", priority: "Medium", status: "Fail" },
  { id: "TR-5", name: "API Response Time", priority: "Medium", status: "Blocked" },
];

const statusIcons: Record<string, React.ReactNode> = {
  "Not Run": <Clock className="h-4 w-4 text-muted-foreground" />,
  Pass: <CheckCircle2 className="h-4 w-4 text-chart-1" />,
  Fail: <XCircle className="h-4 w-4 text-destructive" />,
  Blocked: <AlertCircle className="h-4 w-4 text-chart-4" />,
};

const statusColors: Record<string, string> = {
  "Not Run": "border-muted text-muted-foreground",
  Pass: "border-chart-1 text-chart-1",
  Fail: "border-destructive text-destructive",
  Blocked: "border-chart-4 text-chart-4",
};

const priorityColors: Record<string, string> = {
  Critical: "bg-destructive text-destructive-foreground",
  High: "bg-chart-4 text-foreground",
  Medium: "bg-chart-1 text-foreground",
  Low: "bg-muted text-muted-foreground",
};

export default function TestExecution() {
  const [selectedCycle, setSelectedCycle] = useState(testCycles[0]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = (testId: string, newStatus: string) => {
    toast({
      title: "Status updated",
      description: `Test case ${testId} marked as ${newStatus}`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Workspaces</span>
          <ChevronRight className="h-4 w-4" />
          <span>Projects</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Test Execution</span>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Play className="h-6 w-6 text-primary-foreground" />
              </div>
              Test Execution
            </h1>
            <p className="text-muted-foreground mt-2">
              Run and track test execution cycles
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Test Cycle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Test Cycle</DialogTitle>
                <DialogDescription>
                  Create a new test execution cycle
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="cycle-name">Cycle Name</Label>
                  <Input id="cycle-name" placeholder="e.g., Regression 2.2" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input id="start-date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label>Select Test Cases</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose test suite" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tests</SelectItem>
                      <SelectItem value="user-mgmt">User Management</SelectItem>
                      <SelectItem value="shopping">Shopping Cart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setIsCreateOpen(false);
                  toast({
                    title: "Test cycle created",
                    description: "New test cycle has been created successfully.",
                  });
                }}>
                  Create Cycle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Test Cycles Sidebar */}
          <Card className="h-fit border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">Test Cycles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {testCycles.map((cycle) => (
                <button
                  key={cycle.id}
                  onClick={() => setSelectedCycle(cycle)}
                  className={cn(
                    "w-full rounded-lg border border-border p-3 text-left transition-all hover:border-primary/50",
                    selectedCycle.id === cycle.id && "border-primary bg-accent"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{cycle.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {cycle.progress}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    {cycle.startDate}
                  </div>
                  <Progress value={cycle.progress} className="h-1.5" />
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="text-chart-1">{cycle.passed} passed</span>
                    <span className="text-destructive">{cycle.failed} failed</span>
                    <span className="text-muted-foreground">{cycle.notRun} pending</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Selected Cycle Details */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <Card className="border-border">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-chart-1" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{selectedCycle.passed}</p>
                      <p className="text-xs text-muted-foreground">Passed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{selectedCycle.failed}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-chart-4" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{selectedCycle.blocked}</p>
                      <p className="text-xs text-muted-foreground">Blocked</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{selectedCycle.notRun}</p>
                      <p className="text-xs text-muted-foreground">Not Run</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Test Cases Table */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-foreground">{selectedCycle.name}</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search test cases..." className="pl-9" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Test Case</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cycleTestCases.map((testCase) => (
                      <TableRow key={testCase.id}>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {testCase.id}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {testCase.name}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("capitalize", priorityColors[testCase.priority])}>
                            {testCase.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {statusIcons[testCase.status]}
                            <Badge
                              variant="outline"
                              className={cn(statusColors[testCase.status])}
                            >
                              {testCase.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            onValueChange={(value) => handleStatusChange(testCase.id, value)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Set status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pass">Pass</SelectItem>
                              <SelectItem value="Fail">Fail</SelectItem>
                              <SelectItem value="Blocked">Blocked</SelectItem>
                              <SelectItem value="Skipped">Skipped</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
