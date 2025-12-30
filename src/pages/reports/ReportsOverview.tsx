import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Activity,
  Bug,
  Search,
  Target,
  Zap,
  ArrowRight,
  BarChart3,
} from "lucide-react";

const reportModules = [
  {
    title: "Test Execution Report",
    description: "Run details, pass rates, and execution trends by sprint",
    icon: Play,
    href: "/reports/test-execution",
    color: "text-chart-1",
    stats: { label: "Pass Rate", value: "89.1%" },
  },
  {
    title: "Test Analytics Report",
    description: "Type distribution, quality radar, and efficiency trends",
    icon: Activity,
    href: "/reports/test-analytics",
    color: "text-chart-2",
    stats: { label: "Coverage", value: "82%" },
  },
  {
    title: "Defect Leakage Report",
    description: "Leakage by phase, severity breakdown, and trend analysis",
    icon: Bug,
    href: "/reports/defect-leakage",
    color: "text-destructive",
    stats: { label: "Leakage Rate", value: "6%" },
  },
  {
    title: "RCA Report",
    description: "Root cause categories, preventive actions, and implementation tracking",
    icon: Search,
    href: "/reports/rca",
    color: "text-chart-4",
    stats: { label: "Implemented", value: "50%" },
  },
  {
    title: "Requirement Traceability",
    description: "Coverage matrix linking requirements to test cases",
    icon: Target,
    href: "/reports/traceability",
    color: "text-chart-3",
    stats: { label: "Linked", value: "129" },
  },
  {
    title: "Advanced Reports",
    description: "Test effort analysis, defect density, and test cycle summary",
    icon: Zap,
    href: "/reports/advanced",
    color: "text-primary",
    stats: { label: "Modules", value: "3" },
  },
];

export default function ReportsOverview() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive testing insights and metrics
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">6 Report Modules</span>
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reportModules.map((module) => (
            <Card key={module.title} className="group border-border transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg bg-muted p-3 ${module.color}`}>
                    <module.icon className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{module.stats.label}</p>
                    <p className="text-lg font-bold text-foreground">{module.stats.value}</p>
                  </div>
                </div>
                <CardTitle className="text-foreground">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                  <Link to={module.href}>
                    View Report
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
