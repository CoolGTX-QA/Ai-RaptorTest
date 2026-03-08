import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface HealthProgressBarProps {
  percentage: number;
  totalExecuted: number;
  className?: string;
}

export function HealthProgressBar({ percentage, totalExecuted, className }: HealthProgressBarProps) {
  const hasData = totalExecuted > 0;
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(hasData ? percentage : 0);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage, hasData]);

  const getBarGradient = (pct: number) => {
    if (pct >= 70) return "from-emerald-400 to-green-500";
    if (pct >= 40) return "from-amber-400 to-yellow-500";
    return "from-red-400 to-destructive";
  };

  const getGlowColor = (pct: number) => {
    if (pct >= 70) return "shadow-[0_0_8px_rgba(34,197,94,0.4)]";
    if (pct >= 40) return "shadow-[0_0_8px_rgba(234,179,8,0.4)]";
    return "shadow-[0_0_8px_rgba(239,68,68,0.4)]";
  };

  const getTextColorClass = (pct: number) => {
    if (pct >= 70) return "text-green-600 dark:text-green-400";
    if (pct >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-destructive";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-[11px] font-medium text-muted-foreground shrink-0 tracking-wide uppercase">
        Project Health
      </span>
      <div className={cn(
        "flex-1 max-w-[140px] h-[10px] bg-muted/60 rounded-full overflow-hidden backdrop-blur-sm border border-border/30",
        hasData && animatedWidth > 0 && getGlowColor(percentage)
      )}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r relative",
            hasData ? getBarGradient(percentage) : "bg-muted"
          )}
          style={{ width: `${animatedWidth}%` }}
        >
          {hasData && animatedWidth > 0 && (
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-pulse" />
            </div>
          )}
        </div>
      </div>
      <span className={cn(
        "text-xs font-semibold tabular-nums transition-colors",
        hasData ? getTextColorClass(percentage) : "text-muted-foreground"
      )}>
        {percentage}%
      </span>
    </div>
  );
}
