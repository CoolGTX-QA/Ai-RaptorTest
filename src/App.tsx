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
import Defects from "./pages/Defects";
import Reports from "./pages/Reports";
import Workspaces from "./pages/Workspaces";
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
            <Route path="/defects" element={<ProtectedRoute><Defects /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/workspaces" element={<ProtectedRoute><Workspaces /></ProtectedRoute>} />
            <Route path="/projects" element={<Navigate to="/dashboard" replace />} />
            <Route path="/members" element={<Navigate to="/dashboard" replace />} />
            <Route path="/workspace-settings" element={<Navigate to="/dashboard" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
