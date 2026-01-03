import { Badge } from "@/components/ui/badge";
import { Crown, ShieldCheck, UserCog, Eye } from "lucide-react";
import { AppRole, ROLE_CONFIGS } from "@/hooks/useRBAC";

const ROLE_ICONS: Record<AppRole, typeof Crown> = {
  admin: Crown,
  manager: ShieldCheck,
  tester: UserCog,
  viewer: Eye,
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: "bg-destructive text-destructive-foreground",
  manager: "bg-primary text-primary-foreground",
  tester: "bg-secondary text-secondary-foreground",
  viewer: "bg-muted text-muted-foreground",
};

interface RoleBadgeProps {
  role: AppRole;
  showIcon?: boolean;
  size?: "sm" | "default";
}

export function RoleBadge({ role, showIcon = true, size = "default" }: RoleBadgeProps) {
  const Icon = ROLE_ICONS[role];
  const config = ROLE_CONFIGS[role];

  return (
    <Badge className={`${ROLE_COLORS[role]} ${size === "sm" ? "text-xs px-2 py-0.5" : ""}`}>
      {showIcon && <Icon className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />}
      {config.displayName}
    </Badge>
  );
}
