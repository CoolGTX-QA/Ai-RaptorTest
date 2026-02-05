 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 import { useEffect } from "react";
 
 export interface Notification {
   id: string;
   user_id: string;
   workspace_id: string | null;
   project_id: string | null;
   type: string;
   title: string;
   message: string;
   entity_type: string | null;
   entity_id: string | null;
   is_read: boolean;
   created_at: string;
 }
 
 export function useNotifications() {
   const { user } = useAuth();
   const queryClient = useQueryClient();
 
   const notificationsQuery = useQuery({
     queryKey: ["notifications", user?.id],
     queryFn: async () => {
       if (!user) return [];
 
       const { data, error } = await supabase
         .from("notifications")
         .select("*")
         .eq("user_id", user.id)
         .order("created_at", { ascending: false })
         .limit(50);
 
       if (error) throw error;
       return data as Notification[];
     },
     enabled: !!user,
   });
 
   // Subscribe to realtime updates
   useEffect(() => {
     if (!user) return;
 
     const channel = supabase
       .channel(`notifications-${user.id}`)
       .on(
         "postgres_changes",
         {
           event: "INSERT",
           schema: "public",
           table: "notifications",
           filter: `user_id=eq.${user.id}`,
         },
         () => {
           queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
         }
       )
       .subscribe();
 
     return () => {
       supabase.removeChannel(channel);
     };
   }, [user, queryClient]);
 
   const markAsRead = useMutation({
     mutationFn: async (notificationId: string) => {
       const { error } = await supabase
         .from("notifications")
         .update({ is_read: true })
         .eq("id", notificationId);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["notifications"] });
     },
   });
 
   const markAllAsRead = useMutation({
     mutationFn: async () => {
       if (!user) return;
 
       const { error } = await supabase
         .from("notifications")
         .update({ is_read: true })
         .eq("user_id", user.id)
         .eq("is_read", false);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["notifications"] });
     },
   });
 
   const deleteNotification = useMutation({
     mutationFn: async (notificationId: string) => {
       const { error } = await supabase
         .from("notifications")
         .delete()
         .eq("id", notificationId);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["notifications"] });
     },
   });
 
   const unreadCount = notificationsQuery.data?.filter((n) => !n.is_read).length || 0;
 
   return {
     notifications: notificationsQuery.data || [],
     unreadCount,
     isLoading: notificationsQuery.isLoading,
     markAsRead,
     markAllAsRead,
     deleteNotification,
     refetch: notificationsQuery.refetch,
   };
 }
 
 // Helper to create notifications (for use in mutations)
 export async function createNotification({
   userId,
   workspaceId,
   projectId,
   type,
   title,
   message,
   entityType,
   entityId,
 }: {
   userId: string;
   workspaceId?: string;
   projectId?: string;
   type: string;
   title: string;
   message: string;
   entityType?: string;
   entityId?: string;
 }) {
   const { error } = await supabase.from("notifications").insert({
     user_id: userId,
     workspace_id: workspaceId || null,
     project_id: projectId || null,
     type,
     title,
     message,
     entity_type: entityType || null,
     entity_id: entityId || null,
   });
 
   if (error) {
     console.error("Failed to create notification:", error);
   }
 }