import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";

import { 
  screeningApi, 
  GeneratedQuestion, 
  CandidateStatus,
  CANDIDATE_STATUS_OPTIONS,
  GenerateQuestionsRequest
} from "@/api/screening";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  AlertTriangle,
  Loader2,
  Calendar,
  Timer,
  Users,
  Target,
  Award,
  Clock,
  Briefcase,
  ChevronDown,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { GenerateQuestionsModal } from "@/components/screening/GenerateQuestionsModal";

import { CandidateCard } from "@/components/screening/CandidateCard";


const ScreeningHistoryPage = () => {
  const { runId } = useParams<{ runId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [isJobDescriptionExpanded, setIsJobDescriptionExpanded] = useState(false);
  const [candidateStatuses, setCandidateStatuses] = useState<Record<string, CandidateStatus>>({});
  const [generatingQuestions, setGeneratingQuestions] = useState<string | null>(null);
  const [localQuestions, setLocalQuestions] = useState<Record<string, GeneratedQuestion[]>>({});
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCandidateForQuestions, setSelectedCandidateForQuestions] = useState<{id: string, name: string} | null>(null);

  const { data: run, isLoading, error } = useQuery({
    queryKey: ["screeningRun", user?.user_id, runId],
    queryFn: () => screeningApi.getScreeningRunById(user!.user_id, runId!),
    enabled: !!user?.user_id && !!runId,
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ candidateId, status }: { candidateId: string; status: CandidateStatus }) => {
      return screeningApi.updateCandidateStatus(user!.user_id, candidateId, status);
    },
    onSuccess: (_, variables) => {
      setCandidateStatuses(prev => ({ ...prev, [variables.candidateId]: variables.status }));
      toast.success(`Status updated to "${CANDIDATE_STATUS_OPTIONS.find(s => s.value === variables.status)?.label}"`);
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  // Question generation mutation
  const questionMutation = useMutation({
    mutationFn: async (data: GenerateQuestionsRequest) => {
      setGeneratingQuestions(data.resume_id);
      return screeningApi.generateQuestionsForCandidate(user!.user_id, data);
    },
    onSuccess: (questions, variables) => {
      setLocalQuestions(prev => ({ ...prev, [variables.resume_id]: questions }));
      toast.success("Interview questions generated!");
      setGeneratingQuestions(null);
      setModalOpen(false);
      setSelectedCandidateForQuestions(null);
    },
    onError: () => {
      toast.error("Failed to generate questions");
      setGeneratingQuestions(null);
    },
  });

  const handleStatusChange = (candidateId: string, status: CandidateStatus) => {
    statusMutation.mutate({ candidateId, status });
  };

  const handleOpenQuestionsModal = (candidateId: string, candidateName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCandidateForQuestions({ id: candidateId, name: candidateName });
    setModalOpen(true);
  };
  
  const handleGenerateQuestions = (data: Omit<GenerateQuestionsRequest, 'screening_run_id' | 'resume_id'>) => {
    if (!selectedCandidateForQuestions || !runId) return;
    
    questionMutation.mutate({
        ...data,
        screening_run_id: runId,
        resume_id: selectedCandidateForQuestions.id
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "from-green-500/20 to-emerald-500/20 border-green-500/30";
    if (score >= 60) return "from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
    return "from-red-500/20 to-rose-500/20 border-red-500/30";
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
    
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  };

  const averageFitScore = run?.candidates.length
    ? Math.round(run.candidates.reduce((sum, c) => sum + c.ai_fit_score, 0) / run.candidates.length)
    : 0;

  const topCandidatesCount = run?.candidates.filter((c) => c.ai_fit_score >= 70).length || 0;

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
            <h3 className="text-xl font-semibold gradient-text">Loading Screening Details</h3>
            <p className="text-muted-foreground">Fetching run data...</p>
          </div>
      </div>
    );
  }

  if (error || !run) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="p-6 rounded-full bg-red-500/10">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-foreground">Screening Run Not Found</h3>
            <p className="text-muted-foreground max-w-md">
              The screening run you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
      </div>
    );
  }

  return (
    <>
      {/* Generate Questions Modal */}
      {selectedCandidateForQuestions && (
        <GenerateQuestionsModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedCandidateForQuestions(null);
          }}
          onGenerate={handleGenerateQuestions}
          candidateName={selectedCandidateForQuestions.name}
          isGenerating={generatingQuestions === selectedCandidateForQuestions.id}
        />
      )}

      {/* Hero Header */}
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text mb-2">
              {run.job_role || "Screening Run"}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(run.created_at)}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span className="flex items-center gap-1.5">
                <Timer className="w-4 h-4" />
                {formatDuration(run.time_taken)}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {run.candidates.length} candidates
              </span>
            </div>
          </div>
          <Link to="/screen-candidates">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              <Zap className="w-4 h-4 mr-2" /> New Screening
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview - Bento Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-16 h-16 text-blue-500" />
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Total Candidates</p>
          <p className="text-3xl font-bold text-foreground">{run.candidates.length}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="w-16 h-16 text-purple-500" />
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Avg. Fit Score</p>
          <p className={`text-3xl font-bold ${getScoreColor(averageFitScore)}`}>{averageFitScore}%</p>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Award className="w-16 h-16 text-green-500" />
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Top Matches</p>
          <p className="text-3xl font-bold text-green-500">{topCandidatesCount}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-16 h-16 text-amber-500" />
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Time Taken</p>
          <p className="text-3xl font-bold text-foreground">{formatDuration(run.time_taken)}</p>
        </div>
      </motion.div>

      {/* Collapsible Job Description Card */}
      {run.job_description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl mb-8 overflow-hidden"
        >
          <button
            onClick={() => setIsJobDescriptionExpanded(!isJobDescriptionExpanded)}
            className="w-full p-5 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-foreground">Job Description</h2>
                <p className="text-sm text-muted-foreground">
                  {isJobDescriptionExpanded ? "Click to collapse" : "Click to expand"}
                </p>
              </div>
            </div>
            <div className={`p-2 rounded-lg transition-all duration-300 ${isJobDescriptionExpanded ? 'rotate-180 bg-primary/10' : 'bg-muted/50'}`}>
              <ChevronDown className="w-5 h-5 text-foreground" />
            </div>
          </button>
          
          <AnimatePresence>
            {isJobDescriptionExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 pt-0 border-t border-border/50">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap mt-4">
                    {run.job_description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Candidates Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Candidate Rankings</h2>
          <span className="text-sm text-muted-foreground">
            Sorted by AI Fit Score
          </span>
        </div>

        <div className="space-y-4">
          {run.candidates
            .sort((a, b) => b.ai_fit_score - a.ai_fit_score)
            .map((candidate, index) => (
              <CandidateCard
                key={candidate.resume_id}
                candidate={candidate}
                rank={index + 1}
                isExpanded={expandedCandidate === candidate.resume_id}
                onToggle={() =>
                  setExpandedCandidate(
                    expandedCandidate === candidate.resume_id ? null : candidate.resume_id
                  )
                }
                currentStatus={candidateStatuses[candidate.resume_id] || candidate.status || 'new'}
                onStatusChange={(status) => handleStatusChange(candidate.resume_id, status)}
                onGenerateQuestions={(e) => handleOpenQuestionsModal(candidate.resume_id, candidate.candidate_name, e)}
                isGeneratingQuestions={generatingQuestions === candidate.resume_id}
                localQuestions={localQuestions[candidate.resume_id]}
                getScoreColor={getScoreColor}
                getScoreBgColor={getScoreBgColor}
                getDifficultyBadge={getDifficultyBadge}
              />
            ))}
        </div>
      </div>
    </>
  );
};



export default ScreeningHistoryPage;
