import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  height?: string;
}

export function ChartCard({
  title,
  description,
  children,
  height = "h-[300px]",
}: ChartCardProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className={height}>{children}</div>
      </CardContent>
    </Card>
  );
}
