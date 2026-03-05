import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Globe } from "lucide-react";
import { UrlEntry } from "../AutonomousWizard";

interface Props {
  urls: UrlEntry[];
  setUrls: (v: UrlEntry[]) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const emptyUrl = (): UrlEntry => ({
  url_name: "",
  start_url: "",
  login_email: "",
  login_password: "",
  extra_instructions: "",
});

export function StepFrontendUrls({ urls, setUrls, onNext, onSkip, onBack, isLoading }: Props) {
  const addUrl = () => setUrls([...urls, emptyUrl()]);
  const removeUrl = (i: number) => setUrls(urls.filter((_, idx) => idx !== i));
  const updateUrl = (i: number, field: keyof UrlEntry, value: string) => {
    const updated = [...urls];
    (updated[i] as any)[field] = value;
    setUrls(updated);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Add Your URLs for Testing</CardTitle>
            <CardDescription>Configure frontend pages to test</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {urls.map((url, i) => (
          <Card key={i} className="border-dashed">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">URL #{i + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => removeUrl(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>URL Name</Label>
                  <Input placeholder="Homepage" value={url.url_name} onChange={(e) => updateUrl(i, "url_name", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Starting URL</Label>
                  <Input placeholder="https://example.com" value={url.start_url} onChange={(e) => updateUrl(i, "start_url", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Login Email (optional)</Label>
                  <Input placeholder="test@example.com" value={url.login_email} onChange={(e) => updateUrl(i, "login_email", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Login Password (optional)</Label>
                  <Input type="password" placeholder="••••••••" value={url.login_password} onChange={(e) => updateUrl(i, "login_password", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Extra Testing Instructions</Label>
                <Textarea placeholder="Any special instructions..." value={url.extra_instructions} onChange={(e) => updateUrl(i, "extra_instructions", e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" onClick={addUrl} className="w-full">
          <Plus className="h-4 w-4 mr-2" /> Add URL
        </Button>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onSkip}>Skip Frontend Testing</Button>
            <Button onClick={onNext} disabled={isLoading}>
              {isLoading ? "Saving..." : "Next"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
