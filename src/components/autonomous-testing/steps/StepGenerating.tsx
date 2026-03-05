import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bot, Check, Loader2 } from "lucide-react";
import { AutonomousTestCase } from "@/hooks/useAutonomousTesting";
import { ApiEntry, UrlEntry } from "../AutonomousWizard";

interface Props {
  baseUrl: string;
  apis: ApiEntry[];
  urls: UrlEntry[];
  onComplete: (cases: Partial<AutonomousTestCase>[]) => void;
}

const AI_TASKS = [
  "Crawling website structure",
  "Identifying navigation flows",
  "Detecting UI components",
  "Detecting forms and inputs",
  "Identifying API endpoints",
  "Generating test scenarios",
];

const EXAMPLE_TESTS: Partial<AutonomousTestCase>[] = [
  { test_number: 1, priority: "high", test_name: "Main navigation and page routing", test_description: "Verify all main navigation links route to correct pages and render without errors", test_type: "frontend" },
  { test_number: 2, priority: "high", test_name: "Catalog listing filtering and sorting", test_description: "Test filter controls, sorting options, and pagination on listing pages", test_type: "frontend" },
  { test_number: 3, priority: "medium", test_name: "Product detail page and image gallery", test_description: "Verify product details render correctly with image gallery navigation", test_type: "frontend" },
  { test_number: 4, priority: "high", test_name: "Add to cart persistence", test_description: "Test adding items to cart and verify cart state persists across pages", test_type: "frontend" },
  { test_number: 5, priority: "critical", test_name: "Checkout flow with payment", test_description: "Complete end-to-end checkout flow including form validation and payment", test_type: "frontend" },
  { test_number: 6, priority: "critical", test_name: "Payment failure handling", test_description: "Test error handling for declined payments and network failures", test_type: "frontend" },
  { test_number: 7, priority: "medium", test_name: "Search suggestions and results", test_description: "Verify search autocomplete suggestions and results accuracy", test_type: "frontend" },
  { test_number: 8, priority: "medium", test_name: "Responsive layout behavior", test_description: "Test layout responsiveness across mobile, tablet, and desktop viewports", test_type: "frontend" },
  { test_number: 9, priority: "high", test_name: "Signup form validation", test_description: "Test signup form field validation, error messages, and successful registration", test_type: "frontend" },
  { test_number: 10, priority: "low", test_name: "Wishlist add and remove", test_description: "Test adding and removing items from wishlist with proper state updates", test_type: "frontend" },
  { test_number: 11, priority: "medium", test_name: "Promo code application", test_description: "Test applying valid and invalid promo codes and verify discount calculation", test_type: "frontend" },
  { test_number: 12, priority: "high", test_name: "Session expiration handling", test_description: "Test application behavior when user session expires during active use", test_type: "frontend" },
];

export function StepGenerating({ baseUrl, apis, urls, onComplete }: Props) {
  const [currentTask, setCurrentTask] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 8000;
    const taskInterval = totalDuration / AI_TASKS.length;
    const progressInterval = 50;
    const progressStep = 100 / (totalDuration / progressInterval);

    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(p + progressStep, 100));
    }, progressInterval);

    const taskTimer = setInterval(() => {
      setCurrentTask((t) => {
        if (t >= AI_TASKS.length - 1) {
          clearInterval(taskTimer);
          clearInterval(progressTimer);
          setProgress(100);
          setTimeout(() => onComplete(EXAMPLE_TESTS), 500);
          return t;
        }
        return t + 1;
      });
    }, taskInterval);

    return () => {
      clearInterval(progressTimer);
      clearInterval(taskTimer);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Generating Test Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 py-8">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Bot className="h-10 w-10 text-primary" />
          </div>
        </div>

        <div className="max-w-md mx-auto space-y-3">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm text-muted-foreground">
            This usually takes 1–2 minutes
          </p>
        </div>

        <div className="max-w-sm mx-auto space-y-2">
          {AI_TASKS.map((task, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              {i < currentTask ? (
                <Check className="h-4 w-4 text-primary shrink-0" />
              ) : i === currentTask ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-muted shrink-0" />
              )}
              <span className={i <= currentTask ? "text-foreground" : "text-muted-foreground"}>
                {task}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
