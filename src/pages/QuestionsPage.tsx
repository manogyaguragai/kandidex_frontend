import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";

import { screeningApi, ScreeningRun, GeneratedQuestion } from "@/api/screening";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Briefcase,
  ArrowRight,
  BookOpen,
  Zap,
  Target,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const QuestionsPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set());
  const [copiedQuestion, setCopiedQuestion] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const { data: screeningData, isLoading } = useQuery({
    queryKey: ["screeningRuns", user?.user_id],
    queryFn: () => screeningApi.getScreeningRuns(user!.user_id, 1, 50),
    enabled: !!user?.user_id,
  });

  // Filter runs that have generated questions
  const runsWithQuestions = screeningData?.results?.filter(
    (run: ScreeningRun) =>
      run.candidates.some((c) => c.generated_questions?.length > 0)
  ) || [];

  // Get all questions with metadata
  const allQuestions = runsWithQuestions.flatMap((run: ScreeningRun) =>
    run.candidates.flatMap((candidate) =>
      (candidate.generated_questions || []).map((q: GeneratedQuestion) => ({
        ...q,
        candidateName: candidate.candidate_name,
        jobRole: run.job_role,
        runId: run.id,
      }))
    )
  );

  // Stats
  const totalQuestions = allQuestions.length;
  const easyCount = allQuestions.filter((q: any) => {
    const d = q.difficulty.toLowerCase();
    return d === "easy" || d === "entry level";
  }).length;
  
  const mediumCount = allQuestions.filter((q: any) => {
    const d = q.difficulty.toLowerCase();
    return d === "medium" || d === "mid level";
  }).length;
  
  const hardCount = allQuestions.filter((q: any) => {
    const d = q.difficulty.toLowerCase();
    return d === "hard" || d === "senior";
  }).length;

  const toggleRun = (runId: string) => {
    setExpandedRuns((prev) => {
      const next = new Set(prev);
      if (next.has(runId)) {
        next.delete(runId);
      } else {
        next.add(runId);
      }
      return next;
    });
  };

  const copyQuestion = async (question: string, id: string) => {
    await navigator.clipboard.writeText(question);
    setCopiedQuestion(id);
    toast.success("Question copied to clipboard!");
    setTimeout(() => setCopiedQuestion(null), 2000);
  };

  const getDifficultyBadge = (difficulty: string) => {
    const dLower = difficulty.toLowerCase();
    
    if (dLower === 'entry level' || dLower === 'easy') {
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
    }
    if (dLower === 'mid level' || dLower === 'medium') {
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
    }
    if (dLower === 'senior' || dLower === 'hard') {
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    }
    
    // Default fallback
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-muted flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold gradient-text">Loading Questions</h3>
            <p className="text-muted-foreground">Fetching your AI-generated interview questions...</p>
          </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight gradient-text mb-2">
              Interview Questions
            </h1>
            <p className="text-muted-foreground text-lg">
              AI-generated interview questions tailored to each candidate's profile.
            </p>
          </div>
          <Link to="/screen-candidates">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg gap-2">
              <Zap className="w-4 h-4" />
              Generate More
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group cursor-pointer" onClick={() => setDifficultyFilter("all")}>
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <MessageSquare className="w-16 h-16 text-blue-500" />
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Total Questions</p>
          <p className="text-3xl font-bold text-foreground">{totalQuestions}</p>
        </div>

        <div className={`glass-card p-5 rounded-2xl relative overflow-hidden group cursor-pointer ${difficultyFilter === "easy" ? "ring-2 ring-green-500" : ""}`} onClick={() => setDifficultyFilter(difficultyFilter === "easy" ? "all" : "easy")}>
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen className="w-16 h-16 text-green-500" />
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Easy</p>
          <p className="text-3xl font-bold text-green-500">{easyCount}</p>
        </div>

        <div className={`glass-card p-5 rounded-2xl relative overflow-hidden group cursor-pointer ${difficultyFilter === "medium" ? "ring-2 ring-yellow-500" : ""}`} onClick={() => setDifficultyFilter(difficultyFilter === "medium" ? "all" : "medium")}>
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="w-16 h-16 text-yellow-500" />
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Medium</p>
          <p className="text-3xl font-bold text-yellow-500">{mediumCount}</p>
        </div>

        <div className={`glass-card p-5 rounded-2xl relative overflow-hidden group cursor-pointer ${difficultyFilter === "hard" ? "ring-2 ring-red-500" : ""}`} onClick={() => setDifficultyFilter(difficultyFilter === "hard" ? "all" : "hard")}>
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-16 h-16 text-red-500" />
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Hard</p>
          <p className="text-3xl font-bold text-red-500">{hardCount}</p>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search questions, candidates, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-background/50"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={difficultyFilter === "all" ? "default" : "outline"}
            onClick={() => setDifficultyFilter("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={difficultyFilter === "easy" ? "default" : "outline"}
            onClick={() => setDifficultyFilter("easy")}
            size="sm"
            className={difficultyFilter === "easy" ? "bg-green-500 hover:bg-green-600" : ""}
          >
            Easy
          </Button>
          <Button
            variant={difficultyFilter === "medium" ? "default" : "outline"}
            onClick={() => setDifficultyFilter("medium")}
            size="sm"
            className={difficultyFilter === "medium" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
          >
            Medium
          </Button>
          <Button
            variant={difficultyFilter === "hard" ? "default" : "outline"}
            onClick={() => setDifficultyFilter("hard")}
            size="sm"
            className={difficultyFilter === "hard" ? "bg-red-500 hover:bg-red-600" : ""}
          >
            Hard
          </Button>
        </div>
      </div>

      {/* Questions by Run */}
      {runsWithQuestions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="p-6 rounded-full bg-primary/10 mb-6">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">No Questions Yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Start screening candidates to generate tailored interview questions based on their profiles.
          </p>
          <Link to="/screen-candidates">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg gap-2">
              <Zap className="w-4 h-4" />
              Screen Candidates
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {runsWithQuestions.map((run: ScreeningRun) => {
            const runQuestions = run.candidates.flatMap((c) =>
              (c.generated_questions || []).map((q: GeneratedQuestion, i: number) => ({
                ...q,
                id: `${run.id}-${c.resume_id}-${i}`,
                candidateName: c.candidate_name,
              }))
            );

            const filteredRunQuestions = runQuestions.filter((q: any) => {
              const matchesSearch =
                searchQuery === "" ||
                q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.skill_type.toLowerCase().includes(searchQuery.toLowerCase());
              
              const dLower = q.difficulty.toLowerCase();
              let matchesDifficulty = difficultyFilter === "all";
              
              if (!matchesDifficulty) {
                if (difficultyFilter === "easy") matchesDifficulty = (dLower === "easy" || dLower === "entry level");
                else if (difficultyFilter === "medium") matchesDifficulty = (dLower === "medium" || dLower === "mid level");
                else if (difficultyFilter === "hard") matchesDifficulty = (dLower === "hard" || dLower === "senior");
              }
              
              return matchesSearch && matchesDifficulty;
            });

            if (filteredRunQuestions.length === 0) return null;

            const isExpanded = expandedRuns.has(run.id);

            return (
              <motion.div
                key={run.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl overflow-hidden"
              >
                {/* Run Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleRun(run.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                        <Briefcase className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {run.job_role || "Screening Run"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {filteredRunQuestions.length} questions • {run.candidates.length} candidates
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/screening-history/${run.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        View Details <ExternalLink className="w-3 h-3" />
                      </Link>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Questions */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-3 border-t border-border/50 pt-4">
                        {filteredRunQuestions.map((q: any) => (
                          <div
                            key={q.id}
                            className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors group"
                          >
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                                {q.skill_type}
                              </span>
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getDifficultyBadge(q.difficulty)}`}>
                                {q.difficulty}
                              </span>
                              <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs">
                                For: {q.candidateName}
                              </span>
                              <button
                                onClick={() => copyQuestion(q.question, q.id)}
                                className="ml-auto p-2 rounded-lg hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
                                title="Copy question"
                              >
                                {copiedQuestion === q.id ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4 text-muted-foreground" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">{q.question}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default QuestionsPage;
