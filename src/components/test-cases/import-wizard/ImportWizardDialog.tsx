import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Upload, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { StepIndicator } from "./StepIndicator";
import { UploadStep } from "./UploadStep";
import { MapFieldsStep } from "./MapFieldsStep";
import { PreviewStep } from "./PreviewStep";
import {
  ParsedTestCase,
  CSVColumn,
  APP_FIELDS,
  AppFieldKey,
  VALID_PRIORITIES,
  VALID_STATUSES,
} from "./types";

interface ImportWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (testCases: ParsedTestCase[]) => Promise<void>;
}

export function ImportWizardDialog({ open, onOpenChange, onImport }: ImportWizardDialogProps) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [csvColumns, setCsvColumns] = useState<CSVColumn[]>([]);
  const [rawData, setRawData] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<AppFieldKey, string>>({
    title: "",
    description: "",
    priority: "",
    status: "",
    preconditions: "",
    expected_result: "",
    tags: "",
  });
  const [parsedData, setParsedData] = useState<ParsedTestCase[]>([]);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const resetWizard = () => {
    setStep(1);
    setFile(null);
    setCsvColumns([]);
    setRawData([]);
    setMapping({
      title: "",
      description: "",
      priority: "",
      status: "",
      preconditions: "",
      expected_result: "",
      tags: "",
    });
    setParsedData([]);
  };

  const autoMapColumns = (columns: CSVColumn[]): Record<AppFieldKey, string> => {
    const newMapping: Record<AppFieldKey, string> = {
      title: "",
      description: "",
      priority: "",
      status: "",
      preconditions: "",
      expected_result: "",
      tags: "",
    };

    // Common mappings (case-insensitive)
    const mappingRules: Record<AppFieldKey, string[]> = {
      title: ["title", "name", "test name", "test case", "scenario", "test_name"],
      description: ["description", "desc", "details", "test idea", "test_idea"],
      priority: ["priority", "severity", "importance"],
      status: ["status", "state"],
      preconditions: ["preconditions", "precondition", "prerequisites", "test conditions", "test_conditions"],
      expected_result: ["expected result", "expected_result", "expected", "acceptance criteria", "acceptance_criteria"],
      tags: ["tags", "labels", "categories", "tag"],
    };

    columns.forEach(col => {
      const colNameLower = col.name.toLowerCase().trim();
      for (const [field, patterns] of Object.entries(mappingRules)) {
        if (patterns.some(p => colNameLower.includes(p) || p.includes(colNameLower))) {
          if (!newMapping[field as AppFieldKey]) {
            newMapping[field as AppFieldKey] = col.name;
          }
        }
      }
    });

    return newMapping;
  };

  const handleFileUploaded = (uploadedFile: File, headers: CSVColumn[], data: string[][]) => {
    setFile(uploadedFile);
    setCsvColumns(headers);
    setRawData(data);
    
    // Auto-map columns
    const autoMapping = autoMapColumns(headers);
    setMapping(autoMapping);
    
    setStep(2);
  };

  const handleMappingChange = useCallback((newMapping: Record<AppFieldKey, string>) => {
    setMapping(newMapping);
  }, []);

  const parseDataWithMapping = (): ParsedTestCase[] => {
    const columnIndexMap: Record<string, number> = {};
    csvColumns.forEach((col, index) => {
      columnIndexMap[col.name] = index;
    });

    return rawData.map(row => {
      const getValue = (field: AppFieldKey): string => {
        const csvCol = mapping[field];
        if (!csvCol) return "";
        const index = columnIndexMap[csvCol];
        return index !== undefined ? (row[index] || "").trim() : "";
      };

      const title = getValue("title");
      const description = getValue("description");
      const priorityRaw = getValue("priority").toLowerCase();
      const statusRaw = getValue("status").toLowerCase();
      const preconditions = getValue("preconditions");
      const expected_result = getValue("expected_result");
      const tagsRaw = getValue("tags");

      const errors: string[] = [];

      if (!title || title.length < 3) {
        errors.push("Title is required (min 3 characters)");
      }

      const priority = VALID_PRIORITIES.includes(priorityRaw) ? priorityRaw : "medium";
      const status = VALID_STATUSES.includes(statusRaw) ? statusRaw : "draft";

      if (priorityRaw && !VALID_PRIORITIES.includes(priorityRaw)) {
        errors.push(`Invalid priority: "${priorityRaw}"`);
      }

      if (statusRaw && !VALID_STATUSES.includes(statusRaw)) {
        errors.push(`Invalid status: "${statusRaw}"`);
      }

      const tags = tagsRaw
        ? tagsRaw.split(/[;,]/).map(t => t.trim()).filter(Boolean)
        : [];

      return {
        title,
        description,
        priority,
        status,
        preconditions,
        expected_result,
        tags,
        isValid: errors.length === 0,
        errors,
      };
    });
  };

  const handleNext = () => {
    if (step === 2) {
      // Validate that title is mapped
      if (!mapping.title) {
        toast({
          title: "Title mapping required",
          description: "Please map the Title field to a CSV column",
          variant: "destructive",
        });
        return;
      }
      // Parse data and move to preview
      const parsed = parseDataWithMapping();
      setParsedData(parsed);
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
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
      resetWizard();
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

  const validCount = parsedData.filter(tc => tc.isValid).length;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetWizard();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="sr-only">Import Test Cases</DialogTitle>
          <StepIndicator currentStep={step} totalSteps={3} />
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {step === 1 && (
            <UploadStep onFileUploaded={handleFileUploaded} />
          )}
          {step === 2 && (
            <MapFieldsStep
              csvColumns={csvColumns}
              mapping={mapping}
              onMappingChange={handleMappingChange}
            />
          )}
          {step === 3 && (
            <PreviewStep parsedData={parsedData} />
          )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => {
            resetWizard();
            onOpenChange(false);
          }}>
            Cancel
          </Button>
          
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            
            {step === 1 && (
              <Button disabled>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            )}
            
            {step === 2 && (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            
            {step === 3 && (
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
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
