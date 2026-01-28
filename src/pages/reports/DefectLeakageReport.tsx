import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  TrendingDown,
  Bug,
  AlertTriangle,
  Shield,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { StatCard } from "@/components/reports/StatCard";
import { ChartCard } from "@/components/reports/ChartCard";
import { useDefectLeakageReport } from "@/hooks/useReportData";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DefectLeakageReport() {
  const [selectedProject, setSelectedProject] = useState("all-projects");
  const [selectedTimeRange, setSelectedTimeRange] = useState("last-30");

  const { data: reportData, isLoading } = useDefectLeakageReport(
    selectedProject !== "all-projects" ? selectedProject : undefined
  );

  const stats = reportData?.stats || { totalDefects: 0, leakageRate: "0%", productionDefects: 0, containmentRate: "0%" };
  const phaseData = reportData?.phaseData || [];
  const trendData = reportData?.trendData || [];
  const severityData = reportData?.severityData || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <ReportHeader
          title="Defect Leakage Report"
          description="Leakage by phase, severity breakdown, and trend analysis"
          selectedProject={selectedProject}
          selectedTimeRange={selectedTimeRange}
          onProjectChange={setSelectedProject}
          onTimeRangeChange={setSelectedTimeRange}
        />

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="pt-6">
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Defects Found"
                value={stats.totalDefects}
                description="Across all phases"
                icon={Bug}
                iconClassName="text-chart-1"
              />
              <StatCard
                title="Leakage Rate"
                value={stats.leakageRate}
                description="Defects escaped to production"
                icon={TrendingDown}
                iconClassName="text-chart-1"
                descriptionClassName="text-primary"
              />
              <StatCard
                title="Production Defects"
                value={stats.productionDefects}
                description="Critical to fix"
                icon={AlertTriangle}
                iconClassName="text-destructive"
                descriptionClassName="text-destructive"
              />
              <StatCard
                title="Containment Rate"
                value={stats.containmentRate}
                description="Excellent"
                icon={Shield}
                iconClassName="text-chart-1"
                descriptionClassName="text-primary"
              />
            </>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Defects by Phase */}
          <ChartCard title="Defects by Phase" description="Found vs leaked defects per testing phase">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : phaseData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={phaseData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="phase" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                  <Bar dataKey="found" name="Defects Found" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="leaked" name="Defects Leaked" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Leakage Trend */}
          <ChartCard title="Leakage Rate Trend" description="Monthly defect leakage percentage">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : trendData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No trend data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="leakageRate" name="Leakage Rate" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Severity Breakdown */}
        <ChartCard title="Defects by Severity & Phase" description="Distribution of defects across phases by severity level">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-[250px] w-full" />
            </div>
          ) : severityData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No severity data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="severity" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Legend />
                <Bar dataKey="devPhase" name="Dev Phase" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="testPhase" name="Test Phase" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="production" name="Production" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </AppLayout>
  );
}
