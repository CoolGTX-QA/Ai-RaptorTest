import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props {
  steps: string[];
  currentStep: number;
}

export function WizardProgress({ steps, currentStep }: Props) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors",
                i < currentStep
                  ? "bg-primary border-primary text-primary-foreground"
                  : i === currentStep
                  ? "border-primary text-primary bg-transparent"
                  : "border-muted text-muted-foreground bg-transparent"
              )}
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn(
              "text-[10px] mt-1 text-center leading-tight",
              i <= currentStep ? "text-foreground" : "text-muted-foreground"
            )}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn(
              "h-0.5 flex-1 mx-1 mt-[-16px]",
              i < currentStep ? "bg-primary" : "bg-muted"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}
