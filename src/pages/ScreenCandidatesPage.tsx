import { useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  Loader2, 
  ChevronRight, 
  Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { screeningApi } from "@/api/screening";
import { dashboardApi } from "@/api/dashboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const ScreenCandidatesPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string>("new");
  const [useDeepAnalysis, setUseDeepAnalysis] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Fetch user's jobs for selection
  const { data: jobsData } = useQuery({
    queryKey: ["userJobs", user?.userId],
    queryFn: () => dashboardApi.getAllJobs(user!.userId, 1, 100),
    enabled: !!user?.userId
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const screeningMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("user_id", user!.userId);
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
    },
    onSuccess: (data) => {
      setResults(data);
      setStep(4);
      toast.success("Analysis complete!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Screening failed. Please try again.");
    }
  });

  const handleNext = () => {
    if (step === 1 && files.length === 0) {
      toast.error("Please upload at least one resume.");
      return;
    }
    if (step === 2) {
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
    <AppLayout>
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
                    Support PDF, DOC, DOCX. Drag & drop or click to browse.
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
                <p className="text-muted-foreground">Select a job or define a new one for AI reference.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Job</Label>
                  <Select value={selectedJobId} onValueChange={handleJobSelect}>
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
                      disabled={selectedJobId !== "new"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Description</Label>
                    <Textarea
                      placeholder="Paste the full job description here..." 
                      className="min-h-[200px] bg-background/50 resize-y p-4 leading-relaxed"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      disabled={selectedJobId !== "new"}
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
              <Button variant="outline" size="lg" onClick={handleBack} className="border-input hover:bg-muted">Back</Button>
              <Button
                onClick={handleNext}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20"
              >
                Analyze Candidates
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-8 max-w-2xl mx-auto"
          >
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-muted flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
              <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-4 border-primary border-t-transparent animate-spin" style={{ animationDuration: '1.5s' }} />
              <div className="absolute top-2 left-2 w-28 h-28 rounded-full border-4 border-purple-500 border-t-transparent animate-spin ml-auto" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl font-bold gradient-text">Analyzing Candidates...</h3>
              <p className="text-muted-foreground text-lg">
                 Our AI is reading resumes, extracting skills, and matching them against your job description. This may take a moment.
               </p>
            </div>

            <div className="w-full space-y-2">
              <Progress value={66} className="h-2 bg-muted" />
               <p className="text-xs text-muted-foreground text-right w-full">Processing...</p>
            </div>
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
                <Button onClick={() => window.location.href = '/dashboard'}>
                  Back to Dashboard
                </Button>
              </div>
            </div>

             <div className="grid gap-6">
              {results.candidates.map((candidate: any, index: number) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden border-0 shadow-lg glass-card hover:shadow-xl transition-all duration-300">
                    <div className="grid md:grid-cols-[120px_1fr_200px] gap-8 p-6">
                      <div className="flex flex-col items-center justify-center space-y-3 text-center border-r border-border/50 pr-6">
                        <div className="relative">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle
                              className="text-muted/20"
                              strokeWidth="8"
                              stroke="currentColor"
                              fill="transparent"
                              r="36"
                              cx="48"
                              cy="48"
                            />
                            <circle
                              className={`${candidate.fitScore >= 80 ? 'text-green-500' :
                                candidate.fitScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                                }`}
                              strokeWidth="8"
                              strokeDasharray={36 * 2 * Math.PI}
                              strokeDashoffset={36 * 2 * Math.PI - (candidate.fitScore / 100) * (36 * 2 * Math.PI)}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="transparent"
                              r="36"
                              cx="48"
                              cy="48"
                            />
                          </svg>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
                            {candidate.fitScore}%
                          </div>
                        </div>
                        <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Fit Score</span>
                      </div>

                      <div className="space-y-4 py-2">
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">{candidate.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              <span>{candidate.file_name}</span>
                            </div>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                            <span>{candidate.email || "No email detected"}</span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-xl">
                          {candidate.summary}
                        </p>

                        {candidate.skills && (
                            <div className="flex flex-wrap gap-2">
                            {candidate.skills.exact_matches?.slice(0, 5).map((skill: string) => (
                              <span key={skill} className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-semibold border border-green-500/20">
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.missing?.slice(0, 3).map((skill: string) => (
                              <span key={skill} className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-semibold border border-red-500/20 opacity-70">
                                Missing: {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 justify-center border-l border-border/50 pl-8">
                        <Button className="w-full bg-primary hover:bg-primary/90">View Profile</Button>
                        <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5">Schedule Interview</Button>
                      </div>
                      </div>
                  </Card>
                </motion.div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default ScreenCandidatesPage;
