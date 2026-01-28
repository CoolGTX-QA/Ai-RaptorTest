import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRBAC } from "@/hooks/useRBAC";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Settings,
  ListChecks,
  Flag,
  Layers,
  GripVertical,
  Save,
  Bug,
  CheckCircle2,
  Globe,
  Bell,
  Zap,
  Users,
  Clock,
  TestTube,
  PlayCircle,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  workspace_id: string;
}

interface ProjectSettings {
  id: string;
  project_id: string;
  custom_statuses: CustomStatus[] | null;
  custom_priorities: CustomPriority[] | null;
  custom_fields: CustomField[] | null;
  defect_severities: DefectSeverity[] | null;
  defect_resolutions: DefectResolution[] | null;
  test_environments: TestEnvironment[] | null;
  notification_settings: NotificationSettings | null;
  automation_settings: AutomationSettings | null;
  default_assignees: DefaultAssignees | null;
  sla_settings: SLASettings | null;
  test_types: TestType[] | null;
  execution_statuses: ExecutionStatus[] | null;
}

interface CustomStatus {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface CustomPriority {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "select" | "date" | "checkbox";
  options?: string[];
  required: boolean;
}

interface DefectSeverity {
  id: string;
  name: string;
  color: string;
  description: string;
  order: number;
}

interface DefectResolution {
  id: string;
  name: string;
  description: string;
}

interface TestEnvironment {
  id: string;
  name: string;
  url?: string;
  description?: string;
  isDefault: boolean;
}

interface NotificationSettings {
  emailOnTestRunComplete: boolean;
  emailOnDefectAssigned: boolean;
  emailOnStatusChange: boolean;
  emailOnMentions: boolean;
  slackWebhookUrl?: string;
  slackEnabled: boolean;
}

interface AutomationSettings {
  autoClosePassedRuns: boolean;
  autoAssignDefects: boolean;
  cicdWebhookUrl?: string;
  cicdEnabled: boolean;
  autoRetestOnCodeChange: boolean;
}

interface DefaultAssignees {
  defaultTestCaseReviewer?: string;
  defaultDefectAssignee?: string;
  autoAssignByComponent: boolean;
}

interface SLASettings {
  criticalDefectSLA: number; // hours
  majorDefectSLA: number;
  minorDefectSLA: number;
  trivialDefectSLA: number;
  enableSLAAlerts: boolean;
}

interface TestType {
  id: string;
  name: string;
  color: string;
  description: string;
}

interface ExecutionStatus {
  id: string;
  name: string;
  color: string;
  isFinal: boolean;
}

const DEFAULT_STATUSES: CustomStatus[] = [
  { id: "draft", name: "Draft", color: "gray", order: 0 },
  { id: "in_review", name: "In Review", color: "yellow", order: 1 },
  { id: "approved", name: "Approved", color: "green", order: 2 },
  { id: "needs_update", name: "Needs Update", color: "orange", order: 3 },
  { id: "rejected", name: "Rejected", color: "red", order: 4 },
  { id: "obsolete", name: "Obsolete", color: "gray", order: 5 },
];

const DEFAULT_PRIORITIES: CustomPriority[] = [
  { id: "critical", name: "Critical", color: "red", order: 0 },
  { id: "high", name: "High", color: "orange", order: 1 },
  { id: "medium", name: "Medium", color: "yellow", order: 2 },
  { id: "low", name: "Low", color: "green", order: 3 },
];

const DEFAULT_SEVERITIES: DefectSeverity[] = [
  { id: "blocker", name: "Blocker", color: "red", description: "System is unusable, no workaround", order: 0 },
  { id: "critical", name: "Critical", color: "red", description: "Major functionality broken, limited workaround", order: 1 },
  { id: "major", name: "Major", color: "orange", description: "Significant impact with workaround available", order: 2 },
  { id: "minor", name: "Minor", color: "yellow", description: "Minor impact, low priority", order: 3 },
  { id: "trivial", name: "Trivial", color: "gray", description: "Cosmetic issues, no functional impact", order: 4 },
];

const DEFAULT_RESOLUTIONS: DefectResolution[] = [
  { id: "fixed", name: "Fixed", description: "Issue has been resolved" },
  { id: "wont_fix", name: "Won't Fix", description: "Issue will not be addressed" },
  { id: "duplicate", name: "Duplicate", description: "Issue is a duplicate of another" },
  { id: "cannot_reproduce", name: "Cannot Reproduce", description: "Unable to replicate the issue" },
  { id: "by_design", name: "By Design", description: "Behavior is as intended" },
  { id: "obsolete", name: "Obsolete", description: "Issue is no longer relevant" },
];

const DEFAULT_ENVIRONMENTS: TestEnvironment[] = [
  { id: "dev", name: "Development", description: "Local development environment", isDefault: false },
  { id: "qa", name: "QA", description: "QA testing environment", isDefault: true },
  { id: "staging", name: "Staging", description: "Pre-production staging environment", isDefault: false },
  { id: "prod", name: "Production", description: "Live production environment", isDefault: false },
];

const DEFAULT_TEST_TYPES: TestType[] = [
  { id: "functional", name: "Functional", color: "blue", description: "Verify features work correctly" },
  { id: "regression", name: "Regression", color: "purple", description: "Ensure existing functionality is not broken" },
  { id: "smoke", name: "Smoke", color: "green", description: "Quick validation of critical paths" },
  { id: "integration", name: "Integration", color: "orange", description: "Test component interactions" },
  { id: "performance", name: "Performance", color: "yellow", description: "Load and speed testing" },
  { id: "security", name: "Security", color: "red", description: "Security vulnerability testing" },
  { id: "usability", name: "Usability", color: "gray", description: "User experience testing" },
];

const DEFAULT_EXECUTION_STATUSES: ExecutionStatus[] = [
  { id: "not_run", name: "Not Run", color: "gray", isFinal: false },
  { id: "in_progress", name: "In Progress", color: "blue", isFinal: false },
  { id: "passed", name: "Passed", color: "green", isFinal: true },
  { id: "failed", name: "Failed", color: "red", isFinal: true },
  { id: "blocked", name: "Blocked", color: "orange", isFinal: false },
  { id: "skipped", name: "Skipped", color: "yellow", isFinal: true },
  { id: "retest", name: "Retest", color: "purple", isFinal: false },
];

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailOnTestRunComplete: true,
  emailOnDefectAssigned: true,
  emailOnStatusChange: false,
  emailOnMentions: true,
  slackEnabled: false,
};

