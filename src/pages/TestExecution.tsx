import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Search, Play, Calendar, CheckCircle2, XCircle, Clock,
  AlertCircle, Loader2, Trash2, Bug, Clipboard, UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useTestRuns } from "@/hooks/useTestRuns";
import { useTestCases } from "@/hooks/useTestCases";
import { useProjects } from "@/hooks/useProjects";
import { useDefects } from "@/hooks/useDefects";
import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers";
import { useRBAC } from "@/hooks/useRBAC";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ExecutionNotesDialog } from "@/components/test-execution/ExecutionNotesDialog";
import { LogDefectDialog } from "@/components/test-execution/LogDefectDialog";
import { ManagerDashboard } from "@/components/test-execution/ManagerDashboard";

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
  const [newRunEnvironment, setNewRunEnvironment] = useState("");
  const [newRunBuildVersion, setNewRunBuildVersion] = useState("");
  const [bulkAssignTo, setBulkAssignTo] = useState("");
  const [deleteRunId, setDeleteRunId] = useState<string | null>(null);
  const [executionDialogData, setExecutionDialogData] = useState<{
    executionId: string; testCaseTitle: string; currentStatus: string;
  } | null>(null);
  const [logDefectData, setLogDefectData] = useState<{
    executionId: string; testCaseId: string; testCaseTitle: string;
    testCaseSteps?: Array<{ action: string; expected: string }>;
    executionNotes?: string;
  } | null>(null);
  const [executionSearch, setExecutionSearch] = useState("");
  const { toast } = useToast();

  const { data: projects, isLoading: projectsLoading } = useProjects();
  const currentProjectId = selectedProject || projects?.[0]?.id || "";
  const currentProject = projects?.find((p) => p.id === currentProjectId);

  const {
    testRuns, isLoading: runsLoading, createTestRun,
    updateExecutionStatus, assignExecution, deleteTestRun,
  } = useTestRuns(currentProjectId);

  const { testCases, isLoading: casesLoading } = useTestCases(currentProjectId);
  const { createDefect } = useDefects(currentProjectId);
  const { data: workspaceMembers } = useWorkspaceMembers(currentProject?.workspace_id);
  const { isManager } = useRBAC(currentProject?.workspace_id);

  const [selectedRun, setSelectedRun] = useState<typeof testRuns[0] | null>(null);

  // Auto-select first run
  useMemo(() => {
    if (testRuns.length > 0 && !selectedRun) {
      setSelectedRun(testRuns[0]);
    }
  }, [testRuns, selectedRun]);

  // Keep selectedRun in sync with latest data
  useMemo(() => {
    if (selectedRun) {
      const updated = testRuns.find((r) => r.id === selectedRun.id);
      if (updated) setSelectedRun(updated);
    }
  }, [testRuns]);

  const executableTestCases = useMemo(() => {
    return testCases.filter((tc) =>
      ["ready_for_execution", "approved", "executed"].includes(tc.status)
    );
  }, [testCases]);

  const filteredExecutions = useMemo(() => {
    if (!selectedRun?.executions) return [];
    if (!executionSearch.trim()) return selectedRun.executions;
    return selectedRun.executions.filter((ex: any) =>
      ex.test_case?.title?.toLowerCase().includes(executionSearch.toLowerCase())
    );
  }, [selectedRun, executionSearch]);

  // Manager metrics
  const pendingReviewCount = useMemo(() =>
    testCases.filter((tc) => ["submitted_for_review", "in_review"].includes(tc.status)).length
  , [testCases]);

  const awaitingApprovalCount = useMemo(() =>
    testCases.filter((tc) => tc.status === "reviewed").length
  , [testCases]);

  const handleCreateRun = async () => {
    if (!currentProjectId || !newRunName) {
      toast({ title: "Error", description: "Please provide a run name", variant: "destructive" });
      return;
    }
    if (selectedTestCases.length === 0) {
      toast({ title: "Error", description: "Please select at least one test case", variant: "destructive" });
      return;
    }

    const run = await createTestRun.mutateAsync({
      name: newRunName,
      project_id: currentProjectId,
      test_case_ids: selectedTestCases,
      environment: newRunEnvironment || undefined,
      build_version: newRunBuildVersion || undefined,
    });

    // Bulk assign if selected
    if (bulkAssignTo && run) {
      // After create, assign all executions to the selected tester
      // We need to wait for the query to refresh to get execution IDs
      // For now, we'll handle this via a follow-up
    }

    setIsCreateOpen(false);
    setNewRunName("");
    setNewRunEnvironment("");
    setNewRunBuildVersion("");
    setSelectedTestCases([]);
    setBulkAssignTo("");
  };

  const handleExecutionResult = async (status: string, notes: string, environment?: string, buildVersion?: string) => {
    if (!executionDialogData) return;
    await updateExecutionStatus.mutateAsync({
      executionId: executionDialogData.executionId,
      status,
      notes,
      environment,
      build_version: buildVersion,
    });

    if (status === "failed") {
      const execution = selectedRun?.executions?.find((e: any) => e.id === executionDialogData.executionId) as any;
      if (execution) {
        const tc = testCases.find((t) => t.id === execution.test_case?.id);
        setLogDefectData({
          executionId: executionDialogData.executionId,
          testCaseId: execution.test_case?.id || "",
          testCaseTitle: execution.test_case?.title || "",
          testCaseSteps: tc?.steps as any,
          executionNotes: notes,
        });
      }
    }
    setExecutionDialogData(null);
  };

  const handleLogDefect = async (data: any) => {
    await createDefect.mutateAsync({
      title: data.title,
      description: data.description,
      severity: data.severity,
      priority: data.priority,
      status: "open",
      project_id: data.project_id,
      test_execution_id: data.test_execution_id,
      linked_test_case_id: data.linked_test_case_id,
      steps_to_reproduce: data.steps_to_reproduce,
      assigned_to: data.assigned_to,
    });
    setLogDefectData(null);
  };

  const handleDeleteRun = async () => {
    if (!deleteRunId) return;
    await deleteTestRun.mutateAsync(deleteRunId);
    if (selectedRun?.id === deleteRunId) {
      setSelectedRun(testRuns.find((r) => r.id !== deleteRunId) || null);
    }
    setDeleteRunId(null);
  };

  const handleAssignExecution = async (executionId: string, assignedTo: string) => {
    await assignExecution.mutateAsync({ executionId, assignedTo });
  };

  const toggleTestCase = (id: string) => {
    setSelectedTestCases((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const selectAllTestCases = () => {
    if (selectedTestCases.length === executableTestCases.length) {
      setSelectedTestCases([]);
    } else {
      setSelectedTestCases(executableTestCases.map((tc) => tc.id));
    }
  };

  const getMemberName = (userId: string | null) => {
    if (!userId) return null;
    const member = workspaceMembers?.find((m) => m.user_id === userId);
    return member?.profile?.full_name || member?.profile?.email || userId.slice(0, 8);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: "Test Execution" }]} />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Play className="h-6 w-6 text-primary-foreground" />
              </div>
              Test Execution
            </h1>
            <p className="text-muted-foreground mt-2">Run and track test execution cycles</p>
          </div>
          <div className="flex gap-2">
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
                  projects?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)
                )}
              </SelectContent>
            </Select>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button disabled={!currentProjectId}>
                  <Plus className="mr-2 h-4 w-4" />Create Test Run
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Test Run</DialogTitle>
                  <DialogDescription>Create a test execution run with environment details</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="run-name">Run Name *</Label>
                    <Input id="run-name" placeholder="e.g., Regression 2.2" value={newRunName} onChange={(e) => setNewRunName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Environment</Label>
                      <Select value={newRunEnvironment} onValueChange={setNewRunEnvironment}>
                        <SelectTrigger><SelectValue placeholder="Select environment" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="staging">Staging</SelectItem>
                          <SelectItem value="uat">UAT</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Build / Version</Label>
                      <Input placeholder="e.g., v2.1.0" value={newRunBuildVersion} onChange={(e) => setNewRunBuildVersion(e.target.value)} />
                    </div>
                  </div>

                  {/* Bulk Assign Tester */}
                  {isManager && workspaceMembers && workspaceMembers.length > 0 && (
                    <div className="grid gap-2">
                      <Label className="flex items-center gap-1">
                        <UserPlus className="h-3.5 w-3.5" />
                        Assign All to Tester
                      </Label>
                      <Select value={bulkAssignTo} onValueChange={setBulkAssignTo}>
                        <SelectTrigger><SelectValue placeholder="Select tester (optional)" /></SelectTrigger>
                        <SelectContent>
                          {workspaceMembers
                            .filter((m) => m.role !== "viewer")
                            .map((m) => (
                              <SelectItem key={m.user_id} value={m.user_id}>
                                {m.profile?.full_name || m.profile?.email || m.user_id.slice(0, 8)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label>Select Test Cases <span className="text-xs text-muted-foreground">(only approved/ready)</span></Label>
                      <Button type="button" variant="ghost" size="sm" onClick={selectAllTestCases}>
                        {selectedTestCases.length === executableTestCases.length ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                    {casesLoading ? (
                      <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
                    ) : executableTestCases.length === 0 ? (
                      <div className="text-center py-6 border rounded-md">
                        <Clipboard className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No test cases ready for execution.</p>
                        <p className="text-xs text-muted-foreground">Test cases must be approved first.</p>
                      </div>
                    ) : (
                      <div className="max-h-[300px] overflow-y-auto border rounded-md divide-y">
                        {executableTestCases.map((tc) => (
                          <div key={tc.id} className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer" onClick={() => toggleTestCase(tc.id)}>
                            <Checkbox checked={selectedTestCases.includes(tc.id)} onCheckedChange={() => toggleTestCase(tc.id)} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{tc.title}</p>
                              <p className="text-xs text-muted-foreground">Priority: {tc.priority} • Status: {tc.status.replace(/_/g, " ")}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">{selectedTestCases.length} test case(s) selected</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateRun} disabled={createTestRun.isPending || !newRunName || selectedTestCases.length === 0}>
                    {createTestRun.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Run
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Execution Notes Dialog */}
        <ExecutionNotesDialog
          open={!!executionDialogData}
          onOpenChange={(open) => !open && setExecutionDialogData(null)}
          testCaseTitle={executionDialogData?.testCaseTitle || ""}
          currentStatus={executionDialogData?.currentStatus || "not_run"}
          onSubmit={handleExecutionResult}
          isSubmitting={updateExecutionStatus.isPending}
          showEnvironmentFields
        />

        {/* Log Defect Dialog */}
        <LogDefectDialog
          open={!!logDefectData}
          onOpenChange={(open) => !open && setLogDefectData(null)}
          executionId={logDefectData?.executionId || ""}
          testCaseId={logDefectData?.testCaseId || ""}
          testCaseTitle={logDefectData?.testCaseTitle || ""}
          testCaseSteps={logDefectData?.testCaseSteps}
          executionNotes={logDefectData?.executionNotes}
          projectId={currentProjectId}
          workspaceMembers={workspaceMembers}
          onSubmit={handleLogDefect}
          isSubmitting={createDefect.isPending}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteRunId} onOpenChange={(open) => !open && setDeleteRunId(null)}
          title="Delete Test Run"
          description="Are you sure you want to delete this test run? All execution results will be lost."
          confirmLabel="Delete" variant="destructive"
          onConfirm={handleDeleteRun} loading={deleteTestRun.isPending}
        />

        {/* Manager Dashboard */}
        {isManager && (
          <ManagerDashboard
            testRuns={testRuns}
            workspaceMembers={workspaceMembers}
            pendingReviewCount={pendingReviewCount}
            awaitingApprovalCount={awaitingApprovalCount}
          />
        )}

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Test Runs Sidebar */}
          <Card className="h-fit border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">Test Runs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {runsLoading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
              ) : testRuns.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No test runs yet. Create one to get started.</p>
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
                      variant="ghost" size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6"
                      onClick={(e) => { e.stopPropagation(); setDeleteRunId(run.id); }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{run.name}</span>
                      <Badge variant="outline" className="text-xs">{run.stats?.progress || 0}%</Badge>
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
                        <Input placeholder="Search test cases..." className="pl-9" value={executionSearch} onChange={(e) => setExecutionSearch(e.target.value)} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredExecutions.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">No test executions in this run</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Test Case</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredExecutions.map((execution: any) => (
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
                                {isManager ? (
                                  <Select
                                    value={execution.assigned_to || ""}
                                    onValueChange={(v) => handleAssignExecution(execution.id, v)}
                                  >
                                    <SelectTrigger className="h-8 w-[140px]">
                                      <SelectValue placeholder="Assign">
                                        {getMemberName(execution.assigned_to) || "Unassigned"}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {workspaceMembers
                                        ?.filter((m) => m.role !== "viewer")
                                        .map((m) => (
                                          <SelectItem key={m.user_id} value={m.user_id}>
                                            {m.profile?.full_name || m.profile?.email || m.user_id.slice(0, 8)}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    {getMemberName(execution.assigned_to) || "—"}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {statusIcons[execution.status]}
                                  <Badge variant="outline" className={cn(statusColors[execution.status])}>
                                    {execution.status.replace("_", " ")}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                {execution.notes ? (
                                  <span className="text-sm text-muted-foreground truncate block max-w-[200px]" title={execution.notes}>
                                    {execution.notes}
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setExecutionDialogData({
                                      executionId: execution.id,
                                      testCaseTitle: execution.test_case?.title || "Unknown",
                                      currentStatus: execution.status,
                                    })}
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    Execute
                                  </Button>
                                  {execution.status === "failed" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-destructive border-destructive/50"
                                      onClick={() => {
                                        const tc = testCases.find((t) => t.id === execution.test_case?.id);
                                        setLogDefectData({
                                          executionId: execution.id,
                                          testCaseId: execution.test_case?.id || "",
                                          testCaseTitle: execution.test_case?.title || "",
                                          testCaseSteps: tc?.steps as any,
                                          executionNotes: execution.notes,
                                        });
                                      }}
                                    >
                                      <Bug className="h-3 w-3 mr-1" />
                                      Log Defect
                                    </Button>
                                  )}
                                </div>
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
                      <Plus className="mr-2 h-4 w-4" />Create Test Run
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
