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
