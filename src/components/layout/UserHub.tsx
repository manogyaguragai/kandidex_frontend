import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  MessageSquare,
  Briefcase,
  FileText,
  Clock
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const UserHub = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;



  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="rounded-full gap-2 pl-2 pr-3 h-10 border border-transparent hover:border-input group relative overflow-hidden">
             
             {/* Animated border gradient on hover */}
             <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity" />

          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {user.initials || "U"}
          </div>
          <div className="flex flex-col items-start">
             <span className="text-sm font-medium leading-none">{user.email?.split('@')[0]}</span>
             <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{user.tier}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 overflow-hidden border-0 shadow-2xl bg-background/95 backdrop-blur-xl ring-1 ring-white/10">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                {user.initials || "U"}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{user.email}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20 capitalize">
                    {user.tier} Plan
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Navigation Grid */}
        <div className="p-2 grid grid-cols-4 gap-1">
            <Link to="/dashboard" className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                <LayoutDashboard className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">Dashboard</span>
            </Link>
          <Link to="/jobs" className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
            <Briefcase className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">Jobs</span>
          </Link>
          <Link to="/screen-candidates" className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
            <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">Screening</span>
          </Link>
          <Link to="/questions" className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
            <MessageSquare className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">Questions</span>
          </Link>
            <Link to="/billing" className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                <CreditCard className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">Billing</span>
            </Link>
          <Link to="/screening-history" className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
            <Clock className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">History</span>
          </Link>
            <Link to="/settings" className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">Settings</span>
            </Link>
        </div>

        <Separator className="bg-border/50" />

        {/* Footer */}
        <div className="p-2">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Log out
            </Button>
        </div>

      </PopoverContent>
    </Popover>
  );
};
