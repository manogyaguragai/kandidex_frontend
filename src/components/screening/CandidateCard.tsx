import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Sparkles,
  FileText,
  TrendingUp,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScreeningCandidate, CandidateStatus, CANDIDATE_STATUS_OPTIONS, GeneratedQuestion } from "@/api/screening";

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

export interface CandidateCardProps {
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

export const CandidateCard = ({
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
          {candidate.skill_assessment.exact_matches.slice(0, 4).map((skill: string) => (
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
                    {candidate.skill_assessment.exact_matches.map((skill: string) => (
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
                    {candidate.skill_assessment.transferable_skills.map((skill: string) => (
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
                    {candidate.skill_assessment.non_technical_skills.map((skill: string) => (
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
                    {candidate.gaps.map((gap: string, i: number) => (
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
