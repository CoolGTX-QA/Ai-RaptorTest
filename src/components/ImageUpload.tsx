import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  bucket: "avatars" | "workspace-icons" | "project-logos";
  currentImageUrl?: string | null;
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  folder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  shape?: "circle" | "rounded";
}

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-24 w-24",
};

export function ImageUpload({
  bucket,
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  folder,
  className,
  size = "md",
  placeholder = "?",
  shape = "circle",
}: ImageUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onImageUploaded(urlData.publicUrl);

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative">
        <Avatar
          className={cn(
            sizeClasses[size],
            shape === "rounded" && "rounded-lg"
          )}
        >
          <AvatarImage src={currentImageUrl || undefined} alt="Upload preview" />
          <AvatarFallback className={shape === "rounded" ? "rounded-lg" : undefined}>
            {placeholder}
          </AvatarFallback>
        </Avatar>
        {currentImageUrl && onImageRemoved && (
          <button
            onClick={handleRemoveImage}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
            type="button"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {currentImageUrl ? "Change" : "Upload"}
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, GIF up to 5MB
        </p>
        <p className="text-xs text-muted-foreground">
          Note: Images may be publicly accessible via URL. Avoid uploading sensitive content.
        </p>
      </div>
    </div>
  );
}
