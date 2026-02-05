 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 import { useToast } from "@/hooks/use-toast";
 
 export interface TestCaseReview {
   id: string;
   test_case_id: string;
   reviewer_id: string;
   assigned_by: string;
   version_reviewed: number;
   status: "pending" | "in_progress" | "approved" | "changes_required";
   comments: string | null;
   reviewed_at: string | null;
   created_at: string;
   updated_at: string;
   reviewer?: { full_name: string | null; email: string } | null;
   assigner?: { full_name: string | null; email: string } | null;
 }
 
 export interface ReviewComment {
   id: string;
   review_id: string;
   author_id: string;
   content: string;
   created_at: string;
   author?: { full_name: string | null; email: string } | null;
 }
 
 export function useTestCaseReviews(testCaseId?: string) {
   const { user } = useAuth();
   const { toast } = useToast();
   const queryClient = useQueryClient();
 
   const reviewsQuery = useQuery({
     queryKey: ["test-case-reviews", testCaseId],
     queryFn: async () => {
       if (!testCaseId) return [];
 
       const { data, error } = await supabase
         .from("test_case_reviews")
         .select("*")
         .eq("test_case_id", testCaseId)
         .order("created_at", { ascending: false });
 
       if (error) throw error;
 
       // Fetch reviewer info
       const userIds = [...new Set([
         ...data.map((r) => r.reviewer_id),
         ...data.map((r) => r.assigned_by),
       ])];
 
       const { data: profiles } = await supabase
         .from("profiles")
         .select("id, full_name, email")
         .in("id", userIds);
 
       const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
 
       return data.map((r) => ({
         ...r,
         reviewer: profileMap.get(r.reviewer_id) || null,
         assigner: profileMap.get(r.assigned_by) || null,
       })) as TestCaseReview[];
     },
     enabled: !!user && !!testCaseId,
   });
 
   const assignReviewer = useMutation({
     mutationFn: async ({
       testCaseId,
       reviewerId,
       version,
     }: {
       testCaseId: string;
       reviewerId: string;
       version: number;
     }) => {
       if (!user) throw new Error("Not authenticated");
 
       // Create review record
       const { data, error } = await supabase
         .from("test_case_reviews")
         .insert({
           test_case_id: testCaseId,
           reviewer_id: reviewerId,
           assigned_by: user.id,
           version_reviewed: version,
           status: "pending",
         })
         .select()
         .single();
 
       if (error) throw error;
 
       // Update test case status to in_review
       await supabase
         .from("test_cases")
         .update({
           status: "in_review",
           assigned_reviewer: reviewerId,
         })
         .eq("id", testCaseId);
 
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["test-case-reviews"] });
       queryClient.invalidateQueries({ queryKey: ["test-cases"] });
       toast({ title: "Reviewer assigned", description: "The test case has been assigned for review." });
     },
     onError: (error) => {
       toast({ title: "Error", description: error.message, variant: "destructive" });
     },
   });
 
   const submitReview = useMutation({
     mutationFn: async ({
       reviewId,
       status,
       comments,
     }: {
       reviewId: string;
       status: "approved" | "changes_required";
       comments?: string;
     }) => {
       if (!user) throw new Error("Not authenticated");
 
       // Update review
       const { data: review, error } = await supabase
         .from("test_case_reviews")
         .update({
           status,
           comments,
           reviewed_at: new Date().toISOString(),
         })
         .eq("id", reviewId)
         .select()
         .single();
 
       if (error) throw error;
 
       // Update test case status based on review result
       const newStatus = status === "approved" ? "reviewed" : "changes_required";
       await supabase
         .from("test_cases")
         .update({
           status: newStatus,
           reviewed_by: user.id,
           reviewed_at: new Date().toISOString(),
         })
         .eq("id", review.test_case_id);
 
       return review;
     },
     onSuccess: (_, variables) => {
       queryClient.invalidateQueries({ queryKey: ["test-case-reviews"] });
       queryClient.invalidateQueries({ queryKey: ["test-cases"] });
       const message = variables.status === "approved" 
         ? "Test case has been approved." 
         : "Changes have been requested.";
       toast({ title: "Review submitted", description: message });
     },
     onError: (error) => {
       toast({ title: "Error", description: error.message, variant: "destructive" });
     },
   });
 
   const addComment = useMutation({
     mutationFn: async ({
       reviewId,
       content,
     }: {
       reviewId: string;
       content: string;
     }) => {
       if (!user) throw new Error("Not authenticated");
 
       const { data, error } = await supabase
         .from("review_comments")
         .insert({
           review_id: reviewId,
           author_id: user.id,
           content,
         })
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["review-comments"] });
       toast({ title: "Comment added" });
     },
     onError: (error) => {
       toast({ title: "Error", description: error.message, variant: "destructive" });
     },
   });
 
   return {
     reviews: reviewsQuery.data || [],
     isLoading: reviewsQuery.isLoading,
     assignReviewer,
     submitReview,
     addComment,
     refetch: reviewsQuery.refetch,
   };
 }
 
 export function useReviewComments(reviewId?: string) {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ["review-comments", reviewId],
     queryFn: async () => {
       if (!reviewId) return [];
 
       const { data, error } = await supabase
         .from("review_comments")
         .select("*")
         .eq("review_id", reviewId)
         .order("created_at", { ascending: true });
 
       if (error) throw error;
 
       const userIds = [...new Set(data.map((c) => c.author_id))];
       const { data: profiles } = await supabase
         .from("profiles")
         .select("id, full_name, email")
         .in("id", userIds);
 
       const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
 
       return data.map((c) => ({
         ...c,
         author: profileMap.get(c.author_id) || null,
       })) as ReviewComment[];
     },
     enabled: !!user && !!reviewId,
   });
 }