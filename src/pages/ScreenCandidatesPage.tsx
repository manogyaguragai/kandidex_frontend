import { useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardFooter } from "@/components/ui/card";
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

// Step components or inline? Inline for now for shared state
const ScreenCandidatesPage = () => {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string>("new");
  const [results, setResults] = useState<any>(null);

  // Fetch user's jobs for selection
  const { data: jobsData } = useQuery({
    queryKey: ["userJobs", user?.userId],
    queryFn: () => dashboardApi.getAllJobs(user!.userId, 1, 100),
    enabled: !!user?.userId
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter PDF/DOCX if needed, usually dropzone handles it via accept prop
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
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
      return; // mutation handles step change
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  return (
    <div className="pt-24 pb-12 container mx-auto px-4 max-w-5xl min-h-[90vh]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Screen Candidates</h1>
        <p className="text-muted-foreground mt-1">Upload resumes and let AI find your best matches.</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -z-10 -translate-y-1/2 rounded-full" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500" 
          style={{ width: `${((step - 1) / 3) * 100}%` }} 
        />
        <div className="flex justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                step >= s ? "bg-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"
              }`}
            >
              {s < step ? <Check className="w-5 h-5" /> : s}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
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
            className="space-y-6"
          >
            <Card className="border-dashed border-2 p-8 hover:bg-muted/50 transition-colors cursor-pointer" {...getRootProps()}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Drop resumes here</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Support PDF, DOC, DOCX. Drag & drop or click to browse.
                  </p>
                </div>
              </div>
            </Card>

            {files.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Uploaded Files ({files.length})</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg bg-card shadow-sm group relative">
                      <FileText className="w-8 h-8 text-blue-500/80" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2"
                        onClick={() => removeFile(i)}
                      >
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
               <Button onClick={handleNext} disabled={files.length === 0} size="lg">
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
             <Card>
               <CardHeader>
                 <CardTitle>Job Context</CardTitle>
                 <CardDescription>Tell the AI what you are looking for.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Label>Select Existing Job</Label>
                    <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                      <SelectTrigger>
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
                 
                 {selectedJobId === "new" && (
                   <>
                      <div className="space-y-2">
                         <Label>Job Role</Label>
                         <Input 
                            placeholder="e.g. Senior Frontend Engineer" 
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                         />
                      </div>
                      <div className="space-y-2">
                         <Label>Job Description</Label>
                         <Textarea 
                            placeholder="Paste the full job description here..." 
                            className="min-h-[200px]"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                         />
                      </div>
                   </>
                 )}
               </CardContent>
               <CardFooter className="flex justify-between">
                 <Button variant="outline" onClick={handleBack}>Back</Button>
                 <Button onClick={handleNext}>Analyze Candidates</Button>
               </CardFooter>
             </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-8"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-muted flex items-center justify-center">
                 <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <div className="space-y-2">
               <h3 className="text-2xl font-bold">Analyzing Candidates...</h3>
               <p className="text-muted-foreground max-w-md mx-auto">
                 Our AI is reading resumes, extracting skills, and matching them against your job description. This may take a moment.
               </p>
            </div>
            <div className="w-full max-w-md space-y-2">
               <Progress value={66} className="h-2" />
               <p className="text-xs text-muted-foreground text-right w-full">Processing...</p>
            </div>
          </motion.div>
        )}

        {step === 4 && results && (
          <motion.div
            key="step4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Analysis Results</h2>
                <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                  Back to Dashboard
                </Button>
             </div>

             <div className="grid gap-6">
                {results.candidates.map((candidate: any) => (
                   <Card key={candidate.id} className="overflow-hidden border-l-4 border-l-primary hover:shadow-lg transition-shadow">
                      <div className="grid md:grid-cols-[100px_1fr_200px] gap-6 p-6">
                         <div className="flex flex-col items-center justify-center space-y-2 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-4 ${
                               candidate.fitScore >= 80 ? 'border-green-500 text-green-600' :
                               candidate.fitScore >= 60 ? 'border-yellow-500 text-yellow-600' :
                               'border-red-500 text-red-600'
                            }`}>
                               {candidate.fitScore}%
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground">FIT SCORE</span>
                         </div>
                         
                         <div className="space-y-4">
                            <div>
                               <h3 className="text-xl font-bold">{candidate.name}</h3>
                               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Briefcase className="w-4 h-4" />
                                  <span>{candidate.file_name}</span>
                               </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2">
                               {candidate.summary}
                            </p>

                            <div className="flex flex-wrap gap-2">
                               {candidate.skills.exact_matches.slice(0, 5).map((skill: string) => (
                                  <span key={skill} className="px-2 py-1 rounded-md bg-green-500/10 text-green-700 text-xs font-medium border border-green-500/20">
                                     {skill}
                                  </span>
                               ))}
                               {candidate.skills.exact_matches.length > 5 && (
                                  <span className="px-2 py-1 text-xs text-muted-foreground">+{candidate.skills.exact_matches.length - 5} more</span>
                               )}
                            </div>
                         </div>
                         
                         <div className="flex flex-col gap-3 justify-center border-l pl-6">
                            <Button className="w-full">View Details</Button>
                            <Button variant="outline" className="w-full">Interview</Button>
                         </div>
                      </div>
                   </Card>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScreenCandidatesPage;
