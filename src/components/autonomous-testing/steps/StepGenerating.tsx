import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bot, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutonomousTestCase } from "@/hooks/useAutonomousTesting";
import { ApiEntry, UrlEntry } from "../AutonomousWizard";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  baseUrl: string;
  apis: ApiEntry[];
  urls: UrlEntry[];
  onComplete: (cases: Partial<AutonomousTestCase>[]) => void;
}

const AI_TASKS = [
  "Analyzing application URL",
  "Identifying page structure & routes",
  "Detecting UI components & forms",
  "Mapping API integrations",
  "Generating test scenarios",
  "Building test plan",
];

export function StepGenerating({ baseUrl, apis, urls, onComplete }: Props) {
  const [currentTask, setCurrentTask] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const calledRef = useRef(false);

  const generate = async () => {
    setError(null);
    setCurrentTask(0);
    setProgress(0);

    // Animate progress tasks while waiting for the AI
    const taskInterval = setInterval(() => {
      setCurrentTask((t) => {
        // Don't go past the second-to-last task; last one completes on success
        if (t >= AI_TASKS.length - 2) {
          clearInterval(taskInterval);
          return t;
        }
        return t + 1;
      });
    }, 2500);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 0.5, 85));
    }, 100);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-test-plan", {
        body: { baseUrl, apis, urls },
      });

      clearInterval(taskInterval);
      clearInterval(progressInterval);

      if (fnError) throw new Error(fnError.message || "Failed to generate test plan");
      if (data?.error) throw new Error(data.error);
      if (!data?.test_cases?.length) throw new Error("No test cases were generated");

      // Complete the animation
      setCurrentTask(AI_TASKS.length - 1);
      setProgress(100);

      const cases: Partial<AutonomousTestCase>[] = data.test_cases.map((tc: any) => ({
        test_number: tc.test_number,
        priority: tc.priority,
        test_name: tc.test_name,
        test_description: tc.test_description,
        test_type: tc.test_type,
        is_enabled: true,
      }));

      setTimeout(() => onComplete(cases), 800);
    } catch (e: any) {
      clearInterval(taskInterval);
      clearInterval(progressInterval);
      console.error("Test plan generation failed:", e);
      setError(e.message || "An unexpected error occurred");
    }
  };

  useEffect(() => {
    if (!calledRef.current) {
      calledRef.current = true;
      generate();
    }
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    calledRef.current = false;
    generate().finally(() => setIsRetrying(false));
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Generation Failed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 py-8 text-center">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">{error}</p>
          <Button onClick={handleRetry} disabled={isRetrying}>
            {isRetrying ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Retrying...</>
            ) : (
              "Retry Generation"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Analyzing & Generating Test Plan</CardTitle>
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
            AI is analyzing <span className="font-medium text-foreground">{baseUrl}</span>
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
