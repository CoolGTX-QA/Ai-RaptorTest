import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ArrowRight, RotateCcw, Globe, Loader2,
  CheckCircle, XCircle, Lock, Camera, MousePointer,
  Type, Eye, Navigation, Search, FormInput, Zap, RefreshCw, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { simulateSelfHealing, type HealingResult } from "./TestExecutionEngine";

export interface ExecutionStep {
  action: string;
  detail: string;
  icon: "navigate" | "click" | "type" | "assert" | "wait" | "screenshot" | "scroll" | "search" | "submit";
  targetUrl?: string;
  timestamp: string;
  status: "running" | "done" | "failed" | "pending" | "healed";
  duration_ms?: number;
  selectors?: string[];
  value?: string;
  assertion?: string;
  healingAttempts?: HealingResult[];
  healingResult?: HealingResult;
}

interface Props {
  baseUrl: string;
  testName: string | null;
  testDescription: string | null;
  testStatus: string;
  isRunning: boolean;
  executionSteps: ExecutionStep[];
  onStepsComplete?: (passed: boolean) => void;
}

const stepIcons: Record<ExecutionStep["icon"], React.ReactNode> = {
  navigate: <Navigation className="h-3 w-3 shrink-0" />,
  click: <MousePointer className="h-3 w-3 shrink-0" />,
  type: <Type className="h-3 w-3 shrink-0" />,
  assert: <Eye className="h-3 w-3 shrink-0" />,
  wait: <Loader2 className="h-3 w-3 shrink-0" />,
  screenshot: <Camera className="h-3 w-3 shrink-0" />,
  scroll: <ArrowLeft className="h-3 w-3 shrink-0 rotate-[-90deg]" />,
  search: <Search className="h-3 w-3 shrink-0" />,
  submit: <FormInput className="h-3 w-3 shrink-0" />,
};

