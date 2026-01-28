import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, Download, Loader2, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CSVColumn } from "./types";

interface UploadStepProps {
  onFileUploaded: (file: File, headers: CSVColumn[], rawData: string[][]) => void;
}

export function UploadStep({ onFileUploaded }: UploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const headers = ["Title", "Description", "Priority", "Status", "Preconditions", "Expected Result", "Tags"];
    const sampleRows = [
      [
        "Login with valid credentials",
        "Verify user can login with correct username and password",
        "high",
        "draft",
        "User account exists in the system",
        "User should be redirected to dashboard",
        "authentication;smoke"
      ],
      [
        "Password reset functionality",
        "Test the password reset flow via email",
        "medium",
        "draft",
        "User has a registered email",
        "User receives reset email and can set new password",
        "authentication;regression"
      ]
    ];
    
    const csvContent = [headers.join(","), ...sampleRows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "test_cases_template.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const parseCSVHeaders = (content: string): { headers: CSVColumn[]; data: string[][] } => {
    const lines = content.split("\n").filter(line => line.trim());
    if (lines.length < 1) return { headers: [], data: [] };

    const parseLine = (line: string): string[] => {
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
      return values;
    };

    const headerRow = parseLine(lines[0]);
    const dataRows = lines.slice(1).map(parseLine);
    
    const headers: CSVColumn[] = headerRow.map((name, index) => ({
      name,
      sampleValue: dataRows[0]?.[index] || ""
    }));

    return { headers, data: dataRows };
  };

  const handleFile = async (selectedFile: File) => {
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
      const { headers, data } = parseCSVHeaders(content);
      
      if (headers.length === 0 || data.length === 0) {
        toast({
          title: "No data found",
          description: "The file appears to be empty or incorrectly formatted",
          variant: "destructive",
        });
        setFile(null);
      } else {
        onFileUploaded(selectedFile, headers, data);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  return (
    <div className="space-y-6 py-4">
      {/* Template Download */}
      <Alert>
        <FileSpreadsheet className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Download the CSV template to ensure correct formatting</span>
          <Button variant="link" size="sm" onClick={downloadTemplate} className="text-primary">
            <Download className="mr-2 h-4 w-4" />
            Download sample CSV
          </Button>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload Area */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Select Your CSV File <span className="text-destructive">*</span>
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
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
            ) : file ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-md">
                  <Paperclip className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{file.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">Click to change file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">
                    Drag & Drop CSV file or{" "}
                    <span className="text-primary underline">Browse</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">CSV file (max 5MB)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visual Guide */}
        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span>Download sample CSV</span>
          </div>
          <div className="border-2 border-dashed border-border rounded-lg p-4 bg-background/50">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Paperclip className="h-4 w-4" />
              <span>Drag & Drop files to attach or</span>
              <span className="text-primary underline">Browse</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-chart-1/20 flex items-center justify-center">
              <FileSpreadsheet className="h-4 w-4 text-chart-1" />
            </div>
            <span className="text-sm text-foreground">Sample.csv</span>
          </div>
        </div>
      </div>
    </div>
  );
}
