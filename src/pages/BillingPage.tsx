import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/api/billing";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, X, CreditCard, Zap, Shield, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";

const BillingPage = () => {
  const { user } = useAuthStore();

  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ["currentUsage", user?.userId],
    queryFn: () => billingApi.getCurrentUsage(user!.userId),
    enabled: !!user?.userId,
  });

  const { data: tiersData, isLoading: tiersLoading } = useQuery({
    queryKey: ["allTiers"],
    queryFn: billingApi.getAllTiers,
  });

  const tiers = tiersData?.tiers || [];

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0;
    if (limit === 0) return 100;
    return Math.min(100, (used / limit) * 100);
  };

  const containerStats = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 pb-1">
            Billing & Usage
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your subscription plan and track your AI usage limits.
          </p>
        </div>

        {/* Usage Section */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerStats}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Current Usage</h2>
          </div>

          {usageLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
                <motion.div variants={containerStats} className="glass-card p-6 rounded-2xl border-white/20 dark:border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <CreditCard className="w-32 h-32" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Resume Screenings</h3>
                        <p className="text-sm text-muted-foreground">Candidates processed this cycle</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {usageData?.resumes_screened}
                        </span>
                        <span className="text-muted-foreground text-sm"> / {usageData?.limits?.resumes_per_month === -1 ? '∞' : usageData?.limits?.resumes_per_month}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Progress value={getUsagePercentage(usageData?.resumes_screened || 0, usageData?.limits?.resumes_per_month || 1)} className="h-3" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round(getUsagePercentage(usageData?.resumes_screened || 0, usageData?.limits?.resumes_per_month || 1))}% Used</span>
                        {usageData?.cycle?.end_date && (
                          <span>Resets {new Date(usageData.cycle.end_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={containerStats} className="glass-card p-6 rounded-2xl border-white/20 dark:border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Sparkles className="w-32 h-32 text-purple-500" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Deep Analysis</h3>
                        <p className="text-sm text-muted-foreground">Advanced AI reasoning calls</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {usageData?.deep_analysis_calls}
                        </span>
                        <span className="text-muted-foreground text-sm"> / {usageData?.limits?.deep_analysis_per_month === -1 ? '∞' : usageData?.limits?.deep_analysis_per_month}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Progress value={getUsagePercentage(usageData?.deep_analysis_calls || 0, usageData?.limits?.deep_analysis_per_month || 1)} className="h-3 bg-purple-100 dark:bg-purple-900/20" indicatorClassName="bg-purple-600 dark:bg-purple-400" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round(getUsagePercentage(usageData?.deep_analysis_calls || 0, usageData?.limits?.deep_analysis_per_month || 1))}% Used</span>
                        {usageData?.tier === 'free' && (
                          <span className="text-purple-600 font-medium">Upgrade to unlock more</span>
                        )}
                      </div>
                    </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Plans Section */}
        <div id="plans" className="space-y-8">
          <div className="flex items-center gap-3 justify-center mb-8">
            <h2 className="text-3xl font-bold text-center">Available Plans</h2>
          </div>

          {tiersLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-[500px] w-full rounded-2xl" />)}
            </div>
          ) : (
              <div className="grid md:grid-cols-3 gap-8 items-start">
                {tiers.map((plan: any) => {
                  const isCurrent = user?.tier === plan.tier;
                  const isRecommended = plan.tier === 'business'; // Example logic: highlight Business

                  return (
                    <motion.div
                      key={plan.tier}
                      whileHover={{ y: -5 }}
                      className={cn(
                        "relative p-8 rounded-3xl border flex flex-col h-full",
                        isRecommended
                          ? "bg-gradient-to-b from-blue-600/10 to-purple-600/10 border-blue-500/50 shadow-glow-blue"
                          : "glass-card border-border/50",
                        isCurrent ? "ring-2 ring-primary border-primary" : ""
                      )}
                    >
                      {isCurrent && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                          Current Plan
                        </div>
                      )}
                      {isRecommended && !isCurrent && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                          Most Popular
                        </div>
                      )}

                      <div className="mb-6">
                        <h3 className="text-2xl font-bold capitalize flex items-center gap-2">
                          {plan.display_name}
                          {plan.tier === 'enterprise' && <Shield className="w-5 h-5 text-purple-500" />}
                        </h3>
                        <div className="mt-4 flex items-baseline gap-1">
                          <span className="text-4xl font-extrabold tracking-tight">
                            {plan.price_display}
                          </span>
                          {!plan.is_custom_pricing && <span className="text-muted-foreground font-medium">/month</span>}
                        </div>
                        <p className="text-muted-foreground mt-2 text-sm">{plan.description || "The perfect plan for your needs."}</p>
                      </div>

                      <div className="flex-1 space-y-4 mb-8">
                        <div className="flex items-center gap-3">
                          <div className="p-1 rounded-full bg-green-500/10 text-green-500">
                            <Check className="w-4 h-4" />
                        </div>
                          <span className="text-sm">{plan.limits.resumes_per_month === -1 ? "Unlimited" : plan.limits.resumes_per_month} Resumes/mo</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-1 rounded-full bg-green-500/10 text-green-500">
                            <Check className="w-4 h-4" />
                          </div>
                          <span className="text-sm">{plan.limits.deep_analysis_per_month === -1 ? "Unlimited" : plan.limits.deep_analysis_per_month} Deep Analysis</span>
                        </div>
                      </div>

                      <Button 
                        className={cn("w-full h-12 rounded-xl text-base font-medium shadow-lg hover:shadow-xl transition-all",
                          isRecommended ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0" : ""
                        )}
                        variant={isCurrent ? 'outline' : isRecommended ? 'default' : 'secondary'}
                        disabled={isCurrent}
                      >
                        {isCurrent ? 'Active Plan' : plan.is_custom_pricing ? 'Contact Sales' : 'Upgrade Now'}
                      </Button>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default BillingPage;
