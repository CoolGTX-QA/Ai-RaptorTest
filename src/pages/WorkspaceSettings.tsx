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
  Plug,
  Save,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { IntegrationConfigDialog } from "@/components/workspace/IntegrationConfigDialog";
import { ToolsFeatureSection } from "@/components/workspace/ToolsFeatureSection";

type IntegrationType = "jira" | "clickup" | "linear" | "raptorassist";

interface IntegrationConfig {
  [key: string]: string;
}

interface WorkspaceSettingsData {
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
  integration_configs?: {
    jira?: IntegrationConfig;
    clickup?: IntegrationConfig;
    linear?: IntegrationConfig;
    raptorassist?: IntegrationConfig;
  };
}

interface Workspace {
  id: string;
  name: string;
}

const defaultSettings: WorkspaceSettingsData["enabled_tools"] = {
  ai_tools: true,
  reports: true,
  analytics: true,
  risk_assessment: true,
};

const defaultIntegrations: WorkspaceSettingsData["enabled_integrations"] = {
  jira: false,
  clickup: false,
  linear: false,
  raptorassist: false,
};

const defaultIntegrationConfigs: WorkspaceSettingsData["integration_configs"] = {
  jira: {},
  clickup: {},
  linear: {},
  raptorassist: {},
};

export default function WorkspaceSettings() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasMinRole, loading: rbacLoading } = useRBAC(workspaceId);

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [settings, setSettings] = useState<WorkspaceSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Local state for form
  const [enabledTools, setEnabledTools] = useState(defaultSettings);
  const [enabledIntegrations, setEnabledIntegrations] = useState(defaultIntegrations);
  const [integrationConfigs, setIntegrationConfigs] = useState(defaultIntegrationConfigs);
  const [subToolSettings, setSubToolSettings] = useState<Record<string, boolean>>({});
  
  // Dialog state
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [activeIntegration, setActiveIntegration] = useState<IntegrationType | null>(null);

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
        
        // Fetch integration configs from workspace_integrations table
        const { data: integrationsData } = await supabase
          .from("workspace_integrations")
          .select("integration_type, config, is_active")
          .eq("workspace_id", workspaceId);

        const configs: WorkspaceSettingsData["integration_configs"] = {
          jira: {},
          clickup: {},
          linear: {},
          raptorassist: {},
        };

        if (integrationsData) {
          integrationsData.forEach((int) => {
            const type = int.integration_type as IntegrationType;
            if (configs[type] !== undefined) {
              configs[type] = (int.config as IntegrationConfig) || {};
            }
          });
        }
        
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
          integration_configs: configs,
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
        setIntegrationConfigs(configs);
      } else {
        // No settings exist yet, use defaults
        setEnabledTools(defaultSettings);
        setEnabledIntegrations(defaultIntegrations);
        setIntegrationConfigs(defaultIntegrationConfigs);
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

  const handleSubToolToggle = (subToolId: string) => {
    setSubToolSettings((prev) => ({
      ...prev,
      [subToolId]: !(prev[subToolId] ?? true),
    }));
    setHasChanges(true);
  };

  const handleIntegrationToggle = (integration: keyof typeof enabledIntegrations) => {
    const newValue = !enabledIntegrations[integration];
    setEnabledIntegrations((prev) => ({
      ...prev,
      [integration]: newValue,
    }));
    setHasChanges(true);
    
    // If enabling, open config dialog
    if (newValue) {
      setActiveIntegration(integration);
      setConfigDialogOpen(true);
    }
  };

  const handleConfigureClick = (integration: IntegrationType) => {
    setActiveIntegration(integration);
    setConfigDialogOpen(true);
  };

  const handleSaveIntegrationConfig = async (config: IntegrationConfig) => {
    if (!workspaceId || !user || !activeIntegration) return;
    
    try {
      // Extract API key from config - different integrations use different key names
      const apiKey = config.api_key || config.api_token;
      
      if (!apiKey) {
        toast({
          title: "Error",
          description: "API key is required for this integration.",
          variant: "destructive",
        });
        return;
      }

      // Create safe config without sensitive keys for display purposes
      const safeConfig: IntegrationConfig = {};
      for (const [key, value] of Object.entries(config)) {
        if (key !== 'api_key' && key !== 'api_token') {
          safeConfig[key] = value;
        }
      }

      // Use edge function to securely store the API key
      const { data, error } = await supabase.functions.invoke('manage-integration-keys', {
        body: {
          action: 'store',
          api_key: apiKey,
          workspace_id: workspaceId,
          integration_type: activeIntegration,
          config: safeConfig,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to store API key securely");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Failed to configure integration");
      }

      // Update local state with safe config only (no API keys)
      setIntegrationConfigs((prev) => ({
        ...prev,
        [activeIntegration]: safeConfig,
      }));

      toast({
        title: "Integration configured securely",
        description: `${activeIntegration.charAt(0).toUpperCase() + activeIntegration.slice(1)} has been configured. API key is stored securely.`,
      });
    } catch (error: any) {
      console.error("Error saving integration config:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save integration configuration.",
        variant: "destructive",
      });
    }
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
              Expand each category to configure individual sub-tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ToolsFeatureSection
              enabledTools={enabledTools}
              subToolSettings={subToolSettings}
              onToolToggle={handleToolToggle}
              onSubToolToggle={handleSubToolToggle}
            />
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
            {/* Jira */}
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
              <div className="flex items-center gap-2">
                {enabledIntegrations.jira && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConfigureClick("jira")}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                )}
                <Switch
                  id="jira"
                  checked={enabledIntegrations.jira}
                  onCheckedChange={() => handleIntegrationToggle("jira")}
                />
              </div>
            </div>

            <Separator />

            {/* ClickUp */}
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
              <div className="flex items-center gap-2">
                {enabledIntegrations.clickup && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConfigureClick("clickup")}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                )}
                <Switch
                  id="clickup"
                  checked={enabledIntegrations.clickup}
                  onCheckedChange={() => handleIntegrationToggle("clickup")}
                />
              </div>
            </div>

            <Separator />

            {/* Linear */}
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
              <div className="flex items-center gap-2">
                {enabledIntegrations.linear && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConfigureClick("linear")}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                )}
                <Switch
                  id="linear"
                  checked={enabledIntegrations.linear}
                  onCheckedChange={() => handleIntegrationToggle("linear")}
                />
              </div>
            </div>

            <Separator />

            {/* RaptorAssist */}
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
              <div className="flex items-center gap-2">
                {enabledIntegrations.raptorassist && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConfigureClick("raptorassist")}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                )}
                <Switch
                  id="raptorassist"
                  checked={enabledIntegrations.raptorassist}
                  onCheckedChange={() => handleIntegrationToggle("raptorassist")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Config Dialog */}
        <IntegrationConfigDialog
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          integrationType={activeIntegration}
          onSave={handleSaveIntegrationConfig}
          existingConfig={activeIntegration ? integrationConfigs?.[activeIntegration] : {}}
        />
      </div>
    </AppLayout>
  );
}
