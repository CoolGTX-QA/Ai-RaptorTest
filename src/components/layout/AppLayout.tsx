import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Search, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "@/components/NotificationBell";
import { RoleBadge } from "@/components/RoleBadge";
import type { AppRole } from "@/hooks/useRBAC";

interface Profile {
  full_name: string | null;
  email: string;
  avatar_url: string | null;
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, email, avatar_url")
          .eq("id", user.id)
          .single();
        
        if (data) {
          setProfile(data);
        } else {
          setProfile({
            full_name: user.user_metadata?.full_name || null,
            email: user.email || "",
            avatar_url: null,
          });
        }
      };

      const fetchRole = async () => {
        const { data } = await supabase
          .from("workspace_members")
          .select("role")
          .eq("user_id", user.id)
          .not("accepted_at", "is", null)
          .order("invited_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (data?.role) {
          setUserRole(data.role as AppRole);
        }
      };

      fetchProfile();
      fetchRole();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "User";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-6">
            <SidebarTrigger />
            
            <div className="flex-1">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 bg-background"
                />
              </div>
            </div>

            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">{displayName}</p>
                      {userRole && <RoleBadge role={userRole} size="sm" />}
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile?.email || user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/tmt-settings")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/tmt-settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="p-0">
                  <InteractiveHoverButton
                    text="Log out"
                    className="w-full rounded-sm border-destructive text-sm font-normal h-8 px-2 py-1.5"
                    onClick={handleSignOut}
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          
          <main className="flex-1 overflow-auto bg-background p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
