import { cn } from "@/lib/utils";

interface HealthProgressBarProps {
  percentage: number;
  totalExecuted: number;
  className?: string;
}

export function HealthProgressBar({ percentage, totalExecuted, className }: HealthProgressBarProps) {
  if (totalExecuted === 0) {
    return <span className="text-xs text-muted-foreground">No tests run</span>;
  }

  const getHealthColorClass = (pct: number) => {
    if (pct >= 70) return "bg-green-500";
    if (pct >= 40) return "bg-yellow-500";
    return "bg-destructive";
  };

  const getTextColorClass = (pct: number) => {
    if (pct >= 70) return "text-green-600 dark:text-green-400";
    if (pct >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-destructive";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 max-w-[120px] h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all", getHealthColorClass(percentage))}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={cn("text-xs font-medium", getTextColorClass(percentage))}>
        {percentage}%
      </span>
    </div>
  );
}