const DEFAULT_AUTOMATION_SETTINGS: AutomationSettings = {
  autoClosePassedRuns: false,
  autoAssignDefects: false,
  cicdEnabled: false,
  autoRetestOnCodeChange: false,
};

const DEFAULT_SLA_SETTINGS: SLASettings = {
  criticalDefectSLA: 4,
  majorDefectSLA: 24,
  minorDefectSLA: 72,
  trivialDefectSLA: 168,
  enableSLAAlerts: true,
};

const STATUS_COLORS = [
  { value: "gray", label: "Gray", class: "bg-muted text-muted-foreground" },
  { value: "red", label: "Red", class: "bg-destructive text-destructive-foreground" },
  { value: "orange", label: "Orange", class: "bg-orange-500 text-white" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-500 text-black" },
  { value: "green", label: "Green", class: "bg-green-500 text-white" },
  { value: "blue", label: "Blue", class: "bg-blue-500 text-white" },
  { value: "purple", label: "Purple", class: "bg-purple-500 text-white" },
];

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select (Dropdown)" },
  { value: "date", label: "Date" },
  { value: "checkbox", label: "Checkbox" },
];

export default function ProjectSettings() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspace");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasMinRole, loading: rbacLoading } = useRBAC(workspaceId || undefined);

  const [project, setProject] = useState<Project | null>(null);
  const [settings, setSettings] = useState<ProjectSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local state for editing - Test Case Settings
  const [statuses, setStatuses] = useState<CustomStatus[]>(DEFAULT_STATUSES);
  const [priorities, setPriorities] = useState<CustomPriority[]>(DEFAULT_PRIORITIES);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [testTypes, setTestTypes] = useState<TestType[]>(DEFAULT_TEST_TYPES);

  // Defect Settings
  const [severities, setSeverities] = useState<DefectSeverity[]>(DEFAULT_SEVERITIES);
  const [resolutions, setResolutions] = useState<DefectResolution[]>(DEFAULT_RESOLUTIONS);

  // Environment Settings
  const [environments, setEnvironments] = useState<TestEnvironment[]>(DEFAULT_ENVIRONMENTS);
  const [executionStatuses, setExecutionStatuses] = useState<ExecutionStatus[]>(DEFAULT_EXECUTION_STATUSES);

  // Notification & Automation Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [automationSettings, setAutomationSettings] = useState<AutomationSettings>(DEFAULT_AUTOMATION_SETTINGS);
  const [slaSettings, setSlaSettings] = useState<SLASettings>(DEFAULT_SLA_SETTINGS);

  // Dialog states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [severityDialogOpen, setSeverityDialogOpen] = useState(false);
  const [resolutionDialogOpen, setResolutionDialogOpen] = useState(false);
  const [environmentDialogOpen, setEnvironmentDialogOpen] = useState(false);
  const [testTypeDialogOpen, setTestTypeDialogOpen] = useState(false);
  const [executionStatusDialogOpen, setExecutionStatusDialogOpen] = useState(false);
  
  // New item forms
  const [newStatus, setNewStatus] = useState<Partial<CustomStatus>>({ name: "", color: "gray" });
  const [newPriority, setNewPriority] = useState<Partial<CustomPriority>>({ name: "", color: "gray" });
  const [newField, setNewField] = useState<Partial<CustomField>>({ name: "", type: "text", required: false, options: [] });
  const [newFieldOption, setNewFieldOption] = useState("");
  const [newSeverity, setNewSeverity] = useState<Partial<DefectSeverity>>({ name: "", color: "gray", description: "" });
  const [newResolution, setNewResolution] = useState<Partial<DefectResolution>>({ name: "", description: "" });
  const [newEnvironment, setNewEnvironment] = useState<Partial<TestEnvironment>>({ name: "", url: "", description: "", isDefault: false });
  const [newTestType, setNewTestType] = useState<Partial<TestType>>({ name: "", color: "blue", description: "" });
  const [newExecutionStatus, setNewExecutionStatus] = useState<Partial<ExecutionStatus>>({ name: "", color: "gray", isFinal: false });

  useEffect(() => {
    if (projectId && user) {
      fetchProjectSettings();
    }
  }, [projectId, user]);

  const fetchProjectSettings = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("id, name, workspace_id")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      const { data: settingsData, error: settingsError } = await supabase
        .from("project_settings")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      if (settingsError && settingsError.code !== "PGRST116") throw settingsError;

      if (settingsData) {
        setSettings({
          id: settingsData.id,
          project_id: settingsData.project_id,
          custom_statuses: settingsData.custom_statuses as unknown as CustomStatus[] | null,
          custom_priorities: settingsData.custom_priorities as unknown as CustomPriority[] | null,
          custom_fields: settingsData.custom_fields as unknown as CustomField[] | null,
          defect_severities: settingsData.defect_severities as unknown as DefectSeverity[] | null,
          defect_resolutions: settingsData.defect_resolutions as unknown as DefectResolution[] | null,
          test_environments: settingsData.test_environments as unknown as TestEnvironment[] | null,
          notification_settings: settingsData.notification_settings as unknown as NotificationSettings | null,
          automation_settings: settingsData.automation_settings as unknown as AutomationSettings | null,
          default_assignees: settingsData.default_assignees as unknown as DefaultAssignees | null,
          sla_settings: settingsData.sla_settings as unknown as SLASettings | null,
          test_types: settingsData.test_types as unknown as TestType[] | null,
          execution_statuses: settingsData.execution_statuses as unknown as ExecutionStatus[] | null,
        });
        
        // Populate local state
        setStatuses((settingsData.custom_statuses as unknown as CustomStatus[]) || DEFAULT_STATUSES);
        setPriorities((settingsData.custom_priorities as unknown as CustomPriority[]) || DEFAULT_PRIORITIES);
        setCustomFields((settingsData.custom_fields as unknown as CustomField[]) || []);
        setSeverities((settingsData.defect_severities as unknown as DefectSeverity[]) || DEFAULT_SEVERITIES);
        setResolutions((settingsData.defect_resolutions as unknown as DefectResolution[]) || DEFAULT_RESOLUTIONS);
        setEnvironments((settingsData.test_environments as unknown as TestEnvironment[]) || DEFAULT_ENVIRONMENTS);
        setNotificationSettings((settingsData.notification_settings as unknown as NotificationSettings) || DEFAULT_NOTIFICATION_SETTINGS);
        setAutomationSettings((settingsData.automation_settings as unknown as AutomationSettings) || DEFAULT_AUTOMATION_SETTINGS);
        setSlaSettings((settingsData.sla_settings as unknown as SLASettings) || DEFAULT_SLA_SETTINGS);
        setTestTypes((settingsData.test_types as unknown as TestType[]) || DEFAULT_TEST_TYPES);
        setExecutionStatuses((settingsData.execution_statuses as unknown as ExecutionStatus[]) || DEFAULT_EXECUTION_STATUSES);
      }
    } catch (error: any) {
      console.error("Error fetching project settings:", error);
      toast({
        title: "Error",
        description: "Failed to load project settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!projectId || !user) return;

    setSaving(true);
    try {
      const settingsPayload = {
        project_id: projectId,
        custom_statuses: JSON.parse(JSON.stringify(statuses)),
        custom_priorities: JSON.parse(JSON.stringify(priorities)),
        custom_fields: JSON.parse(JSON.stringify(customFields)),
        defect_severities: JSON.parse(JSON.stringify(severities)),
        defect_resolutions: JSON.parse(JSON.stringify(resolutions)),
        test_environments: JSON.parse(JSON.stringify(environments)),
        notification_settings: JSON.parse(JSON.stringify(notificationSettings)),
        automation_settings: JSON.parse(JSON.stringify(automationSettings)),
        sla_settings: JSON.parse(JSON.stringify(slaSettings)),
        test_types: JSON.parse(JSON.stringify(testTypes)),
        execution_statuses: JSON.parse(JSON.stringify(executionStatuses)),
        updated_at: new Date().toISOString(),
      };

      if (settings?.id) {
        const { error } = await supabase
          .from("project_settings")
          .update(settingsPayload)
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("project_settings")
          .insert(settingsPayload);

        if (error) throw error;
      }

      toast({
        title: "Settings saved",
        description: "Project settings have been updated successfully.",
      });

      fetchProjectSettings();
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save project settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Add/Remove handlers
  const addStatus = () => {
    if (!newStatus.name?.trim()) return;
    const status: CustomStatus = {
      id: crypto.randomUUID(),
      name: newStatus.name.trim(),
      color: newStatus.color || "gray",
      order: statuses.length,
    };
    setStatuses([...statuses, status]);
    setNewStatus({ name: "", color: "gray" });
    setStatusDialogOpen(false);
  };

  const removeStatus = (id: string) => setStatuses(statuses.filter((s) => s.id !== id));

  const addPriority = () => {
    if (!newPriority.name?.trim()) return;
    const priority: CustomPriority = {
      id: crypto.randomUUID(),
      name: newPriority.name.trim(),
      color: newPriority.color || "gray",
      order: priorities.length,
    };
    setPriorities([...priorities, priority]);
    setNewPriority({ name: "", color: "gray" });
    setPriorityDialogOpen(false);
  };

  const removePriority = (id: string) => setPriorities(priorities.filter((p) => p.id !== id));

  const addField = () => {
    if (!newField.name?.trim()) return;
    const field: CustomField = {
      id: crypto.randomUUID(),
      name: newField.name.trim(),
      type: newField.type as CustomField["type"],
      required: newField.required || false,
      options: newField.type === "select" ? newField.options : undefined,
    };
    setCustomFields([...customFields, field]);
    setNewField({ name: "", type: "text", required: false, options: [] });
    setFieldDialogOpen(false);
  };

  const removeField = (id: string) => setCustomFields(customFields.filter((f) => f.id !== id));

  const addFieldOption = () => {
    if (!newFieldOption.trim()) return;
    setNewField({ ...newField, options: [...(newField.options || []), newFieldOption.trim()] });
    setNewFieldOption("");
  };

  const removeFieldOption = (index: number) => {
    setNewField({ ...newField, options: newField.options?.filter((_, i) => i !== index) });
  };

  const addSeverity = () => {
    if (!newSeverity.name?.trim()) return;
    const severity: DefectSeverity = {
      id: crypto.randomUUID(),
      name: newSeverity.name.trim(),
      color: newSeverity.color || "gray",
      description: newSeverity.description || "",
      order: severities.length,
    };
    setSeverities([...severities, severity]);
    setNewSeverity({ name: "", color: "gray", description: "" });
    setSeverityDialogOpen(false);
  };

  const removeSeverity = (id: string) => setSeverities(severities.filter((s) => s.id !== id));

  const addResolution = () => {
    if (!newResolution.name?.trim()) return;
    const resolution: DefectResolution = {
      id: crypto.randomUUID(),
      name: newResolution.name.trim(),
      description: newResolution.description || "",
    };
    setResolutions([...resolutions, resolution]);
    setNewResolution({ name: "", description: "" });
    setResolutionDialogOpen(false);
  };

  const removeResolution = (id: string) => setResolutions(resolutions.filter((r) => r.id !== id));

  const addEnvironment = () => {
    if (!newEnvironment.name?.trim()) return;
    const env: TestEnvironment = {
      id: crypto.randomUUID(),
      name: newEnvironment.name.trim(),
      url: newEnvironment.url,
      description: newEnvironment.description,
      isDefault: newEnvironment.isDefault || false,
    };
    setEnvironments([...environments, env]);
    setNewEnvironment({ name: "", url: "", description: "", isDefault: false });
    setEnvironmentDialogOpen(false);
  };

  const removeEnvironment = (id: string) => setEnvironments(environments.filter((e) => e.id !== id));

  const setDefaultEnvironment = (id: string) => {
    setEnvironments(environments.map((e) => ({ ...e, isDefault: e.id === id })));
  };

  const addTestType = () => {
    if (!newTestType.name?.trim()) return;
    const type: TestType = {
      id: crypto.randomUUID(),
      name: newTestType.name.trim(),
      color: newTestType.color || "blue",
      description: newTestType.description || "",
    };
    setTestTypes([...testTypes, type]);
    setNewTestType({ name: "", color: "blue", description: "" });
    setTestTypeDialogOpen(false);
  };

  const removeTestType = (id: string) => setTestTypes(testTypes.filter((t) => t.id !== id));

  const addExecutionStatus = () => {
    if (!newExecutionStatus.name?.trim()) return;
    const status: ExecutionStatus = {
      id: crypto.randomUUID(),
      name: newExecutionStatus.name.trim(),
      color: newExecutionStatus.color || "gray",
      isFinal: newExecutionStatus.isFinal || false,
    };
    setExecutionStatuses([...executionStatuses, status]);
    setNewExecutionStatus({ name: "", color: "gray", isFinal: false });
    setExecutionStatusDialogOpen(false);
  };

  const removeExecutionStatus = (id: string) => setExecutionStatuses(executionStatuses.filter((s) => s.id !== id));

  const getColorClass = (color: string) => {
    return STATUS_COLORS.find((c) => c.value === color)?.class || "bg-muted";
  };

  if (loading || rbacLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-lg font-semibold">Project not found</h2>
          <Button variant="link" onClick={() => navigate(-1)}>
            Go back
          </Button>
        </div>
      </AppLayout>
    );
  }

  const canManageSettings = hasMinRole("manager");

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => workspaceId ? navigate(`/workspaces/${workspaceId}`) : navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Project Settings
              </h1>
              <p className="text-muted-foreground">{project.name}</p>
            </div>
          </div>
          {canManageSettings && (
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          )}
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="test-cases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="test-cases" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              <span className="hidden sm:inline">Test Cases</span>
            </TabsTrigger>
            <TabsTrigger value="defects" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              <span className="hidden sm:inline">Defects</span>
            </TabsTrigger>
            <TabsTrigger value="execution" className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Execution</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Automation</span>
            </TabsTrigger>
          </TabsList>

          {/* Test Cases Tab */}
          <TabsContent value="test-cases" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Custom Statuses */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5" />
                    Test Case Statuses
                  </CardTitle>
                  <CardDescription>
                    Define the workflow statuses for test cases
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {statuses.map((status) => (
                      <div key={status.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Badge className={getColorClass(status.color)}>{status.name}</Badge>
                        </div>
                        {canManageSettings && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeStatus(status.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {canManageSettings && (
                    <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Custom Status</DialogTitle>
                          <DialogDescription>Create a new status for test case workflow</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Status Name</Label>
                            <Input
                              placeholder="e.g., Pending Review"
                              value={newStatus.name}
                              onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <Select value={newStatus.color} onValueChange={(value) => setNewStatus({ ...newStatus, color: value })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {STATUS_COLORS.map((color) => (
                                  <SelectItem key={color.value} value={color.value}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded ${color.class}`} />
                                      {color.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
                          <Button onClick={addStatus} disabled={!newStatus.name?.trim()}>Add Status</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>

              {/* Priorities */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5" />
                    Priority Levels
                  </CardTitle>
                  <CardDescription>Configure priority levels for test cases</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {priorities.map((priority) => (
                      <div key={priority.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Badge className={getColorClass(priority.color)}>{priority.name}</Badge>
                        </div>
                        {canManageSettings && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removePriority(priority.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {canManageSettings && (
                    <Dialog open={priorityDialogOpen} onOpenChange={setPriorityDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Priority
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Priority Level</DialogTitle>
                          <DialogDescription>Create a new priority level</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Priority Name</Label>
                            <Input placeholder="e.g., Urgent" value={newPriority.name} onChange={(e) => setNewPriority({ ...newPriority, name: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <Select value={newPriority.color} onValueChange={(value) => setNewPriority({ ...newPriority, color: value })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {STATUS_COLORS.map((color) => (
                                  <SelectItem key={color.value} value={color.value}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded ${color.class}`} />
                                      {color.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setPriorityDialogOpen(false)}>Cancel</Button>
                          <Button onClick={addPriority} disabled={!newPriority.name?.trim()}>Add Priority</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>

              {/* Test Types */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Test Types
                  </CardTitle>
                  <CardDescription>Categories for organizing test cases</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {testTypes.map((type) => (
                      <div key={type.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Badge className={getColorClass(type.color)}>{type.name}</Badge>
                          <span className="text-xs text-muted-foreground">{type.description}</span>
                        </div>
                        {canManageSettings && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeTestType(type.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {canManageSettings && (
                    <Dialog open={testTypeDialogOpen} onOpenChange={setTestTypeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Test Type
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Test Type</DialogTitle>
                          <DialogDescription>Create a new test type category</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Type Name</Label>
                            <Input placeholder="e.g., Accessibility" value={newTestType.name} onChange={(e) => setNewTestType({ ...newTestType, name: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Input placeholder="Brief description" value={newTestType.description} onChange={(e) => setNewTestType({ ...newTestType, description: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <Select value={newTestType.color} onValueChange={(value) => setNewTestType({ ...newTestType, color: value })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {STATUS_COLORS.map((color) => (
                                  <SelectItem key={color.value} value={color.value}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded ${color.class}`} />
                                      {color.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setTestTypeDialogOpen(false)}>Cancel</Button>
                          <Button onClick={addTestType} disabled={!newTestType.name?.trim()}>Add Type</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>

              {/* Custom Fields */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Custom Fields
                  </CardTitle>
                  <CardDescription>Add custom fields for test case data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customFields.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No custom fields configured</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {customFields.map((field) => (
                        <div key={field.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{field.name}</span>
                              {field.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {FIELD_TYPES.find((t) => t.value === field.type)?.label}
                              {field.type === "select" && field.options && ` (${field.options.length} options)`}
                            </div>
                          </div>
                          {canManageSettings && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeField(field.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {canManageSettings && (
                    <Dialog open={fieldDialogOpen} onOpenChange={setFieldDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Custom Field
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Custom Field</DialogTitle>
                          <DialogDescription>Create a custom field for test cases</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Field Name</Label>
                            <Input placeholder="e.g., Browser Version" value={newField.name} onChange={(e) => setNewField({ ...newField, name: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Field Type</Label>
                            <Select value={newField.type} onValueChange={(value) => setNewField({ ...newField, type: value as CustomField["type"], options: value === "select" ? [] : undefined })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {FIELD_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {newField.type === "select" && (
                            <div className="space-y-2">
                              <Label>Options</Label>
                              <div className="flex gap-2">
                                <Input placeholder="Add option..." value={newFieldOption} onChange={(e) => setNewFieldOption(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFieldOption())} />
                                <Button type="button" variant="outline" onClick={addFieldOption}>Add</Button>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {newField.options?.map((opt, idx) => (
                                  <Badge key={idx} variant="secondary" className="gap-1">
                                    {opt}
                                    <button type="button" onClick={() => removeFieldOption(idx)} className="ml-1 hover:text-destructive">×</button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="field-required" checked={newField.required} onChange={(e) => setNewField({ ...newField, required: e.target.checked })} className="rounded border-border" />
                            <Label htmlFor="field-required">Required field</Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setFieldDialogOpen(false)}>Cancel</Button>
                          <Button onClick={addField} disabled={!newField.name?.trim() || (newField.type === "select" && (!newField.options || newField.options.length === 0))}>Add Field</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Defects Tab */}
          <TabsContent value="defects" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Defect Severities */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5" />
                    Defect Severity Levels
                  </CardTitle>
                  <CardDescription>Configure severity levels for defects (like Jira)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {severities.map((severity) => (
                      <div key={severity.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <div className="flex items-center gap-2 flex-1">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Badge className={getColorClass(severity.color)}>{severity.name}</Badge>
                          <span className="text-xs text-muted-foreground truncate">{severity.description}</span>
                        </div>
                        {canManageSettings && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSeverity(severity.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {canManageSettings && (
                    <Dialog open={severityDialogOpen} onOpenChange={setSeverityDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Severity
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Defect Severity</DialogTitle>
                          <DialogDescription>Create a new severity level</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Severity Name</Label>
                            <Input placeholder="e.g., Showstopper" value={newSeverity.name} onChange={(e) => setNewSeverity({ ...newSeverity, name: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Input placeholder="Brief description" value={newSeverity.description} onChange={(e) => setNewSeverity({ ...newSeverity, description: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <Select value={newSeverity.color} onValueChange={(value) => setNewSeverity({ ...newSeverity, color: value })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {STATUS_COLORS.map((color) => (
                                  <SelectItem key={color.value} value={color.value}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded ${color.class}`} />
                                      {color.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSeverityDialogOpen(false)}>Cancel</Button>
                          <Button onClick={addSeverity} disabled={!newSeverity.name?.trim()}>Add Severity</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>

              {/* Defect Resolutions */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Resolution Types
                  </CardTitle>
                  <CardDescription>Define how defects can be resolved</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {resolutions.map((resolution) => (
                      <div key={resolution.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{resolution.name}</div>
                          <div className="text-xs text-muted-foreground">{resolution.description}</div>
                        </div>
                        {canManageSettings && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeResolution(resolution.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {canManageSettings && (
                    <Dialog open={resolutionDialogOpen} onOpenChange={setResolutionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Resolution
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Resolution Type</DialogTitle>
                          <DialogDescription>Create a new defect resolution</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Resolution Name</Label>
                            <Input placeholder="e.g., Deferred" value={newResolution.name} onChange={(e) => setNewResolution({ ...newResolution, name: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Input placeholder="Brief description" value={newResolution.description} onChange={(e) => setNewResolution({ ...newResolution, description: e.target.value })} />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setResolutionDialogOpen(false)}>Cancel</Button>
                          <Button onClick={addResolution} disabled={!newResolution.name?.trim()}>Add Resolution</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>

              {/* SLA Settings */}
              <Card className="border-border md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    SLA Configuration
                  </CardTitle>
                  <CardDescription>Define resolution time targets for defects by severity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-md bg-muted/30">
                    <div>
                      <Label>Enable SLA Alerts</Label>
                      <p className="text-xs text-muted-foreground">Get notified when defects approach or breach SLA</p>
                    </div>
                    <Switch
                      checked={slaSettings.enableSLAAlerts}
                      onCheckedChange={(checked) => setSlaSettings({ ...slaSettings, enableSLAAlerts: checked })}
                      disabled={!canManageSettings}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Badge variant="destructive">Critical</Badge>
                        SLA (hours)
                      </Label>
                      <Input
                        type="number"
                        value={slaSettings.criticalDefectSLA}
                        onChange={(e) => setSlaSettings({ ...slaSettings, criticalDefectSLA: parseInt(e.target.value) || 4 })}
                        disabled={!canManageSettings}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Badge className={getColorClass("orange")}>Major</Badge>
                        SLA (hours)
                      </Label>
                      <Input
                        type="number"
                        value={slaSettings.majorDefectSLA}
                        onChange={(e) => setSlaSettings({ ...slaSettings, majorDefectSLA: parseInt(e.target.value) || 24 })}
                        disabled={!canManageSettings}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Badge className={getColorClass("yellow")}>Minor</Badge>
                        SLA (hours)
                      </Label>
                      <Input
                        type="number"
                        value={slaSettings.minorDefectSLA}
                        onChange={(e) => setSlaSettings({ ...slaSettings, minorDefectSLA: parseInt(e.target.value) || 72 })}
                        disabled={!canManageSettings}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Badge variant="secondary">Trivial</Badge>
                        SLA (hours)
                      </Label>
                      <Input
                        type="number"
                        value={slaSettings.trivialDefectSLA}
                        onChange={(e) => setSlaSettings({ ...slaSettings, trivialDefectSLA: parseInt(e.target.value) || 168 })}
                        disabled={!canManageSettings}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Execution Tab */}
          <TabsContent value="execution" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Test Environments */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Test Environments
                  </CardTitle>
                  <CardDescription>Configure environments for test execution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {environments.map((env) => (
                      <div key={env.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                        <div className="flex items-center gap-3 flex-1">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{env.name}</span>
                              {env.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                            </div>
                            {env.description && <p className="text-xs text-muted-foreground">{env.description}</p>}
                            {env.url && <p className="text-xs text-muted-foreground font-mono">{env.url}</p>}
                          </div>
                        </div>
                        {canManageSettings && (
                          <div className="flex items-center gap-1">
                            {!env.isDefault && (
                              <Button variant="ghost" size="sm" onClick={() => setDefaultEnvironment(env.id)}>
                                Set Default
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeEnvironment(env.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {canManageSettings && (
                    <Dialog open={environmentDialogOpen} onOpenChange={setEnvironmentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Environment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Test Environment</DialogTitle>
                          <DialogDescription>Create a new environment for test execution</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Environment Name</Label>
                            <Input placeholder="e.g., UAT" value={newEnvironment.name} onChange={(e) => setNewEnvironment({ ...newEnvironment, name: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>URL (optional)</Label>
                            <Input placeholder="https://uat.example.com" value={newEnvironment.url} onChange={(e) => setNewEnvironment({ ...newEnvironment, url: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Description (optional)</Label>
                            <Input placeholder="Brief description" value={newEnvironment.description} onChange={(e) => setNewEnvironment({ ...newEnvironment, description: e.target.value })} />
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="env-default" checked={newEnvironment.isDefault} onChange={(e) => setNewEnvironment({ ...newEnvironment, isDefault: e.target.checked })} className="rounded border-border" />
                            <Label htmlFor="env-default">Set as default environment</Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEnvironmentDialogOpen(false)}>Cancel</Button>
                          <Button onClick={addEnvironment} disabled={!newEnvironment.name?.trim()}>Add Environment</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>

              {/* Execution Statuses */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5" />
                    Execution Result Statuses
                  </CardTitle>
                  <CardDescription>Configure test execution result options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {executionStatuses.map((status) => (
                      <div key={status.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Badge className={getColorClass(status.color)}>{status.name}</Badge>
                          {status.isFinal && <Badge variant="outline" className="text-xs">Final</Badge>}
                        </div>
                        {canManageSettings && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeExecutionStatus(status.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {canManageSettings && (
                    <Dialog open={executionStatusDialogOpen} onOpenChange={setExecutionStatusDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Execution Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Execution Status</DialogTitle>
                          <DialogDescription>Create a new execution result status</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Status Name</Label>
                            <Input placeholder="e.g., Deferred" value={newExecutionStatus.name} onChange={(e) => setNewExecutionStatus({ ...newExecutionStatus, name: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <Select value={newExecutionStatus.color} onValueChange={(value) => setNewExecutionStatus({ ...newExecutionStatus, color: value })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {STATUS_COLORS.map((color) => (
                                  <SelectItem key={color.value} value={color.value}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded ${color.class}`} />
                                      {color.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="status-final" checked={newExecutionStatus.isFinal} onChange={(e) => setNewExecutionStatus({ ...newExecutionStatus, isFinal: e.target.checked })} className="rounded border-border" />
                            <Label htmlFor="status-final">Final status (ends execution)</Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setExecutionStatusDialogOpen(false)}>Cancel</Button>
                          <Button onClick={addExecutionStatus} disabled={!newExecutionStatus.name?.trim()}>Add Status</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription>Configure when team members receive email notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-md bg-muted/30">
                    <div>
                      <Label>Test Run Completed</Label>
                      <p className="text-xs text-muted-foreground">Notify when a test run is finished</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailOnTestRunComplete}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailOnTestRunComplete: checked })}
                      disabled={!canManageSettings}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-md bg-muted/30">
                    <div>
                      <Label>Defect Assigned</Label>
                      <p className="text-xs text-muted-foreground">Notify when a defect is assigned to you</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailOnDefectAssigned}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailOnDefectAssigned: checked })}
                      disabled={!canManageSettings}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-md bg-muted/30">
                    <div>
                      <Label>Status Changes</Label>
                      <p className="text-xs text-muted-foreground">Notify on test case or defect status changes</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailOnStatusChange}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailOnStatusChange: checked })}
                      disabled={!canManageSettings}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-md bg-muted/30">
                    <div>
                      <Label>Mentions</Label>
                      <p className="text-xs text-muted-foreground">Notify when you're mentioned in comments</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailOnMentions}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailOnMentions: checked })}
                      disabled={!canManageSettings}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Slack Integration</CardTitle>
                <CardDescription>Send notifications to a Slack channel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-md bg-muted/30">
                  <div>
                    <Label>Enable Slack Notifications</Label>
                    <p className="text-xs text-muted-foreground">Post updates to a Slack webhook</p>
                  </div>
                  <Switch
                    checked={notificationSettings.slackEnabled}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, slackEnabled: checked })}
                    disabled={!canManageSettings}
                  />
                </div>
                {notificationSettings.slackEnabled && (
                  <div className="space-y-2">
                    <Label>Slack Webhook URL</Label>
                    <Input
                      placeholder="https://hooks.slack.com/services/..."
                      value={notificationSettings.slackWebhookUrl || ""}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, slackWebhookUrl: e.target.value })}
                      disabled={!canManageSettings}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Automation Rules
                </CardTitle>
                <CardDescription>Configure automatic actions and workflows</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-md bg-muted/30">
                  <div>
                    <Label>Auto-close Passed Runs</Label>
                    <p className="text-xs text-muted-foreground">Automatically close test runs when all tests pass</p>
                  </div>
                  <Switch
                    checked={automationSettings.autoClosePassedRuns}
                    onCheckedChange={(checked) => setAutomationSettings({ ...automationSettings, autoClosePassedRuns: checked })}
                    disabled={!canManageSettings}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-md bg-muted/30">
                  <div>
                    <Label>Auto-assign Defects</Label>
                    <p className="text-xs text-muted-foreground">Automatically assign defects based on component owners</p>
                  </div>
                  <Switch
                    checked={automationSettings.autoAssignDefects}
                    onCheckedChange={(checked) => setAutomationSettings({ ...automationSettings, autoAssignDefects: checked })}
                    disabled={!canManageSettings}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-md bg-muted/30">
                  <div>
                    <Label>Auto-retest on Code Change</Label>
                    <p className="text-xs text-muted-foreground">Mark affected tests for retest when code changes are detected</p>
                  </div>
                  <Switch
                    checked={automationSettings.autoRetestOnCodeChange}
                    onCheckedChange={(checked) => setAutomationSettings({ ...automationSettings, autoRetestOnCodeChange: checked })}
                    disabled={!canManageSettings}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>CI/CD Integration</CardTitle>
                <CardDescription>Integrate with your CI/CD pipeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-md bg-muted/30">
                  <div>
                    <Label>Enable CI/CD Webhooks</Label>
                    <p className="text-xs text-muted-foreground">Receive test results from CI/CD pipelines</p>
                  </div>
                  <Switch
                    checked={automationSettings.cicdEnabled}
                    onCheckedChange={(checked) => setAutomationSettings({ ...automationSettings, cicdEnabled: checked })}
                    disabled={!canManageSettings}
                  />
                </div>
                {automationSettings.cicdEnabled && (
                  <div className="space-y-2">
                    <Label>CI/CD Webhook URL</Label>
                    <Input
                      placeholder="Your webhook endpoint URL"
                      value={automationSettings.cicdWebhookUrl || ""}
                      onChange={(e) => setAutomationSettings({ ...automationSettings, cicdWebhookUrl: e.target.value })}
                      disabled={!canManageSettings}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use this URL in your CI/CD pipeline to send test results
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
