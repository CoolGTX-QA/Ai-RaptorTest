import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { ParsedTestCase } from "./types";
import { cn } from "@/lib/utils";

interface PreviewStepProps {
  parsedData: ParsedTestCase[];
}

export function PreviewStep({ parsedData }: PreviewStepProps) {
  const validCount = parsedData.filter(tc => tc.isValid).length;
  const invalidCount = parsedData.filter(tc => !tc.isValid).length;

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Review the test cases before importing. Fix any validation errors if needed.
        </p>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {validCount} valid
          </Badge>
          {invalidCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {invalidCount} with errors
            </Badge>
          )}
        </div>
      </div>

      <ScrollArea className="h-[400px] border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-24">Priority</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-32">Validation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parsedData.map((tc, index) => (
              <TableRow 
                key={index} 
                className={cn(
                  tc.isValid ? "" : "bg-destructive/5"
                )}
              >
                <TableCell className="font-mono text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div>
                    <p className={cn(
                      "font-medium",
                      tc.title ? "text-foreground" : "text-muted-foreground italic"
                    )}>
                      {tc.title || "(empty)"}
                    </p>
                    {tc.description && (
                      <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                        {tc.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {tc.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {tc.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  {tc.isValid ? (
                    <Badge variant="default" className="bg-chart-1 hover:bg-chart-1">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Valid
                    </Badge>
                  ) : (
                    <div className="space-y-1">
                      {tc.errors.map((err, i) => (
                        <Badge key={i} variant="destructive" className="text-xs block w-fit">
                          {err}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {invalidCount > 0 && (
        <p className="text-sm text-muted-foreground">
          <AlertCircle className="inline h-4 w-4 mr-1 text-chart-4" />
          Only valid test cases will be imported. Fix the errors or they will be skipped.
        </p>
      )}
    </div>
  );
}
