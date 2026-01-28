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

  // Local state for editing
  const [statuses, setStatuses] = useState<CustomStatus[]>(DEFAULT_STATUSES);
  const [priorities, setPriorities] = useState<CustomPriority[]>(DEFAULT_PRIORITIES);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  // Dialog states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  
  // New item forms
  const [newStatus, setNewStatus] = useState<Partial<CustomStatus>>({ name: "", color: "gray" });
  const [newPriority, setNewPriority] = useState<Partial<CustomPriority>>({ name: "", color: "gray" });
  const [newField, setNewField] = useState<Partial<CustomField>>({ 
    name: "", 
    type: "text", 
    required: false,
    options: []
  });
  const [newFieldOption, setNewFieldOption] = useState("");

  useEffect(() => {
    if (projectId && user) {
      fetchProjectSettings();
    }
  }, [projectId, user]);

  const fetchProjectSettings = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("id, name, workspace_id")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch project settings
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
        });
        setStatuses((settingsData.custom_statuses as unknown as CustomStatus[]) || DEFAULT_STATUSES);
        setPriorities((settingsData.custom_priorities as unknown as CustomPriority[]) || DEFAULT_PRIORITIES);
        setCustomFields((settingsData.custom_fields as unknown as CustomField[]) || []);
      } else {
        // No settings yet, use defaults
        setStatuses(DEFAULT_STATUSES);
        setPriorities(DEFAULT_PRIORITIES);
        setCustomFields([]);
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
        updated_at: new Date().toISOString(),
      };

      if (settings?.id) {
        // Update existing
        const { error } = await supabase
          .from("project_settings")
          .update(settingsPayload)
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        // Insert new
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

  const removeStatus = (id: string) => {
    setStatuses(statuses.filter((s) => s.id !== id));
  };

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

  const removePriority = (id: string) => {
    setPriorities(priorities.filter((p) => p.id !== id));
  };

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

  const removeField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

  const addFieldOption = () => {
    if (!newFieldOption.trim()) return;
    setNewField({
      ...newField,
      options: [...(newField.options || []), newFieldOption.trim()],
    });
    setNewFieldOption("");
  };

  const removeFieldOption = (index: number) => {
    setNewField({
      ...newField,
      options: newField.options?.filter((_, i) => i !== index),
    });
  };

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

        <div className="grid gap-6 md:grid-cols-2">
          {/* Custom Statuses */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Test Case Statuses
              </CardTitle>
              <CardDescription>
                Define the workflow statuses for test cases in this project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {statuses.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Badge className={getColorClass(status.color)}>
                        {status.name}
                      </Badge>
                    </div>
                    {canManageSettings && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeStatus(status.id)}
                      >
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
                      <DialogDescription>
                        Create a new status for test case workflow
                      </DialogDescription>
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
                        <Select
                          value={newStatus.color}
                          onValueChange={(value) => setNewStatus({ ...newStatus, color: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
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
                      <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addStatus} disabled={!newStatus.name?.trim()}>
                        Add Status
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {/* Custom Priorities */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Priority Levels
              </CardTitle>
              <CardDescription>
                Configure priority levels for test cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {priorities.map((priority) => (
                  <div
                    key={priority.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Badge className={getColorClass(priority.color)}>
                        {priority.name}
                      </Badge>
                    </div>
                    {canManageSettings && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removePriority(priority.id)}
                      >
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
                      <DialogDescription>
                        Create a new priority level for test cases
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Priority Name</Label>
                        <Input
                          placeholder="e.g., Urgent"
                          value={newPriority.name}
                          onChange={(e) => setNewPriority({ ...newPriority, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <Select
                          value={newPriority.color}
                          onValueChange={(value) => setNewPriority({ ...newPriority, color: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
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
                      <Button variant="outline" onClick={() => setPriorityDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addPriority} disabled={!newPriority.name?.trim()}>
                        Add Priority
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {/* Custom Fields */}
          <Card className="border-border md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Custom Fields
              </CardTitle>
              <CardDescription>
                Add custom fields to capture additional test case data specific to this project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {customFields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No custom fields configured</p>
                  <p className="text-sm">Add fields to capture project-specific test case data</p>
                </div>
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  {customFields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{field.name}</span>
                          {field.required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Type: {FIELD_TYPES.find((t) => t.value === field.type)?.label}
                          {field.type === "select" && field.options && (
                            <span> ({field.options.length} options)</span>
                          )}
                        </div>
                      </div>
                      {canManageSettings && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeField(field.id)}
                        >
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
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Custom Field
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Custom Field</DialogTitle>
                      <DialogDescription>
                        Create a custom field for test cases in this project
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Field Name</Label>
                        <Input
                          placeholder="e.g., Browser Version"
                          value={newField.name}
                          onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Field Type</Label>
                        <Select
                          value={newField.type}
                          onValueChange={(value) => setNewField({ 
                            ...newField, 
                            type: value as CustomField["type"],
                            options: value === "select" ? [] : undefined
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {newField.type === "select" && (
                        <div className="space-y-2">
                          <Label>Options</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add option..."
                              value={newFieldOption}
                              onChange={(e) => setNewFieldOption(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFieldOption())}
                            />
                            <Button type="button" variant="outline" onClick={addFieldOption}>
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {newField.options?.map((opt, idx) => (
                              <Badge key={idx} variant="secondary" className="gap-1">
                                {opt}
                                <button
                                  type="button"
                                  onClick={() => removeFieldOption(idx)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="field-required"
                          checked={newField.required}
                          onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                          className="rounded border-border"
                        />
                        <Label htmlFor="field-required">Required field</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setFieldDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={addField} 
                        disabled={!newField.name?.trim() || (newField.type === "select" && (!newField.options || newField.options.length === 0))}
                      >
                        Add Field
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
