import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCallback } from "react";
import type { Json } from "@/integrations/supabase/types";

export type ActionType = "create" | "update" | "delete" | "execute";
export type EntityType = 
  | "test_case" 
  | "test_run" 
  | "defect" 
  | "project" 
  | "workspace" 
  | "member" 
  | "settings"
  | "test_execution";

interface LogActivityParams {
  actionType: ActionType;
  entityType: EntityType;
  entityId?: string;
  entityName?: string;
  workspaceId?: string;
  projectId?: string;
  details?: Json;
}

export function useActivityLog() {
  const { user } = useAuth();

  const logActivity = useCallback(
    async ({
      actionType,
      entityType,
      entityId,
      entityName,
      workspaceId,
      projectId,
      details = {},
    }: LogActivityParams) => {
      if (!user) return;

      try {
        await supabase.from("activity_logs").insert([{
          user_id: user.id,
          action_type: actionType,
          entity_type: entityType,
          entity_id: entityId || null,
          entity_name: entityName || null,
          workspace_id: workspaceId || null,
          project_id: projectId || null,
          details: details as Json,
        }]);
      } catch (err) {
        console.error("Error logging activity:", err);
      }
    },
    [user]
  );

  return { logActivity };
}

// Standalone function for use outside of React components
export async function logActivityDirect(
  userId: string,
  params: Omit<LogActivityParams, "userId">
) {
  try {
    await supabase.from("activity_logs").insert([{
      user_id: userId,
      action_type: params.actionType,
      entity_type: params.entityType,
      entity_id: params.entityId || null,
      entity_name: params.entityName || null,
      workspace_id: params.workspaceId || null,
      project_id: params.projectId || null,
      details: (params.details || {}) as Json,
    }]);
  } catch (err) {
    console.error("Error logging activity:", err);
  }
}
