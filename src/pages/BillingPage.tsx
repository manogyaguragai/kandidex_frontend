import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/api/billing";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, X, CreditCard, Zap, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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

  return (
    <div className="pt-24 pb-12 container mx-auto px-4 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Billing & Usage</h1>
        <p className="text-muted-foreground">Manage your subscription and track your usage</p>
      </div>

      {/* Usage Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Current Usage
        </h2>
        {usageLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Resume Screenings</CardTitle>
                <CardDescription>
                  {usageData?.cycle?.start_date && (
                    <span>Cycle ends: {new Date(usageData.cycle.end_date).toLocaleDateString()}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Used</span>
                    <span className="font-bold">
                      {usageData?.resumes_screened} / {usageData?.limits?.resumes_per_month === -1 ? '∞' : usageData?.limits?.resumes_per_month}
                    </span>
                  </div>
                  <Progress value={getUsagePercentage(usageData?.resumes_screened || 0, usageData?.limits?.resumes_per_month || 1)} />
                  {usageData?.limits?.resumes_per_month !== -1 && (
                    <p className="text-xs text-muted-foreground">
                      {Math.max(0, (usageData?.limits?.resumes_per_month || 0) - (usageData?.resumes_screened || 0))} screenings remaining
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Deep Analysis Calls</CardTitle>
                <CardDescription>AI-powered detailed reports</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Used</span>
                    <span className="font-bold">
                      {usageData?.deep_analysis_calls} / {usageData?.limits?.deep_analysis_per_month === -1 ? '∞' : usageData?.limits?.deep_analysis_per_month}
                    </span>
                  </div>
                  <Progress value={getUsagePercentage(usageData?.deep_analysis_calls || 0, usageData?.limits?.deep_analysis_per_month || 1)} />
                   <p className="text-xs text-muted-foreground">
                      {usageData?.tier === 'free' ? 'Upgrade for deep analysis' : 'Using advanced LLM reasoning'}
                   </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Plans Section */}
      <div id="plans">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-500" />
          Available Plans
        </h2>
        {tiersLoading ? (
           <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-[400px] w-full" />)}
           </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((plan: any) => {
              const isCurrent = user?.tier === plan.tier;
              const isRecommended = plan.tier === 'business'; // Example logic

              return (
                <Card 
                  key={plan.tier} 
                  className={cn(
                    "relative p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                    isCurrent ? "border-primary/50 ring-2 ring-primary/20 bg-primary/5" : "border-border",
                    isRecommended && !isCurrent ? "border-blue-500/50" : ""
                  )}
                >
                  {isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                      Current Plan
                    </span>
                  )}
                  {isRecommended && !isCurrent && (
                     <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                      Recommended
                    </span>
                  )}

                  <CardHeader className="p-0 mb-6">
                    <h3 className="text-xl font-bold capitalize flex items-center gap-2">
                      {plan.display_name}
                      {plan.tier === 'enterprise' && <Shield className="w-4 h-4 text-purple-500" />}
                    </h3>
                    <div className="text-3xl font-bold mt-2">
                      {plan.price_display}
                      {!plan.is_custom_pricing && <span className="text-lg font-normal text-muted-foreground">/mo</span>}
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 mb-8 space-y-3 flex-1">
                    {/* Features List specifically mapped or generic */}
                    {/* We can use limits as features for display */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                             <Check className="w-4 h-4 text-green-500 shrink-0" />
                             <span>{plan.limits.resumes_per_month === -1 ? "Unlimited" : plan.limits.resumes_per_month} Resumes/mo</span>
                        </div>
                         <div className="flex items-center gap-2 text-sm">
                             <Check className="w-4 h-4 text-green-500 shrink-0" />
                             <span>{plan.limits.deep_analysis_per_month === -1 ? "Unlimited" : plan.limits.deep_analysis_per_month} Deep Analysis</span>
                        </div>
                        {plan.features.custom_exports && (
                            <div className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-green-500 shrink-0" />
                                <span>Custom Exports</span>
                            </div>
                        )}
                         {plan.features.priority_support && (
                            <div className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-green-500 shrink-0" />
                                <span>Priority Support</span>
                            </div>
                        )}
                        {plan.tier === 'free' && (
                             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <X className="w-4 h-4 shrink-0" />
                                <span>Basic Support</span>
                            </div>
                        )}
                    </div>
                  </CardContent>

                  <CardFooter className="p-0 mt-auto">
                    <Button 
                        className={cn("w-full", isRecommended ? "bg-blue-600 hover:bg-blue-700" : "")} 
                        variant={isCurrent ? 'outline' : 'default'}
                        disabled={isCurrent}
                    >
                      {isCurrent ? 'Active' : plan.is_custom_pricing ? 'Contact Sales' : 'Upgrade'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPage;
