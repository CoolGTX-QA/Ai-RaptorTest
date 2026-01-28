import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sparkles,
  FileText,
  BarChart3,
  AlertTriangle,
  Settings,
  ChevronDown,
  ChevronRight,
  Brain,
  Wand2,
  MessageSquare,
  FileSearch,
  TestTube,
  Bug,
  GitBranch,
  TrendingUp,
  PieChart,
  Activity,
  Target,
  Shield,
  Gauge,
  Bell,
  Users,
  Lock,
  Palette,
} from "lucide-react";

interface SubTool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  subTools: SubTool[];
}

interface EnabledToolsType {
  ai_tools: boolean;
  reports: boolean;
  analytics: boolean;
  risk_assessment: boolean;
}

interface ToolsFeatureSectionProps {
  enabledTools: EnabledToolsType;
  subToolSettings: Record<string, boolean>;
  onToolToggle: (tool: keyof EnabledToolsType) => void;
  onSubToolToggle: (subToolId: string) => void;
}

const toolCategories: ToolCategory[] = [
  {
    id: "ai_tools",
    name: "AI Tools",
    description: "AI-powered test case generation and suggestions",
    icon: <Sparkles className="h-5 w-5 text-primary" />,
    subTools: [
      {
        id: "ai_test_generation",
        name: "Test Case Generation",
        description: "Auto-generate test cases from requirements",
        icon: <Wand2 className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "ai_suggestions",
        name: "Smart Suggestions",
        description: "AI-powered test improvement suggestions",
        icon: <Brain className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "ai_chat",
        name: "AI Assistant Chat",
        description: "Interactive AI assistant for testing queries",
        icon: <MessageSquare className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "ai_defect_analysis",
        name: "Defect Analysis",
        description: "AI-driven defect pattern detection",
        icon: <FileSearch className="h-4 w-4" />,
        enabled: true,
      },
    ],
  },
  {
    id: "reports",
    name: "Reports",
    description: "Comprehensive test reports and export functionality",
    icon: <FileText className="h-5 w-5 text-primary" />,
    subTools: [
      {
        id: "report_execution",
        name: "Test Execution Report",
        description: "Detailed test run results and trends",
        icon: <TestTube className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "report_defect_leakage",
        name: "Defect Leakage Report",
        description: "Phase and severity breakdown analysis",
        icon: <Bug className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "report_rca",
        name: "Root Cause Analysis",
        description: "RCA categories and patterns",
        icon: <GitBranch className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "report_traceability",
        name: "Requirement Traceability",
        description: "Coverage matrix and requirement mapping",
        icon: <Target className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "report_advanced",
        name: "Advanced Reports",
        description: "Effort analysis and test density",
        icon: <TrendingUp className="h-4 w-4" />,
        enabled: true,
      },
    ],
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Dashboards and analytics for test metrics",
    icon: <BarChart3 className="h-5 w-5 text-primary" />,
    subTools: [
      {
        id: "analytics_dashboard",
        name: "Analytics Dashboard",
        description: "Overview of key testing metrics",
        icon: <PieChart className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "analytics_trends",
        name: "Trend Analysis",
        description: "Historical test performance trends",
        icon: <TrendingUp className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "analytics_quality_radar",
        name: "Quality Radar",
        description: "Multi-dimensional quality assessment",
        icon: <Activity className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "analytics_team_performance",
        name: "Team Performance",
        description: "Team productivity and efficiency metrics",
        icon: <Users className="h-4 w-4" />,
        enabled: true,
      },
    ],
  },
  {
    id: "risk_assessment",
    name: "Risk Assessment",
    description: "Risk analysis and quality predictions",
    icon: <AlertTriangle className="h-5 w-5 text-primary" />,
    subTools: [
      {
        id: "risk_scoring",
        name: "Risk Scoring",
        description: "Automated risk score calculation",
        icon: <Gauge className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "risk_predictions",
        name: "Quality Predictions",
        description: "AI-powered quality forecasting",
        icon: <Brain className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "risk_alerts",
        name: "Risk Alerts",
        description: "Automated risk threshold notifications",
        icon: <Bell className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "risk_mitigation",
        name: "Mitigation Tracking",
        description: "Track and manage risk mitigation actions",
        icon: <Shield className="h-4 w-4" />,
        enabled: true,
      },
    ],
  },
  {
    id: "settings",
    name: "Settings",
    description: "Workspace configuration and preferences",
    icon: <Settings className="h-5 w-5 text-primary" />,
    subTools: [
      {
        id: "settings_permissions",
        name: "Permissions Management",
        description: "Role and access control settings",
        icon: <Lock className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "settings_notifications",
        name: "Notification Preferences",
        description: "Email and in-app notification settings",
        icon: <Bell className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "settings_customization",
        name: "UI Customization",
        description: "Theme and display preferences",
        icon: <Palette className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "settings_team",
        name: "Team Settings",
        description: "Team management and invitations",
        icon: <Users className="h-4 w-4" />,
        enabled: true,
      },
    ],
  },
];

export function ToolsFeatureSection({
  enabledTools,
  subToolSettings,
  onToolToggle,
  onSubToolToggle,
}: ToolsFeatureSectionProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getCategoryEnabled = (categoryId: string): boolean => {
    if (categoryId === "settings") return true; // Settings always enabled
    return enabledTools[categoryId as keyof typeof enabledTools] ?? false;
  };

  const getSubToolEnabled = (subToolId: string, categoryId: string): boolean => {
    // If parent category is disabled, sub-tools are disabled
    if (!getCategoryEnabled(categoryId)) return false;
    return subToolSettings[subToolId] ?? true;
  };

  const countEnabledSubTools = (category: ToolCategory) => {
    if (!getCategoryEnabled(category.id)) return 0;
    return category.subTools.filter((st) => getSubToolEnabled(st.id, category.id)).length;
  };

  return (
    <div className="space-y-4">
      {toolCategories.map((category) => {
        const isExpanded = expandedCategories.includes(category.id);
        const categoryEnabled = getCategoryEnabled(category.id);
        const enabledCount = countEnabledSubTools(category);
        const totalCount = category.subTools.length;

        return (
          <Collapsible
            key={category.id}
            open={isExpanded}
            onOpenChange={() => toggleExpanded(category.id)}
          >
            <div className="rounded-lg border border-border bg-card">
              {/* Category Header */}
              <div className="flex items-center justify-between p-4">
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="p-2 rounded-lg bg-primary/10">
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-medium text-foreground cursor-pointer">
                          {category.name}
                        </Label>
                        <Badge variant="secondary" className="text-xs">
                          {categoryEnabled ? `${enabledCount}/${totalCount}` : "Disabled"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </button>
                </CollapsibleTrigger>
                {category.id !== "settings" && (
                  <Switch
                    id={category.id}
                    checked={categoryEnabled}
                    onCheckedChange={() =>
                      onToolToggle(category.id as keyof typeof enabledTools)
                    }
                  />
                )}
              </div>

              {/* Sub-tools */}
              <CollapsibleContent>
                <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-3">
                  {category.subTools.map((subTool) => {
                    const subEnabled = getSubToolEnabled(subTool.id, category.id);
                    const isDisabledByParent = !categoryEnabled;

                    return (
                      <div
                        key={subTool.id}
                        className={`flex items-center justify-between py-2 px-3 rounded-md ${
                          isDisabledByParent ? "opacity-50" : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-muted-foreground">{subTool.icon}</div>
                          <div>
                            <Label
                              htmlFor={subTool.id}
                              className={`text-sm font-medium ${
                                isDisabledByParent
                                  ? "text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {subTool.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {subTool.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={subTool.id}
                          checked={subEnabled}
                          disabled={isDisabledByParent}
                          onCheckedChange={() => onSubToolToggle(subTool.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}
