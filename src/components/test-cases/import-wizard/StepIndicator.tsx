import { cn } from "@/lib/utils";
import { Check, Upload, GitMerge, Eye } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { number: 1, title: "Upload CSV", icon: Upload },
  { number: 2, title: "Map Fields", icon: GitMerge },
  { number: 3, title: "Preview & Import", icon: Eye },
];

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 pb-4">
      {steps.slice(0, totalSteps).map((step, index) => {
        const Icon = step.icon;
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isActive && "border-primary bg-background text-primary",
                  !isCompleted && !isActive && "border-muted bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  "mt-1.5 text-xs font-medium",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 w-12 transition-colors",
                  currentStep > step.number ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
