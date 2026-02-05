 import { Badge } from "@/components/ui/badge";
 import { cn } from "@/lib/utils";
 
 const statusConfig: Record<string, { label: string; className: string }> = {
   draft: { label: "Draft", className: "border-muted text-muted-foreground" },
   submitted_for_review: { label: "Submitted", className: "border-chart-3 text-chart-3" },
   in_review: { label: "In Review", className: "border-chart-4 text-chart-4" },
   changes_required: { label: "Changes Required", className: "border-destructive text-destructive" },
   reviewed: { label: "Reviewed", className: "border-chart-2 text-chart-2" },
   approved: { label: "Approved", className: "border-primary text-primary" },
   ready_for_execution: { label: "Ready for Execution", className: "border-chart-1 text-chart-1" },
   executed: { label: "Executed", className: "border-chart-5 text-chart-5" },
   blocked: { label: "Blocked", className: "border-chart-4 text-chart-4" },
   obsolete: { label: "Obsolete", className: "border-muted text-muted-foreground" },
 };
 
 interface TestCaseStatusBadgeProps {
   status: string;
   className?: string;
 }
 
 export function TestCaseStatusBadge({ status, className }: TestCaseStatusBadgeProps) {
   const config = statusConfig[status] || statusConfig.draft;
   
   return (
     <Badge 
       variant="outline" 
       className={cn(config.className, className)}
     >
       {config.label}
     </Badge>
   );
 }
 
 export const TEST_CASE_STATUSES = [
   { value: "draft", label: "Draft" },
   { value: "submitted_for_review", label: "Submitted for Review" },
   { value: "in_review", label: "In Review" },
   { value: "changes_required", label: "Changes Required" },
   { value: "reviewed", label: "Reviewed" },
   { value: "approved", label: "Approved" },
   { value: "ready_for_execution", label: "Ready for Execution" },
   { value: "executed", label: "Executed" },
   { value: "blocked", label: "Blocked" },
   { value: "obsolete", label: "Obsolete" },
 ];
 
 // Valid status transitions
 export const STATUS_TRANSITIONS: Record<string, string[]> = {
   draft: ["submitted_for_review", "obsolete"],
   submitted_for_review: ["in_review", "draft"],
   in_review: ["reviewed", "changes_required"],
   changes_required: ["draft", "submitted_for_review"],
   reviewed: ["approved", "changes_required"],
   approved: ["ready_for_execution", "obsolete"],
   ready_for_execution: ["executed", "blocked", "obsolete"],
   executed: ["ready_for_execution", "obsolete"],
   blocked: ["ready_for_execution", "obsolete"],
   obsolete: [],
 };
 
 export function getNextStatuses(currentStatus: string): string[] {
   return STATUS_TRANSITIONS[currentStatus] || [];
 }