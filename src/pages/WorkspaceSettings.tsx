import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRBAC } from "@/hooks/useRBAC";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Loader2,
  Settings,
  Sparkles,
  BarChart3,
  FileText,
  AlertTriangle,
  Plug,
  Save,
} from "lucide-react";

interface WorkspaceSettings {
  id: string;
  workspace_id: string;
  enabled_tools: {
    ai_tools: boolean;
    reports: boolean;
    analytics: boolean;
    risk_assessment: boolean;
  };
  enabled_integrations: {
    jira: boolean;
    clickup: boolean;
    linear: boolean;
    raptorassist: boolean;
  };
}

interface Workspace {
  id: string;
  name: string;
}

const defaultSettings: WorkspaceSettings["enabled_tools"] = {
  ai_tools: true,
  reports: true,
  analytics: true,
  risk_assessment: true,
};

const defaultIntegrations: WorkspaceSettings["enabled_integrations"] = {
  jira: false,
  clickup: false,
  linear: false,
  raptorassist: false,
};

export default function WorkspaceSettings() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasMinRole, loading: rbacLoading } = useRBAC(workspaceId);

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Local state for form
  const [enabledTools, setEnabledTools] = useState(defaultSettings);
  const [enabledIntegrations, setEnabledIntegrations] = useState(defaultIntegrations);

  useEffect(() => {
    if (workspaceId && user) {
      fetchData();
    }
  }, [workspaceId, user]);

  const fetchData = async () => {
    if (!workspaceId) return;

    setLoading(true);
    try {
      // Fetch workspace details
      const { data: workspaceData, error: workspaceError } = await supabase
        .from("workspaces")
        .select("id, name")
        .eq("id", workspaceId)
        .maybeSingle();

      if (workspaceError) throw workspaceError;

      if (!workspaceData) {
        toast({
          title: "Workspace not found",
          description: "The workspace you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate("/workspaces");
        return;
      }

      setWorkspace(workspaceData);

      // Fetch workspace settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("workspace_settings")
        .select("*")
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (settingsError && settingsError.code !== "PGRST116") {
        throw settingsError;
      }

      if (settingsData) {
        const tools = settingsData.enabled_tools as Record<string, boolean> | null;
        const integrations = settingsData.enabled_integrations as Record<string, boolean> | null;
        
        setSettings({
          id: settingsData.id,
          workspace_id: settingsData.workspace_id,
          enabled_tools: {
            ai_tools: tools?.ai_tools ?? true,
            reports: tools?.reports ?? true,
            analytics: tools?.analytics ?? true,
            risk_assessment: tools?.risk_assessment ?? true,
          },
          enabled_integrations: {
            jira: integrations?.jira ?? false,
            clickup: integrations?.clickup ?? false,
            linear: integrations?.linear ?? false,
            raptorassist: integrations?.raptorassist ?? false,
          },
        });
        setEnabledTools({
          ai_tools: tools?.ai_tools ?? true,
          reports: tools?.reports ?? true,
          analytics: tools?.analytics ?? true,
          risk_assessment: tools?.risk_assessment ?? true,
        });
        setEnabledIntegrations({
          jira: integrations?.jira ?? false,
          clickup: integrations?.clickup ?? false,
          linear: integrations?.linear ?? false,
          raptorassist: integrations?.raptorassist ?? false,
        });
      } else {
        // No settings exist yet, use defaults
        setEnabledTools(defaultSettings);
        setEnabledIntegrations(defaultIntegrations);
      }
    } catch (error: any) {
      console.error("Error fetching workspace settings:", error);
      toast({
        title: "Error",
        description: "Failed to load workspace settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToolToggle = (tool: keyof typeof enabledTools) => {
    setEnabledTools((prev) => ({
      ...prev,
      [tool]: !prev[tool],
    }));
    setHasChanges(true);
  };

  const handleIntegrationToggle = (integration: keyof typeof enabledIntegrations) => {
    setEnabledIntegrations((prev) => ({
      ...prev,
      [integration]: !prev[integration],
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!workspaceId || !user) return;

    setSaving(true);
    try {
      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from("workspace_settings")
          .update({
            enabled_tools: enabledTools,
            enabled_integrations: enabledIntegrations,
          })
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase.from("workspace_settings").insert({
          workspace_id: workspaceId,
          enabled_tools: enabledTools,
          enabled_integrations: enabledIntegrations,
        });

        if (error) throw error;
      }

      toast({
        title: "Settings saved",
        description: "Workspace settings have been updated successfully.",
      });

      setHasChanges(false);
      fetchData(); // Refresh to get the latest data
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save workspace settings. You may not have permission.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
          <div className="grid gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const canManageSettings = hasMinRole("manager");

  if (!canManageSettings) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You need manager or admin permissions to access workspace settings.
          </p>
          <Button variant="outline" onClick={() => navigate(`/workspaces/${workspaceId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workspace
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/workspaces/${workspaceId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Workspace Settings
                </h1>
                <p className="text-muted-foreground">{workspace?.name}</p>
              </div>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>

        {/* Tools Section */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Tools & Features
            </CardTitle>
            <CardDescription>
              Control which tools and features are available to workspace members.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-tools" className="text-base font-medium text-foreground">
                  AI Tools
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable AI-powered test case generation and suggestions
                </p>
              </div>
              <Switch
                id="ai-tools"
                checked={enabledTools.ai_tools}
                onCheckedChange={() => handleToolToggle("ai_tools")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reports" className="text-base font-medium text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Reports
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable comprehensive test reports and export functionality
                </p>
              </div>
              <Switch
                id="reports"
                checked={enabledTools.reports}
                onCheckedChange={() => handleToolToggle("reports")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics" className="text-base font-medium text-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable dashboards and analytics for test metrics
                </p>
              </div>
              <Switch
                id="analytics"
                checked={enabledTools.analytics}
                onCheckedChange={() => handleToolToggle("analytics")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="risk-assessment" className="text-base font-medium text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Assessment
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable risk analysis and quality predictions
                </p>
              </div>
              <Switch
                id="risk-assessment"
                checked={enabledTools.risk_assessment}
                onCheckedChange={() => handleToolToggle("risk_assessment")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Integrations Section */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Plug className="h-5 w-5 text-primary" />
              Integrations
            </CardTitle>
            <CardDescription>
              Enable integrations that can be connected at the project level. 
              Individual projects can then configure their own connections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="jira" className="text-base font-medium text-foreground flex items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M11.571 11.429L0 0h11.429a12 12 0 0 1 0 22.857l-.857-.857 1.285-1.286a9.43 9.43 0 0 0 0-13.285L11.571 11.429z" fill="#2684FF"/>
                    <path d="M12.429 12.571L24 24H12.571a12 12 0 0 1 0-22.857l.857.857-1.285 1.286a9.43 9.43 0 0 0 0 13.285l.286.286z" fill="#2684FF"/>
                  </svg>
                  Jira
                </Label>
                <p className="text-sm text-muted-foreground">
                  Sync defects and requirements with Atlassian Jira
                </p>
              </div>
              <Switch
                id="jira"
                checked={enabledIntegrations.jira}
                onCheckedChange={() => handleIntegrationToggle("jira")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="clickup" className="text-base font-medium text-foreground flex items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M4.105 17.468l2.642-2.021a5.413 5.413 0 0 0 4.253 2.07 5.413 5.413 0 0 0 4.253-2.07l2.642 2.02C16.197 19.63 13.858 21 11 21c-2.858 0-5.197-1.37-6.895-3.532z" fill="#8930FD"/>
                    <path d="M11 6.333l-5.294 4.32 2.103 2.575L11 10.772l3.191 2.456 2.103-2.574L11 6.333z" fill="#FF02F0"/>
                    <path d="M11 3l7.895 6.445-2.103 2.574L11 7.563 5.208 12.02l-2.103-2.575L11 3z" fill="#FFD803"/>
                  </svg>
                  ClickUp
                </Label>
                <p className="text-sm text-muted-foreground">
                  Connect with ClickUp for task management
                </p>
              </div>
              <Switch
                id="clickup"
                checked={enabledIntegrations.clickup}
                onCheckedChange={() => handleIntegrationToggle("clickup")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="linear" className="text-base font-medium text-foreground flex items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M3.185 12.808l8.007 8.007a9.082 9.082 0 0 1-8.007-8.007z" fill="#5E6AD2"/>
                    <path d="M3 11.118a9.092 9.092 0 0 1 2.665-5.453 9.092 9.092 0 0 1 5.453-2.665l9.882 9.882a9.092 9.092 0 0 1-2.665 5.453 9.092 9.092 0 0 1-5.453 2.665L3 11.118z" fill="#5E6AD2"/>
                    <path d="M12.808 3.185a9.082 9.082 0 0 1 8.007 8.007l-8.007-8.007z" fill="#5E6AD2"/>
                  </svg>
                  Linear
                </Label>
                <p className="text-sm text-muted-foreground">
                  Integrate with Linear for issue tracking
                </p>
              </div>
              <Switch
                id="linear"
                checked={enabledIntegrations.linear}
                onCheckedChange={() => handleIntegrationToggle("linear")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="raptorassist" className="text-base font-medium text-foreground flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-primary-foreground" />
                  </div>
                  RaptorAssist
                </Label>
                <p className="text-sm text-muted-foreground">
                  Connect to RaptorAssist AI for enhanced testing capabilities
                </p>
              </div>
              <Switch
                id="raptorassist"
                checked={enabledIntegrations.raptorassist}
                onCheckedChange={() => handleIntegrationToggle("raptorassist")}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
