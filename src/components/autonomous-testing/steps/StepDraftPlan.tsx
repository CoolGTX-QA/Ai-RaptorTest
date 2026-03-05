import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AutonomousTestCase } from "@/hooks/useAutonomousTesting";

interface Props {
  testCases: AutonomousTestCase[];
  onBack: () => void;
  onFinish: () => void;
}

const priorityColor = (p: string) => {
  switch (p) {
    case "critical": return "destructive";
    case "high": return "default";
    case "medium": return "secondary";
    case "low": return "outline";
    default: return "secondary";
  }
};

export function StepDraftPlan({ testCases, onBack, onFinish }: Props) {
  const [cases, setCases] = useState(testCases);
  const [editingId, setEditingId] = useState<string | null>(null);

  const toggleEnabled = (id: string) => {
    setCases((prev) => prev.map((c) => c.id === id ? { ...c, is_enabled: !c.is_enabled } : c));
  };

  const updateCase = (id: string, field: string, value: string) => {
    setCases((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Draft Test Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="w-[60px]">#</TableHead>
                <TableHead className="w-[100px]">Priority</TableHead>
                <TableHead>Test Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((tc) => (
                <TableRow key={tc.id} className={!tc.is_enabled ? "opacity-50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={tc.is_enabled}
                      onCheckedChange={() => toggleEnabled(tc.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{tc.test_number}</TableCell>
                  <TableCell>
                    <Select value={tc.priority} onValueChange={(v) => updateCase(tc.id, "priority", v)}>
                      <SelectTrigger className="h-7 text-xs">
                        <Badge variant={priorityColor(tc.priority)} className="text-[10px]">
                          {tc.priority}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {editingId === tc.id ? (
                      <Input
                        value={tc.test_name}
                        onChange={(e) => updateCase(tc.id, "test_name", e.target.value)}
                        onBlur={() => setEditingId(null)}
                        className="h-7 text-xs"
                        autoFocus
                      />
                    ) : (
                      <span
                        className="text-sm cursor-pointer hover:text-primary"
                        onClick={() => setEditingId(tc.id)}
                      >
                        {tc.test_name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                    {tc.test_description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={onFinish}>
            Start Execution →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
