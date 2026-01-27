import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import {
  Activity,
  CreditCard,
  Plus,
  Users,
  Search,
  ArrowRight,
  Briefcase,
  FileText
} from "lucide-react";
import { billingApi } from "@/api/billing";
import { screeningApi } from "@/api/screening";
import { dashboardApi } from "@/api/dashboard";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";

export const DashboardPage = () => {
  const { user } = useAuthStore();

  // Fetch Usage/Billing Info
  const { data: usageData, isLoading: isUsageLoading } = useQuery({
    queryKey: ["currentUsage", user?.user_id],
    queryFn: () => billingApi.getCurrentUsage(user!.user_id),
    enabled: !!user?.user_id,
  });

  // Fetch Screening Runs (Recent Activity)
  const { data: activityData, isLoading: isActivityLoading } = useQuery({
    queryKey: ["recentActivity", user?.user_id],
    queryFn: () => screeningApi.getScreeningRuns(user!.user_id, 1, 5),
    enabled: !!user?.user_id,
  });

  // Fetch Active Jobs Count
  const { data: jobsData, isLoading: isJobsLoading } = useQuery({
    queryKey: ["activeJobs", user?.user_id],
    queryFn: () => dashboardApi.getAllJobs(user!.user_id, 1, 1, "active"),
    enabled: !!user?.user_id,
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
    <AppLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Welcome back, {user?.initials || "User"}. Here's your recruitment overview.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/screen-candidates"
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
            New Screening
          </Link>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8"
      >
        {/* Total Candidates Card */}
        <motion.div variants={item} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-24 h-24 text-blue-500" />
          </div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Candidates</p>
              {isUsageLoading ? (
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
              ) : (
                  <h3 className="text-3xl font-bold text-foreground">{usageData?.resumes_screened || 0}</h3>
              )}
            </div>
            <div className="mt-4 flex items-center text-xs text-blue-500 font-medium">
              <Activity className="w-3 h-3 mr-1" /> Lifetime screenings
            </div>
          </div>
        </motion.div>

        {/* Active Jobs Card */}
        <motion.div variants={item} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <JobIcon className="w-24 h-24 text-purple-500" />
          </div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Active Jobs</p>
              {isJobsLoading ? (
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
              ) : (
                  <h3 className="text-3xl font-bold text-foreground">{jobsData?.total || 0}</h3>
              )}
            </div>
            <div className="mt-4 flex items-center text-xs text-purple-500 font-medium">
              <Link to="/jobs" className="hover:underline flex items-center">
                Manage Jobs <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Credits Remaining Card */}
        <motion.div variants={item} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CreditCard className="w-24 h-24 text-green-500" />
          </div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Current Plan</p>
              {isUsageLoading ? (
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
              ) : (
                  <h3 className="text-3xl font-bold text-foreground">
                    {usageData?.tier_display_name || "Free"}
                  </h3>
              )}
            </div>
            <div className="mt-4 flex items-center text-xs text-green-500 font-medium">
              {usageData?.limits?.resumes_per_month === -1
                ? "Unlimited screenings"
                : `${usageData?.resumes_screened || 0} / ${usageData?.limits?.resumes_per_month || 0} used • ${usageData?.cycle?.days_remaining || 0} days left`}
            </div>
          </div>
        </motion.div>

        {/* Total Questions Generated Card */}
        <motion.div variants={item} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText className="w-24 h-24 text-orange-500" />
          </div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Questions</p>
              {isUsageLoading ? (
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
              ) : (
                <h3 className="text-3xl font-bold text-foreground">{usageData?.questions_generated || 0}</h3>
              )}
            </div>
            <div className="mt-4 flex items-center text-xs text-orange-500 font-medium">
              <Link to="/questions" className="hover:underline flex items-center">
                View All Questions <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Recent Activity Section */}
        <div className="col-span-full md:col-span-4 glass-card rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-foreground">Recent Screening Activity</h3>
            <Link to="/screening-history" className="text-sm text-primary hover:underline">View all</Link>
          </div>

          <div className="space-y-4">
            {isActivityLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700/50 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700/50 rounded" />
                    <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700/50 rounded" />
                  </div>
                </div>
              ))
            ) : activityData?.results && activityData.results.length > 0 ? (
                activityData.results.map((run: any) => (
                  <div key={run.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-border/50 group">
                    <div className="bg-primary/10 p-2.5 rounded-xl text-primary group-hover:scale-110 transition-transform">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        Screened {run.candidates?.length || 0} candidates for{" "}
                        <span className="text-primary font-semibold">{run.job_role || "Unknown Role"}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(run.run_end_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Link
                      to={`/screening-history/${run.id}`}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))
            ) : (
                  <div className="text-center py-12 text-muted-foreground bg-gray-50/50 dark:bg-slate-800/50 rounded-xl border border-dashed border-border">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No screening activity yet.</p>
                    <Link to="/screen-candidates" className="text-primary hover:underline mt-2 inline-block text-sm font-medium">
                      Start your first screening
                    </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Tips */}
        <div className="col-span-full md:col-span-3 glass-card rounded-2xl p-6">
          <h3 className="text-xl font-bold text-foreground mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <Link to="/screen-candidates" className="block">
              <div className="group flex items-center p-4 bg-white/50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-border rounded-xl transition-all duration-300 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800">
                <div className="bg-blue-500/10 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <div className="font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">New Screening Run</div>
                  <div className="text-xs text-muted-foreground">Upload resumes & analyze matches</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link to="/billing" className="block">
              <div className="group flex items-center p-4 bg-white/50 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-border rounded-xl transition-all duration-300 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800">
                <div className="bg-purple-500/10 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <div className="font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Manage Subscription</div>
                  <div className="text-xs text-muted-foreground">View plan usage & billing details</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link to="/jobs" className="block">
              <div className="group flex items-center p-4 bg-white/50 dark:bg-slate-800/50 hover:bg-green-50 dark:hover:bg-green-900/20 border border-border rounded-xl transition-all duration-300 hover:shadow-md hover:border-green-200 dark:hover:border-green-800">
                <div className="bg-green-500/10 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <div className="font-semibold text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Job Openings</div>
                  <div className="text-xs text-muted-foreground">Manage your active job listings</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-5 rounded-xl mt-6 border border-yellow-500/10">
            <h4 className="font-semibold text-sm mb-2 flex items-center text-yellow-700 dark:text-yellow-400">
              <span className="bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded text-[10px] uppercase font-bold mr-2 tracking-wide">Pro Tip</span>
              Better Results
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Use "Deep Analysis" mode for critical hires. It performs a more detailed evaluation of candidate experience and soft skills compared to the standard screening.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

const JobIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

export default DashboardPage;
