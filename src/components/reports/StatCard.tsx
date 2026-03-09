import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  descriptionClassName?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  descriptionClassName,
}: StatCardProps) {
  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className={cn("h-4 w-4 text-muted-foreground", iconClassName)} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className={cn("text-xs text-muted-foreground", descriptionClassName)}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
