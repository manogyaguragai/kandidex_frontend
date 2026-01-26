import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import AppLayout from "@/components/AppLayout";
import { screeningApi, ScreeningRun } from "@/api/screening";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Users,
  Calendar,
  Briefcase,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ScreeningHistoryListPage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["screeningRuns", user?.user_id, page],
    queryFn: () => screeningApi.getScreeningRuns(user!.user_id, page, limit),
    enabled: !!user?.user_id,
  });

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTopScore = (run: ScreeningRun) => {
    if (!run.candidates.length) return 0;
    return Math.round(Math.max(...run.candidates.map((c) => c.ai_fit_score)));
  };

  return (
    <AppLayout>
      {/* Hero Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text mb-2">
              Screening History
            </h1>
            <p className="text-muted-foreground text-lg">
              View all your past screening runs and candidate analyses.
            </p>
          </div>
          <Link to="/screen-candidates">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              <Zap className="w-4 h-4 mr-2" /> New Screening
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 rounded-2xl mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="p-2 rounded-lg bg-primary/10">
                <Search className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Total Runs</p>
                <p className="font-semibold text-foreground">{data.total}</p>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Page {data.page} of {data.total_pages}
          </div>
        </motion.div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-muted flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading screening history...</p>
        </div>
      ) : !data?.results.length ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="mx-auto w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Screening History</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You haven't run any candidate screenings yet. Start your first screening to see results here.
          </p>
          <Link to="/screen-candidates">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              Start First Screening
            </Button>
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Screening Runs List */}
          <div className="space-y-4">
            {data.results.map((run, index) => (
              <motion.div
                key={run.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/screening-history/${run.id}`}>
                  <div className="glass-card p-6 rounded-2xl hover:shadow-xl transition-all duration-300 group cursor-pointer border border-transparent hover:border-primary/20">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Icon */}
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 shrink-0 group-hover:scale-110 transition-transform">
                        <Briefcase className="w-6 h-6 text-primary" />
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground mb-1 truncate group-hover:text-primary transition-colors">
                          {run.job_role || "Untitled Screening"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(run.created_at)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/50 hidden sm:block" />
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDuration(run.time_taken)}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-center px-4 py-2 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-1 justify-center">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-lg font-bold text-foreground">{run.candidates.length}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Candidates</p>
                        </div>

                        <div className="text-center px-4 py-2 rounded-xl bg-green-500/10">
                          <div className="flex items-center gap-1 justify-center">
                            <Target className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">{getTopScore(run)}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Top Score</p>
                        </div>

                        <div className="p-2 rounded-lg text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              <div className="flex items-center gap-1 mx-4">
                {Array.from({ length: Math.min(5, data.total_pages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={page === pageNum ? "bg-primary" : ""}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {data.total_pages > 5 && (
                  <>
                    <span className="text-muted-foreground px-2">...</span>
                    <Button
                      variant={page === data.total_pages ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPage(data.total_pages)}
                    >
                      {data.total_pages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default ScreeningHistoryListPage;
