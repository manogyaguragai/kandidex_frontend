import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  Loader2, 
  ChevronRight, 
  Brain,
  Sparkles,
  FileSearch,
  Zap,
  Target,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { screeningApi, ScreeningCandidate, CandidateStatus, CANDIDATE_STATUS_OPTIONS, GeneratedQuestion, GenerateQuestionsRequest } from "@/api/screening";
import { dashboardApi } from "@/api/dashboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CandidateCard } from "@/components/screening/CandidateCard";
import { GenerateQuestionsModal } from "@/components/screening/GenerateQuestionsModal";
import { Switch } from "@/components/ui/switch";

import { useSearchParams, useNavigate } from "react-router-dom";
import { resumeApi } from "@/api/resume";

const ScreenCandidatesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobIdParam = searchParams.get("jobId");

  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string>("new");
  const [useDeepAnalysis, setUseDeepAnalysis] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Selection State
  const [availableCandidates, setAvailableCandidates] = useState<any[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  // New state for existing candidates mode
  const [screenMode, setScreenMode] = useState<'upload' | 'existing'>('upload');

  // Interactive Results State
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [candidateStatuses, setCandidateStatuses] = useState<Record<string, CandidateStatus>>({});
  const [generatingQuestions, setGeneratingQuestions] = useState<string | null>(null);
  const [localQuestions, setLocalQuestions] = useState<Record<string, GeneratedQuestion[]>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCandidateForQuestions, setSelectedCandidateForQuestions] = useState<{ id: string, name: string } | null>(null);

  // Fetch user's jobs for selection (keep this for the dropdown)
  const { data: jobsData } = useQuery({
    queryKey: ["userJobs", user?.user_id],
    queryFn: () => dashboardApi.getAllJobs(user!.user_id, 1, 100),
    enabled: !!user?.user_id
  });

  // Fetch specific job details if jobIdParam is present
  const { data: specificJobData } = useQuery({
    queryKey: ["job", jobIdParam],
    queryFn: () => dashboardApi.getJob(user!.user_id, jobIdParam!),
    enabled: !!user?.user_id && !!jobIdParam,
  });

  // Handle URL Job ID - Pre-populate from specific job fetch
  useEffect(() => {
    const initJob = async () => {
      if (jobIdParam && specificJobData) {
        setSelectedJobId(specificJobData.id);
        setJobRole(specificJobData.job_role);
        setJobDescription(specificJobData.job_description);

        try {
          // Fetch ALL resumes for this job to allow selection
          const resumes = await resumeApi.getResumesByJobId(user!.user_id, jobIdParam, undefined, undefined, 1, 100);

          if (resumes.results.length > 0) {
            setAvailableCandidates(resumes.results);
            // Default: Select 'position_applied' candidates initially
            const pending = resumes.results.filter((r: any) => r.phase === 'position_applied');
            // If there are applied candidates, select them. Otherwise (if all already screened), select none or let them choose.
            const initialSelection = pending.length > 0 ? pending.map((r: any) => r._id) : [];

            setSelectedCandidateIds(initialSelection);
            setScreenMode('existing');
            setStep(2);
          } else {
            setScreenMode('upload');
            setStep(1);
          }

        } catch (e) {
          console.error("Failed to check existing resumes", e);
        }
      }
    };
    initJob();
  }, [jobIdParam, specificJobData, user]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    }
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const screeningMutation = useMutation({
    mutationFn: async () => {
      if (screenMode === 'existing') {
        if (selectedCandidateIds.length === 0) {
          throw new Error("No candidates selected");
        }
        return await screeningApi.rankExistingCandidates(
          user!.user_id,
          selectedJobId,
          useDeepAnalysis,
          selectedCandidateIds
        );
      } else {
        const formData = new FormData();
        formData.append("user_id", user!.user_id);
        formData.append("job_role", jobRole);
        formData.append("job_desc", jobDescription);
        formData.append("deep_analysis", useDeepAnalysis.toString());

        files.forEach(file => {
          formData.append("files", file);
        });

        if (selectedJobId !== "new") {
          formData.append("job_details_id", selectedJobId);
        }

        return await screeningApi.rankCandidates(formData);
      }
    },
    onSuccess: (data) => {
      setResults(data);
      setStep(4);
      toast.success("Analysis complete!");
    },
    onError: (error) => {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Screening failed. Please try again.");
    }
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
    onError: (error) => {
      console.error(error);
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
    if (!selectedCandidateForQuestions || !results?.run_id) return;

    questionMutation.mutate({
      ...data,
      screening_run_id: results.run_id,
      resume_id: selectedCandidateForQuestions.id
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
    if (dLower === 'entry level' || dLower === 'easy') return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
    if (dLower === 'mid level' || dLower === 'medium') return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
    if (dLower === 'senior' || dLower === 'hard') return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  };

  // Helper to map API candidate (mixed or Candidate model) to ScreeningCandidate interface
  const mapToScreeningCandidate = (c: any): ScreeningCandidate => {
    // If it already matches the shape (has resume_id), assume it's good, but handle the mixed response from rank endpoints
    // The rank endpoint returns Candidate model which has 'id', 'name', 'fitScore', etc.
    // We need to map it to ScreeningCandidate which has 'resume_id', 'candidate_name', 'ai_fit_score', etc.

    // Check if it's already in the right format (from screening run history) or needs mapping (from immediate rank)
    if (c.resume_id && c.candidate_name) return c;

    return {
      resume_id: c.id,
      candidate_name: c.name,
      file_name: c.file_name,
      ai_fit_score: c.fitScore,
      skill_similarity: c.overall_similarity,
      candidate_summary: c.summary,
      skill_assessment: {
        exact_matches: c.skills?.exact_matches || [],
        transferable_skills: c.skills?.transferable || [],
        non_technical_skills: c.skills?.non_technical || []
      },
      experience_highlights: c.experience_highlights,
      education_highlights: c.education_highlights,
      gaps: c.gaps || [],
      ai_justification: c.justification,
      resume_content_preview: c.resume_content || "",
      questions_generated: false,
      generated_questions: [],
      status: 'position_applied'
    };
  };

  const toggleCandidate = (id: string) => {
    setSelectedCandidateIds(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCandidateIds.length === availableCandidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(availableCandidates.map(c => c._id));
    }
  };

  const handleNext = () => {
    if (step === 1 && files.length === 0) {
      toast.error("Please upload at least one resume.");
      return;
    }
    if (step === 2) {
      if (screenMode === 'existing' && selectedCandidateIds.length === 0) {
        toast.error("Please select at least one candidate to screen.");
        return;
      }
      if (selectedJobId === "new" && (!jobRole || !jobDescription)) {
        toast.error("Please provide job role and description.");
        return;
      }
      // If valid, start analysis
      setStep(3);
      screeningMutation.mutate();
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  // Handle job selection change
  const handleJobSelect = (value: string) => {
    setSelectedJobId(value);
    if (value !== "new" && jobsData) {
      const job = jobsData.results.find((j: any) => j.id === value);
      if (job) {
        setJobRole(job.job_role);
        setJobDescription(job.job_description);
      }
    } else {
      setJobRole("");
      setJobDescription("");
    }
  };

  return (
    <>
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

      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight gradient-text mb-2">Screen Candidates</h1>
        <p className="text-muted-foreground text-lg">Upload resumes and let AI find your best matches.</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-12 relative max-w-3xl mx-auto">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -z-10 -translate-y-1/2 rounded-full" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 -z-10 -translate-y-1/2 rounded-full transition-all duration-500" 
          style={{ width: `${((step - 1) / 3) * 100}%` }} 
        />
        <div className="flex justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-4 border-background ${step >= s
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-glow"
                : "bg-muted text-muted-foreground"
              }`}
            >
              {s < step ? <Check className="w-5 h-5" /> : s}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs font-medium text-muted-foreground mt-2 px-1">
          <span>Upload</span>
          <span>Job Details</span>
          <span>Analysis</span>
          <span>Results</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <div
              {...getRootProps()}
              className={`border-dashed border-2 rounded-2xl p-12 transition-all duration-300 cursor-pointer text-center ${isDragActive
                ? "border-primary bg-primary/10 scale-[1.02]"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary text-white' : 'bg-primary/10 text-primary'} transition-colors`}>
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Drop resumes here</h3>
                  <p className="text-muted-foreground mt-2">
                    Support PDF, DOC, DOCX, and ZIP files. Drag & drop or click to browse.
                  </p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-4 glass-card p-6 rounded-2xl">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Uploaded Files ({files.length})</h4>
                  <Button variant="ghost" size="sm" onClick={() => setFiles([])} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    Clear All
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-xl bg-background/50 backdrop-blur-sm group relative hover:border-primary/50 transition-colors">
                      <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        className="p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleNext}
                disabled={files.length === 0}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20"
              >
                 Next Step <ChevronRight className="w-4 h-4 ml-2" />
               </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 max-w-3xl mx-auto"
          >
            <div className="glass-card p-8 rounded-2xl space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Job Context</h2>
                <p className="text-muted-foreground">Confirm details for screening.</p>
              </div>

              {screenMode === 'existing' && (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-full">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">Select Candidates to Screen</p>
                        <p className="text-xs opacity-80">{selectedCandidateIds.length} candidates selected ({availableCandidates.length} available)</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="hover:bg-blue-500/20">
                      {selectedCandidateIds.length === availableCandidates.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>

                  {/* Scrollable Candidate List */}
                  <div className="border border-border rounded-xl overflow-hidden bg-background/50 h-[250px] overflow-y-auto custom-scrollbar">
                    {availableCandidates.map((candidate) => (
                      <div
                        key={candidate._id}
                        onClick={() => toggleCandidate(candidate._id)}
                        className={`flex items-center justify-between p-3 border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/50 ${selectedCandidateIds.includes(candidate._id) ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCandidateIds.includes(candidate._id) ? 'bg-primary border-primary text-white' : 'border-muted-foreground'}`}>
                            {selectedCandidateIds.includes(candidate._id) && <Check className="w-3 h-3" />}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground uppercase">
                            {candidate.name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{candidate.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{candidate.phase.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(candidate.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Job</Label>
                  <Select value={selectedJobId} onValueChange={handleJobSelect} disabled={screenMode === 'existing'}>
                    <SelectTrigger className="h-12 bg-background/50 border-input focus:ring-primary/50">
                        <SelectValue placeholder="Select a job or create new" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Create New Job</SelectItem>
                        {user && jobsData?.results?.map((job: any) => (
                          <SelectItem key={job.id} value={job.id}>{job.job_role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>
                 
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Job Role</Label>
                    <Input
                      placeholder="e.g. Senior Frontend Engineer"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      className="h-11 bg-background/50"
                      disabled={selectedJobId !== "new" || screenMode === 'existing'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Description</Label>
                    <Textarea
                      placeholder="Paste the full job description here..." 
                      className="min-h-[200px] bg-background/50 resize-y p-4 leading-relaxed"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      disabled={selectedJobId !== "new" || screenMode === 'existing'}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="space-y-0.5">
                    <Label className="text-base">Deep Analysis</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable detailed AI evaluation (Takes longer, consumes more credits)
                    </p>
                  </div>
                  <Switch
                    checked={useDeepAnalysis}
                    onCheckedChange={setUseDeepAnalysis}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" size="lg" onClick={handleBack} className="border-input hover:bg-muted" disabled={screenMode === 'existing'}>Back</Button>
              <Button
                onClick={handleNext}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20"
              >
                {screenMode === 'existing' ? `Screen ${selectedCandidateIds.length} Candidates` : 'Analyze Candidates'}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative min-h-[600px] flex flex-col items-center justify-center py-12"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {/* Gradient Mesh Background - Light/Dark mode aware */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 dark:from-blue-950/50 dark:via-purple-950/50 dark:to-indigo-950/50" />

              {/* Animated Grid */}
              <div className="absolute inset-0 opacity-30 dark:opacity-20">
                <div className="absolute inset-0" style={{
                  backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.15) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px',
                  animation: 'grid-pulse 4s ease-in-out infinite'
                }} />
              </div>

              {/* Floating Orbs */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full blur-3xl"
                  style={{
                    width: `${150 + i * 50}px`,
                    height: `${150 + i * 50}px`,
                    background: i % 2 === 0
                      ? 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%)',
                    left: `${10 + i * 15}%`,
                    top: `${20 + (i % 3) * 25}%`,
                  }}
                  animate={{
                    x: [0, 30, -20, 0],
                    y: [0, -40, 20, 0],
                    scale: [1, 1.1, 0.95, 1],
                  }}
                  transition={{
                    duration: 8 + i * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}

              {/* Particle Field */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-1 h-1 rounded-full bg-blue-400/60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [-20, 20],
                    x: [-10, 10],
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 4,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center space-y-10 max-w-3xl mx-auto px-6">

              {/* Neural Network Brain Animation */}
              <div className="relative">
                {/* Outer Glow Ring */}
                <motion.div
                  className="absolute -inset-8 rounded-full"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5), transparent)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* Secondary Ring */}
                <motion.div
                  className="absolute -inset-6 rounded-full border-2 border-dashed border-blue-500/30"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />

                {/* Main Brain Container */}
                <motion.div
                  className="relative w-40 h-40 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl"
                  animate={{
                    boxShadow: [
                      '0 0 60px rgba(59, 130, 246, 0.3), 0 0 120px rgba(147, 51, 234, 0.2)',
                      '0 0 80px rgba(59, 130, 246, 0.5), 0 0 160px rgba(147, 51, 234, 0.3)',
                      '0 0 60px rgba(59, 130, 246, 0.3), 0 0 120px rgba(147, 51, 234, 0.2)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Pulsing Core */}
                  <motion.div
                    className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500/40 to-purple-500/40"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Brain Icon */}
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Brain className="w-16 h-16 text-white drop-shadow-lg" />
                  </motion.div>

                  {/* Orbiting Sparkles */}
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3"
                      style={{ originX: '50%', originY: '50%' }}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 4 + i,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 0.5,
                      }}
                    >
                      <motion.div
                        className="absolute"
                        style={{
                          left: `${60 + i * 15}px`,
                          top: '50%',
                          transform: 'translateY(-50%)',
                        }}
                      >
                        <Sparkles className={`w-4 h-4 ${i === 0 ? 'text-blue-400' : i === 1 ? 'text-purple-400' : 'text-cyan-400'}`} />
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Neural Connection Lines */}
                <svg className="absolute -inset-12 w-[calc(100%+96px)] h-[calc(100%+96px)]" style={{ transform: 'translate(-24px, -24px)' }}>
                  {[...Array(8)].map((_, i) => {
                    const angle = (i * 45) * (Math.PI / 180);
                    const x1 = 120 + Math.cos(angle) * 50;
                    const y1 = 120 + Math.sin(angle) * 50;
                    const x2 = 120 + Math.cos(angle) * 100;
                    const y2 = 120 + Math.sin(angle) * 100;
                    return (
                      <motion.line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="url(#neural-gradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0.3, 0.8, 0.3] }}
                        transition={{
                          pathLength: { duration: 1.5, delay: i * 0.1 },
                          opacity: { duration: 2, repeat: Infinity, delay: i * 0.2 }
                        }}
                      />
                    );
                  })}
                  <defs>
                    <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#9333EA" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Title with Typing Effect */}
              <div className="text-center space-y-4">
                <motion.h2
                  className="text-4xl md:text-5xl font-bold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    AI Analysis in Progress
                  </span>
                </motion.h2>
                <motion.p
                  className="text-lg text-muted-foreground max-w-lg mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Our neural network is parsing resumes, extracting skills, and ranking candidates in real-time.
                </motion.p>
              </div>

              {/* AI Waveform Visualization */}
              <motion.div
                className="w-full max-w-md h-16 flex items-center justify-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {[...Array(24)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 rounded-full bg-gradient-to-t from-blue-500 to-purple-500"
                    animate={{
                      height: [12, 20 + Math.random() * 40, 12],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 0.8 + Math.random() * 0.6,
                      repeat: Infinity,
                      delay: i * 0.05,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>

              {/* Progress Steps */}
              <div className="w-full max-w-lg space-y-4">
                {[
                  { icon: FileSearch, label: 'Extracting resume data', delay: 0 },
                  { icon: Brain, label: 'Analyzing skills & experience', delay: 1 },
                  { icon: Target, label: 'Matching against job requirements', delay: 2 },
                  { icon: Zap, label: 'Ranking candidates by fit score', delay: 3 },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-sm shadow-sm"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.2 }}
                  >
                    <motion.div
                      className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                      animate={{
                        boxShadow: [
                          '0 0 0 rgba(59, 130, 246, 0)',
                          '0 0 20px rgba(59, 130, 246, 0.3)',
                          '0 0 0 rgba(59, 130, 246, 0)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    >
                      <item.icon className="w-5 h-5 text-blue-400" />
                    </motion.div>
                    <span className="text-sm font-medium text-slate-700 dark:text-foreground/80">{item.label}</span>
                    <motion.div
                      className="ml-auto"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-4 h-4 text-purple-400" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* Glowing Progress Bar */}
              <motion.div
                className="w-full max-w-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <div className="relative h-3 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"
                    animate={{ width: ['0%', '100%'] }}
                    transition={{ duration: 15, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    }}
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-3">
                  Processing {files.length} resume{files.length > 1 ? 's' : ''}...
                </p>
              </motion.div>
            </div>

            {/* CSS Keyframes inline style */}
            <style>{`
              @keyframes grid-pulse {
                0%, 100% { opacity: 0.1; }
                50% { opacity: 0.25; }
              }
            `}</style>
          </motion.div>
        )}

        {step === 4 && results && (
          <motion.div
            key="step4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
             <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Analysis Results</h2>
                <p className="text-muted-foreground">Found {results.candidates.length} candidates</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setStep(1); setFiles([]); setResults(null); }}>
                  Start New
                </Button>
                <Button onClick={() => navigate(selectedJobId && selectedJobId !== 'new' ? `/jobs/${selectedJobId}` : '/dashboard')}>
                  {selectedJobId && selectedJobId !== 'new' ? 'Back to Job' : 'Back to Dashboard'}
                </Button>
              </div>
            </div>

             <div className="grid gap-6">
              {results.candidates
                .map(mapToScreeningCandidate)
                .map((candidate: ScreeningCandidate, index: number) => (
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
                    currentStatus={candidateStatuses[candidate.resume_id] || candidate.status || 'position_applied'}
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ScreenCandidatesPage;
