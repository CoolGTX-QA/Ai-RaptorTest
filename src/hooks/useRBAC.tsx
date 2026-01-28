import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useCallback } from "react";

export type AppRole = "admin" | "manager" | "tester" | "viewer";

export interface RoleConfig {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  level: number; // Higher = more permissions
}

export const ROLE_CONFIGS: Record<AppRole, RoleConfig> = {
  admin: {
    name: "admin",
    displayName: "Admin",
    description: "Full CRUD access + system configuration rights",
    permissions: [
      "workspace.create",
      "workspace.update",
      "workspace.delete",
      "project.create",
      "project.update",
      "project.delete",
      "member.invite",
      "member.remove",
      "member.update_role",
      "test_case.create",
      "test_case.update",
      "test_case.delete",
      "test_run.create",
      "test_run.update",
      "test_run.delete",
      "defect.create",
      "defect.update",
      "defect.delete",
      "report.create",
      "report.update",
      "report.delete",
      "settings.manage",
    ],
    level: 100,
  },
  manager: {
    name: "manager",
    displayName: "Manager",
    description: "All CRUD operations across workspace",
    permissions: [
      "project.create",
      "project.update",
      "project.delete",
      "member.invite",
      "member.remove",
      "member.update_role",
      "test_case.create",
      "test_case.update",
      "test_case.delete",
      "test_run.create",
      "test_run.update",
      "test_run.delete",
      "defect.create",
      "defect.update",
      "defect.delete",
      "report.create",
      "report.update",
      "report.delete",
    ],
    level: 75,
  },
  tester: {
    name: "tester",
    displayName: "QA Tester",
    description: "Create test cases and test suites, execute and review",
    permissions: [
      "test_case.create",
      "test_case.update",
      "test_run.create",
      "test_run.update",
      "defect.create",
      "defect.update",
      "report.create",
    ],
    level: 50,
  },
  viewer: {
    name: "viewer",
    displayName: "Developer",
    description: "View-only access to given resources",
    permissions: [
      "test_case.view",
      "test_run.view",
      "defect.view",
      "report.view",
    ],
    level: 25,
  },
};

export function useRBAC(workspaceId?: string) {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !workspaceId) {
      setUserRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("workspace_members")
          .select("role")
          .eq("workspace_id", workspaceId)
          .eq("user_id", user.id)
          .not("accepted_at", "is", null)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setUserRole(null);
        } else {
          setUserRole(data?.role as AppRole);
        }
      } catch (err) {
        console.error("Error in fetchRole:", err);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user, workspaceId]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!userRole) return false;
      return ROLE_CONFIGS[userRole].permissions.includes(permission);
    },
    [userRole]
  );

  const hasMinRole = useCallback(
    (minRole: AppRole): boolean => {
      if (!userRole) return false;
      return ROLE_CONFIGS[userRole].level >= ROLE_CONFIGS[minRole].level;
    },
    [userRole]
  );

  const canManageRole = useCallback(
    (targetRole: AppRole): boolean => {
      if (!userRole) return false;
      // Can only manage roles lower than your own
      return ROLE_CONFIGS[userRole].level > ROLE_CONFIGS[targetRole].level;
    },
    [userRole]
  );

  const getRoleConfig = useCallback((role: AppRole): RoleConfig => {
    return ROLE_CONFIGS[role];
  }, []);

  const getAllRoles = useCallback((): AppRole[] => {
    return Object.keys(ROLE_CONFIGS) as AppRole[];
  }, []);

  const getAssignableRoles = useCallback((): AppRole[] => {
    if (!userRole) return [];
    // Admins can assign all roles including admin
    // Others can only assign roles lower than their own
    if (userRole === "admin") {
      return getAllRoles();
    }
    return getAllRoles().filter(
      (role) => ROLE_CONFIGS[userRole].level > ROLE_CONFIGS[role].level
    );
  }, [userRole, getAllRoles]);

  return {
    userRole,
    loading,
    hasPermission,
    hasMinRole,
    canManageRole,
    getRoleConfig,
    getAllRoles,
    getAssignableRoles,
    isAdmin: userRole === "admin",
    isManager: hasMinRole("manager"),
    isTester: hasMinRole("tester"),
  };
}
