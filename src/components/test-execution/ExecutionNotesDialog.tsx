import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ExecutionNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testCaseTitle: string;
  currentStatus: string;
  onSubmit: (status: string, notes: string, environment?: string, buildVersion?: string) => Promise<void>;
  isSubmitting?: boolean;
  showEnvironmentFields?: boolean;
}

const statusOptions = [
  { value: "passed", label: "Passed", icon: CheckCircle2, color: "text-chart-1" },
  { value: "failed", label: "Failed", icon: XCircle, color: "text-destructive" },
  { value: "blocked", label: "Blocked", icon: AlertCircle, color: "text-chart-4" },
  { value: "skipped", label: "Skipped", icon: Clock, color: "text-muted-foreground" },
];

export function ExecutionNotesDialog({
  open,
  onOpenChange,
  testCaseTitle,
  currentStatus,
  onSubmit,
  isSubmitting,
  showEnvironmentFields,
}: ExecutionNotesDialogProps) {
  const [status, setStatus] = useState(currentStatus === "not_run" ? "passed" : currentStatus);
  const [notes, setNotes] = useState("");
  const [environment, setEnvironment] = useState("");
  const [buildVersion, setBuildVersion] = useState("");

  const handleSubmit = async () => {
    await onSubmit(status, notes, environment || undefined, buildVersion || undefined);
    setNotes("");
    setEnvironment("");
    setBuildVersion("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Execution Result</DialogTitle>
          <DialogDescription>
            Test Case: <strong>{testCaseTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Execution Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={status === opt.value ? "default" : "outline"}
                    className="justify-start gap-2"
                    onClick={() => setStatus(opt.value)}
                  >
                    <Icon className={cn("h-4 w-4", status !== opt.value && opt.color)} />
                    {opt.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {showEnvironmentFields && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Select value={environment} onValueChange={setEnvironment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="uat">UAT</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="build-version">Build / Version</Label>
                <Input
                  id="build-version"
                  value={buildVersion}
                  onChange={(e) => setBuildVersion(e.target.value)}
                  placeholder="e.g., v2.1.0"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">
              Execution Notes {status === "failed" && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                status === "failed"
                  ? "Describe the failure and observed behavior (required)"
                  : status === "blocked"
                  ? "Describe the blocker"
                  : "Optional notes about this execution"
              }
              rows={4}
            />
            {status === "failed" && !notes.trim() && (
              <p className="text-xs text-destructive">Notes are required for failed executions</p>
            )}
          </div>

          {status === "failed" && (
            <Badge variant="outline" className="border-destructive text-destructive">
              A defect can be logged after recording this failure
            </Badge>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (status === "failed" && !notes.trim())}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Record Result
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
