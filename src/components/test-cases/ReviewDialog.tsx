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
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
 import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
 
 interface ReviewDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   testCaseTitle: string;
   onSubmit: (decision: "approved" | "changes_required", comments: string) => Promise<void>;
   isSubmitting?: boolean;
 }
 
 export function ReviewDialog({
   open,
   onOpenChange,
   testCaseTitle,
   onSubmit,
   isSubmitting,
 }: ReviewDialogProps) {
   const [decision, setDecision] = useState<"approved" | "changes_required">("approved");
   const [comments, setComments] = useState("");
 
   const handleSubmit = async () => {
     if (decision === "changes_required" && !comments.trim()) {
       return; // Comments are required for changes_required
     }
     await onSubmit(decision, comments);
     setDecision("approved");
     setComments("");
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent>
         <DialogHeader>
           <DialogTitle>Submit Review</DialogTitle>
           <DialogDescription>
             Review test case: <strong>{testCaseTitle}</strong>
           </DialogDescription>
         </DialogHeader>
 
         <div className="space-y-4 py-4">
           <div className="space-y-3">
             <Label>Decision</Label>
             <RadioGroup
               value={decision}
               onValueChange={(v) => setDecision(v as "approved" | "changes_required")}
               className="grid grid-cols-2 gap-4"
             >
               <div className="flex items-center space-x-2">
                 <RadioGroupItem value="approved" id="approved" />
                 <Label htmlFor="approved" className="flex items-center gap-2 cursor-pointer">
                   <CheckCircle className="h-4 w-4 text-chart-1" />
                   Approve
                 </Label>
               </div>
               <div className="flex items-center space-x-2">
                 <RadioGroupItem value="changes_required" id="changes_required" />
                 <Label htmlFor="changes_required" className="flex items-center gap-2 cursor-pointer">
                   <AlertTriangle className="h-4 w-4 text-chart-4" />
                   Request Changes
                 </Label>
               </div>
             </RadioGroup>
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="comments">
               Comments {decision === "changes_required" && <span className="text-destructive">*</span>}
             </Label>
             <Textarea
               id="comments"
               value={comments}
               onChange={(e) => setComments(e.target.value)}
               placeholder={
                 decision === "approved"
                   ? "Optional feedback for the author"
                   : "Describe what changes are required (required)"
               }
               rows={4}
             />
             {decision === "changes_required" && !comments.trim() && (
               <p className="text-xs text-destructive">
                 Comments are required when requesting changes
               </p>
             )}
           </div>
         </div>
 
         <DialogFooter>
           <Button variant="outline" onClick={() => onOpenChange(false)}>
             Cancel
           </Button>
           <Button
             onClick={handleSubmit}
             disabled={isSubmitting || (decision === "changes_required" && !comments.trim())}
           >
             {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
             Submit Review
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }