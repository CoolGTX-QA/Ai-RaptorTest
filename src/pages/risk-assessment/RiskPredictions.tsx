import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const predictionData = [
  { week: "Week 1", actual: 45, predicted: 48 },
  { week: "Week 2", actual: 52, predicted: 50 },
  { week: "Week 3", actual: 48, predicted: 47 },
  { week: "Week 4", actual: 55, predicted: 52 },
  { week: "Week 5", actual: null, predicted: 58 },
  { week: "Week 6", actual: null, predicted: 62 },
  { week: "Week 7", actual: null, predicted: 65 },
  { week: "Week 8", actual: null, predicted: 60 },
];

const predictions = [
  {
    title: "Authentication Module",
    trend: "up",
    prediction: "Risk likely to increase by 15% in next sprint",
    confidence: 85,
    reason: "Upcoming security feature changes",
  },
  {
    title: "Payment Processing",
    trend: "down",
    prediction: "Risk expected to decrease by 10%",
    confidence: 72,
    reason: "Additional test coverage being added",
  },
  {
    title: "User Management",
    trend: "stable",
    prediction: "Risk expected to remain stable",
    confidence: 90,
    reason: "No major changes planned",
  },
  {
    title: "Reporting Module",
    trend: "up",
    prediction: "Minor risk increase expected",
    confidence: 68,
    reason: "New export functionality being added",
  },
];

const trendIcons = {
  up: <TrendingUp className="h-4 w-4 text-destructive" />,
  down: <TrendingDown className="h-4 w-4 text-chart-1" />,
  stable: <Minus className="h-4 w-4 text-muted-foreground" />,
};

export default function RiskPredictions() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Risk Assessment</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Risk Predictions</span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            Risk Predictions
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered risk trend predictions and forecasts
          </p>
        </div>

        {/* Prediction Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Risk Trend Forecast</CardTitle>
            <CardDescription>
              Actual vs predicted risk scores over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                    name="Actual Risk"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "hsl(var(--chart-4))" }}
                    name="Predicted Risk"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Predictions Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {predictions.map((item) => (
            <Card key={item.title} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-foreground">{item.title}</CardTitle>
                  {trendIcons[item.trend as keyof typeof trendIcons]}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground mb-2">{item.prediction}</p>
                <p className="text-xs text-muted-foreground mb-3">{item.reason}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {item.confidence}% confidence
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-2 rounded-md bg-accent p-4">
          <Info className="h-5 w-5 text-accent-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium text-accent-foreground">About Predictions</p>
            <p className="text-sm text-accent-foreground/80">
              Predictions are generated using machine learning models trained on historical 
              test data, defect patterns, and code change frequency. Confidence levels 
              indicate the reliability of each prediction.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
