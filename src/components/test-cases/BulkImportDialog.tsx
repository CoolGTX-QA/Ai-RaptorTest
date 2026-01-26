import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParsedTestCase {
  title: string;
  description: string;
  priority: string;
  status: string;
  preconditions: string;
  expected_result: string;
  tags: string[];
  isValid: boolean;
  errors: string[];
}

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (testCases: ParsedTestCase[]) => Promise<void>;
}

const VALID_PRIORITIES = ["critical", "high", "medium", "low"];
const VALID_STATUSES = ["draft", "active", "under_review", "approved", "obsolete"];

export function BulkImportDialog({ open, onOpenChange, onImport }: BulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedTestCase[]>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const headers = ["Title", "Description", "Priority", "Status", "Preconditions", "Expected Result", "Tags"];
    const sampleRow = [
      "Login with valid credentials",
      "Verify user can login with correct username and password",
      "high",
      "draft",
      "User account exists in the system",
      "User should be redirected to dashboard",
      "authentication,smoke"
    ];
    
    const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "test_cases_template.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const parseCSV = (content: string): ParsedTestCase[] => {
    const lines = content.split("\n").filter(line => line.trim());
    if (lines.length < 2) return [];

    // Skip header row
    const dataRows = lines.slice(1);
    
    return dataRows.map((line) => {
      // Handle CSV with quoted fields
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const [title, description, priority, status, preconditions, expected_result, tags] = values;
      
      const errors: string[] = [];
      
      if (!title || title.length < 3) {
        errors.push("Title is required (min 3 characters)");
      }
      
      const normalizedPriority = (priority || "medium").toLowerCase();
      if (!VALID_PRIORITIES.includes(normalizedPriority)) {
        errors.push(`Invalid priority: ${priority}. Must be one of: ${VALID_PRIORITIES.join(", ")}`);
      }
      
      const normalizedStatus = (status || "draft").toLowerCase();
      if (!VALID_STATUSES.includes(normalizedStatus)) {
        errors.push(`Invalid status: ${status}. Must be one of: ${VALID_STATUSES.join(", ")}`);
      }

      return {
        title: title || "",
        description: description || "",
        priority: VALID_PRIORITIES.includes(normalizedPriority) ? normalizedPriority : "medium",
        status: VALID_STATUSES.includes(normalizedStatus) ? normalizedStatus : "draft",
        preconditions: preconditions || "",
        expected_result: expected_result || "",
        tags: tags ? tags.split(";").map(t => t.trim()).filter(Boolean) : [],
        isValid: errors.length === 0,
        errors,
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [".csv", ".txt"];
    const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
    
    if (!validTypes.includes(fileExt)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setParsing(true);

    try {
      const content = await selectedFile.text();
      const parsed = parseCSV(content);
      
      if (parsed.length === 0) {
        toast({
          title: "No data found",
          description: "The file appears to be empty or incorrectly formatted",
          variant: "destructive",
        });
        setFile(null);
      } else {
        setParsedData(parsed);
        setStep("preview");
      }
    } catch (error) {
      toast({
        title: "Error parsing file",
        description: "Could not read the file. Please check the format.",
        variant: "destructive",
      });
      setFile(null);
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    const validCases = parsedData.filter(tc => tc.isValid);
    
    if (validCases.length === 0) {
      toast({
        title: "No valid test cases",
        description: "Please fix the errors before importing",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    try {
      await onImport(validCases);
      toast({
        title: "Import successful",
        description: `${validCases.length} test case(s) imported successfully`,
      });
      handleReset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import test cases",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setStep("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validCount = parsedData.filter(tc => tc.isValid).length;
  const invalidCount = parsedData.filter(tc => !tc.isValid).length;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleReset();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Import Test Cases</DialogTitle>
          <DialogDescription>
            {step === "upload" 
              ? "Upload a CSV file to import multiple test cases at once" 
              : "Review the parsed test cases before importing"}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" ? (
          <div className="space-y-6 py-4">
            {/* Template Download */}
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Download the CSV template to ensure correct formatting</span>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </AlertDescription>
            </Alert>

            {/* File Upload Area */}
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              {parsing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-muted-foreground">Parsing file...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">CSV file (max 5MB)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Format Instructions */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-foreground">CSV Format Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li><strong>Title</strong> (required): Test case name (min 3 characters)</li>
                <li><strong>Description</strong>: Detailed description</li>
                <li><strong>Priority</strong>: critical, high, medium, or low</li>
                <li><strong>Status</strong>: draft, active, under_review, approved, or obsolete</li>
                <li><strong>Preconditions</strong>: Prerequisites for the test</li>
                <li><strong>Expected Result</strong>: Expected outcome</li>
                <li><strong>Tags</strong>: Semicolon-separated tags (e.g., smoke;regression)</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col space-y-4 py-4">
            {/* Summary */}
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <FileSpreadsheet className="h-3 w-3" />
                {file?.name}
              </Badge>
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
              <Button variant="ghost" size="sm" onClick={handleReset} className="ml-auto">
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>

            {/* Preview Table */}
            <ScrollArea className="flex-1 border rounded-lg">
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
                    <TableRow key={index} className={tc.isValid ? "" : "bg-destructive/5"}>
                      <TableCell className="font-mono text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{tc.title || "(empty)"}</p>
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
                          <Badge variant="default" className="bg-chart-1">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Valid
                          </Badge>
                        ) : (
                          <div className="space-y-1">
                            {tc.errors.map((err, i) => (
                              <Badge key={i} variant="destructive" className="text-xs block">
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
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => {
            handleReset();
            onOpenChange(false);
          }}>
            Cancel
          </Button>
          {step === "preview" && (
            <Button onClick={handleImport} disabled={importing || validCount === 0}>
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import {validCount} Test Case{validCount !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}