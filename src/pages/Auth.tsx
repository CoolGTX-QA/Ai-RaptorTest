import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layers, Users, BarChart3, Shield, Zap, Bug, FlaskConical, FolderTree, BrainCircuit, GitBranch, Clock } from "lucide-react";
import RadialOrbitalTimeline, { type TimelineItem } from "@/components/ui/radial-orbital-timeline";
import VaporizeTextCycle, { Tag } from "@/components/ui/vapour-text-effect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { z } from "zod";

// Validation schemas
const emailSchema = z.string().trim().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const fullNameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long");

function TypewriterHeading() {
  const text = "Modern Test Management Platform";
  const [displayed, setDisplayed] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const blink = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <h2 className="text-3xl font-bold mb-4 text-primary-foreground drop-shadow-lg min-h-[2.5rem]">
      {displayed}
      <span className={`inline-block w-[3px] h-[1em] bg-primary-foreground ml-1 align-middle transition-opacity ${cursorVisible ? "opacity-100" : "opacity-0"}`} />
    </h2>
  );
}

export default function Auth() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Google sign-in failed", description: err.message || "An error occurred", variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast({ title: "Invalid email", description: emailResult.error.errors[0].message, variant: "destructive" });
      return;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast({ title: "Invalid password", description: passwordResult.error.errors[0].message, variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await signIn(emailResult.data, password);
    
    setIsLoading(false);
    
    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate("/dashboard");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailResult = emailSchema.safeParse(resetEmail);
    if (!emailResult.success) {
      toast({ title: "Invalid email", description: emailResult.error.errors[0].message, variant: "destructive" });
      return;
    }
    
    setResetLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(emailResult.data, {
      redirectTo: `${window.location.origin}/`,
    });
    
    setResetLoading(false);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
      setShowForgotPassword(false);
      setResetEmail("");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast({ title: "Invalid email", description: emailResult.error.errors[0].message, variant: "destructive" });
      return;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast({ title: "Invalid password", description: passwordResult.error.errors[0].message, variant: "destructive" });
      return;
    }
    
    if (fullName) {
      const nameResult = fullNameSchema.safeParse(fullName);
      if (!nameResult.success) {
        toast({ title: "Invalid name", description: nameResult.error.errors[0].message, variant: "destructive" });
        return;
      }
    }
    
    setIsLoading(true);
    
    const { error } = await signUp(emailResult.data, password, fullName || undefined);
    
    setIsLoading(false);
    
    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      });
      navigate("/dashboard");
    }
  };

  const featureTimelineData: TimelineItem[] = [
    {
      id: 1, title: "AI Generation", date: "Core", content: "Generate comprehensive test cases from requirements using AI models with smart prioritization.", category: "AI", icon: BrainCircuit, relatedIds: [2, 3], status: "completed", energy: 95,
    },
    {
      id: 2, title: "Autonomous Testing", date: "Core", content: "Fully autonomous test execution with browser automation and intelligent error analysis.", category: "Automation", icon: Zap, relatedIds: [1, 3], status: "completed", energy: 90,
    },
    {
      id: 3, title: "Test Repository", date: "Core", content: "Hierarchical folder-based test case management with versioning and review workflows.", category: "Repository", icon: FolderTree, relatedIds: [1, 4], status: "completed", energy: 100,
    },
    {
      id: 4, title: "Test Execution", date: "Core", content: "Create test runs, assign to team members, and track execution status in real-time.", category: "Execution", icon: FlaskConical, relatedIds: [3, 5], status: "in-progress", energy: 85,
    },
    {
      id: 5, title: "Defect Tracking", date: "Core", content: "Integrated defect management linked to test cases with severity and priority tracking.", category: "Defects", icon: Bug, relatedIds: [4, 6], status: "in-progress", energy: 80,
    },
    {
      id: 6, title: "Reports & Analytics", date: "Core", content: "Advanced dashboards with execution reports, defect leakage, traceability matrices, and RCA.", category: "Reports", icon: BarChart3, relatedIds: [5, 7], status: "completed", energy: 88,
    },
    {
      id: 7, title: "Risk Assessment", date: "Core", content: "AI-powered risk scoring, predictions, and mitigation tracking for proactive quality management.", category: "Risk", icon: Shield, relatedIds: [6, 8], status: "in-progress", energy: 70,
    },
    {
      id: 8, title: "Team Workspaces", date: "Core", content: "Role-based workspaces with project management, member invitations, and granular permissions.", category: "Collaboration", icon: Users, relatedIds: [7, 1], status: "completed", energy: 92,
    },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Panel - Auth Form with Glossy Effect */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-background via-background to-muted/30 relative">
        {/* Decorative glossy orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* Glossy Logo */}
            <div className="flex items-center gap-3 mb-6 group">
              <div className="relative">
                {/* Outer glow */}
                <div className="absolute -inset-2 bg-primary/30 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Logo container with glossy effect */}
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 shadow-xl shadow-primary/40 overflow-hidden">
                  <Layers className="h-8 w-8 text-primary-foreground drop-shadow-md relative z-10" />
                  
                  {/* Glossy shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-transparent pointer-events-none" />
                  
                  {/* Animated shine sweep */}
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.5) 55%, transparent 60%)',
                      backgroundSize: '200% 100%',
                      animation: 'logoShine 3s ease-in-out infinite',
                    }}
                  />
                </div>
              </div>
              
              {/* Text with glow effect */}
              <span 
                className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent relative"
                style={{
                  textShadow: '0 0 30px hsl(var(--primary) / 0.3)',
                }}
              >
                RaptorTest
              </span>
            </div>
            
            <style>{`
              @keyframes logoShine {
                0%, 100% { background-position: 200% 0; }
                50% { background-position: -200% 0; }
              }
            `}</style>
            <div className="w-full h-12">
              <VaporizeTextCycle
                texts={["Welcome to RaptorTest", "Modern Test Management", "AI-Powered Testing"]}
                font={{
                  fontFamily: "Work Sans, sans-serif",
                  fontSize: "24px",
                  fontWeight: 600,
                }}
                color="rgb(23, 23, 23)"
                spread={4}
                density={6}
                animation={{
                  vaporizeDuration: 1.5,
                  fadeInDuration: 0.8,
                  waitDuration: 2,
                }}
                direction="left-to-right"
                alignment="center"
                tag={Tag.H1}
              />
            </div>
            <p className="text-muted-foreground mt-2">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Glassmorphism Card */}
          <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/80 relative overflow-hidden">
            {/* Glossy top shine */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            <CardHeader className="pb-4">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50 backdrop-blur-sm">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Login"}
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      className="w-full text-primary hover:text-primary/80"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </Button>
                  </form>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card/80 px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-border/50 hover:bg-accent/50 transition-all duration-300"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {googleLoading ? "Signing in..." : "Google"}
                  </Button>
                </TabsContent>

                <TabsContent value="register" className="mt-6">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-fullname" className="text-foreground font-medium">Full Name</Label>
                      <Input
                        id="reg-fullname"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-foreground font-medium">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-foreground font-medium">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Register"}
                    </Button>
                  </form>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card/80 px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-border/50 hover:bg-accent/50 transition-all duration-300"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {googleLoading ? "Signing in..." : "Google"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <div className="text-center text-sm text-muted-foreground">
                By continuing, you agree to our{" "}
                <Link to="/terms-of-service" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <Card className="w-full max-w-md border-border/50 shadow-2xl backdrop-blur-sm bg-card/90">
                <CardHeader className="text-center">
                  <h2 className="text-xl font-semibold text-foreground">Reset Password</h2>
                  <p className="text-sm text-muted-foreground">
                    Enter your email and we'll send you a reset link
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-foreground font-medium">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="bg-background/50 border-border/50 focus:border-primary"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setResetEmail("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-primary to-primary/90"
                        disabled={resetLoading}
                      >
                        {resetLoading ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Orbital Timeline */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/80" />
        
        {/* Subtle floating orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-primary-foreground/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary-foreground/8 blur-3xl animate-pulse" />
        </div>

        {/* Orbital Timeline */}
        <div className="absolute inset-0 flex items-center justify-center">
          <RadialOrbitalTimeline
            timelineData={featureTimelineData}
            centerContent={
              <div className="flex flex-col items-center text-center pointer-events-none">
                {/* Logo */}
                <div className="relative mb-3">
                  <div className="absolute -inset-3 bg-primary-foreground/15 rounded-full blur-xl" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-foreground/25 to-primary-foreground/10 border border-primary-foreground/30 backdrop-blur-sm shadow-xl overflow-hidden">
                    <Layers className="h-9 w-9 text-primary-foreground drop-shadow-md relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/30 via-primary-foreground/5 to-transparent pointer-events-none" />
                  </div>
                </div>
                <span className="text-lg font-bold text-primary-foreground drop-shadow-md">RaptorTest</span>
                <span className="text-[10px] text-primary-foreground/60 mt-0.5 tracking-wider uppercase">Click a feature to explore</span>
              </div>
            }
          />
        </div>

        {/* Bottom tagline */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-sm text-primary-foreground/60 font-medium">
            End-to-end Quality Assurance Platform
          </p>
        </div>
      </div>
    </div>
  );
}
