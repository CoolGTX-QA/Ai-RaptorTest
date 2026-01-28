import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  TrendingUp,
  Percent,
  Zap,
  Target,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { StatCard } from "@/components/reports/StatCard";
import { ChartCard } from "@/components/reports/ChartCard";
import { useAnalyticsReport } from "@/hooks/useReportData";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function TestAnalyticsReport() {
  const [selectedProject, setSelectedProject] = useState("all-projects");
  const [selectedTimeRange, setSelectedTimeRange] = useState("last-30");

  const { data: reportData, isLoading } = useAnalyticsReport(
    selectedProject !== "all-projects" ? selectedProject : undefined
  );

  const stats = reportData?.stats || { testCoverage: 0, automationRate: 0, defectDetection: 0, qualityScore: 0 };
  const testTypeDistribution = reportData?.testTypeDistribution || [];
  const qualityMetrics = reportData?.qualityMetrics || [];
  const efficiencyTrend = reportData?.efficiencyTrend || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <ReportHeader
          title="Test Analytics Report"
          description="Type distribution, quality radar, and efficiency trends"
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
                title="Test Coverage"
                value={`${stats.testCoverage}%`}
                description="Overall coverage"
                icon={Target}
                iconClassName="text-chart-1"
                descriptionClassName="text-primary"
              />
              <StatCard
                title="Automation Rate"
                value={`${stats.automationRate}%`}
                description="Automated tests"
                icon={Zap}
                iconClassName="text-chart-2"
                descriptionClassName="text-primary"
              />
              <StatCard
                title="Defect Detection"
                value={`${stats.defectDetection}%`}
                description="Detection rate"
                icon={Percent}
                iconClassName="text-chart-3"
                descriptionClassName="text-primary"
              />
              <StatCard
                title="Quality Score"
                value={stats.qualityScore}
                description="Excellent rating"
                icon={TrendingUp}
                iconClassName="text-chart-4"
                descriptionClassName="text-primary"
              />
            </>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Test Type Distribution */}
          <ChartCard title="Test Type Distribution" description="Breakdown of test cases by type">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
              </div>
            ) : testTypeDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={testTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {testTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Quality Metrics Radar */}
          <ChartCard title="Quality Metrics Radar" description="Overall testing quality assessment">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : qualityMetrics.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={qualityMetrics}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Efficiency Trends */}
        <ChartCard title="Efficiency Trends" description="Key efficiency metrics over time">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-[250px] w-full" />
            </div>
          ) : efficiencyTrend.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No trend data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={efficiencyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Legend />
                <Line type="monotone" dataKey="automationRate" name="Automation Rate" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-1))" }} />
                <Line type="monotone" dataKey="defectDetection" name="Defect Detection" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-2))" }} />
                <Line type="monotone" dataKey="testCoverage" name="Test Coverage" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-3))" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </AppLayout>
  );
}
