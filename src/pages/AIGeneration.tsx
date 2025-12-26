import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Wand2,
  FileText,
  Save,
  RefreshCw,
  ChevronRight,
  Check,
  Edit2,
  Trash2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface GeneratedTestCase {
  id: string;
  name: string;
  description: string;
  priority: string;
  type: string;
  steps: { action: string; expected: string }[];
  selected: boolean;
}

const sampleGeneratedTests: GeneratedTestCase[] = [
  {
    id: "gen-1",
    name: "Verify user can successfully log in with valid credentials",
    description: "Test the login functionality with correct username and password",
    priority: "high",
    type: "functional",
    steps: [
      { action: "Navigate to the login page", expected: "Login page is displayed with username and password fields" },
      { action: "Enter valid username", expected: "Username is accepted" },
      { action: "Enter valid password", expected: "Password is masked and accepted" },
      { action: "Click the Login button", expected: "User is redirected to dashboard with success message" },
    ],
    selected: true,
  },
  {
    id: "gen-2",
    name: "Verify error message for invalid credentials",
    description: "Test login validation with incorrect credentials",
    priority: "high",
    type: "functional",
    steps: [
      { action: "Navigate to the login page", expected: "Login page is displayed" },
      { action: "Enter invalid username", expected: "Username field accepts input" },
      { action: "Enter invalid password", expected: "Password field accepts input" },
      { action: "Click the Login button", expected: "Error message 'Invalid credentials' is displayed" },
    ],
    selected: true,
  },
  {
    id: "gen-3",
    name: "Verify password field masking",
    description: "Ensure password characters are hidden when typing",
    priority: "medium",
    type: "security",
    steps: [
      { action: "Navigate to the login page", expected: "Login page is displayed" },
      { action: "Click on password field", expected: "Password field is focused" },
      { action: "Type password characters", expected: "Characters are masked with dots or asterisks" },
    ],
    selected: false,
  },
  {
    id: "gen-4",
    name: "Verify session timeout after inactivity",
    description: "Test that user session expires after configured inactivity period",
    priority: "medium",
    type: "security",
    steps: [
      { action: "Log in with valid credentials", expected: "User is logged in successfully" },
      { action: "Wait for session timeout period (e.g., 30 minutes)", expected: "No activity during this period" },
      { action: "Attempt to perform any action", expected: "User is redirected to login page with session expired message" },
    ],
    selected: false,
  },
];

export default function AIGeneration() {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTests, setGeneratedTests] = useState<GeneratedTestCase[]>([]);
  const [inputType, setInputType] = useState("description");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a feature description or user story.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedTests(sampleGeneratedTests);
      setIsGenerating(false);
      toast({
        title: "Test cases generated",
        description: `${sampleGeneratedTests.length} test cases have been generated.`,
      });
    }, 2000);
  };

  const toggleTestSelection = (id: string) => {
    setGeneratedTests((prev) =>
      prev.map((test) =>
        test.id === id ? { ...test, selected: !test.selected } : test
      )
    );
  };

  const handleSaveSelected = () => {
    const selected = generatedTests.filter((t) => t.selected);
    if (selected.length === 0) {
      toast({
        title: "No tests selected",
        description: "Please select at least one test case to save.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Test cases saved",
      description: `${selected.length} test cases have been saved to the repository.`,
    });
  };

  const priorityColors: Record<string, string> = {
    high: "bg-chart-4 text-foreground",
    medium: "bg-chart-1 text-foreground",
    low: "bg-muted text-muted-foreground",
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>AI Tools</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">AI Test Generation</span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            AI Test Generation
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate comprehensive test cases from feature descriptions, user stories, or requirements
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Input</CardTitle>
              <CardDescription>
                Provide a feature description or user story to generate test cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Input Type</Label>
                <Select value={inputType} onValueChange={setInputType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="description">Feature Description</SelectItem>
                    <SelectItem value="user_story">User Story</SelectItem>
                    <SelectItem value="requirements">Requirements Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>
                  {inputType === "description"
                    ? "Feature Description"
                    : inputType === "user_story"
                    ? "User Story"
                    : "Requirements"}
                </Label>
                <Textarea
                  placeholder={
                    inputType === "description"
                      ? "Describe the feature you want to test...\n\nExample: User authentication with login, logout, and password reset functionality"
                      : inputType === "user_story"
                      ? "Enter your user story...\n\nExample: As a user, I want to log in with my credentials so that I can access my account securely"
                      : "Paste or describe the requirements..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
                <span className="text-xs text-muted-foreground">
                  Supports .txt, .docx, .pdf
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Default Priority</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Test Type</Label>
                  <Select defaultValue="functional">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="functional">Functional</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Test Cases
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Tests Section */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Generated Test Cases</CardTitle>
                  <CardDescription>
                    Review and save AI-generated test cases
                  </CardDescription>
                </div>
                {generatedTests.length > 0 && (
                  <Button onClick={handleSaveSelected}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Selected
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedTests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent mb-4">
                    <FileText className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No test cases yet
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Enter a feature description and click "Generate Test Cases" to
                    see AI-generated test cases here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {generatedTests.map((test) => (
                    <div
                      key={test.id}
                      className={cn(
                        "rounded-lg border border-border p-4 transition-all",
                        test.selected && "border-primary bg-accent/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={test.selected}
                          onCheckedChange={() => toggleTestSelection(test.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-foreground">{test.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={cn(
                                  "capitalize text-xs",
                                  priorityColors[test.priority]
                                )}
                              >
                                {test.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {test.type}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {test.description}
                          </p>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                              Steps ({test.steps.length}):
                            </p>
                            <div className="space-y-1 pl-2 border-l-2 border-border">
                              {test.steps.slice(0, 2).map((step, idx) => (
                                <p key={idx} className="text-xs text-muted-foreground">
                                  {idx + 1}. {step.action}
                                </p>
                              ))}
                              {test.steps.length > 2 && (
                                <p className="text-xs text-primary">
                                  +{test.steps.length - 2} more steps
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <Button variant="ghost" size="sm">
                              <Edit2 className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
