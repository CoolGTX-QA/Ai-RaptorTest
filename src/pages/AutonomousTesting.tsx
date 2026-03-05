import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Bot, Play, Eye, Trash2 } from "lucide-react";
import { useProjects, Project } from "@/hooks/useProjects";
import { useAutonomousTesting, AutonomousProject } from "@/hooks/useAutonomousTesting";
import { AutonomousWizard } from "@/components/autonomous-testing/AutonomousWizard";
import { TestExecutionView } from "@/components/autonomous-testing/TestExecutionView";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AutonomousTesting() {
  const { data: projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [showWizard, setShowWizard] = useState(false);
  const [viewingProject, setViewingProject] = useState<AutonomousProject | null>(null);

  const activeProjectId = selectedProjectId || projects?.[0]?.id;
  const { projects: autoProjects, isLoading } = useAutonomousTesting(activeProjectId);

  const statusColor = (s: string) => {
    switch (s) {
      case "draft": return "secondary";
      case "generating": return "outline";
      case "ready": return "default";
      case "running": return "default";
      case "completed": return "default";
      default: return "secondary";
    }
  };

  if (viewingProject) {
    return (
      <TestExecutionView
        autonomousProject={viewingProject}
        onBack={() => setViewingProject(null)}
      />
    );
  }

  if (showWizard && activeProjectId) {
    return (
      <AutonomousWizard
        projectId={activeProjectId}
        onClose={() => setShowWizard(false)}
        onComplete={(project) => {
          setShowWizard(false);
          setViewingProject(project);
        }}
      />
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Autonomous Testing</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered test generation and execution for web applications
            </p>
          </div>
          <div className="flex items-center gap-3">
            {projects && projects.length > 0 && (
              <Select value={activeProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={() => setShowWizard(true)} disabled={!activeProjectId}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tests
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : autoProjects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bot className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Autonomous Tests Yet</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Create your first AI-powered test suite. The AI will crawl your application,
                generate test cases, and provide executable Playwright-style scripts.
              </p>
              <Button onClick={() => setShowWizard(true)} disabled={!activeProjectId}>
                <Plus className="h-4 w-4 mr-2" />
                Create Tests
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {autoProjects.map((ap) => (
              <Card key={ap.id} className="hover:border-primary/30 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">{ap.test_name}</CardTitle>
                    <CardDescription className="mt-1">{ap.base_url}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColor(ap.status)}>{ap.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => setViewingProject(ap)}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Created {format(new Date(ap.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
