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
 import { Textarea } from "@/components/ui/textarea";
 import { Badge } from "@/components/ui/badge";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Separator } from "@/components/ui/separator";
 import {
   Plus,
   Trash2,
   Loader2,
   Lock,
   History,
   MessageSquare,
   Send,
   User,
   Calendar,
 } from "lucide-react";
 import { TestCaseStatusBadge, getNextStatuses, TEST_CASE_STATUSES } from "./TestCaseStatusBadge";
 import { format } from "date-fns";
 import { cn } from "@/lib/utils";
 
 interface TestStep {
   action: string;
   expected: string;
 }
 
 interface TestCase {
   id: string;
   title: string;
   description?: string | null;
   preconditions?: string | null;
   expected_result?: string | null;
   steps?: TestStep[] | null;
   priority: string;
   status: string;
   test_type?: string;
   tags?: string[] | null;
   version?: number;
   is_locked?: boolean;
   created_by: string;
   created_at: string;
   updated_at: string;
   folder_id?: string | null;
   created_by_profile?: { full_name: string | null; email: string } | null;
 }
 
 interface TestCaseDetailDialogProps {
   testCase: TestCase | null;
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onUpdate: (data: Partial<TestCase>) => Promise<void>;
   onSubmitForReview: () => void;
   isUpdating?: boolean;
   isReadOnly?: boolean;
   workspaceMembers?: Array<{ id: string; user_id: string; profile?: { full_name: string | null; email: string } }>;
   onAssignReviewer?: (reviewerId: string) => void;
   reviews?: Array<{
     id: string;
     status: string;
     comments: string | null;
     reviewed_at: string | null;
     reviewer?: { full_name: string | null; email: string } | null;
   }>;
   versions?: Array<{
     version: number;
     title: string;
     created_at: string;
     change_summary: string | null;
     created_by_profile?: { full_name: string | null; email: string } | null;
   }>;
 }
 
 export function TestCaseDetailDialog({
   testCase,
   open,
   onOpenChange,
   onUpdate,
   onSubmitForReview,
   isUpdating,
   isReadOnly,
   workspaceMembers = [],
   onAssignReviewer,
   reviews = [],
   versions = [],
 }: TestCaseDetailDialogProps) {
   const [activeTab, setActiveTab] = useState("details");
   const [editedData, setEditedData] = useState<Partial<TestCase>>({});
   const [steps, setSteps] = useState<TestStep[]>([]);
 
   // Initialize data when test case changes
   useState(() => {
     if (testCase) {
       setEditedData({});
       setSteps(Array.isArray(testCase.steps) ? testCase.steps : []);
     }
   });
 
   if (!testCase) return null;
 
   const isLocked = testCase.is_locked;
   const canEdit = !isReadOnly && !isLocked;
   const nextStatuses = getNextStatuses(testCase.status);
 
   const handleSave = async () => {
     await onUpdate({
       ...editedData,
       steps: steps.length > 0 ? steps : undefined,
     });
     setEditedData({});
   };
 
   const addStep = () => {
     setSteps([...steps, { action: "", expected: "" }]);
   };
 
   const updateStep = (index: number, field: "action" | "expected", value: string) => {
     const newSteps = [...steps];
     newSteps[index] = { ...newSteps[index], [field]: value };
     setSteps(newSteps);
   };
 
   const removeStep = (index: number) => {
     setSteps(steps.filter((_, i) => i !== index));
   };
 
   const hasChanges = Object.keys(editedData).length > 0 || 
     JSON.stringify(steps) !== JSON.stringify(testCase.steps || []);
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
         <DialogHeader>
           <div className="flex items-center gap-3">
             <DialogTitle className="flex-1">{testCase.title}</DialogTitle>
             {isLocked && (
               <Badge variant="secondary" className="gap-1">
                 <Lock className="h-3 w-3" />
                 Locked
               </Badge>
             )}
             <TestCaseStatusBadge status={testCase.status} />
           </div>
           <DialogDescription className="flex items-center gap-4 text-sm">
             <span className="flex items-center gap-1">
               <User className="h-3 w-3" />
               {testCase.created_by_profile?.full_name || testCase.created_by_profile?.email || "Unknown"}
             </span>
             <span className="flex items-center gap-1">
               <Calendar className="h-3 w-3" />
               {format(new Date(testCase.created_at), "MMM d, yyyy")}
             </span>
             <span>v{testCase.version || 1}</span>
           </DialogDescription>
         </DialogHeader>
 
         <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
           <TabsList className="grid w-full grid-cols-4">
             <TabsTrigger value="details">Details</TabsTrigger>
             <TabsTrigger value="steps">Test Steps</TabsTrigger>
             <TabsTrigger value="reviews" className="gap-1">
               <MessageSquare className="h-3 w-3" />
               Reviews ({reviews.length})
             </TabsTrigger>
             <TabsTrigger value="history" className="gap-1">
               <History className="h-3 w-3" />
               History ({versions.length})
             </TabsTrigger>
           </TabsList>
 
           <ScrollArea className="flex-1 mt-4">
             <TabsContent value="details" className="m-0 space-y-4">
               <div className="grid gap-4">
                 <div className="grid gap-2">
                   <Label>Title</Label>
                   <Input
                     value={editedData.title ?? testCase.title}
                     onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                     disabled={!canEdit}
                   />
                 </div>
 
                 <div className="grid gap-2">
                   <Label>Description</Label>
                   <Textarea
                     value={editedData.description ?? testCase.description ?? ""}
                     onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                     disabled={!canEdit}
                     rows={3}
                   />
                 </div>
 
                 <div className="grid grid-cols-3 gap-4">
                   <div className="grid gap-2">
                     <Label>Priority</Label>
                     <Select
                       value={editedData.priority ?? testCase.priority}
                       onValueChange={(v) => setEditedData({ ...editedData, priority: v })}
                       disabled={!canEdit}
                     >
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="critical">Critical</SelectItem>
                         <SelectItem value="high">High</SelectItem>
                         <SelectItem value="medium">Medium</SelectItem>
                         <SelectItem value="low">Low</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
 
                   <div className="grid gap-2">
                     <Label>Test Type</Label>
                     <Select
                       value={(editedData.test_type ?? testCase.test_type) || "manual"}
                       onValueChange={(v) => setEditedData({ ...editedData, test_type: v })}
                       disabled={!canEdit}
                     >
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="manual">Manual</SelectItem>
                         <SelectItem value="automated">Automated</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
 
                   <div className="grid gap-2">
                     <Label>Status</Label>
                     <Select
                       value={testCase.status}
                       disabled={true}
                     >
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         {TEST_CASE_STATUSES.map((s) => (
                           <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                 </div>
 
                 <div className="grid gap-2">
                   <Label>Preconditions</Label>
                   <Textarea
                     value={editedData.preconditions ?? testCase.preconditions ?? ""}
                     onChange={(e) => setEditedData({ ...editedData, preconditions: e.target.value })}
                     disabled={!canEdit}
                     rows={2}
                     placeholder="Any preconditions required before executing this test"
                   />
                 </div>
 
                 <div className="grid gap-2">
                   <Label>Expected Result</Label>
                   <Textarea
                     value={editedData.expected_result ?? testCase.expected_result ?? ""}
                     onChange={(e) => setEditedData({ ...editedData, expected_result: e.target.value })}
                     disabled={!canEdit}
                     rows={2}
                     placeholder="Expected outcome of this test case"
                   />
                 </div>
               </div>
             </TabsContent>
 
             <TabsContent value="steps" className="m-0 space-y-4">
               <div className="flex items-center justify-between">
                 <Label>Test Steps</Label>
                 {canEdit && (
                   <Button variant="outline" size="sm" onClick={addStep}>
                     <Plus className="h-4 w-4 mr-1" />
                     Add Step
                   </Button>
                 )}
               </div>
 
               {steps.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground">
                   No test steps defined. Add steps to document the test procedure.
                 </div>
               ) : (
                 <div className="space-y-3">
                   {steps.map((step, index) => (
                     <div key={index} className="border rounded-lg p-4 space-y-3">
                       <div className="flex items-center justify-between">
                         <span className="font-medium text-sm">Step {index + 1}</span>
                         {canEdit && (
                           <Button
                             variant="ghost"
                             size="icon"
                             className="h-6 w-6"
                             onClick={() => removeStep(index)}
                           >
                             <Trash2 className="h-3 w-3 text-destructive" />
                           </Button>
                         )}
                       </div>
                       <div className="grid gap-2">
                         <Label className="text-xs">Action</Label>
                         <Input
                           value={step.action}
                           onChange={(e) => updateStep(index, "action", e.target.value)}
                           disabled={!canEdit}
                           placeholder="Describe the action to perform"
                         />
                       </div>
                       <div className="grid gap-2">
                         <Label className="text-xs">Expected Result</Label>
                         <Input
                           value={step.expected}
                           onChange={(e) => updateStep(index, "expected", e.target.value)}
                           disabled={!canEdit}
                           placeholder="Expected outcome of this step"
                         />
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </TabsContent>
 
             <TabsContent value="reviews" className="m-0 space-y-4">
               {reviews.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground">
                   No reviews yet. Submit for review to start the review process.
                 </div>
               ) : (
                 <div className="space-y-4">
                   {reviews.map((review) => (
                     <div key={review.id} className="border rounded-lg p-4 space-y-2">
                       <div className="flex items-center justify-between">
                         <span className="font-medium">
                           {review.reviewer?.full_name || review.reviewer?.email || "Unknown Reviewer"}
                         </span>
                         <Badge variant="outline">
                           {review.status.replace("_", " ")}
                         </Badge>
                       </div>
                       {review.reviewed_at && (
                         <p className="text-xs text-muted-foreground">
                           Reviewed on {format(new Date(review.reviewed_at), "MMM d, yyyy 'at' h:mm a")}
                         </p>
                       )}
                       {review.comments && (
                         <p className="text-sm mt-2 p-2 bg-muted rounded">
                           {review.comments}
                         </p>
                       )}
                     </div>
                   ))}
                 </div>
               )}
 
               {testCase.status === "submitted_for_review" && onAssignReviewer && (
                 <div className="border-t pt-4">
                   <Label className="mb-2 block">Assign Reviewer</Label>
                   <Select onValueChange={onAssignReviewer}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select a reviewer" />
                     </SelectTrigger>
                     <SelectContent>
                       {workspaceMembers
                         .filter((m) => m.user_id !== testCase.created_by)
                         .map((m) => (
                           <SelectItem key={m.user_id} value={m.user_id}>
                             {m.profile?.full_name || m.profile?.email || m.user_id}
                           </SelectItem>
                         ))}
                     </SelectContent>
                   </Select>
                 </div>
               )}
             </TabsContent>
 
             <TabsContent value="history" className="m-0 space-y-4">
               {versions.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground">
                   No version history. Changes will be tracked after the first update.
                 </div>
               ) : (
                 <div className="space-y-3">
                   {versions.map((version) => (
                     <div key={version.version} className="flex items-start gap-3 p-3 border rounded-lg">
                       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                         v{version.version}
                       </div>
                       <div className="flex-1">
                         <p className="font-medium">{version.title}</p>
                         <p className="text-xs text-muted-foreground">
                           {version.created_by_profile?.full_name || version.created_by_profile?.email} • 
                           {format(new Date(version.created_at), " MMM d, yyyy")}
                         </p>
                         {version.change_summary && (
                           <p className="text-sm text-muted-foreground mt-1">{version.change_summary}</p>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </TabsContent>
           </ScrollArea>
         </Tabs>
 
         <Separator className="my-4" />
 
         <DialogFooter className="flex-shrink-0">
           <div className="flex items-center gap-2 w-full justify-between">
             <div className="flex gap-2">
               {testCase.status === "draft" && !isReadOnly && (
                 <Button variant="secondary" onClick={onSubmitForReview}>
                   <Send className="h-4 w-4 mr-2" />
                   Submit for Review
                 </Button>
               )}
             </div>
             <div className="flex gap-2">
               <Button variant="outline" onClick={() => onOpenChange(false)}>
                 Cancel
               </Button>
               {canEdit && hasChanges && (
                 <Button onClick={handleSave} disabled={isUpdating}>
                   {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                   Save Changes
                 </Button>
               )}
             </div>
           </div>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }