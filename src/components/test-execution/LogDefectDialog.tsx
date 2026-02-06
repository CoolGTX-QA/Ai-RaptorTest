import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Bug, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LogDefectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  executionId: string;
  testCaseId: string;
  testCaseTitle: string;
  testCaseSteps?: Array<{ action: string; expected: string }>;
  executionNotes?: string;
  projectId: string;
  workspaceMembers?: Array<{ user_id: string; profile?: { full_name: string | null; email: string } | null }>;
  onSubmit: (data: {
    title: string;
    description: string;
    severity: string;
    priority: string;
    steps_to_reproduce: string;
    assigned_to?: string;
    test_execution_id: string;
    linked_test_case_id: string;
    project_id: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export function LogDefectDialog({
  open,
  onOpenChange,
  executionId,
  testCaseId,
  testCaseTitle,
  testCaseSteps,
  executionNotes,
  projectId,
  workspaceMembers = [],
  onSubmit,
  isSubmitting,
}: LogDefectDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [priority, setPriority] = useState("medium");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  // Auto-fill steps from test case when dialog opens
  useEffect(() => {
    if (open) {
      setTitle(`Defect from: ${testCaseTitle}`);
      setDescription(executionNotes || "");

      if (testCaseSteps && testCaseSteps.length > 0) {
        const stepsText = testCaseSteps
          .map((step, i) => `${i + 1}. ${step.action}\n   Expected: ${step.expected}`)
          .join("\n\n");
        setStepsToReproduce(stepsText);
      }
    }
  }, [open, testCaseTitle, testCaseSteps, executionNotes]);

  const handleSubmit = async () => {
    await onSubmit({
      title,
      description,
      severity,
      priority,
      steps_to_reproduce: stepsToReproduce,
      assigned_to: assignedTo || undefined,
      test_execution_id: executionId,
      linked_test_case_id: testCaseId,
      project_id: projectId,
    });
    // Reset form
    setTitle("");
    setDescription("");
    setSeverity("medium");
    setPriority("medium");
    setStepsToReproduce("");
    setAssignedTo("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-destructive" />
            Log Defect
          </DialogTitle>
          <DialogDescription>
            Create a defect linked to the failed test execution
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Linked items */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <LinkIcon className="h-3 w-3" />
              Test Case: {testCaseTitle}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <LinkIcon className="h-3 w-3" />
              Execution: {executionId.slice(0, 8)}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defect-title">Title *</Label>
            <Input
              id="defect-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the defect"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defect-description">Description</Label>
            <Textarea
              id="defect-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the defect"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="steps-to-reproduce">
              Steps to Reproduce
              <span className="text-xs text-muted-foreground ml-2">(auto-filled from test case)</span>
            </Label>
            <Textarea
              id="steps-to-reproduce"
              value={stepsToReproduce}
              onChange={(e) => setStepsToReproduce(e.target.value)}
              placeholder="Steps to reproduce the defect"
              rows={6}
            />
          </div>

          {workspaceMembers.length > 0 && (
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {workspaceMembers.map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {m.profile?.full_name || m.profile?.email || m.user_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim()}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Defect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
