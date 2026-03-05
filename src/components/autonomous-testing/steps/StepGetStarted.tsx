import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

interface Props {
  testName: string;
  setTestName: (v: string) => void;
  baseUrl: string;
  setBaseUrl: (v: string) => void;
  onNext: () => void;
  isLoading: boolean;
}

export function StepGetStarted({ testName, setTestName, baseUrl, setBaseUrl, onNext, isLoading }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Create a new AI testing project</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-name">Test Name</Label>
          <Input
            id="test-name"
            placeholder="e.g., E-commerce Smoke Tests"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="base-url">Base URL of the Application</Label>
          <Input
            id="base-url"
            placeholder="https://example.com"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            The main URL of the web application you want to test
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={onNext} disabled={isLoading}>
            {isLoading ? "Creating..." : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
