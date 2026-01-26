import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  CreditCard,
  FileText,
  Plus,
  Users,
  Search,
  ArrowRight
} from "lucide-react";
import { billingApi } from "@/api/billing";
import { screeningApi } from "@/api/screening";
import { dashboardApi } from "@/api/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export const DashboardPage = () => {
  const { user } = useAuthStore();

  // Fetch Usage/Billing Info
  const { data: usageData, isLoading: isUsageLoading } = useQuery({
    queryKey: ["currentUsage", user?.userId],
    queryFn: () => billingApi.getCurrentUsage(user!.userId),
    enabled: !!user?.userId,
  });

  // Fetch Screening Runs (Recent Activity)
  const { data: activityData, isLoading: isActivityLoading } = useQuery({
    queryKey: ["recentActivity", user?.userId],
    queryFn: () => screeningApi.getScreeningRuns(user!.userId, 1, 5),
    enabled: !!user?.userId,
  });

  // Fetch Active Jobs Count
  const { data: jobsData, isLoading: isJobsLoading } = useQuery({
    queryKey: ["activeJobs", user?.userId],
    queryFn: () => dashboardApi.getAllJobs(user!.userId, 1, 1, "active"),
    enabled: !!user?.userId,
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="pt-24 pb-12 container mx-auto px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.initials || "User"}. Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 text-white border-0">
            <Link to="/screen-candidates">
              <Plus className="w-4 h-4 mr-2" />
              New Screening
            </Link>
          </Button>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8"
      >
        {/* Total Candidates Card */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {isUsageLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{usageData?.resumes_screened || 0}</div>
                  <p className="text-xs text-muted-foreground">Lifetime screenings</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Jobs Card */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <FileText className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              {isJobsLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{jobsData?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">Currently hiring</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Credits Remaining Card */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
              <CreditCard className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {isUsageLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {usageData?.cycle?.days_remaining || 0} days
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {usageData?.limits?.resumes_per_month === -1 
                      ? "Unlimited plan" 
                      : `${usageData?.limits?.resumes_per_month} resumes/mo`}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Efficiency Score (Placeholder for now) */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 to-transparent ring-1 ring-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">AI Efficiency</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">94%</div>
              <p className="text-xs text-primary/80">Time saved vs manual</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Recent Activity Section */}
        <Card className="col-span-4 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Screening Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isActivityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activityData?.results && activityData.results.length > 0 ? (
              <div className="space-y-6">
                {activityData.results.map((run: any) => (
                  <div key={run.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="mt-1 bg-primary/10 p-2 rounded-full text-primary">
                      <Search className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Screened {run.candidates?.length || 0} candidates for{" "}
                        <span className="text-primary">{run.job_role || "Unknown Role"}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(run.run_end_time).toLocaleDateString()} at{" "}
                        {new Date(run.run_end_time).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/screen-candidates?run=${run.id}`}>
                        View <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No screening activity yet.</p>
                <Button variant="link" asChild className="mt-2 text-primary">
                  <Link to="/screen-candidates">Start your first screening</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions / Tips */}
        <Card className="col-span-3 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start h-auto py-4" asChild>
              <Link to="/screen-candidates">
                <div className="bg-blue-500/10 p-2 rounded-lg mr-4">
                  <Plus className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">New Screening Run</div>
                  <div className="text-xs text-muted-foreground">Upload resumes & analyze</div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full justify-start h-auto py-4" asChild>
              <Link to="/billing">
                <div className="bg-purple-500/10 p-2 rounded-lg mr-4">
                  <CreditCard className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Manage Subscription</div>
                  <div className="text-xs text-muted-foreground">View plan usage & billing</div>
                </div>
              </Link>
            </Button>

            <div className="bg-muted/30 p-4 rounded-lg mt-6">
              <h4 className="font-medium text-sm mb-2 flex items-center">
                <span className="bg-yellow-500/20 text-yellow-600 p-1 rounded mr-2 text-xs">TIP</span>
                Better Results
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For best results, upload PDF resumes with clear text. Our AI works best when the job description is detailed and specific about required skills.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
