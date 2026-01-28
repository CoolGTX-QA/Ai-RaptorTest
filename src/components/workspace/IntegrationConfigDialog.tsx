import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, Sparkles } from "lucide-react";

type IntegrationType = "jira" | "clickup" | "linear" | "raptorassist";

interface IntegrationConfig {
  [key: string]: string;
}

interface IntegrationConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrationType: IntegrationType | null;
  onSave: (config: IntegrationConfig) => Promise<void>;
  existingConfig?: IntegrationConfig;
}

const integrationDetails: Record<IntegrationType, {
  title: string;
  description: string;
  fields: { key: string; label: string; placeholder: string; type: "text" | "password" | "email" }[];
  logo: React.ReactNode;
}> = {
  jira: {
    title: "Configure Jira Integration",
    description: "Connect to your Atlassian Jira instance to sync defects and requirements.",
    fields: [
      { key: "site_url", label: "Jira Site URL", placeholder: "https://your-company.atlassian.net", type: "text" },
      { key: "email", label: "Email", placeholder: "your-email@company.com", type: "email" },
      { key: "api_token", label: "API Token", placeholder: "Enter your Jira API token", type: "password" },
    ],
    logo: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
        <path d="M11.571 11.429L0 0h11.429a12 12 0 0 1 0 22.857l-.857-.857 1.285-1.286a9.43 9.43 0 0 0 0-13.285L11.571 11.429z" fill="#2684FF"/>
        <path d="M12.429 12.571L24 24H12.571a12 12 0 0 1 0-22.857l.857.857-1.285 1.286a9.43 9.43 0 0 0 0 13.285l.286.286z" fill="#2684FF"/>
      </svg>
    ),
  },
  clickup: {
    title: "Configure ClickUp Integration",
    description: "Connect to ClickUp to sync tasks and project management.",
    fields: [
      { key: "api_token", label: "API Token", placeholder: "Enter your ClickUp API token", type: "password" },
      { key: "workspace_id", label: "Workspace ID (Optional)", placeholder: "Enter ClickUp workspace ID", type: "text" },
    ],
    logo: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
        <path d="M4.105 17.468l2.642-2.021a5.413 5.413 0 0 0 4.253 2.07 5.413 5.413 0 0 0 4.253-2.07l2.642 2.02C16.197 19.63 13.858 21 11 21c-2.858 0-5.197-1.37-6.895-3.532z" fill="#8930FD"/>
        <path d="M11 6.333l-5.294 4.32 2.103 2.575L11 10.772l3.191 2.456 2.103-2.574L11 6.333z" fill="#FF02F0"/>
        <path d="M11 3l7.895 6.445-2.103 2.574L11 7.563 5.208 12.02l-2.103-2.575L11 3z" fill="#FFD803"/>
      </svg>
    ),
  },
  linear: {
    title: "Configure Linear Integration",
    description: "Connect to Linear for issue tracking and project management.",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "Enter your Linear API key", type: "password" },
      { key: "team_id", label: "Team ID (Optional)", placeholder: "Enter Linear team ID", type: "text" },
    ],
    logo: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
        <path d="M3.185 12.808l8.007 8.007a9.082 9.082 0 0 1-8.007-8.007z" fill="#5E6AD2"/>
        <path d="M3 11.118a9.092 9.092 0 0 1 2.665-5.453 9.092 9.092 0 0 1 5.453-2.665l9.882 9.882a9.092 9.092 0 0 1-2.665 5.453 9.092 9.092 0 0 1-5.453 2.665L3 11.118z" fill="#5E6AD2"/>
        <path d="M12.808 3.185a9.082 9.082 0 0 1 8.007 8.007l-8.007-8.007z" fill="#5E6AD2"/>
      </svg>
    ),
  },
  raptorassist: {
    title: "Configure RaptorAssist Integration",
    description: "Connect to RaptorAssist AI for enhanced testing capabilities.",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "Enter your RaptorAssist API key", type: "password" },
      { key: "endpoint", label: "Endpoint URL (Optional)", placeholder: "https://api.raptorassist.com", type: "text" },
    ],
    logo: (
      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
        <Sparkles className="h-5 w-5 text-primary-foreground" />
      </div>
    ),
  },
};

export function IntegrationConfigDialog({
  open,
  onOpenChange,
  integrationType,
  onSave,
  existingConfig = {},
}: IntegrationConfigDialogProps) {
  const [config, setConfig] = useState<IntegrationConfig>(existingConfig);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  if (!integrationType) return null;

  const details = integrationDetails[integrationType];

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(config);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfig(existingConfig);
      setShowPasswords({});
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {details.logo}
            <DialogTitle>{details.title}</DialogTitle>
          </div>
          <DialogDescription>{details.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {details.fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <div className="relative">
                <Input
                  id={field.key}
                  type={field.type === "password" && !showPasswords[field.key] ? "password" : field.type === "password" ? "text" : field.type}
                  placeholder={field.placeholder}
                  value={config[field.key] || ""}
                  onChange={(e) => setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                />
                {field.type === "password" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => togglePasswordVisibility(field.key)}
                  >
                    {showPasswords[field.key] ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
