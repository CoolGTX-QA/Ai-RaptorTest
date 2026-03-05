import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Play, CheckCircle, XCircle, Clock, Loader2,
  AlertTriangle, Code, Bot, RotateCcw, Send,
} from "lucide-react";
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
  
  // TODO: AI-generated test steps
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

  const simulateRun = async (tc: AutonomousTestCase) => {
    setRunningTests((prev) => new Set(prev).add(tc.id));
    setSelectedTest({ ...tc, status: "running" });

    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 3000));

    const passed = Math.random() > 0.3;
    const result: Partial<AutonomousTestCase> = passed
      ? { status: "passed", duration_ms: Math.floor(1000 + Math.random() * 4000), executed_at: new Date().toISOString() }
      : {
          status: "failed",
          duration_ms: Math.floor(500 + Math.random() * 2000),
          executed_at: new Date().toISOString(),
          error_message: "Filter controls not found on catalog page. Expected element with selector '.filter-panel' to be visible.",
          trace: `at Object.<anonymous> (test.spec.ts:15:5)\n  at page.waitForSelector('.filter-panel')\n  at TimeoutError: waiting for selector '.filter-panel'\n  Timeout: 30000ms`,
          cause: "DOM selector mismatch. The filter controls use a different CSS class name than expected.",
          fix_suggestion: "Update the selector from '.filter-panel' to '[data-testid=\"filters\"]' or add explicit waits for dynamic content loading.",
        };

    try {
      await updateTestCase.mutateAsync({ id: tc.id, updates: result });
    } catch {}

    setRunningTests((prev) => { const s = new Set(prev); s.delete(tc.id); return s; });
    setSelectedTest((prev) => prev?.id === tc.id ? { ...prev, ...result } as AutonomousTestCase : prev);
    refetch();
  };

  const runAll = async () => {
    const enabled = testCases.filter((tc) => tc.is_enabled);
    for (const tc of enabled) {
      await simulateRun(tc);
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: chatInput },
      { role: "assistant", content: `I analyzed the test "${selectedTest?.test_name || "selected test"}". ${selectedTest?.status === "failed" ? `The failure was caused by: ${selectedTest.cause || "unknown"}. ${selectedTest.fix_suggestion || "Try updating the selector."}` : "The test is currently in good shape. Let me know if you need help with debugging or modifications."}` },
    ]);
    setChatInput("");
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
            <Button onClick={runAll} size="sm">
              <Play className="h-4 w-4 mr-1" /> Run All
            </Button>
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
                  {testCases.map((tc) => (
                    <button
                      key={tc.id}
                      onClick={() => setSelectedTest(tc)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors",
                        selectedTest?.id === tc.id
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50 text-foreground"
                      )}
                    >
                      {runningTests.has(tc.id) ? (
                        <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
                      ) : (
                        statusIcon(tc.status)
                      )}
                      <span className="truncate">{tc.test_name}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* CENTER: Execution Preview */}
          <div className="col-span-5">
            <Card className="h-full flex flex-col">
              <CardHeader className="py-3 px-4 flex-row items-center justify-between">
                <CardTitle className="text-sm">
                  {selectedTest ? selectedTest.test_name : "Select a test"}
                </CardTitle>
                {selectedTest && (
                  <Button size="sm" variant="outline" onClick={() => simulateRun(selectedTest)}>
                    <Play className="h-3 w-3 mr-1" /> Run
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                {selectedTest && (
                  <Tabs value={resultTab} onValueChange={setResultTab} className="h-full flex flex-col">
                    <TabsList className="mx-4 mt-0">
                      <TabsTrigger value="script"><Code className="h-3 w-3 mr-1" />Script</TabsTrigger>
                      <TabsTrigger value="error" disabled={selectedTest.status !== "failed"}>
                        <AlertTriangle className="h-3 w-3 mr-1" />Error
                      </TabsTrigger>
                      <TabsTrigger value="trace" disabled={selectedTest.status !== "failed"}>Trace</TabsTrigger>
                      <TabsTrigger value="cause" disabled={selectedTest.status !== "failed"}>Cause</TabsTrigger>
                      <TabsTrigger value="fix" disabled={selectedTest.status !== "failed"}>Fix</TabsTrigger>
                    </TabsList>
                    <TabsContent value="script" className="flex-1 m-0 p-4">
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
                      <pre className="text-xs font-mono bg-muted/50 rounded-lg p-4 text-foreground whitespace-pre-wrap">
                        {selectedTest.trace || "No trace available"}
                      </pre>
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
              </CardContent>
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
                        "rounded-lg px-3 py-2 text-sm",
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
                      <Button size="icon" variant="outline" onClick={() => simulateRun(selectedTest)} title="Re-run">
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
