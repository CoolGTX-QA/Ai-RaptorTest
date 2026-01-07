import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, CheckCircle, Users, BarChart3, Shield, Zap, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signUp(email, password, fullName);
    
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
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 shadow-lg shadow-primary/30">
                  <Layers className="h-8 w-8 text-primary-foreground drop-shadow-sm" />
                </div>
                {/* Glossy shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                RaptorTest
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Welcome to RaptorTest</h1>
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
                  </form>
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
                </TabsContent>
              </Tabs>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <div className="text-center text-sm text-muted-foreground">
                By continuing, you agree to our <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Panel - Hero Section with TMT Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/80" />
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 border border-primary-foreground/30 rounded-full animate-pulse" />
          <div className="absolute top-40 right-20 w-60 h-60 border border-primary-foreground/20 rounded-full animate-pulse delay-500" />
          <div className="absolute bottom-20 left-1/4 w-32 h-32 border border-primary-foreground/25 rounded-full animate-pulse delay-1000" />
        </div>
        
        {/* Floating TMT icons - Corners only to avoid overlap */}
        {/* Top-right corner */}
        <div className="absolute top-6 right-6 animate-bounce delay-300 z-20">
          <div className="w-11 h-11 rounded-xl bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-primary-foreground/80" />
          </div>
        </div>
        
        {/* Bottom-right corner */}
        <div className="absolute bottom-6 right-6 animate-bounce delay-700 z-20">
          <div className="w-11 h-11 rounded-xl bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground/80" />
          </div>
        </div>
        
        {/* Bottom-left corner */}
        <div className="absolute bottom-6 left-6 animate-bounce delay-500 z-20">
          <div className="w-11 h-11 rounded-xl bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground/80" />
          </div>
        </div>
        
        {/* Top-left corner */}
        <div className="absolute top-6 left-6 animate-bounce z-20">
          <div className="w-11 h-11 rounded-xl bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center">
            <Bug className="w-5 h-5 text-primary-foreground/80" />
          </div>
        </div>

        {/* Glossy glass panel */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="relative max-w-lg">
            {/* Glowing backdrop */}
            <div className="absolute -inset-4 bg-primary-foreground/5 rounded-3xl blur-xl" />
            
            <div className="relative bg-primary-foreground/10 backdrop-blur-md rounded-2xl p-8 border border-primary-foreground/20">
              {/* Top glossy shine */}
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary-foreground/40 to-transparent" />
              
              <h2 className="text-4xl font-bold mb-4 text-primary-foreground drop-shadow-lg">
                Modern Test Management Platform
              </h2>
              <p className="text-lg text-primary-foreground/90 mb-8 leading-relaxed">
                Streamline your testing process with our comprehensive test
                management solution. Create, organize, and execute test cases with
                ease.
              </p>
              
              <div className="space-y-5">
                <div className="flex items-center gap-4 group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-lg text-primary-foreground font-medium">Intuitive test case management</span>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-lg text-primary-foreground font-medium">Collaborative workspace</span>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-lg text-primary-foreground font-medium">Comprehensive reporting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
