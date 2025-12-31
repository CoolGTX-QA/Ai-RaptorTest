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

const testTypeDistribution = [
  { name: "Functional", value: 145, color: "hsl(var(--chart-1))" },
  { name: "Integration", value: 68, color: "hsl(var(--chart-2))" },
  { name: "Performance", value: 32, color: "hsl(var(--chart-3))" },
  { name: "Security", value: 24, color: "hsl(var(--chart-4))" },
  { name: "Usability", value: 18, color: "hsl(var(--chart-5))" },
];

const testEfficiencyData = [
  { month: "Aug", automationRate: 45, defectDetection: 78, testCoverage: 65 },
  { month: "Sep", automationRate: 52, defectDetection: 82, testCoverage: 68 },
  { month: "Oct", automationRate: 58, defectDetection: 85, testCoverage: 72 },
  { month: "Nov", automationRate: 65, defectDetection: 88, testCoverage: 75 },
  { month: "Dec", automationRate: 72, defectDetection: 91, testCoverage: 78 },
  { month: "Jan", automationRate: 78, defectDetection: 94, testCoverage: 82 },
];

const qualityMetricsRadar = [
  { metric: "Test Coverage", value: 82, fullMark: 100 },
  { metric: "Pass Rate", value: 91, fullMark: 100 },
  { metric: "Automation", value: 78, fullMark: 100 },
  { metric: "Defect Detection", value: 94, fullMark: 100 },
  { metric: "Execution Speed", value: 85, fullMark: 100 },
  { metric: "Requirements Coverage", value: 88, fullMark: 100 },
];

export default function TestAnalyticsReport() {
  const [selectedProject, setSelectedProject] = useState("all-projects");
  const [selectedTimeRange, setSelectedTimeRange] = useState("last-30");

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
          <StatCard
            title="Test Coverage"
            value="82%"
            description="+4% from last month"
            icon={Target}
            iconClassName="text-chart-1"
            descriptionClassName="text-primary"
          />
          <StatCard
            title="Automation Rate"
            value="78%"
            description="+6% improvement"
            icon={Zap}
            iconClassName="text-chart-2"
            descriptionClassName="text-primary"
          />
          <StatCard
            title="Defect Detection"
            value="94%"
            description="+3% this quarter"
            icon={Percent}
            iconClassName="text-chart-3"
            descriptionClassName="text-primary"
          />
          <StatCard
            title="Quality Score"
            value="88"
            description="Excellent rating"
            icon={TrendingUp}
            iconClassName="text-chart-4"
            descriptionClassName="text-primary"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Test Type Distribution */}
          <ChartCard title="Test Type Distribution" description="Breakdown of test cases by type">
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
          </ChartCard>

          {/* Quality Metrics Radar */}
          <ChartCard title="Quality Metrics Radar" description="Overall testing quality assessment">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={qualityMetricsRadar}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Efficiency Trends */}
        <ChartCard title="Efficiency Trends" description="Key efficiency metrics over time">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={testEfficiencyData}>
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
        </ChartCard>
      </div>
    </AppLayout>
  );
}
