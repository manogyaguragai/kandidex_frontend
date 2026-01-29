import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";

import { 
  screeningApi, 
  ScreeningCandidate, 
  GeneratedQuestion, 
  CandidateStatus,
  CANDIDATE_STATUS_OPTIONS,
  GenerateQuestionsRequest
} from "@/api/screening";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Users,
  Target,
  Briefcase,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Sparkles,
  FileText,
  GraduationCap,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  Loader2,
  Calendar,
  Timer,
  Award,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GenerateQuestionsModal } from "@/components/screening/GenerateQuestionsModal";

// Status color mapping for light/dark mode
const getStatusStyles = (status: CandidateStatus) => {
  const styles: Record<CandidateStatus, string> = {
    position_applied: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    initial_screening: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    ai_selected: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    questions_generated: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    email_sent: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    interview_set: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    hired: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    rejected: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  };
  return styles[status] || styles.position_applied;
};

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

interface CandidateCardProps {
  candidate: ScreeningCandidate;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
  currentStatus: CandidateStatus;
  onStatusChange: (status: CandidateStatus) => void;
  onGenerateQuestions: (e: React.MouseEvent) => void;
  isGeneratingQuestions: boolean;
  localQuestions?: GeneratedQuestion[];
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
  getDifficultyBadge: (difficulty: string) => string;
}

const CandidateCard = ({
  candidate,
  rank,
  isExpanded,
  onToggle,
  currentStatus,
  onStatusChange,
  onGenerateQuestions,
  isGeneratingQuestions,
  localQuestions,
  getScoreColor,
  getScoreBgColor,
  getDifficultyBadge,
}: CandidateCardProps) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/30";
    if (rank === 2) return "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800 shadow-lg";
    if (rank === 3) return "bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-lg";
    return "bg-muted text-muted-foreground";
  };

  // Combine API questions with locally generated ones
  const allQuestions = [...(candidate.generated_questions || []), ...(localQuestions || [])];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
      className="glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Main Card Header */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          {/* Rank Badge */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${getRankBadge(rank)}`}>
            #{rank}
          </div>

          {/* Score Circle */}
          <div className="shrink-0">
            <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${getScoreBgColor(candidate.ai_fit_score)} border-2 flex items-center justify-center`}>
              <div className="text-center">
                <span className={`text-2xl font-bold ${getScoreColor(candidate.ai_fit_score)}`}>
                  {Math.round(candidate.ai_fit_score)}
                </span>
                <span className={`text-xs ${getScoreColor(candidate.ai_fit_score)}`}>%</span>
              </div>
            </div>
          </div>

          {/* Candidate Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h3 className="text-xl font-bold text-foreground truncate">
                {candidate.candidate_name}
              </h3>
              {/* Status Badge with Dropdown */}
              <div onClick={(e) => e.stopPropagation()}>
                <Select value={currentStatus} onValueChange={(value) => onStatusChange(value as CandidateStatus)}>
                  <SelectTrigger className={`h-7 w-auto gap-1.5 border text-xs font-medium transition-all ${getStatusStyles(currentStatus)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CANDIDATE_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full bg-${option.color}-500`} />
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {candidate.file_name}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {Math.round(candidate.skill_similarity * 100)}% skill match
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {candidate.candidate_summary}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Generate Questions Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onGenerateQuestions}
              disabled={isGeneratingQuestions}
              className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
            >
              {isGeneratingQuestions ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
              {isGeneratingQuestions ? "Generating..." : "Generate Questions"}
            </Button>
            
            {/* Expand Button */}
            <Button variant="ghost" size="sm" className="rounded-full" onClick={onToggle}>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Skills Preview */}
        <div className="flex flex-wrap gap-2 mt-4 cursor-pointer" onClick={onToggle}>
          {candidate.skill_assessment.exact_matches.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-medium border border-green-500/20"
            >
              <CheckCircle2 className="w-3 h-3 inline mr-1" />
              {skill}
            </span>
          ))}
          {candidate.skill_assessment.exact_matches.length > 4 && (
            <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
              +{candidate.skill_assessment.exact_matches.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-6 border-t border-border/50 pt-6">
              {/* AI Justification */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-2">AI Analysis</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {candidate.ai_justification}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills Grid */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* Exact Matches */}
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                  <h4 className="font-semibold text-sm text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Exact Matches
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skill_assessment.exact_matches.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded bg-green-500/10 text-green-700 dark:text-green-400 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skill_assessment.exact_matches.length === 0 && (
                      <span className="text-xs text-muted-foreground">None identified</span>
                    )}
                  </div>
                </div>

                {/* Transferable Skills */}
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <h4 className="font-semibold text-sm text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Transferable Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skill_assessment.transferable_skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skill_assessment.transferable_skills.length === 0 && (
                      <span className="text-xs text-muted-foreground">None identified</span>
                    )}
                  </div>
                </div>

                {/* Non-Technical Skills */}
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <h4 className="font-semibold text-sm text-purple-700 dark:text-purple-400 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Non-Technical
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skill_assessment.non_technical_skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skill_assessment.non_technical_skills.length === 0 && (
                      <span className="text-xs text-muted-foreground">None identified</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Experience & Education */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" /> Experience Highlights
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {candidate.experience_highlights || "No highlights available"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" /> Education Highlights
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {candidate.education_highlights || "No highlights available"}
                  </p>
                </div>
              </div>

              {/* Gaps */}
              {candidate.gaps.length > 0 && (
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <h4 className="font-semibold text-sm text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Identified Gaps
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.gaps.map((gap, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-medium"
                      >
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interview Questions */}
              {allQuestions.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <h4 className="font-semibold text-sm text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> AI-Generated Interview Questions
                  </h4>
                  <div className="space-y-3">
                    {allQuestions.map((q: GeneratedQuestion, i: number) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-background/50 border border-border/50"
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
                            {q.skill_type}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getDifficultyBadge(q.difficulty)}`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{q.question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state for questions */}
              {allQuestions.length === 0 && (
                <div className="p-6 rounded-xl bg-muted/30 border border-dashed border-border text-center">
                  <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No interview questions generated yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Generate Questions" to create AI-powered interview questions for this candidate.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ScreeningHistoryPage;
