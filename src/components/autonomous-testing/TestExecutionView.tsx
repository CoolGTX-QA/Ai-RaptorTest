import { useState, useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  ArrowLeft, Play, CheckCircle, XCircle, Clock, Loader2,
  AlertTriangle, Code, Bot, RotateCcw, Send, StopCircle, Maximize2, Minimize2,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, List, MessageSquare,
} from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { BrowserPreview, type ExecutionStep } from "./BrowserPreview";
import { parseTestInstructions, buildExecutionSteps, generatePlaywrightScript, type HealingResult } from "./TestExecutionEngine";
import { generateFailureDetails } from "./testStepGenerator";
import { AutonomousProject, AutonomousTestCase, useAutonomousTesting } from "@/hooks/useAutonomousTesting";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  autonomousProject: AutonomousProject;
  onBack: () => void;
}

const statusIcon = (s: string) => {
  switch (s) {
    case "passed": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "failed": return <XCircle className="h-4 w-4 text-destructive" />;
    case "running": return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

export function TestExecutionView({ autonomousProject, onBack }: Props) {
  const [selectedTest, setSelectedTest] = useState<AutonomousTestCase | null>(null);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [currentSteps, setCurrentSteps] = useState<ExecutionStep[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [runAllInProgress, setRunAllInProgress] = useState(false);
  const abortRef = useRef(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string; _streaming?: boolean }[]>([
    { role: "assistant", content: "I'm your AI testing assistant. Select a test case and ask me about errors — I'll analyze failures and suggest fixes using AI." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [resultTab, setResultTab] = useState("script");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const stepsResolveRef = useRef<((passed: boolean) => void) | null>(null);

  const { data: testCases = [], refetch } = useQuery({
    queryKey: ["autonomous-test-cases", autonomousProject.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("autonomous_test_cases" as any)
        .select("*")
        .eq("autonomous_project_id", autonomousProject.id)
        .order("test_number");
      if (error) throw error;
      return (data || []) as unknown as AutonomousTestCase[];
    },
  });

  const { updateTestCase } = useAutonomousTesting(autonomousProject.project_id);

  useEffect(() => {
    if (testCases.length > 0 && !selectedTest) {
      setSelectedTest(testCases[0]);
    }
  }, [testCases]);

  const getScript = (tc: AutonomousTestCase) => {
    if (tc.generated_script) return tc.generated_script;
    const instructions = parseTestInstructions(tc.test_name, tc.test_description, autonomousProject.base_url);
    return generatePlaywrightScript(instructions, tc.test_name, autonomousProject.base_url);
  };

  const executeTest = useCallback(async (tc: AutonomousTestCase) => {
    if (abortRef.current) return;
    const instructions = parseTestInstructions(tc.test_name, tc.test_description, autonomousProject.base_url);
    const steps = buildExecutionSteps(instructions, autonomousProject.base_url);
    setCurrentSteps(steps);
    setSelectedTest({ ...tc, status: "running" });
    setRunningTests((prev) => new Set(prev).add(tc.id));
    setIsExecuting(true);
    setResultTab("script");
    setChatMessages(prev => [...prev, {
      role: "assistant",
      content: `🚀 Starting "${tc.test_name}" — ${steps.length} steps.\n🛡️ Self-healing enabled.`,
    }]);
    const passed = await new Promise<boolean>((resolve) => {
      stepsResolveRef.current = resolve;
    });
    if (abortRef.current) {
      setIsExecuting(false);
      setRunningTests((prev) => { const s = new Set(prev); s.delete(tc.id); return s; });
      return;
    }
    const totalDuration = steps.reduce((sum, s) => sum + (s.duration_ms || 700), 0);
    let result: Partial<AutonomousTestCase>;
    if (passed) {
      const script = generatePlaywrightScript(instructions, tc.test_name, autonomousProject.base_url);
      result = { status: "passed", duration_ms: totalDuration, executed_at: new Date().toISOString(), generated_script: script, error_message: null, trace: null, cause: null, fix_suggestion: null };
      setChatMessages(prev => [...prev, { role: "assistant", content: `✅ "${tc.test_name}" passed in ${(totalDuration / 1000).toFixed(1)}s.` }]);
    } else {
      const failure = generateFailureDetails(tc.test_name);
      result = { status: "failed", duration_ms: totalDuration, executed_at: new Date().toISOString(), ...failure };
      setResultTab("error");
      setChatMessages(prev => [...prev, { role: "assistant", content: `❌ "${tc.test_name}" failed.\n\n**Cause:** ${failure.cause}\n\n**Fix:** ${failure.fix_suggestion}` }]);
    }
    try { await updateTestCase.mutateAsync({ id: tc.id, updates: result }); } catch {}
    setIsExecuting(false);
    setRunningTests((prev) => { const s = new Set(prev); s.delete(tc.id); return s; });
    setSelectedTest((prev) => prev?.id === tc.id ? { ...prev, ...result } as AutonomousTestCase : prev);
    refetch();
  }, [autonomousProject.base_url, updateTestCase, refetch]);

  const handleStepsComplete = useCallback((passed: boolean) => {
    if (stepsResolveRef.current) {
      stepsResolveRef.current(passed);
      stepsResolveRef.current = null;
    }
  }, []);

  const runAll = async () => {
    abortRef.current = false;
    setRunAllInProgress(true);
    const enabled = testCases.filter((tc) => tc.is_enabled);
    setChatMessages(prev => [...prev, { role: "assistant", content: `📋 Running ${enabled.length} enabled tests...` }]);
    for (const tc of enabled) {
      if (abortRef.current) break;
      await executeTest(tc);
    }
    setRunAllInProgress(false);
    if (!abortRef.current) {
      setChatMessages(prev => [...prev, { role: "assistant", content: `🏁 Done. ${testCases.filter(t => t.status === "passed").length} passed, ${testCases.filter(t => t.status === "failed").length} failed.` }]);
    }
  };

  const stopExecution = () => { abortRef.current = true; setRunAllInProgress(false); };

  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    setIsChatLoading(true);

    // Build context for the AI
    const testContext = selectedTest
      ? {
          test_name: selectedTest.test_name,
          test_description: selectedTest.test_description,
          status: selectedTest.status,
          error_message: selectedTest.error_message,
          trace: selectedTest.trace,
          cause: selectedTest.cause,
          fix_suggestion: selectedTest.fix_suggestion,
          generated_script: selectedTest.generated_script,
          base_url: autonomousProject.base_url,
        }
      : null;

    // Build message history (last 10 messages for context)
    const recentMessages = chatMessages.slice(-10).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    recentMessages.push({ role: "user", content: userMsg });

    let assistantContent = "";

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-test-error`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: recentMessages, testContext }),
        }
      );

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No stream body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setChatMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && last._streaming) {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent, _streaming: true }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Finalize streaming message
      setChatMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 && (m as any)._streaming
            ? { role: m.role, content: m.content }
            : m
        )
      );
    } catch (err: any) {
      console.error("AI chat error:", err);
      setChatMessages((prev) => [
        ...prev,
        ...(assistantContent ? [] : [{ role: "assistant", content: `⚠️ ${err.message || "Failed to get AI response. Please try again."}` }]),
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const passedCount = testCases.filter((t) => t.status === "passed").length;
  const failedCount = testCases.filter((t) => t.status === "failed").length;

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="flex flex-col h-[calc(100vh-80px)]">
          {/* Top bar */}
          <div className="flex items-center justify-between px-1 pb-3 shrink-0">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground leading-tight">{autonomousProject.test_name}</h1>
                <p className="text-[11px] text-muted-foreground">{autonomousProject.base_url}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" /> {passedCount}
              </Badge>
              <Badge variant="outline" className="text-xs gap-1">
                <XCircle className="h-3 w-3 text-destructive" /> {failedCount}
              </Badge>
              {runAllInProgress ? (
                <Button onClick={stopExecution} size="sm" variant="destructive">
                  <StopCircle className="h-3.5 w-3.5 mr-1" /> Stop
                </Button>
              ) : (
                <Button onClick={runAll} size="sm" disabled={isExecuting}>
                  <Play className="h-3.5 w-3.5 mr-1" /> Run All
                </Button>
              )}
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
            {/* LEFT: Test List Panel */}
            {leftPanelOpen ? (
              <div className="w-[260px] shrink-0 flex flex-col">
                <Card className="flex-1 flex flex-col overflow-hidden border-border/60">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <List className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">Tests ({testCases.length})</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setLeftPanelOpen(false)}>
                          <PanelLeftClose className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right"><p className="text-xs">Minimize panel</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-1.5 space-y-0.5">
                      {testCases.map((tc) => {
                        const isActive = selectedTest?.id === tc.id;
                        const tcRunning = runningTests.has(tc.id);
                        return (
                          <button
                            key={tc.id}
                            onClick={() => { setSelectedTest(tc); if (!tcRunning) setCurrentSteps([]); }}
                            className={cn(
                              "w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-all",
                              isActive
                                ? "bg-primary/10 text-foreground ring-1 ring-primary/20"
                                : "hover:bg-accent/50 text-foreground/80"
                            )}
                          >
                            {tcRunning ? (
                              <Loader2 className="h-3 w-3 text-primary animate-spin shrink-0" />
                            ) : (
                              <span className="shrink-0">{statusIcon(tc.status)}</span>
                            )}
                            <span className="truncate flex-1 leading-tight">{tc.test_name}</span>
                            {tc.duration_ms && !tcRunning && (
                              <span className="text-[10px] text-muted-foreground tabular-nums">{(tc.duration_ms / 1000).toFixed(1)}s</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            ) : (
              <div className="shrink-0 flex flex-col items-center pt-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setLeftPanelOpen(true)}>
                      <PanelLeftOpen className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right"><p className="text-xs">Show test list</p></TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* CENTER: Execution Preview */}
            <div className={cn(
              "flex-1 min-w-0 flex flex-col",
              isFullscreen && "fixed inset-0 z-50 bg-background p-3"
            )}>
              <Card className="flex-1 flex flex-col overflow-hidden border-border/60">
                {/* Center header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 shrink-0">
                  <span className="text-xs font-medium text-foreground truncate mr-2">
                    {selectedTest ? selectedTest.test_name : "Select a test case"}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {selectedTest && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5"
                        onClick={() => executeTest(selectedTest)}
                        disabled={isExecuting}
                      >
                        {runningTests.has(selectedTest.id) ? (
                          <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Running</>
                        ) : (
                          <><Play className="h-3 w-3 mr-1" /> Run</>
                        )}
                      </Button>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => setIsFullscreen((f) => !f)}
                        >
                          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p className="text-xs">{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                {/* Center body */}
                <div className="flex-1 overflow-hidden">
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={isFullscreen ? 70 : 60} minSize={30}>
                      <BrowserPreview
                        baseUrl={autonomousProject.base_url}
                        testName={selectedTest?.test_name || null}
                        testDescription={selectedTest?.test_description || null}
                        testStatus={selectedTest?.status || "draft"}
                        isRunning={selectedTest ? runningTests.has(selectedTest.id) : false}
                        executionSteps={currentSteps}
                        onStepsComplete={handleStepsComplete}
                      />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={isFullscreen ? 30 : 40} minSize={10}>
                      {selectedTest && (
                        <Tabs value={resultTab} onValueChange={setResultTab} className="h-full flex flex-col">
                          <TabsList className="mx-3 mt-1.5 h-8">
                            <TabsTrigger value="script" className="text-xs h-7"><Code className="h-3 w-3 mr-1" />Script</TabsTrigger>
                            <TabsTrigger value="error" className="text-xs h-7" disabled={selectedTest.status !== "failed"}>
                              <AlertTriangle className="h-3 w-3 mr-1" />Error
                            </TabsTrigger>
                            <TabsTrigger value="trace" className="text-xs h-7" disabled={selectedTest.status !== "failed"}>Trace</TabsTrigger>
                            <TabsTrigger value="cause" className="text-xs h-7" disabled={selectedTest.status !== "failed"}>Cause</TabsTrigger>
                            <TabsTrigger value="fix" className="text-xs h-7" disabled={selectedTest.status !== "failed"}>Fix</TabsTrigger>
                          </TabsList>
                          <TabsContent value="script" className="flex-1 m-0 p-3 overflow-hidden">
                            <ScrollArea className="h-full">
                              <pre className="text-[11px] font-mono bg-muted/50 rounded-lg p-3 text-foreground overflow-x-auto whitespace-pre">
                                {getScript(selectedTest)}
                              </pre>
                            </ScrollArea>
                          </TabsContent>
                          <TabsContent value="error" className="flex-1 m-0 p-3">
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                              <p className="text-xs text-destructive font-medium">Error</p>
                              <p className="text-xs text-foreground mt-1.5">{selectedTest.error_message || "No error"}</p>
                            </div>
                          </TabsContent>
                          <TabsContent value="trace" className="flex-1 m-0 p-3">
                            <ScrollArea className="h-full">
                              <pre className="text-[11px] font-mono bg-muted/50 rounded-lg p-3 text-foreground whitespace-pre-wrap">
                                {selectedTest.trace || "No trace available"}
                              </pre>
                            </ScrollArea>
                          </TabsContent>
                          <TabsContent value="cause" className="flex-1 m-0 p-3">
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-xs font-medium text-foreground">Root Cause</p>
                              <p className="text-xs text-muted-foreground mt-1.5">{selectedTest.cause || "Not determined"}</p>
                            </div>
                          </TabsContent>
                          <TabsContent value="fix" className="flex-1 m-0 p-3">
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                              <p className="text-xs font-medium text-primary">Suggested Fix</p>
                              <p className="text-xs text-foreground mt-1.5">{selectedTest.fix_suggestion || "No suggestion"}</p>
                            </div>
                          </TabsContent>
                        </Tabs>
                      )}
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>
              </Card>
            </div>

            {/* RIGHT: AI Assistant Panel */}
            {rightPanelOpen ? (
              <div className="w-[300px] shrink-0 flex flex-col">
                <Card className="flex-1 flex flex-col overflow-hidden border-border/60">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-foreground">AI Assistant</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setRightPanelOpen(false)}>
                          <PanelRightClose className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left"><p className="text-xs">Minimize panel</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-2.5">
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={cn(
                            "rounded-lg px-3 py-2 text-xs leading-relaxed",
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground ml-6"
                              : "bg-muted text-foreground mr-4"
                          )}
                        >
                          {msg.role === "assistant" ? (
                            <div className="prose prose-xs prose-neutral dark:prose-invert max-w-none [&_p]:text-xs [&_p]:my-1 [&_li]:text-xs [&_code]:text-[10px] [&_pre]:text-[10px] [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            msg.content
                          )}
                        </div>
                      ))}
                      {isChatLoading && chatMessages[chatMessages.length - 1]?.role !== "assistant" && (
                        <div className="bg-muted text-foreground mr-4 rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                          <span className="text-muted-foreground">Analyzing...</span>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="p-2.5 border-t border-border/60 shrink-0">
                    <div className="flex gap-1.5">
                      <Textarea
                        placeholder="Ask about failures, errors, or how to fix tests..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        rows={2}
                        className="resize-none text-xs min-h-[52px]"
                        disabled={isChatLoading}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendChat(); }
                        }}
                      />
                      <div className="flex flex-col gap-1">
                        <Button size="icon" className="h-6 w-6" onClick={handleSendChat}>
                          <Send className="h-3 w-3" />
                        </Button>
                        {selectedTest && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() => executeTest(selectedTest)}
                            disabled={isExecuting}
                            title="Re-run"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="shrink-0 flex flex-col items-center pt-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setRightPanelOpen(true)}>
                      <PanelRightOpen className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left"><p className="text-xs">Show AI assistant</p></TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
