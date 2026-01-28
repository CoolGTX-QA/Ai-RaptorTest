export interface ParsedTestCase {
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

export interface CSVColumn {
  name: string;
  sampleValue: string;
}

export interface FieldMapping {
  csvColumn: string;
  appField: string;
}

export const APP_FIELDS = [
  { key: "title", label: "Title", required: true },
  { key: "description", label: "Description", required: false },
  { key: "priority", label: "Priority", required: false },
  { key: "status", label: "Status", required: false },
  { key: "preconditions", label: "Preconditions", required: false },
  { key: "expected_result", label: "Expected Result", required: false },
  { key: "tags", label: "Tags", required: false },
] as const;

export type AppFieldKey = typeof APP_FIELDS[number]["key"];

export const VALID_PRIORITIES = ["critical", "high", "medium", "low"];
export const VALID_STATUSES = ["draft", "active", "under_review", "approved", "obsolete"];
