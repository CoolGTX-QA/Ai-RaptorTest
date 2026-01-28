import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Check, X } from "lucide-react";
import { CSVColumn, APP_FIELDS, AppFieldKey } from "./types";
import { cn } from "@/lib/utils";

interface MapFieldsStepProps {
  csvColumns: CSVColumn[];
  mapping: Record<AppFieldKey, string>;
  onMappingChange: (mapping: Record<AppFieldKey, string>) => void;
}

export function MapFieldsStep({ csvColumns, mapping, onMappingChange }: MapFieldsStepProps) {
  const [localMapping, setLocalMapping] = useState<Record<AppFieldKey, string>>(mapping);

  useEffect(() => {
    onMappingChange(localMapping);
  }, [localMapping, onMappingChange]);

  const handleMappingChange = (appField: AppFieldKey, csvColumn: string) => {
    setLocalMapping(prev => ({
      ...prev,
      [appField]: csvColumn
    }));
  };

  const mappedFields = Object.entries(localMapping).filter(([_, value]) => value !== "");
  const unmappedFields = APP_FIELDS.filter(field => !localMapping[field.key]);

  return (
    <div className="py-4">
      <p className="text-sm text-muted-foreground mb-4">
        Choose the right mapping for each field in CSV to the ones in the application.
        Most have been automatically done for you.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mapping Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-8 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">App</span>
              </div>
              <span className="text-sm font-medium text-foreground">Application Fields</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-chart-1/10 flex items-center justify-center">
                <span className="text-xs font-medium text-chart-1">CSV</span>
              </div>
              <span className="text-sm font-medium text-foreground">CSV Fields</span>
            </div>
          </div>

          <ScrollArea className="h-[350px] pr-4">
            <div className="space-y-3">
              {APP_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {field.label}
                      {field.required && <span className="text-destructive ml-0.5">*</span>}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Select
                    value={localMapping[field.key] || ""}
                    onValueChange={(value) => handleMappingChange(field.key, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- Not Mapped --</SelectItem>
                      {csvColumns.map((col) => (
                        <SelectItem key={col.name} value={col.name}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Mapping Preview */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Mapping Preview</h4>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">
                Mapped
              </Badge>
              <Badge variant="outline" className="text-xs">
                Non Mapped
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            {/* Unmapped count */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Non Mapped</span>
              <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">{unmappedFields.length}</span>
              </div>
            </div>

            {/* Mapped fields visualization */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-chart-1" />
                <span className="text-muted-foreground">Mapped</span>
              </div>
              
              <div className="space-y-1.5 pl-4">
                {mappedFields.map(([appField, csvColumn]) => {
                  const fieldInfo = APP_FIELDS.find(f => f.key === appField);
                  return (
                    <div
                      key={appField}
                      className={cn(
                        "flex items-center gap-2 text-sm py-1.5 px-2 rounded-md",
                        "bg-chart-1/10 border border-chart-1/20"
                      )}
                    >
                      <Check className="h-3 w-3 text-chart-1" />
                      <span className="text-foreground">{csvColumn}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-chart-1">{fieldInfo?.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unmapped fields */}
            {unmappedFields.length > 0 && (
              <div className="space-y-1.5 pl-4">
                {unmappedFields.map((field) => (
                  <div
                    key={field.key}
                    className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-md bg-muted/50 border border-border"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{field.label}</span>
                    <span className="text-xs text-muted-foreground">(not mapped)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
