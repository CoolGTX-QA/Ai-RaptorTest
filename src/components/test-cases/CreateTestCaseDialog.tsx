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
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { Plus, Trash2, Loader2 } from "lucide-react";
 
 interface TestStep {
   action: string;
   expected: string;
 }
 
 interface CreateTestCaseDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onSubmit: (data: {
     title: string;
     description: string;
     priority: string;
     test_type: string;
     preconditions: string;
     expected_result: string;
     steps: TestStep[];
     folder_id?: string;
   }) => Promise<void>;
   isSubmitting?: boolean;
   selectedFolderId?: string | null;
 }
 
 export function CreateTestCaseDialog({
   open,
   onOpenChange,
   onSubmit,
   isSubmitting,
   selectedFolderId,
 }: CreateTestCaseDialogProps) {
   const [title, setTitle] = useState("");
   const [description, setDescription] = useState("");
   const [priority, setPriority] = useState("medium");
   const [testType, setTestType] = useState("manual");
   const [preconditions, setPreconditions] = useState("");
   const [expectedResult, setExpectedResult] = useState("");
   const [steps, setSteps] = useState<TestStep[]>([{ action: "", expected: "" }]);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     await onSubmit({
       title,
       description,
       priority,
       test_type: testType,
       preconditions,
       expected_result: expectedResult,
       steps: steps.filter((s) => s.action.trim()),
       folder_id: selectedFolderId || undefined,
     });
     // Reset form
     setTitle("");
     setDescription("");
     setPriority("medium");
     setTestType("manual");
     setPreconditions("");
     setExpectedResult("");
     setSteps([{ action: "", expected: "" }]);
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
     if (steps.length > 1) {
       setSteps(steps.filter((_, i) => i !== index));
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
         <form onSubmit={handleSubmit}>
           <DialogHeader>
             <DialogTitle>Create New Test Case</DialogTitle>
             <DialogDescription>
               Create a comprehensive test case with steps and expected results
             </DialogDescription>
           </DialogHeader>
 
           <div className="grid gap-4 py-4">
             <div className="grid gap-2">
               <Label htmlFor="title">Title *</Label>
               <Input
                 id="title"
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 placeholder="Enter a descriptive title"
                 required
               />
             </div>
 
             <div className="grid gap-2">
               <Label htmlFor="description">Description</Label>
               <Textarea
                 id="description"
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 placeholder="Describe the purpose of this test case"
                 rows={2}
               />
             </div>
 
             <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label>Priority</Label>
                 <Select value={priority} onValueChange={setPriority}>
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
                 <Select value={testType} onValueChange={setTestType}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="manual">Manual</SelectItem>
                     <SelectItem value="automated">Automated</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
 
             <div className="grid gap-2">
               <Label htmlFor="preconditions">Preconditions</Label>
               <Textarea
                 id="preconditions"
                 value={preconditions}
                 onChange={(e) => setPreconditions(e.target.value)}
                 placeholder="Any setup required before running this test"
                 rows={2}
               />
             </div>
 
             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <Label>Test Steps</Label>
                 <Button type="button" variant="outline" size="sm" onClick={addStep}>
                   <Plus className="h-4 w-4 mr-1" />
                   Add Step
                 </Button>
               </div>
 
               {steps.map((step, index) => (
                 <div key={index} className="border rounded-lg p-3 space-y-2">
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-medium">Step {index + 1}</span>
                     {steps.length > 1 && (
                       <Button
                         type="button"
                         variant="ghost"
                         size="icon"
                         className="h-6 w-6"
                         onClick={() => removeStep(index)}
                       >
                         <Trash2 className="h-3 w-3 text-destructive" />
                       </Button>
                     )}
                   </div>
                   <Input
                     placeholder="Action to perform"
                     value={step.action}
                     onChange={(e) => updateStep(index, "action", e.target.value)}
                   />
                   <Input
                     placeholder="Expected result"
                     value={step.expected}
                     onChange={(e) => updateStep(index, "expected", e.target.value)}
                   />
                 </div>
               ))}
             </div>
 
             <div className="grid gap-2">
               <Label htmlFor="expected_result">Overall Expected Result</Label>
               <Textarea
                 id="expected_result"
                 value={expectedResult}
                 onChange={(e) => setExpectedResult(e.target.value)}
                 placeholder="The expected outcome when all steps pass"
                 rows={2}
               />
             </div>
           </div>
 
           <DialogFooter>
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
               Cancel
             </Button>
             <Button type="submit" disabled={isSubmitting || !title.trim()}>
               {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
               Create Test Case
             </Button>
           </DialogFooter>
         </form>
       </DialogContent>
     </Dialog>
   );
 }