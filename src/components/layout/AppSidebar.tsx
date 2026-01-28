import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  FolderKanban,
  TestTube2,
  Play,
  Bug,
  Sparkles,
  Shield,
  BarChart3,
  Settings,
  Users,
  ChevronDown,
  ChevronRight,
  LogOut,
  Layers,
  Target,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const menuItems = {
  workspaces: [
    { title: "Workspaces", url: "/workspaces", icon: Layers },
  ],
  projects: [
    { title: "All Projects", url: "/projects", icon: FolderKanban },
  ],
  testManagement: [
    { title: "Test Repository", url: "/test-repository", icon: TestTube2 },
    { title: "Test Execution", url: "/test-execution", icon: Play },
    { title: "Defects", url: "/defects", icon: Bug },
  ],
  aiTools: [
    { title: "AI Test Generation", url: "/ai-generation", icon: Sparkles },
  ],
  reports: [
    { title: "Reports Overview", url: "/reports", icon: BarChart3 },
    { title: "Test Execution", url: "/reports/test-execution", icon: Play },
    { title: "Test Analytics", url: "/reports/test-analytics", icon: BarChart3 },
    { title: "Defect Leakage", url: "/reports/defect-leakage", icon: Bug },
    { title: "RCA Report", url: "/reports/rca", icon: Shield },
    { title: "Traceability", url: "/reports/traceability", icon: Layers },
    { title: "Advanced Reports", url: "/reports/advanced", icon: Sparkles },
  ],
  riskAssessment: [
    { title: "Risk Overview", url: "/risk-assessment", icon: Shield },
    { title: "Risk Scoring", url: "/risk-assessment/scoring", icon: Target },
    { title: "Risk Predictions", url: "/risk-assessment/predictions", icon: TrendingUp },
    { title: "Risk Alerts", url: "/risk-assessment/alerts", icon: AlertTriangle },
    { title: "Mitigation Tracking", url: "/risk-assessment/mitigation", icon: ShieldCheck },
  ],
  settings: [
    { title: "Workspace Settings", url: "/workspace-settings", icon: Settings },
  ],
};

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    workspaces: true,
    projects: true,
    testManagement: true,
    aiTools: true,
    reports: true,
    riskAssessment: true,
    settings: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isActive = (url: string) => location.pathname === url;

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border px-4 py-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Layers className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">RaptorTest</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={cn(
                "w-full",
                isActive("/dashboard") && "bg-accent text-accent-foreground"
              )}
            >
              <Link to="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarGroup>
          <SidebarGroupLabel
            onClick={() => toggleSection("workspaces")}
            className="flex cursor-pointer items-center justify-between hover:bg-accent/50 rounded px-2"
          >
            <span>WORKSPACES</span>
            {expandedSections.workspaces ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </SidebarGroupLabel>
          {expandedSections.workspaces && (
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.workspaces.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        isActive(item.url) && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel
            onClick={() => toggleSection("projects")}
            className="flex cursor-pointer items-center justify-between hover:bg-accent/50 rounded px-2"
          >
            <span>PROJECTS</span>
            {expandedSections.projects ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </SidebarGroupLabel>
          {expandedSections.projects && (
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.projects.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        isActive(item.url) && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel
            onClick={() => toggleSection("testManagement")}
            className="flex cursor-pointer items-center justify-between hover:bg-accent/50 rounded px-2"
          >
            <span>TEST MANAGEMENT</span>
            {expandedSections.testManagement ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </SidebarGroupLabel>
          {expandedSections.testManagement && (
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.testManagement.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        isActive(item.url) && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel
            onClick={() => toggleSection("aiTools")}
            className="flex cursor-pointer items-center justify-between hover:bg-accent/50 rounded px-2"
          >
            <span>AI TOOLS</span>
            {expandedSections.aiTools ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </SidebarGroupLabel>
          {expandedSections.aiTools && (
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.aiTools.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        isActive(item.url) && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel
            onClick={() => toggleSection("reports")}
            className="flex cursor-pointer items-center justify-between hover:bg-accent/50 rounded px-2"
          >
            <span>REPORTS & ANALYTICS</span>
            {expandedSections.reports ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </SidebarGroupLabel>
          {expandedSections.reports && (
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.reports.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        isActive(item.url) && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel
            onClick={() => toggleSection("riskAssessment")}
            className="flex cursor-pointer items-center justify-between hover:bg-accent/50 rounded px-2"
          >
            <span>RISK ASSESSMENT</span>
            {expandedSections.riskAssessment ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </SidebarGroupLabel>
          {expandedSections.riskAssessment && (
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.riskAssessment.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        isActive(item.url) && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel
            onClick={() => toggleSection("settings")}
            className="flex cursor-pointer items-center justify-between hover:bg-accent/50 rounded px-2"
          >
            <span>SETTINGS</span>
            {expandedSections.settings ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </SidebarGroupLabel>
          {expandedSections.settings && (
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.settings.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        isActive(item.url) && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4 space-y-1">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start gap-2",
            isActive("/tmt-settings") && "bg-accent text-accent-foreground"
          )}
          onClick={() => navigate("/tmt-settings")}
        >
          <Settings className="h-4 w-4" />
          <span>TMT Settings</span>
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2"
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
