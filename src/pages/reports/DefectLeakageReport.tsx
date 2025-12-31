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

const defectLeakageData = [
  { phase: "Unit Testing", found: 45, leaked: 12 },
  { phase: "Integration", found: 32, leaked: 8 },
  { phase: "System Testing", found: 28, leaked: 5 },
  { phase: "UAT", found: 15, leaked: 3 },
  { phase: "Production", found: 8, leaked: 0 },
];

const defectLeakageTrend = [
  { month: "Aug", leakageRate: 18 },
  { month: "Sep", leakageRate: 15 },
  { month: "Oct", leakageRate: 12 },
  { month: "Nov", leakageRate: 10 },
  { month: "Dec", leakageRate: 8 },
  { month: "Jan", leakageRate: 6 },
];

const defectsBySeverity = [
  { severity: "Critical", devPhase: 5, testPhase: 2, production: 1 },
  { severity: "High", devPhase: 12, testPhase: 8, production: 2 },
  { severity: "Medium", devPhase: 25, testPhase: 15, production: 4 },
  { severity: "Low", devPhase: 18, testPhase: 10, production: 1 },
];

export default function DefectLeakageReport() {
  const [selectedProject, setSelectedProject] = useState("all-projects");
  const [selectedTimeRange, setSelectedTimeRange] = useState("last-30");

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
          <StatCard
            title="Total Defects Found"
            value="128"
            description="Across all phases"
            icon={Bug}
            iconClassName="text-chart-1"
          />
          <StatCard
            title="Leakage Rate"
            value="6%"
            description="-12% from baseline"
            icon={TrendingDown}
            iconClassName="text-chart-1"
            descriptionClassName="text-primary"
          />
          <StatCard
            title="Production Defects"
            value="8"
            description="Critical to fix"
            icon={AlertTriangle}
            iconClassName="text-destructive"
            descriptionClassName="text-destructive"
          />
          <StatCard
            title="Containment Rate"
            value="94%"
            description="Excellent"
            icon={Shield}
            iconClassName="text-chart-1"
            descriptionClassName="text-primary"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Defects by Phase */}
          <ChartCard title="Defects by Phase" description="Found vs leaked defects per testing phase">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defectLeakageData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="phase" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Legend />
                <Bar dataKey="found" name="Defects Found" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leaked" name="Defects Leaked" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Leakage Trend */}
          <ChartCard title="Leakage Rate Trend" description="Monthly defect leakage percentage">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={defectLeakageTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="leakageRate" name="Leakage Rate" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Severity Breakdown */}
        <ChartCard title="Defects by Severity & Phase" description="Distribution of defects across phases by severity level">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={defectsBySeverity}>
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
        </ChartCard>
      </div>
    </AppLayout>
  );
}
