import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  status: string;
  workspace_id?: string;
}

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdated: () => void;
  workspaceId?: string;
}

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
  onProjectUpdated,
  workspaceId,
}: EditProjectDialogProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo_url: "",
    status: "active",
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        logo_url: project.logo_url || "",
        status: project.status || "active",
      });
    }
  }, [project]);

  const handleSave = async () => {
    if (!project || !formData.name.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          logo_url: formData.logo_url || null,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id);

      if (error) throw error;

      toast({
        title: "Project updated",
        description: `"${formData.name.trim()}" has been updated successfully.`,
      });

      onProjectUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update project",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update project details and settings
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Logo Upload */}
          <div className="flex flex-col items-center gap-4">
            <Label>Project Logo</Label>
            <ImageUpload
              bucket="project-logos"
              currentImageUrl={formData.logo_url || null}
              onImageUploaded={(url) => setFormData({ ...formData, logo_url: url })}
              onImageRemoved={() => setFormData({ ...formData, logo_url: "" })}
              folder={workspaceId || project.workspace_id}
              placeholder={formData.name.substring(0, 2).toUpperCase() || "P"}
              shape="rounded"
              size="lg"
            />
            <p className="text-xs text-muted-foreground">
              Click to upload or change logo
            </p>
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-project-name">Project Name</Label>
            <Input
              id="edit-project-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Project name"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-project-description">Description</Label>
            <Textarea
              id="edit-project-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Project description..."
              rows={3}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="edit-project-status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !formData.name.trim()}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
