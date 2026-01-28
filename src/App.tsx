import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TestRepository from "./pages/TestRepository";
import TestExecution from "./pages/TestExecution";
import AIGeneration from "./pages/AIGeneration";
import RiskAssessment from "./pages/RiskAssessment";
import RiskScoring from "./pages/risk-assessment/RiskScoring";
import RiskPredictions from "./pages/risk-assessment/RiskPredictions";
import RiskAlerts from "./pages/risk-assessment/RiskAlerts";
import MitigationTracking from "./pages/risk-assessment/MitigationTracking";
import Defects from "./pages/Defects";
import ReportsOverview from "./pages/reports/ReportsOverview";
import TestExecutionReport from "./pages/reports/TestExecutionReport";
import TestAnalyticsReport from "./pages/reports/TestAnalyticsReport";
import DefectLeakageReport from "./pages/reports/DefectLeakageReport";
import RCAReport from "./pages/reports/RCAReport";
import RequirementTraceability from "./pages/reports/RequirementTraceability";
import AdvancedReports from "./pages/reports/AdvancedReports";
import Workspaces from "./pages/Workspaces";
import WorkspaceDetail from "./pages/WorkspaceDetail";
import WorkspaceMembers from "./pages/WorkspaceMembers";
import WorkspaceSettings from "./pages/WorkspaceSettings";
import AllProjects from "./pages/AllProjects";
import ProjectSettings from "./pages/ProjectSettings";
import TMTSettings from "./pages/TMTSettings";
import ActivityLog from "./pages/ActivityLog";
import AcceptInvite from "./pages/AcceptInvite";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/test-repository" element={<ProtectedRoute><TestRepository /></ProtectedRoute>} />
            <Route path="/test-execution" element={<ProtectedRoute><TestExecution /></ProtectedRoute>} />
            <Route path="/ai-generation" element={<ProtectedRoute><AIGeneration /></ProtectedRoute>} />
            <Route path="/risk-assessment" element={<ProtectedRoute><RiskAssessment /></ProtectedRoute>} />
            <Route path="/risk-assessment/scoring" element={<ProtectedRoute><RiskScoring /></ProtectedRoute>} />
            <Route path="/risk-assessment/predictions" element={<ProtectedRoute><RiskPredictions /></ProtectedRoute>} />
            <Route path="/risk-assessment/alerts" element={<ProtectedRoute><RiskAlerts /></ProtectedRoute>} />
            <Route path="/risk-assessment/mitigation" element={<ProtectedRoute><MitigationTracking /></ProtectedRoute>} />
            <Route path="/defects" element={<ProtectedRoute><Defects /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsOverview /></ProtectedRoute>} />
            <Route path="/reports/test-execution" element={<ProtectedRoute><TestExecutionReport /></ProtectedRoute>} />
            <Route path="/reports/test-analytics" element={<ProtectedRoute><TestAnalyticsReport /></ProtectedRoute>} />
            <Route path="/reports/defect-leakage" element={<ProtectedRoute><DefectLeakageReport /></ProtectedRoute>} />
            <Route path="/reports/rca" element={<ProtectedRoute><RCAReport /></ProtectedRoute>} />
            <Route path="/reports/traceability" element={<ProtectedRoute><RequirementTraceability /></ProtectedRoute>} />
            <Route path="/reports/advanced" element={<ProtectedRoute><AdvancedReports /></ProtectedRoute>} />
            <Route path="/workspaces" element={<ProtectedRoute><Workspaces /></ProtectedRoute>} />
            <Route path="/workspaces/:workspaceId" element={<ProtectedRoute><WorkspaceDetail /></ProtectedRoute>} />
            <Route path="/workspaces/:workspaceId/members" element={<ProtectedRoute><WorkspaceMembers /></ProtectedRoute>} />
            <Route path="/workspaces/:workspaceId/settings" element={<ProtectedRoute><WorkspaceSettings /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><AllProjects /></ProtectedRoute>} />
            <Route path="/projects/:projectId/settings" element={<ProtectedRoute><ProjectSettings /></ProtectedRoute>} />
            <Route path="/members" element={<Navigate to="/dashboard" replace />} />
            <Route path="/workspace-settings" element={<Navigate to="/dashboard" replace />} />
            <Route path="/tmt-settings" element={<ProtectedRoute><TMTSettings /></ProtectedRoute>} />
            <Route path="/activity-log" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
            <Route path="/accept-invite" element={<AcceptInvite />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
