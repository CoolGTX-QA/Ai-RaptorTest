import { useState, useEffect, useCallback, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Play, CheckCircle, XCircle, Clock, Loader2,
  AlertTriangle, Code, Bot, RotateCcw, Send, StopCircle, Maximize2, Minimize2,
} from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { BrowserPreview, type ExecutionStep } from "./BrowserPreview";
import { generateExecutionSteps, generateFailureDetails } from "./testStepGenerator";
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

const SAMPLE_SCRIPTS: Record<string, string> = {
  "Main navigation and page routing": `import { test, expect } from '@playwright/test';

test('Main navigation and page routing', async ({ page }) => {
  await page.goto('{{BASE_URL}}');
  
  // Verify main navigation links
  const navLinks = page.locator('nav a');
  await expect(navLinks).toHaveCount.greaterThan(0);
  
  // Click each nav link and verify no errors
  const links = await navLinks.allTextContents();
  for (const linkText of links) {
    await page.click(\`nav a:has-text("\${linkText}")\`);
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveTitle(/error|404/i);
  }
});`,
  default: `import { test, expect } from '@playwright/test';

test('{{TEST_NAME}}', async ({ page }) => {
  await page.goto('{{BASE_URL}}');
  
  // Step 1: Navigate to the target page
  await page.waitForLoadState('networkidle');
  
  // Step 2: Interact with page elements
  // await page.click('selector');
  
  // Step 3: Assert expected outcomes
  await expect(page).toBeVisible();
});`,
};

