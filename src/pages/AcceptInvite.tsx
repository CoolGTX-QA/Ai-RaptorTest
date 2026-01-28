import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, UserPlus } from "lucide-react";

interface Invite {
  id: string;
  email: string;
  role: string;
  workspace_id: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  workspace?: {
    name: string;
  };
  inviter?: {
    full_name: string | null;
    email: string;
  };
}

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signUp, signIn } = useAuth();
  const { toast } = useToast();

  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  // Form states for new user registration
  const [isNewUser, setIsNewUser] = useState(false);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Form states for existing user login
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");

  useEffect(() => {
    if (token) {
      fetchInvite();
    } else {
      setError("Invalid invitation link");
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // If user is already logged in, try to accept the invite
    if (user && invite && !invite.accepted_at) {
      if (user.email?.toLowerCase() === invite.email.toLowerCase()) {
        handleAcceptInvite();
      } else {
        setError(`This invitation is for ${invite.email}. Please sign out and use the correct account.`);
      }
    }
  }, [user, invite]);

  const fetchInvite = async () => {
    if (!token) return;

    try {
      // Fetch invite details
      const { data: inviteData, error: inviteError } = await supabase
        .from("workspace_invites")
        .select("*")
        .eq("id", token)
        .single();

      if (inviteError || !inviteData) {
        setError("Invitation not found or has expired");
        setLoading(false);
        return;
      }

      // Check if expired
      if (new Date(inviteData.expires_at) < new Date()) {
        setError("This invitation has expired");
        setLoading(false);
        return;
      }

      // Check if already accepted
      if (inviteData.accepted_at) {
        setError("This invitation has already been accepted");
        setLoading(false);
        return;
      }

      // Fetch workspace details
      const { data: workspaceData } = await supabase
        .from("workspaces")
        .select("name")
        .eq("id", inviteData.workspace_id)
        .single();

      // Fetch inviter details
      const { data: inviterData } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", inviteData.invited_by)
        .single();

      setInvite({
        ...inviteData,
        workspace: workspaceData || undefined,
        inviter: inviterData || undefined,
      });

      // Check if user with this email already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", inviteData.email.toLowerCase())
        .single();

      if (existingProfile) {
        setIsExistingUser(true);
      } else {
        setIsNewUser(true);
      }
    } catch (err: any) {
      console.error("Error fetching invite:", err);
      setError("Failed to load invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!invite || !user) return;

    setAccepting(true);
    try {
      // Add user as workspace member
      const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: invite.workspace_id,
          user_id: user.id,
          role: invite.role as any,
          invited_by: invite.invited_by,
          accepted_at: new Date().toISOString(),
        });

      if (memberError) {
        // Check if already a member
        if (memberError.code === "23505") {
          toast({
            title: "Already a member",
            description: "You're already a member of this workspace",
          });
        } else {
          throw memberError;
        }
      }

      // Mark invite as accepted
      await supabase
        .from("workspace_invites")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invite.id);

      toast({
        title: "Welcome!",
        description: `You've joined ${invite.workspace?.name || "the workspace"}`,
      });

      // Redirect to the workspace
      navigate(`/workspace/${invite.workspace_id}`);
    } catch (err: any) {
      console.error("Error accepting invite:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to accept invitation",
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite) return;

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setAccepting(true);
    try {
      const { error: signUpError } = await signUp(invite.email, password, fullName);

      if (signUpError) {
        throw signUpError;
      }

      // The useEffect will handle accepting the invite once user is authenticated
      toast({
        title: "Account created!",
        description: "Setting up your workspace access...",
      });
    } catch (err: any) {
      console.error("Error signing up:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to create account",
        variant: "destructive",
      });
      setAccepting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite) return;

    setAccepting(true);
    try {
      const { error: signInError } = await signIn(invite.email, loginPassword);

      if (signInError) {
        throw signInError;
      }

      // The useEffect will handle accepting the invite once user is authenticated
    } catch (err: any) {
      console.error("Error signing in:", err);
      toast({
        title: "Error",
        description: err.message || "Invalid credentials",
        variant: "destructive",
      });
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invitation Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => navigate("/auth")}>Go to Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (user && invite && user.email?.toLowerCase() === invite.email.toLowerCase()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {accepting ? (
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            ) : (
              <CheckCircle className="h-12 w-12 text-primary mx-auto" />
            )}
            <CardTitle>Joining Workspace</CardTitle>
            <CardDescription>
              Setting up your access to {invite.workspace?.name}...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Workspace Invitation</CardTitle>
          <CardDescription>
            You've been invited to join <strong>{invite?.workspace?.name}</strong>
            {invite?.inviter && (
              <> by <strong>{invite.inviter.full_name || invite.inviter.email}</strong></>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Your role will be</p>
            <p className="font-semibold text-lg capitalize">{invite?.role}</p>
          </div>

          {isNewUser && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Create your account to accept this invitation
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={invite?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={accepting}>
                {accepting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Account & Join
              </Button>
            </form>
          )}

          {isExistingUser && !user && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Sign in to your existing account to accept this invitation
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={invite?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loginPassword">Password</Label>
                <Input
                  id="loginPassword"
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={accepting}>
                {accepting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Sign In & Join
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 text-center">
          <p className="text-xs text-muted-foreground">
            This invitation expires on{" "}
            {invite?.expires_at
              ? new Date(invite.expires_at).toLocaleDateString()
              : "N/A"}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
