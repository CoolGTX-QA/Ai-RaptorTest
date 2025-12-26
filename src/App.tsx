import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TestRepository from "./pages/TestRepository";
import TestExecution from "./pages/TestExecution";
import AIGeneration from "./pages/AIGeneration";
import RiskAssessment from "./pages/RiskAssessment";
import Defects from "./pages/Defects";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test-repository" element={<TestRepository />} />
          <Route path="/test-execution" element={<TestExecution />} />
          <Route path="/ai-generation" element={<AIGeneration />} />
          <Route path="/risk-assessment" element={<RiskAssessment />} />
          <Route path="/defects" element={<Defects />} />
          <Route path="/projects" element={<Navigate to="/dashboard" replace />} />
          <Route path="/reports" element={<Navigate to="/dashboard" replace />} />
          <Route path="/members" element={<Navigate to="/dashboard" replace />} />
          <Route path="/workspace-settings" element={<Navigate to="/dashboard" replace />} />
          <Route path="/workspaces" element={<Navigate to="/dashboard" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
