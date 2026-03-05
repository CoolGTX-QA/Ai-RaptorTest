import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Server } from "lucide-react";
import { ApiEntry } from "../AutonomousWizard";

interface Props {
  apis: ApiEntry[];
  setApis: (v: ApiEntry[]) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const emptyApi = (): ApiEntry => ({
  api_name: "",
  endpoint_url: "",
  auth_type: "none",
  auth_config: {},
  extra_info: "",
});

const AUTH_TYPES = [
  { value: "none", label: "None" },
  { value: "bearer", label: "Bearer Token" },
  { value: "api_key", label: "API Key" },
  { value: "oauth", label: "OAuth" },
  { value: "basic", label: "Basic Auth" },
];

export function StepBackendApis({ apis, setApis, onNext, onSkip, onBack, isLoading }: Props) {
  const addApi = () => setApis([...apis, emptyApi()]);
  const removeApi = (i: number) => setApis(apis.filter((_, idx) => idx !== i));
  const updateApi = (i: number, field: keyof ApiEntry, value: any) => {
    const updated = [...apis];
    (updated[i] as any)[field] = value;
    setApis(updated);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Server className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Add Your APIs for Testing</CardTitle>
            <CardDescription>Configure backend API endpoints to test (optional)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {apis.map((api, i) => (
          <Card key={i} className="border-dashed">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">API #{i + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => removeApi(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>API Name</Label>
                  <Input placeholder="User API" value={api.api_name} onChange={(e) => updateApi(i, "api_name", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Endpoint URL</Label>
                  <Input placeholder="https://api.example.com/v1" value={api.endpoint_url} onChange={(e) => updateApi(i, "endpoint_url", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Authentication Type</Label>
                <Select value={api.auth_type} onValueChange={(v) => updateApi(i, "auth_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AUTH_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Extra Testing Information</Label>
                <Textarea placeholder="Any special instructions..." value={api.extra_info} onChange={(e) => updateApi(i, "extra_info", e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" onClick={addApi} className="w-full">
          <Plus className="h-4 w-4 mr-2" /> Add API
        </Button>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onSkip}>Skip Backend Testing</Button>
            <Button onClick={onNext} disabled={isLoading}>
              {isLoading ? "Saving..." : "Next"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
