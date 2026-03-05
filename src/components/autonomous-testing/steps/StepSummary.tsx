import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Globe, Server, TestTube2 } from "lucide-react";

interface Props {
  urlCount: number;
  apiCount: number;
  testCaseCount: number;
  onNext: () => void;
}

export function StepSummary({ urlCount, apiCount, testCaseCount, onNext }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <CheckCircle className="h-6 w-6 text-primary" />
          Your Draft Test Plan is Ready
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{urlCount}</div>
              <div className="text-sm text-muted-foreground">URLs uploaded</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Server className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{apiCount}</div>
              <div className="text-sm text-muted-foreground">APIs uploaded</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <TestTube2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{testCaseCount}</div>
              <div className="text-sm text-muted-foreground">Test cases generated</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center pt-4">
          <Button onClick={onNext} size="lg">
            Next → Review Test Cases
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
