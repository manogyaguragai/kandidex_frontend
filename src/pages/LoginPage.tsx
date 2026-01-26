import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { GlowingOrb } from "@/components/ui/glowing-orb";
import { authApi } from "@/api/auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Real API call
      const response = await authApi.login(data.email, data.password);
      
      const user = {
        email: response.email || data.email,
        // If backend sends name, use it for initials, else fallback to email
        initials: (response.first_name && response.last_name)
          ? `${response.first_name[0]}${response.last_name[0]}`.toUpperCase()
          : (response.email || data.email).substring(0, 2).toUpperCase(),
        userId: response.user_id, // Critical fix: Use ID from backend
        tier: response.tier || response.role || "free"
      };
      
      login(user, response.access_token);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-background overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-30 pointer-events-none">
        <GlowingOrb />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-card border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center space-y-2 pb-6">
            <Link to="/" className="inline-flex items-center gap-2 justify-center mb-4">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-0.5">
                <div className="bg-background w-full h-full rounded-[10px] flex items-center justify-center">
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600 text-xl">K</span>
                </div>
              </div>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input 
                    {...register("email")} 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10"
                  />
                </div>
                {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Password</label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input 
                    {...register("password")} 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
              </div>
              
              <Button type="submit" size="lg" className="w-full shadow-glow-blue" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="text-center justify-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/contact" className="text-primary hover:underline ml-1 font-medium">
              Contact Admin
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
