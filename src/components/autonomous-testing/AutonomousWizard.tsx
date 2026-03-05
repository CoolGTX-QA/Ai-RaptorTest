import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAutonomousTesting, AutonomousProject, AutonomousTestCase } from "@/hooks/useAutonomousTesting";
import { StepGetStarted } from "./steps/StepGetStarted";
import { StepBackendApis } from "./steps/StepBackendApis";
import { StepFrontendUrls } from "./steps/StepFrontendUrls";
import { StepGenerating } from "./steps/StepGenerating";
import { StepSummary } from "./steps/StepSummary";
import { StepDraftPlan } from "./steps/StepDraftPlan";
import { WizardProgress } from "./WizardProgress";
import { toast } from "sonner";

interface Props {
  projectId: string;
  onClose: () => void;
  onComplete: (project: AutonomousProject) => void;
}

export interface ApiEntry {
  api_name: string;
  endpoint_url: string;
  auth_type: string;
  auth_config: any;
  extra_info: string;
}

export interface UrlEntry {
  url_name: string;
  start_url: string;
  login_email: string;
  login_password: string;
  extra_instructions: string;
}

const STEPS = ["Get Started", "Backend APIs", "Frontend URLs", "Generating", "Summary", "Draft Plan"];

export function AutonomousWizard({ projectId, onClose, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [testName, setTestName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apis, setApis] = useState<ApiEntry[]>([]);
  const [urls, setUrls] = useState<UrlEntry[]>([]);
  const [createdProject, setCreatedProject] = useState<AutonomousProject | null>(null);
  const [generatedCases, setGeneratedCases] = useState<AutonomousTestCase[]>([]);

  const { createProject, addApis, addUrls, saveTestCases, updateProject } = useAutonomousTesting(projectId);

  const handleStep1Next = async () => {
    if (!testName.trim() || !baseUrl.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const project = await createProject.mutateAsync({ test_name: testName, base_url: baseUrl });
      setCreatedProject(project);
      setStep(1);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleStep2Next = async () => {
    if (apis.length > 0 && createdProject) {
      try {
        await addApis.mutateAsync({
          autonomous_project_id: createdProject.id,
          apis: apis.map((a) => ({ ...a, doc_url: null })),
        });
      } catch (e: any) {
        toast.error(e.message);
        return;
      }
    }
    setStep(2);
  };

  const handleStep3Next = async () => {
    if (urls.length > 0 && createdProject) {
      try {
        await addUrls.mutateAsync({
          autonomous_project_id: createdProject.id,
          urls: urls.map((u) => ({ ...u, doc_url: null })),
        });
      } catch (e: any) {
        toast.error(e.message);
        return;
      }
    }
    setStep(3);
  };

  const handleGenerationComplete = async (cases: Partial<AutonomousTestCase>[]) => {
    if (!createdProject) return;
    try {
      const saved = await saveTestCases.mutateAsync({
        autonomous_project_id: createdProject.id,
        cases,
      });
      setGeneratedCases(saved);
      await updateProject.mutateAsync({ id: createdProject.id, status: "ready" });
      setStep(4);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleFinish = () => {
    if (createdProject) {
      onComplete(createdProject);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Autonomous Tests</h1>
            <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length}</p>
          </div>
        </div>

        <WizardProgress steps={STEPS} currentStep={step} />

        {step === 0 && (
          <StepGetStarted
            testName={testName}
            setTestName={setTestName}
            baseUrl={baseUrl}
            setBaseUrl={setBaseUrl}
            onNext={handleStep1Next}
            isLoading={createProject.isPending}
          />
        )}

        {step === 1 && (
          <StepBackendApis
            apis={apis}
            setApis={setApis}
            onNext={handleStep2Next}
            onSkip={() => setStep(2)}
            onBack={() => setStep(0)}
            isLoading={addApis.isPending}
          />
        )}

        {step === 2 && (
          <StepFrontendUrls
            urls={urls}
            setUrls={setUrls}
            onNext={handleStep3Next}
            onSkip={() => setStep(3)}
            onBack={() => setStep(1)}
            isLoading={addUrls.isPending}
          />
        )}

        {step === 3 && (
          <StepGenerating
            baseUrl={baseUrl}
            apis={apis}
            urls={urls}
            onComplete={handleGenerationComplete}
          />
        )}

        {step === 4 && (
          <StepSummary
            urlCount={urls.length}
            apiCount={apis.length}
            testCaseCount={generatedCases.length}
            onNext={() => setStep(5)}
          />
        )}

        {step === 5 && (
          <StepDraftPlan
            testCases={generatedCases}
            onBack={() => setStep(4)}
            onFinish={handleFinish}
          />
        )}
      </div>
    </AppLayout>
  );
}
