import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

// Pricing Tiers Data
const PRICING_TIERS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "Perfect for trying out Kandidex",
    features: [
      "5 Resume Parses / month",
      "Basic Candidate Ranking",
      "Email Support",
      "1 Job Posting"
    ],
    highlight: false,
    gradient: "from-blue-500/10 to-cyan-500/10",
    border: "border-blue-500/20",
    buttonVariant: "outline" as const
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For growing teams and startups",
    features: [
      "500 Resume Parses / month",
      "Advanced AI Ranking & Matching",
      "Priority Support",
      "Unlimited Job Postings",
      "Smart Audit Logs",
      "Export to CSV/PDF"
    ],
    highlight: true,
    popular: true,
    gradient: "from-violet-600/10 to-indigo-600/10",
    border: "border-violet-500/20",
    buttonVariant: "default" as const
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Unlimited Parses",
      "Custom AI Models",
      "Dedicated Account Manager",
      "SSO & Advanced Security",
      "API Access",
      "Custom Integrations"
    ],
    highlight: false,
    gradient: "from-orange-500/10 to-red-500/10",
    border: "border-orange-500/20",
    buttonVariant: "outline" as const
  },
  {
    id: "sudo",
    name: "Sudo",
    price: "$999",
    period: "/month",
    description: "Super Admin Access",
    features: [
      "Full System Control",
      "Manage All Users",
      "System Configuration",
      "Database Access",
      "Audit All Logs"
    ],
    highlight: false,
    isHidden: true, // Special flag to hide unless user has this tier
    gradient: "from-emerald-500/10 to-green-500/10",
    border: "border-emerald-500/20",
    buttonVariant: "outline" as const
  }
];

const Particle = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, y: 0, x: Math.random() * 100 - 50 }}
    animate={{ 
      opacity: [0, 1, 0], 
      scale: [0, 1.5, 0], 
      y: -100,
      x: Math.random() * 100 - 50
    }}
    transition={{ 
      duration: 2, 
      delay, 
      repeat: Infinity, 
      repeatDelay: Math.random() * 2 
    }}
    className="absolute bottom-10 left-1/2 w-1 h-1 bg-primary/50 rounded-full blur-[1px] pointer-events-none"
  />
);

const PricingCard = ({ tier, isCurrent, index }: { tier: any, isCurrent: boolean, index: number }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative rounded-2xl border bg-background/50 backdrop-blur-xl p-8 flex flex-col w-full md:w-[350px] transition-all duration-300",
        tier.popular ? "border-primary/50 ring-2 ring-primary/20" : "border-border",
        isCurrent ? "ring-2 ring-emerald-500 border-emerald-500/50 bg-emerald-500/5" : "",
        isHovered ? "shadow-glow-lg border-primary/30 translate-y-[-5px]" : ""
      )}
    >
      {/* Glow Effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-500 pointer-events-none",
          tier.gradient
        )}
        style={{ opacity: isHovered ? 0.2 : 0 }}
      />

      {/* Particles */}
      {isHovered && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <Particle key={i} delay={i * 0.2} />
          ))}
        </div>
      )}

      {tier.popular && !isCurrent && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-xs font-bold text-white shadow-glow-sm z-10">
          Most Popular
        </div>
      )}
      
      {isCurrent && (
         <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-600 rounded-full text-xs font-bold text-white shadow-glow-green z-10">
          Current Plan
        </div>
      )}

      <div className="mb-8 relative z-10">
        <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
        <p className="text-muted-foreground text-sm h-10">{tier.description}</p>
      </div>

      <div className="mb-8 relative z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{tier.price}</span>
          {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
        </div>
      </div>

      <ul className="space-y-4 mb-8 flex-1 relative z-10">
        {tier.features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-primary" />
            </div>
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button 
        className={cn(
          "w-full relative z-10", 
          isCurrent ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
        )}
        variant={isCurrent ? "default" : tier.buttonVariant}
        disabled={isCurrent}
        asChild={!isCurrent}
      >
        {isCurrent ? (
          "Active Plan"
        ) : (
          <Link to="/contact">
            {tier.price === "Custom" ? "Contact Sales" : "Contact Sales"}
          </Link>
        )}
      </Button>
    </motion.div>
  );
};

export const PricingPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const currentTier = user?.tier?.toLowerCase() || "";

  // Filter tiers:
  // 1. Always show non-hidden tiers
  // 2. Show hidden tier ONLY if user has that specific tier
  const visibleTiers = PRICING_TIERS.filter(tier => {
    if (!tier.isHidden) return true;
    return isAuthenticated && currentTier === tier.id;
  });

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mb-6"
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground"
          >
            Choose the plan that's right for your recruitment needs. No hidden fees.
          </motion.p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {visibleTiers.map((tier, index) => (
            <PricingCard 
              key={tier.id} 
              tier={tier} 
              index={index}
              isCurrent={isAuthenticated && currentTier === tier.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
