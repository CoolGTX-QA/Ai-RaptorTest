import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layers, CheckCircle, Users, BarChart3, Shield, Zap, Bug, FlaskConical, FolderTree, GitBranch, BrainCircuit } from "lucide-react";
import { useEffect, useRef } from "react";
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

      {/* Right Panel - Hero Section with TMT Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/80" />
        
        {/* Animated floating orbs */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large glowing orb - top left */}
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-primary-foreground/20 to-transparent blur-3xl animate-pulse" />
          
          {/* Medium orb - bottom right */}
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-tl from-primary-foreground/15 to-transparent blur-3xl animate-pulse delay-1000" />
          
          {/* Small floating orbs with custom animation */}
          <div className="absolute top-[15%] right-[10%] w-4 h-4 rounded-full bg-primary-foreground/40 shadow-lg shadow-primary-foreground/20" 
               style={{ animation: 'float 6s ease-in-out infinite' }} />
          <div className="absolute top-[25%] left-[8%] w-3 h-3 rounded-full bg-primary-foreground/30" 
               style={{ animation: 'float 8s ease-in-out infinite 1s' }} />
          <div className="absolute bottom-[30%] right-[15%] w-5 h-5 rounded-full bg-primary-foreground/35" 
               style={{ animation: 'float 7s ease-in-out infinite 2s' }} />
          <div className="absolute bottom-[20%] left-[12%] w-2 h-2 rounded-full bg-primary-foreground/45" 
               style={{ animation: 'float 5s ease-in-out infinite 0.5s' }} />
          <div className="absolute top-[60%] right-[8%] w-3 h-3 rounded-full bg-primary-foreground/25" 
               style={{ animation: 'float 9s ease-in-out infinite 3s' }} />
          
          {/* Geometric accent lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="50%" stopColor="white" stopOpacity="0.5" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="30%" x2="40%" y2="0" stroke="url(#lineGrad)" strokeWidth="1" />
            <line x1="60%" y1="100%" x2="100%" y2="70%" stroke="url(#lineGrad)" strokeWidth="1" />
            <line x1="100%" y1="20%" x2="70%" y2="50%" stroke="url(#lineGrad)" strokeWidth="1" />
          </svg>
          
          {/* Hexagon grid pattern - subtle */}
          <div className="absolute top-10 right-10 opacity-10">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <polygon points="60,5 110,30 110,80 60,105 10,80 10,30" fill="none" stroke="white" strokeWidth="1" />
              <polygon points="60,20 95,37 95,73 60,90 25,73 25,37" fill="none" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>
          <div className="absolute bottom-16 left-8 opacity-10">
            <svg width="80" height="80" viewBox="0 0 120 120">
              <polygon points="60,5 110,30 110,80 60,105 10,80 10,30" fill="none" stroke="white" strokeWidth="1" />
            </svg>
          </div>
        </div>
        
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-20px) translateX(10px); }
            50% { transform: translateY(-10px) translateX(-10px); }
            75% { transform: translateY(-25px) translateX(5px); }
          }
        `}</style>

        {/* Glossy glass panel */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="relative max-w-lg">
            {/* Glowing backdrop */}
            <div className="absolute -inset-4 bg-primary-foreground/5 rounded-3xl blur-xl" />
            
            <div className="relative bg-primary-foreground/10 backdrop-blur-md rounded-2xl p-8 border border-primary-foreground/20 overflow-hidden">
              {/* Animated glossy border shine */}
              <div 
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s ease-in-out infinite',
                  maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'xor',
                  WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  padding: '1px',
                }}
              />
              <style>{`
                @keyframes shimmer {
                  0% { background-position: 200% 0; }
                  100% { background-position: -200% 0; }
                }
              `}</style>
              {/* Top glossy shine */}
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary-foreground/40 to-transparent" />
              
              <TypewriterHeading />
              <p className="text-base text-primary-foreground/85 mb-8 leading-relaxed">
                End-to-end quality assurance platform with AI-powered test generation, 
                autonomous testing, real-time defect tracking, and advanced analytics — 
                all in one unified workspace.
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: BrainCircuit, text: "AI-Powered Test Case Generation" },
                  { icon: Zap, text: "Autonomous Test Execution" },
                  { icon: FolderTree, text: "Hierarchical Test Repository" },
                  { icon: FlaskConical, text: "Test Runs & Execution Tracking" },
                  { icon: Bug, text: "Integrated Defect Management" },
                  { icon: BarChart3, text: "Advanced Reports & Analytics" },
                  { icon: Shield, text: "Risk Assessment & Predictions" },
                  { icon: Users, text: "Role-Based Team Workspaces" },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 backdrop-blur-sm shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-sm text-primary-foreground/90 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
