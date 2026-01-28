import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, AlertTriangle, Bell, BellOff, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const alerts = [
  {
    id: 1,
    title: "Critical: Authentication Module Risk Exceeded Threshold",
    description: "Risk score increased to 89, exceeding the 80 threshold",
    module: "Authentication",
    severity: "critical",
    timestamp: "2 hours ago",
    acknowledged: false,
  },
  {
    id: 2,
    title: "Warning: Payment Processing Coverage Dropped",
    description: "Test coverage decreased from 78% to 65%",
    module: "Payment Processing",
    severity: "warning",
    timestamp: "5 hours ago",
    acknowledged: false,
  },
  {
    id: 3,
    title: "Info: New High-Risk Test Case Identified",
    description: "SQL Injection Prevention test case flagged as high risk",
    module: "Security",
    severity: "info",
    timestamp: "1 day ago",
    acknowledged: true,
  },
  {
    id: 4,
    title: "Warning: Integration Tests Failing",
    description: "3 integration tests have been failing for 2 days",
    module: "Integration",
    severity: "warning",
    timestamp: "2 days ago",
    acknowledged: true,
  },
];

const severityStyles = {
  critical: {
    badge: "bg-destructive text-destructive-foreground",
    icon: "text-destructive",
  },
  warning: {
    badge: "bg-chart-4 text-foreground",
    icon: "text-chart-4",
  },
  info: {
    badge: "bg-primary text-primary-foreground",
    icon: "text-primary",
  },
};

export default function RiskAlerts() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Risk Assessment</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Risk Alerts</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <AlertTriangle className="h-6 w-6 text-primary-foreground" />
              </div>
              Risk Alerts
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor and manage risk threshold alerts
            </p>
          </div>
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Configure Alerts
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold text-destructive">2</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Acknowledged</p>
                  <p className="text-2xl font-bold text-chart-1">2</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-chart-1" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-foreground">4</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Alerts</CardTitle>
            <CardDescription>
              Risk alerts triggered based on configured thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start justify-between p-4 rounded-lg border",
                  alert.acknowledged ? "bg-muted/50 border-border" : "bg-background border-border"
                )}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={cn(
                      "h-5 w-5 mt-0.5",
                      severityStyles[alert.severity as keyof typeof severityStyles].icon
                    )}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{alert.title}</h4>
                      <Badge
                        className={cn(
                          severityStyles[alert.severity as keyof typeof severityStyles].badge
                        )}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Module: {alert.module}</span>
                      <span>•</span>
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant={alert.acknowledged ? "ghost" : "outline"}
                  size="sm"
                  disabled={alert.acknowledged}
                >
                  {alert.acknowledged ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Acknowledged
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-1" />
                      Acknowledge
                    </>
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