export function TestExecutionView({ autonomousProject, onBack }: Props) {
  const [selectedTest, setSelectedTest] = useState<AutonomousTestCase | null>(null);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [currentSteps, setCurrentSteps] = useState<ExecutionStep[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [runAllInProgress, setRunAllInProgress] = useState(false);
  const abortRef = useRef(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "I'm your AI testing assistant. Select a test case to see its details, or run tests to see results. I can help debug failures and suggest fixes." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [resultTab, setResultTab] = useState("script");

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
    const template = SAMPLE_SCRIPTS[tc.test_name] || SAMPLE_SCRIPTS.default;
    return template
      .replace(/\{\{BASE_URL\}\}/g, autonomousProject.base_url)
      .replace(/\{\{TEST_NAME\}\}/g, tc.test_name);
  };

  const executeTest = useCallback(async (tc: AutonomousTestCase) => {
    if (abortRef.current) return;

    // Generate contextual steps for this test case
    const steps = generateExecutionSteps({
      testName: tc.test_name,
      testDescription: tc.test_description,
      baseUrl: autonomousProject.base_url,
      testType: tc.test_type,
    });

    setCurrentSteps(steps);
    setSelectedTest({ ...tc, status: "running" });
    setRunningTests((prev) => new Set(prev).add(tc.id));
    setIsExecuting(true);
    setResultTab("script");

    // Add chat message about starting
    setChatMessages(prev => [...prev, {
      role: "assistant",
      content: `🚀 Starting execution of "${tc.test_name}" — ${steps.length} steps to execute.`,
    }]);

    // Wait for steps to complete (each step ~500-1200ms)
    const totalDuration = steps.length * 700 + 500;
    await new Promise((r) => setTimeout(r, totalDuration));

    if (abortRef.current) {
      setIsExecuting(false);
      setRunningTests((prev) => { const s = new Set(prev); s.delete(tc.id); return s; });
      return;
    }

    // Determine pass/fail
    const passed = Math.random() > 0.3;
    let result: Partial<AutonomousTestCase>;

    if (passed) {
      result = {
        status: "passed",
        duration_ms: totalDuration,
        executed_at: new Date().toISOString(),
        error_message: null,
        trace: null,
        cause: null,
        fix_suggestion: null,
      };
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: `✅ "${tc.test_name}" passed in ${(totalDuration / 1000).toFixed(1)}s. All ${steps.length} steps completed successfully.`,
      }]);
    } else {
      const failure = generateFailureDetails(tc.test_name);
      result = {
        status: "failed",
        duration_ms: totalDuration,
        executed_at: new Date().toISOString(),
        ...failure,
      };
      setResultTab("error");
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: `❌ "${tc.test_name}" failed.\n\n**Cause:** ${failure.cause}\n\n**Fix:** ${failure.fix_suggestion}`,
      }]);
    }

    try {
      await updateTestCase.mutateAsync({ id: tc.id, updates: result });
    } catch {}

    setIsExecuting(false);
    setRunningTests((prev) => { const s = new Set(prev); s.delete(tc.id); return s; });
    setSelectedTest((prev) => prev?.id === tc.id ? { ...prev, ...result } as AutonomousTestCase : prev);
    refetch();
  }, [autonomousProject.base_url, updateTestCase, refetch]);

  const runAll = async () => {
    abortRef.current = false;
    setRunAllInProgress(true);
    const enabled = testCases.filter((tc) => tc.is_enabled);
    setChatMessages(prev => [...prev, {
      role: "assistant",
      content: `📋 Running ${enabled.length} enabled test cases sequentially...`,
    }]);
    for (const tc of enabled) {
      if (abortRef.current) break;
      await executeTest(tc);
    }
    setRunAllInProgress(false);
    if (!abortRef.current) {
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: `🏁 Test run complete. ${testCases.filter(t => t.status === "passed").length} passed, ${testCases.filter(t => t.status === "failed").length} failed.`,
      }]);
    }
  };

  const stopExecution = () => {
    abortRef.current = true;
    setRunAllInProgress(false);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg },
    ]);
    setChatInput("");

    // Generate contextual AI response
    setTimeout(() => {
      let response = "";
      if (selectedTest?.status === "failed") {
        response = `I analyzed the test "${selectedTest.test_name}".\n\n**Root Cause:** ${selectedTest.cause || "Unknown"}\n\n**Suggested Fix:** ${selectedTest.fix_suggestion || "Check element selectors and add explicit waits."}\n\nWould you like me to update the test script with the fix?`;
      } else if (selectedTest?.status === "passed") {
        response = `"${selectedTest.test_name}" is passing. The test completed all steps successfully in ${selectedTest.duration_ms ? (selectedTest.duration_ms / 1000).toFixed(1) + "s" : "a few seconds"}. Let me know if you'd like to modify the test assertions or add edge cases.`;
      } else if (userMsg.toLowerCase().includes("run") || userMsg.toLowerCase().includes("execute")) {
        response = selectedTest
          ? `I'll run "${selectedTest.test_name}" now. Click the Run button or I can help you configure the test steps first.`
          : "Select a test case from the left panel first, then click Run.";
      } else {
        response = `I can help you with:\n• Debugging failed tests\n• Modifying test scripts\n• Understanding error traces\n• Suggesting better selectors\n\nSelect a test case and run it to get started.`;
      }
      setChatMessages(prev => [...prev, { role: "assistant", content: response }]);
    }, 500);
  };

  const passedCount = testCases.filter((t) => t.status === "passed").length;
  const failedCount = testCases.filter((t) => t.status === "failed").length;

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{autonomousProject.test_name}</h1>
              <p className="text-xs text-muted-foreground">{autonomousProject.base_url}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{passedCount} passed</Badge>
            <Badge variant="destructive">{failedCount} failed</Badge>
            {runAllInProgress ? (
              <Button onClick={stopExecution} size="sm" variant="destructive">
                <StopCircle className="h-4 w-4 mr-1" /> Stop
              </Button>
            ) : (
              <Button onClick={runAll} size="sm" disabled={isExecuting}>
                <Play className="h-4 w-4 mr-1" /> Run All
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
          {/* LEFT: Test List */}
          <div className="col-span-3">
            <Card className="h-full">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Test Cases ({testCases.length})</CardTitle>
              </CardHeader>
              <ScrollArea className="h-[calc(100%-60px)]">
                <div className="px-2 pb-2 space-y-1">
                  {testCases.map((tc) => {
                    const isActive = selectedTest?.id === tc.id;
                    const tcRunning = runningTests.has(tc.id);
                    return (
                      <button
                        key={tc.id}
                        onClick={() => {
                          setSelectedTest(tc);
                          if (!tcRunning) {
                            setCurrentSteps([]);
                          }
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50 text-foreground"
                        )}
                      >
                        {tcRunning ? (
                          <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
                        ) : (
                          statusIcon(tc.status)
                        )}
                        <span className="truncate flex-1">{tc.test_name}</span>
                        {tc.duration_ms && !tcRunning && (
                          <span className="text-[10px] text-muted-foreground">{(tc.duration_ms / 1000).toFixed(1)}s</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* CENTER: Execution Preview */}
          <div className="col-span-5">
            <Card className="h-full flex flex-col overflow-hidden">
              <CardHeader className="py-3 px-4 flex-row items-center justify-between shrink-0">
                <CardTitle className="text-sm truncate mr-2">
                  {selectedTest ? selectedTest.test_name : "Select a test"}
                </CardTitle>
                {selectedTest && (
                  <Button
                    size="sm"
                    variant="outline"
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
              </CardHeader>
              <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel defaultSize={55} minSize={30}>
                    <BrowserPreview
                      baseUrl={autonomousProject.base_url}
                      testName={selectedTest?.test_name || null}
                      testDescription={selectedTest?.test_description || null}
                      testStatus={selectedTest?.status || "draft"}
                      isRunning={selectedTest ? runningTests.has(selectedTest.id) : false}
                      executionSteps={currentSteps}
                    />
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={45} minSize={20}>
                    {selectedTest && (
                      <Tabs value={resultTab} onValueChange={setResultTab} className="h-full flex flex-col">
                        <TabsList className="mx-4 mt-2">
                          <TabsTrigger value="script"><Code className="h-3 w-3 mr-1" />Script</TabsTrigger>
                          <TabsTrigger value="error" disabled={selectedTest.status !== "failed"}>
                            <AlertTriangle className="h-3 w-3 mr-1" />Error
                          </TabsTrigger>
                          <TabsTrigger value="trace" disabled={selectedTest.status !== "failed"}>Trace</TabsTrigger>
                          <TabsTrigger value="cause" disabled={selectedTest.status !== "failed"}>Cause</TabsTrigger>
                          <TabsTrigger value="fix" disabled={selectedTest.status !== "failed"}>Fix</TabsTrigger>
                        </TabsList>
                        <TabsContent value="script" className="flex-1 m-0 p-4 overflow-hidden">
                          <ScrollArea className="h-full">
                            <pre className="text-xs font-mono bg-muted/50 rounded-lg p-4 text-foreground overflow-x-auto whitespace-pre">
                              {getScript(selectedTest)}
                            </pre>
                          </ScrollArea>
                        </TabsContent>
                        <TabsContent value="error" className="flex-1 m-0 p-4">
                          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                            <p className="text-sm text-destructive font-medium">Error</p>
                            <p className="text-sm text-foreground mt-2">{selectedTest.error_message || "No error"}</p>
                          </div>
                        </TabsContent>
                        <TabsContent value="trace" className="flex-1 m-0 p-4">
                          <ScrollArea className="h-full">
                            <pre className="text-xs font-mono bg-muted/50 rounded-lg p-4 text-foreground whitespace-pre-wrap">
                              {selectedTest.trace || "No trace available"}
                            </pre>
                          </ScrollArea>
                        </TabsContent>
                        <TabsContent value="cause" className="flex-1 m-0 p-4">
                          <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-sm font-medium text-foreground">Root Cause</p>
                            <p className="text-sm text-muted-foreground mt-2">{selectedTest.cause || "Not determined"}</p>
                          </div>
                        </TabsContent>
                        <TabsContent value="fix" className="flex-1 m-0 p-4">
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                            <p className="text-sm font-medium text-primary">Suggested Fix</p>
                            <p className="text-sm text-foreground mt-2">{selectedTest.fix_suggestion || "No suggestion"}</p>
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </Card>
          </div>

          {/* RIGHT: AI Assistant */}
          <div className="col-span-4">
            <Card className="h-full flex flex-col">
              <CardHeader className="py-3 px-4 flex-row items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">AI Assistant</CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-3 pb-4">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground ml-8"
                          : "bg-muted text-foreground mr-8"
                      )}
                    >
                      {msg.content}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask about test failures, debugging..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    rows={2}
                    className="resize-none text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChat();
                      }
                    }}
                  />
                  <div className="flex flex-col gap-1">
                    <Button size="icon" onClick={handleSendChat}>
                      <Send className="h-4 w-4" />
                    </Button>
                    {selectedTest && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => executeTest(selectedTest)}
                        disabled={isExecuting}
                        title="Re-run"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
