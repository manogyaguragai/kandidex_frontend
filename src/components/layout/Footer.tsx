import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { isPlayground, getMainDomainUrl } from "@/lib/subdomain";

export const Footer = () => {
  const onPlayground = isPlayground();
  const mainUrl = getMainDomainUrl();

  const MarketingLink = ({ to, children, className }: { to: string, children: React.ReactNode, className?: string }) => {
    if (onPlayground) {
      // Remove leading slash if present to avoid double slash if mainUrl ends with slash (though helper doesn't)
      // Our helper: protocol//hostname[:port]
      const path = to.startsWith('/') ? to : `/${to}`;
      return <a href={`${mainUrl}${path}`} className={className}>{children}</a>;
    }
    return <Link to={to} className={className}>{children}</Link>;
  };

  return (
    <footer className="relative bg-background pt-20 pb-10 border-t border-border overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand Column */}
          <div className="space-y-6 lg:col-span-2">
            <MarketingLink to="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-0.5">
                <div className="bg-background w-full h-full rounded-md flex items-center justify-center">
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600 text-lg">K</span>
                </div>
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">
                Kandidex
              </span>
            </MarketingLink>
            <p className="text-muted-foreground leading-relaxed">
              Transforming recruitment with AI-powered intelligence. Find the perfect candidate in minutes, not days.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Product</h3>
            <ul className="space-y-4">
              <li><MarketingLink to="/features" className="text-muted-foreground hover:text-primary transition-colors">Features</MarketingLink></li>
              <li><MarketingLink to="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</MarketingLink></li>
              <li><MarketingLink to="/enterprise" className="text-muted-foreground hover:text-primary transition-colors">Enterprise</MarketingLink></li>
              <li><MarketingLink to="/case-studies" className="text-muted-foreground hover:text-primary transition-colors">Case Studies</MarketingLink></li>
              <li><MarketingLink to="/docs" className="text-muted-foreground hover:text-primary transition-colors">API Docs</MarketingLink></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Company</h3>
            <ul className="space-y-4">
              <li><MarketingLink to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</MarketingLink></li>
              <li><MarketingLink to="/careers" className="text-muted-foreground hover:text-primary transition-colors">Careers</MarketingLink></li>
              <li><MarketingLink to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</MarketingLink></li>
              <li><MarketingLink to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</MarketingLink></li>
              <li><MarketingLink to="/legal" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</MarketingLink></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kandidex Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
