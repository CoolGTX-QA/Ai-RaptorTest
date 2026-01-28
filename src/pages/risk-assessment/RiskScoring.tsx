import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight, Target, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRiskScoring } from "@/hooks/useRiskData";
import { Skeleton } from "@/components/ui/skeleton";

const riskLevelColors: Record<string, string> = {
  High: "bg-destructive text-destructive-foreground",
  Medium: "bg-chart-4 text-foreground",
  Low: "bg-chart-1 text-foreground",
};

export default function RiskScoring() {
  const { data: riskScores, isLoading } = useRiskScoring();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Risk Assessment</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Risk Scoring</span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Target className="h-6 w-6 text-primary-foreground" />
            </div>
            Risk Scoring
          </h1>
          <p className="text-muted-foreground mt-2">
            Detailed risk scores by module and component
          </p>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-2 rounded-md bg-accent p-4">
          <Info className="h-5 w-5 text-accent-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium text-accent-foreground">About Risk Scoring</p>
            <p className="text-sm text-accent-foreground/80">
              Risk scores are calculated based on test coverage, defect history, code complexity, 
              and business criticality. Scores range from 0 (lowest risk) to 100 (highest risk).
            </p>
          </div>
        </div>

        {/* Risk Scoring Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Module Risk Scores</CardTitle>
            <CardDescription>
              Risk assessment scores for each application module
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-2 w-24" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : !riskScores || riskScores.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No risk data available. Create test cases and executions to generate risk scores.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Module</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Test Cases</TableHead>
                    <TableHead className="text-right">Coverage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riskScores.map((item) => (
                    <TableRow key={item.module}>
                      <TableCell className="font-medium text-foreground">
                        {item.module}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={item.score} className="w-24 h-2" />
                          <span className="text-sm font-medium text-foreground w-10">
                            {item.score}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(riskLevelColors[item.level])}>
                          {item.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.tests}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.coverage}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
