import { useState, useMemo } from "react";
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
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useTestRuns } from "@/hooks/useTestRuns";
import { useTestCases } from "@/hooks/useTestCases";
import { useProjects } from "@/hooks/useProjects";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const statusIcons: Record<string, React.ReactNode> = {
  not_run: <Clock className="h-4 w-4 text-muted-foreground" />,
  passed: <CheckCircle2 className="h-4 w-4 text-chart-1" />,
  failed: <XCircle className="h-4 w-4 text-destructive" />,
  blocked: <AlertCircle className="h-4 w-4 text-chart-4" />,
  skipped: <Clock className="h-4 w-4 text-muted-foreground" />,
};

const statusColors: Record<string, string> = {
  not_run: "border-muted text-muted-foreground",
  passed: "border-chart-1 text-chart-1",
  failed: "border-destructive text-destructive",
  blocked: "border-chart-4 text-chart-4",
  skipped: "border-muted text-muted-foreground",
};

const priorityColors: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-chart-4 text-foreground",
  medium: "bg-chart-1 text-foreground",
  low: "bg-muted text-muted-foreground",
};

export default function TestExecution() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [newRunName, setNewRunName] = useState("");
  const [deleteRunId, setDeleteRunId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: projects, isLoading: projectsLoading } = useProjects();
  const currentProjectId = selectedProject || projects?.[0]?.id || "";

  const { 
    testRuns, 
    isLoading: runsLoading, 
    createTestRun, 
    updateExecutionStatus,
    deleteTestRun,
  } = useTestRuns(currentProjectId);
  
  const { testCases, isLoading: casesLoading } = useTestCases(currentProjectId);

  const [selectedRun, setSelectedRun] = useState<typeof testRuns[0] | null>(null);

  // Auto-select first run when data loads
  useMemo(() => {
    if (testRuns.length > 0 && !selectedRun) {
      setSelectedRun(testRuns[0]);
    }
  }, [testRuns, selectedRun]);

  const handleCreateRun = async () => {
    if (!currentProjectId || !newRunName) {
      toast({ title: "Error", description: "Please provide a run name", variant: "destructive" });
      return;
    }

    if (selectedTestCases.length === 0) {
      toast({ title: "Error", description: "Please select at least one test case", variant: "destructive" });
      return;
    }

    await createTestRun.mutateAsync({
      name: newRunName,
      project_id: currentProjectId,
      test_case_ids: selectedTestCases,
    });

    setIsCreateOpen(false);
    setNewRunName("");
    setSelectedTestCases([]);
  };

  const handleStatusChange = async (executionId: string, newStatus: string) => {
    await updateExecutionStatus.mutateAsync({
      executionId,
      status: newStatus,
    });
  };

  const handleDeleteRun = async () => {
    if (!deleteRunId) return;
    await deleteTestRun.mutateAsync(deleteRunId);
    if (selectedRun?.id === deleteRunId) {
      setSelectedRun(testRuns.find((r) => r.id !== deleteRunId) || null);
    }
    setDeleteRunId(null);
  };

  const toggleTestCase = (id: string) => {
    setSelectedTestCases((prev) => 
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const selectAllTestCases = () => {
    if (selectedTestCases.length === testCases.length) {
      setSelectedTestCases([]);
    } else {
      setSelectedTestCases(testCases.map((tc) => tc.id));
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/projects" },
            { label: "Test Execution" },
          ]}
        />

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
          <div className="flex gap-2">
            {/* Project Selector */}
            <Select value={currentProjectId} onValueChange={(v) => { setSelectedProject(v); setSelectedRun(null); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projectsLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : projects?.length === 0 ? (
                  <SelectItem value="none" disabled>No projects found</SelectItem>
                ) : (
                  projects?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button disabled={!currentProjectId}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Test Run
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Test Run</DialogTitle>
                  <DialogDescription>
                    Create a new test execution run by selecting test cases
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="run-name">Run Name</Label>
                    <Input 
                      id="run-name" 
                      placeholder="e.g., Regression 2.2"
                      value={newRunName}
                      onChange={(e) => setNewRunName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label>Select Test Cases</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={selectAllTestCases}
                      >
                        {selectedTestCases.length === testCases.length ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                    {casesLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    ) : testCases.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No test cases found. Create test cases first.
                      </p>
                    ) : (
                      <div className="max-h-[300px] overflow-y-auto border rounded-md divide-y">
                        {testCases.map((tc) => (
                          <div 
                            key={tc.id}
                            className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer"
                            onClick={() => toggleTestCase(tc.id)}
                          >
                            <Checkbox 
                              checked={selectedTestCases.includes(tc.id)}
                              onCheckedChange={() => toggleTestCase(tc.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{tc.title}</p>
                              <p className="text-xs text-muted-foreground">
                                Priority: {tc.priority}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {selectedTestCases.length} test case(s) selected
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateRun}
                    disabled={createTestRun.isPending || !newRunName || selectedTestCases.length === 0}
                  >
                    {createTestRun.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Run
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteRunId}
          onOpenChange={(open) => !open && setDeleteRunId(null)}
          title="Delete Test Run"
          description="Are you sure you want to delete this test run? All execution results will be lost."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDeleteRun}
          loading={deleteTestRun.isPending}
        />

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Test Runs Sidebar */}
          <Card className="h-fit border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">Test Runs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {runsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : testRuns.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No test runs yet. Create one to get started.
                </p>
              ) : (
                testRuns.map((run) => (
                  <div
                    key={run.id}
                    className={cn(
                      "w-full rounded-lg border border-border p-3 text-left transition-all hover:border-primary/50 cursor-pointer relative group",
                      selectedRun?.id === run.id && "border-primary bg-accent"
                    )}
                    onClick={() => setSelectedRun(run)}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6"
                      onClick={(e) => { e.stopPropagation(); setDeleteRunId(run.id); }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{run.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {run.stats?.progress || 0}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(run.created_at), "MMM d, yyyy")}
                    </div>
                    <Progress value={run.stats?.progress || 0} className="h-1.5" />
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-chart-1">{run.stats?.passed || 0} passed</span>
                      <span className="text-destructive">{run.stats?.failed || 0} failed</span>
                      <span className="text-muted-foreground">{run.stats?.notRun || 0} pending</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Selected Run Details */}
          <div className="space-y-4">
            {/* Stats */}
            {selectedRun && (
              <>
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                  <Card className="border-border">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-chart-1" />
                        <div>
                          <p className="text-2xl font-bold text-foreground">{selectedRun.stats?.passed || 0}</p>
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
                          <p className="text-2xl font-bold text-foreground">{selectedRun.stats?.failed || 0}</p>
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
                          <p className="text-2xl font-bold text-foreground">{selectedRun.stats?.blocked || 0}</p>
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
                          <p className="text-2xl font-bold text-foreground">{selectedRun.stats?.notRun || 0}</p>
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
                      <CardTitle className="text-base text-foreground">{selectedRun.name}</CardTitle>
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search test cases..." className="pl-9" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedRun.executions?.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">
                        No test executions in this run
                      </p>
                    ) : (
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
                          {selectedRun.executions?.map((execution: any) => (
                            <TableRow key={execution.id}>
                              <TableCell className="font-mono text-sm text-muted-foreground">
                                {execution.test_case?.id?.slice(0, 8) || "N/A"}
                              </TableCell>
                              <TableCell className="font-medium text-foreground">
                                {execution.test_case?.title || "Unknown Test Case"}
                              </TableCell>
                              <TableCell>
                                <Badge className={cn("capitalize", priorityColors[execution.test_case?.priority || "medium"])}>
                                  {execution.test_case?.priority || "medium"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {statusIcons[execution.status]}
                                  <Badge
                                    variant="outline"
                                    className={cn(statusColors[execution.status])}
                                  >
                                    {execution.status.replace("_", " ")}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Select
                                  value={execution.status}
                                  onValueChange={(value) => handleStatusChange(execution.id, value)}
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Set status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="passed">Pass</SelectItem>
                                    <SelectItem value="failed">Fail</SelectItem>
                                    <SelectItem value="blocked">Blocked</SelectItem>
                                    <SelectItem value="skipped">Skipped</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {!selectedRun && !runsLoading && (
              <Card className="border-border">
                <CardContent className="py-12 text-center">
                  <Play className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No test run selected</h3>
                  <p className="text-muted-foreground mb-4">
                    {testRuns.length === 0 
                      ? "Create your first test run to start executing tests" 
                      : "Select a test run from the sidebar to view details"}
                  </p>
                  {testRuns.length === 0 && (
                    <Button onClick={() => setIsCreateOpen(true)} disabled={!currentProjectId}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Test Run
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
