import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ClipboardCheck, Users, TrendingUp, AlertTriangle,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import type { TestRun } from "@/hooks/useTestRuns";

interface ManagerDashboardProps {
  testRuns: TestRun[];
  workspaceMembers?: Array<{
    user_id: string;
    profile?: { full_name: string | null; email: string } | null;
  }>;
  pendingReviewCount?: number;
  awaitingApprovalCount?: number;
}

export function ManagerDashboard({
  testRuns,
  workspaceMembers = [],
  pendingReviewCount = 0,
  awaitingApprovalCount = 0,
}: ManagerDashboardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const metrics = useMemo(() => {
    const allExecutions = testRuns.flatMap((r) => r.executions || []);
    const total = allExecutions.length;
    const passed = allExecutions.filter((e: any) => e.status === "passed").length;
    const failed = allExecutions.filter((e: any) => e.status === "failed").length;
    const blocked = allExecutions.filter((e: any) => e.status === "blocked").length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    // Group by assigned_to
    const testerMap = new Map<string, { assigned: number; completed: number; passed: number; failed: number }>();
    allExecutions.forEach((ex: any) => {
      const assignee = ex.assigned_to || "unassigned";
      if (!testerMap.has(assignee)) {
        testerMap.set(assignee, { assigned: 0, completed: 0, passed: 0, failed: 0 });
      }
      const entry = testerMap.get(assignee)!;
      entry.assigned++;
      if (ex.status !== "not_run") entry.completed++;
      if (ex.status === "passed") entry.passed++;
      if (ex.status === "failed") entry.failed++;
    });

    const testerBreakdown = Array.from(testerMap.entries()).map(([userId, stats]) => {
      const member = workspaceMembers.find((m) => m.user_id === userId);
      return {
        userId,
        name: member?.profile?.full_name || member?.profile?.email || (userId === "unassigned" ? "Unassigned" : userId.slice(0, 8)),
        ...stats,
        passRate: stats.completed > 0 ? Math.round((stats.passed / stats.completed) * 100) : 0,
      };
    });

    return { total, passed, failed, blocked, passRate, testerBreakdown };
  }, [testRuns, workspaceMembers]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Manager Dashboard
              </CardTitle>
              {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Summary Cards */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <Card className="border-border">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-chart-4" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{pendingReviewCount}</p>
                      <p className="text-xs text-muted-foreground">Pending Reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-chart-4" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{awaitingApprovalCount}</p>
                      <p className="text-xs text-muted-foreground">Awaiting Approval</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-chart-1" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{metrics.passRate}%</p>
                      <p className="text-xs text-muted-foreground">Overall Pass Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{metrics.blocked}</p>
                      <p className="text-xs text-muted-foreground">Blocked</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tester Breakdown */}
            {metrics.testerBreakdown.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Tester Progress</h4>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Tester</TableHead>
                      <TableHead className="text-center">Assigned</TableHead>
                      <TableHead className="text-center">Completed</TableHead>
                      <TableHead className="text-center">Pass Rate</TableHead>
                      <TableHead>Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.testerBreakdown.map((t) => (
                      <TableRow key={t.userId}>
                        <TableCell className="font-medium text-foreground">{t.name}</TableCell>
                        <TableCell className="text-center">{t.assigned}</TableCell>
                        <TableCell className="text-center">{t.completed}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={t.passRate >= 80 ? "border-chart-1 text-chart-1" : t.passRate >= 50 ? "border-chart-4 text-chart-4" : "border-destructive text-destructive"}>
                            {t.passRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Progress value={t.assigned > 0 ? (t.completed / t.assigned) * 100 : 0} className="h-2" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