export function BrowserPreview({ baseUrl, testName, testDescription, testStatus, isRunning, executionSteps, onStepsComplete }: Props) {
  const [activeSteps, setActiveSteps] = useState<ExecutionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [currentUrl, setCurrentUrl] = useState(baseUrl);
  const [iframeKey, setIframeKey] = useState(0);
  const [healingCount, setHealingCount] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (activeSteps.length > 0 && currentStepIndex >= 0) {
        setActiveSteps(prev => prev.map((s, i) => ({
          ...s,
          status: s.status === "failed" ? "failed" : i <= currentStepIndex ? (s.status === "healed" ? "healed" : "done") : s.status,
        })));
      }
      return;
    }

    setCurrentUrl(baseUrl);
    setCurrentStepIndex(-1);
    setHealingCount(0);
    const initialized = executionSteps.map(s => ({ ...s, status: "pending" as const, timestamp: "", duration_ms: 0, healingResult: undefined }));
    setActiveSteps(initialized);

    let stepIdx = 0;
    let totalHealed = 0;
    let hasFailed = false;

    const runNextStep = () => {
      if (stepIdx >= executionSteps.length) {
        // 70% pass, 30% fail — but if we healed many, slightly lower pass rate
        const passChance = totalHealed > 2 ? 0.5 : 0.7;
        onStepsComplete?.(!hasFailed && Math.random() < passChance);
        return;
      }

      const idx = stepIdx;
      const step = executionSteps[idx];
      const baseDelay = getStepDelay(step.icon);

      setCurrentStepIndex(idx);
      setActiveSteps(prev => prev.map((s, j) => {
        if (j === idx) return { ...s, status: "running", timestamp: new Date().toLocaleTimeString() };
        if (j < idx && s.status === "running") return { ...s, status: "done" };
        return s;
      }));

      if (step.targetUrl) {
        setCurrentUrl(step.targetUrl);
      }

      // Attempt self-healing for steps with selectors
      const selectors = step.selectors || [];
      const healing = selectors.length > 1 ? simulateSelfHealing(selectors, idx) : null;

      if (healing) {
        totalHealed++;
        setHealingCount(totalHealed);

        // Show healing animation — first show as failed, then retry, then healed
        const healDelay = 300 + Math.random() * 400;

        timerRef.current = setTimeout(() => {
          // Mark as healing attempt
          setActiveSteps(prev => prev.map((s, j) => {
            if (j === idx) return {
              ...s,
              status: "running",
              detail: `⚡ Healing: ${healing.strategy} → ${healing.healedSelector}`,
              healingResult: healing,
            };
            return s;
          }));

          // After heal delay, mark as healed and continue
          timerRef.current = setTimeout(() => {
            setActiveSteps(prev => prev.map((s, j) => {
              if (j === idx) return {
                ...s,
                status: "healed",
                duration_ms: Math.round(baseDelay + healDelay * 2),
                detail: step.detail,
                healingResult: healing,
              };
              return s;
            }));
            stepIdx++;
            timerRef.current = setTimeout(runNextStep, 150);
          }, healDelay);
        }, healDelay);
      } else {
        // Normal execution
        timerRef.current = setTimeout(() => {
          // Small chance of hard failure on assert steps
          const isHardFail = step.icon === "assert" && Math.random() < 0.08;

          if (isHardFail) {
            hasFailed = true;
            setActiveSteps(prev => prev.map((s, j) => {
              if (j === idx) return { ...s, status: "failed", duration_ms: Math.round(baseDelay), detail: `✗ Assertion failed: Element not found after 30s timeout` };
              return s;
            }));
            stepIdx++;
            timerRef.current = setTimeout(runNextStep, 200);
          } else {
            setActiveSteps(prev => prev.map((s, j) => {
              if (j === idx) return { ...s, status: "done", duration_ms: Math.round(baseDelay) };
              return s;
            }));
            stepIdx++;
            timerRef.current = setTimeout(runNextStep, 100);
          }
        }, baseDelay);
      }
    };

    timerRef.current = setTimeout(runNextStep, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, testName]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [activeSteps, currentStepIndex]);

  const borderColor = isRunning
    ? "border-primary"
    : testStatus === "passed"
    ? "border-green-500/50"
    : testStatus === "failed"
    ? "border-destructive/50"
    : "border-border";

  const getStepStatusIcon = (step: ExecutionStep) => {
    if (step.status === "running") return <Loader2 className="h-3 w-3 text-primary animate-spin shrink-0" />;
    if (step.status === "healed") return <ShieldCheck className="h-3 w-3 text-amber-500 shrink-0" />;
    if (step.status === "done") return <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />;
    if (step.status === "failed") return <XCircle className="h-3 w-3 text-destructive shrink-0" />;
    return <div className="h-3 w-3 rounded-full border border-muted-foreground/30 shrink-0" />;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Browser Chrome */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 border-b border-border shrink-0">
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        </div>
        <div className="flex items-center gap-0.5 ml-2">
          <Button variant="ghost" size="icon" className="h-5 w-5" disabled>
            <ArrowLeft className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5" disabled>
            <ArrowRight className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIframeKey(k => k + 1)}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex-1 flex items-center gap-1.5 bg-background rounded px-2 py-0.5 text-xs text-muted-foreground border border-border mx-1">
          <Lock className="h-3 w-3 text-green-500 shrink-0" />
          <span className="truncate">{currentUrl}</span>
        </div>
        {healingCount > 0 && (
          <Badge variant="outline" className="text-[10px] h-5 gap-1 border-amber-500/50 text-amber-500">
            <ShieldCheck className="h-3 w-3" /> {healingCount} healed
          </Badge>
        )}
        {isRunning && (
          <Badge variant="outline" className="text-[10px] h-5 gap-1 border-primary text-primary animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" /> Executing
          </Badge>
        )}
        {!isRunning && testStatus === "passed" && activeSteps.length > 0 && (
          <Badge variant="outline" className="text-[10px] h-5 gap-1 border-green-500/50 text-green-500">
            <CheckCircle className="h-3 w-3" /> Passed
          </Badge>
        )}
        {!isRunning && testStatus === "failed" && activeSteps.length > 0 && (
          <Badge variant="outline" className="text-[10px] h-5 gap-1 border-destructive/50 text-destructive">
            <XCircle className="h-3 w-3" /> Failed
          </Badge>
        )}
      </div>

      {/* Viewport */}
      <div className={cn("relative flex-1 border-2 transition-colors rounded-b-md overflow-hidden", borderColor)}>
        <iframe
          key={iframeKey}
          src={baseUrl}
          className="w-full h-full bg-background"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          title="Test Preview"
        />

        {/* Click indicator */}
        {isRunning && currentStepIndex >= 0 && activeSteps[currentStepIndex]?.icon === "click" && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="h-8 w-8 rounded-full border-2 border-primary animate-ping opacity-50" />
            <MousePointer className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4" />
          </div>
        )}

        {/* Type indicator */}
        {isRunning && currentStepIndex >= 0 && activeSteps[currentStepIndex]?.icon === "type" && (
          <div className="absolute bottom-[55%] left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="bg-primary/10 border border-primary/30 rounded px-3 py-1 flex items-center gap-1.5 animate-pulse">
              <Type className="h-3 w-3 text-primary" />
              <span className="text-xs text-primary font-mono">{activeSteps[currentStepIndex]?.value || "typing..."}</span>
              <span className="w-0.5 h-3 bg-primary animate-pulse" />
            </div>
          </div>
        )}

        {/* Healing indicator */}
        {isRunning && currentStepIndex >= 0 && activeSteps[currentStepIndex]?.status === "running" && activeSteps[currentStepIndex]?.healingResult && (
          <div className="absolute top-4 right-4 pointer-events-none">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 flex items-center gap-2 animate-pulse">
              <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />
              <div>
                <p className="text-xs font-medium text-amber-500">Self-Healing</p>
                <p className="text-[10px] text-amber-500/80">Trying alternative selector...</p>
              </div>
            </div>
          </div>
        )}

        {/* Assert highlight */}
        {isRunning && currentStepIndex >= 0 && activeSteps[currentStepIndex]?.icon === "assert" && (
          <div className="absolute inset-[15%] pointer-events-none border-2 border-dashed border-primary/60 rounded-lg animate-pulse" />
        )}

        {/* Execution Step Log */}
        {(isRunning || activeSteps.length > 0) && (
          <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border max-h-[45%] flex flex-col">
            <div className="px-3 py-1.5 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <Globe className="h-3 w-3 text-primary" />
                <span className="text-[11px] font-medium text-foreground">Execution Log</span>
                {healingCount > 0 && (
                  <Badge variant="outline" className="text-[9px] h-4 gap-0.5 border-amber-500/30 text-amber-500 ml-1">
                    <Zap className="h-2.5 w-2.5" /> {healingCount} self-healed
                  </Badge>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {activeSteps.filter(s => s.status === "done" || s.status === "healed").length}/{activeSteps.length} steps
              </span>
            </div>
            <div ref={logRef} className="px-3 py-1 space-y-0.5 overflow-y-auto">
              {activeSteps.map((step, i) => (
                <div key={i} className={cn(
                  "flex items-center gap-2 text-[11px] py-0.5 rounded px-1 transition-colors",
                  step.status === "running" && "bg-primary/5",
                  step.status === "healed" && "bg-amber-500/5",
                  step.status === "failed" && "bg-destructive/5"
                )}>
                  {getStepStatusIcon(step)}
                  <span className="text-muted-foreground">
                    {stepIcons[step.icon]}
                  </span>
                  <span className={cn(
                    "flex-1",
                    step.status === "pending" ? "text-muted-foreground" : "text-foreground"
                  )}>
                    <span className="font-medium">{step.action}</span>
                    {step.detail && <span className="text-muted-foreground ml-1">— {step.detail}</span>}
                  </span>
                  {step.status === "healed" && (
                    <Badge variant="outline" className="text-[9px] h-4 px-1 border-amber-500/30 text-amber-500">
                      healed
                    </Badge>
                  )}
                  {step.duration_ms ? (
                    <span className="text-muted-foreground text-[10px] tabular-nums">{step.duration_ms}ms</span>
                  ) : step.timestamp ? (
                    <span className="text-muted-foreground text-[10px]">{step.timestamp}</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ready overlay */}
        {!isRunning && activeSteps.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
            <div className="text-center">
              <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Ready to execute</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Run a test to see live preview with self-healing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getStepDelay(icon: string): number {
  switch (icon) {
    case "navigate": return 800 + Math.random() * 600;
    case "click": return 300 + Math.random() * 400;
    case "type": return 500 + Math.random() * 700;
    case "assert": return 400 + Math.random() * 500;
    case "wait": return 600 + Math.random() * 800;
    case "screenshot": return 200 + Math.random() * 300;
    case "scroll": return 300 + Math.random() * 300;
    case "search": return 400 + Math.random() * 400;
    case "submit": return 500 + Math.random() * 500;
    default: return 400 + Math.random() * 500;
  }
}
