import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuthStore } from "@/store/authStore";
import { UserHub } from "@/components/layout/UserHub";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, History } from "lucide-react";
import { navbarVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { getMainDomainUrl } from "@/lib/subdomain";

export const PlaygroundNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { 
      name: "Screening", 
      path: "/screen-candidates",
      dropdown: [
        { name: "New Screening", path: "/screen-candidates", icon: Plus },
        { name: "Screening History", path: "/screening-history", icon: History },
      ]
    },
    { name: "Jobs", path: "/jobs" },
    { name: "Questions", path: "/questions" },
    { name: "Billing", path: "/billing" },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = getMainDomainUrl(); // Redirect to main domain after logout
  };

  const isActive = (path: string) => {
    if (path === '/screen-candidates' || path === '/screening-history') {
      return location.pathname.startsWith('/screen-candidates') || location.pathname.startsWith('/screening-history');
    }
    return location.pathname === path;
  };

  if (!mounted) return null;

  return (
    <motion.header
      initial="top"
      animate={scrolled ? "scrolled" : "top"}
      variants={navbarVariants}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "py-3 bg-background/80 backdrop-blur-md shadow-md support-backdrop-blur:bg-background/80" : "py-5 bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo - redirects to dashboard in playground */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-0.5 group-hover:shadow-glow-blue transition-all duration-500">
              <div className="bg-background w-full h-full rounded-md flex items-center justify-center">
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600 text-lg">K</span>
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
              Kandidex
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.dropdown ? (
                <DropdownMenu key={link.name}>
                  <DropdownMenuTrigger
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary outline-none group",
                      isActive(link.path) ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {link.name}
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {link.dropdown.map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link to={item.path} className="flex items-center gap-2 cursor-pointer">
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary relative group",
                    isActive(link.path) ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.name}
                  <span className={cn(
                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                    isActive(link.path) ? "w-full" : ""
                  )} />
                </Link>
              )
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full w-9 h-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Hub */}
            <UserHub /> 
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full pt-6">
                  <div className="flex flex-col space-y-4 mb-8">
                    {navLinks.map((link) => (
                      <SheetClose key={link.name} asChild>
                        <Link
                          to={link.path}
                          className={cn(
                            "text-lg font-medium p-2 rounded-lg transition-colors hover:bg-muted",
                            isActive(link.path) ? "text-primary bg-primary/10" : "text-foreground"
                          )}
                        >
                          {link.name}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>

                  <div className="mt-auto flex flex-col gap-4 pb-8">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {user?.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{user?.email}</span>
                          <span className="text-xs text-muted-foreground capitalize">{user?.tier} Plan</span>
                        </div>
                      </div>
                      <SheetClose asChild>
                        <Button asChild size="lg" className="w-full">
                          <Link to="/dashboard">Go to Dashboard</Link>
                        </Button>
                      </SheetClose>
                      <Button variant="outline" size="lg" onClick={handleLogout} className="w-full text-destructive hover:text-destructive">
                        Sign Out
                      </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
