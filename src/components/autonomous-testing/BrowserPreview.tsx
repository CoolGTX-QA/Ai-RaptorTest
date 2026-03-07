import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ArrowRight, RotateCcw, Globe, Loader2,
  CheckCircle, XCircle, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutionStep {
  action: string;
  timestamp: string;
  status: "running" | "done" | "pending";
}

interface Props {
  baseUrl: string;
  testName: string | null;
  testStatus: string;
  isRunning: boolean;
}

const STEP_TEMPLATES: Record<string, string[]> = {
  navigation: [
    "Navigating to {{URL}}",
    "Waiting for page load",
    "Finding navigation elements",
    "Clicking nav link",
    "Asserting page title changed",
    "Screenshot captured",
  ],
  default: [
    "Navigating to {{URL}}",
    "Waiting for DOM ready",
    "Finding target element",
    "Interacting with element",
    "Waiting for response",
    "Asserting expected outcome",
    "Screenshot captured",
  ],
};

function getStepsForTest(testName: string, baseUrl: string): string[] {
  const lower = testName.toLowerCase();
  let template = STEP_TEMPLATES.default;
  if (lower.includes("navigation") || lower.includes("routing")) {
    template = STEP_TEMPLATES.navigation;
  }
  return template.map((s) => s.replace("{{URL}}", baseUrl));
}

export function BrowserPreview({ baseUrl, testName, testStatus, isRunning }: Props) {
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [currentUrl, setCurrentUrl] = useState(baseUrl);

  useEffect(() => {
    if (!isRunning || !testName) {
      if (!isRunning && steps.length > 0) {
        setSteps((prev) =>
          prev.map((s) => ({
            ...s,
            status: "done" as const,
          }))
        );
      }
      return;
    }

    const rawSteps = getStepsForTest(testName, baseUrl);
    const initial: ExecutionStep[] = rawSteps.map((action) => ({
      action,
      timestamp: "",
      status: "pending",
    }));
    setSteps(initial);

    let i = 0;
    const interval = setInterval(() => {
      if (i >= rawSteps.length) {
        clearInterval(interval);
        return;
      }
      const idx = i;
      setSteps((prev) =>
        prev.map((s, j) => {
          if (j === idx) return { ...s, status: "running", timestamp: new Date().toLocaleTimeString() };
          if (j < idx) return { ...s, status: "done" };
          return s;
        })
      );
      i++;
    }, 600);

    return () => clearInterval(interval);
  }, [isRunning, testName, baseUrl]);

  const borderColor = isRunning
    ? "border-primary"
    : testStatus === "passed"
    ? "border-green-500"
    : testStatus === "failed"
    ? "border-destructive"
    : "border-border";

  return (
    <div className="h-full flex flex-col">
      {/* Browser Chrome */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 border-b border-border">
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        </div>
        <div className="flex items-center gap-0.5 ml-2">
          <Button variant="ghost" size="icon" className="h-5 w-5">
            <ArrowLeft className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5">
            <ArrowRight className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5">
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex-1 flex items-center gap-1.5 bg-background rounded px-2 py-0.5 text-xs text-muted-foreground border border-border mx-1">
          <Lock className="h-3 w-3 text-green-500 shrink-0" />
          <span className="truncate">{currentUrl}</span>
        </div>
        {isRunning && (
          <Badge variant="outline" className="text-[10px] h-5 gap-1 border-primary text-primary">
            <Loader2 className="h-3 w-3 animate-spin" /> Executing
          </Badge>
        )}
      </div>

      {/* Viewport */}
      <div className={cn("relative flex-1 border-2 transition-colors rounded-b-md overflow-hidden", borderColor)}>
        <iframe
          src={baseUrl}
          className="w-full h-full bg-background"
          sandbox="allow-scripts allow-same-origin allow-forms"
          title="Test Preview"
        />

        {/* Execution Step Overlay */}
        {(isRunning || (steps.length > 0 && testStatus !== "draft")) && (
          <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-border max-h-[40%] overflow-y-auto">
            <div className="px-3 py-1.5 border-b border-border flex items-center gap-1.5">
              <Globe className="h-3 w-3 text-primary" />
              <span className="text-[11px] font-medium text-foreground">Execution Log</span>
            </div>
            <div className="px-3 py-1 space-y-0.5">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] py-0.5">
                  {step.status === "running" ? (
                    <Loader2 className="h-3 w-3 text-primary animate-spin shrink-0" />
                  ) : step.status === "done" ? (
                    <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-muted-foreground/30 shrink-0" />
                  )}
                  <span className={cn(
                    "flex-1",
                    step.status === "pending" ? "text-muted-foreground" : "text-foreground"
                  )}>
                    {step.action}
                  </span>
                  {step.timestamp && (
                    <span className="text-muted-foreground text-[10px]">{step.timestamp}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ready overlay when idle and no steps */}
        {!isRunning && steps.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
            <div className="text-center">
              <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Ready to execute</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Run a test to see live preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
