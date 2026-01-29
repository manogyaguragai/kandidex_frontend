import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { dashboardApi } from "@/api/dashboard";
import { resumeApi, Resume } from "@/api/resume";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Edit,
  FileText,
  Filter,
  Search,
  Trash2,
  Upload,
  Zap, 
  X,
  Users,
  ChevronLeft,
  ChevronRight,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

// Updated Phase Styles matching the new schema
const PHASE_STYLES: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  position_applied: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20", icon: Clock },
  initial_screening: { bg: "bg-cyan-500/10", text: "text-cyan-600", border: "border-cyan-500/20", icon: FileText },
  ai_selected: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/20", icon: Zap },
  questions_generated: { bg: "bg-indigo-500/10", text: "text-indigo-600", border: "border-indigo-500/20", icon: FileText },
  email_sent: { bg: "bg-pink-500/10", text: "text-pink-600", border: "border-pink-500/20", icon: Mail },
  interview_set: { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/20", icon: Calendar },
  hired: { bg: "bg-green-500/10", text: "text-green-600", border: "border-green-500/20", icon: CheckCircle },
  rejected: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20", icon: XCircle },
};

const formatPhase = (phase: string) => {
  return phase.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const JobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [editFormData, setEditFormData] = useState({
    job_role: '',
    job_description: '',
    status: 'active'
  });
  
  // Filters State
  const [phaseFilter, setPhaseFilter] = useState<string | undefined>(undefined);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Fetch Job Details
  const { data: job, isLoading: isJobLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => dashboardApi.getJob(user!.user_id, jobId!),
    enabled: !!user?.user_id && !!jobId,
  });

  // Fetch Candidates (Resumes)
  // Note: Backend pagination might be needed for large sets. 
  // Assuming getResumesByJobId supports pagination arguments based on previous files.
  // Fetch Candidates (Resumes)
  const { data: candidatesData, isLoading: isCandidatesLoading } = useQuery({
    queryKey: ["job-candidates", jobId, currentPage, searchTerm, phaseFilter],
    queryFn: () => resumeApi.getResumesByJobId(user!.user_id, jobId!, phaseFilter as any, searchTerm, currentPage, ITEMS_PER_PAGE),
    enabled: !!user?.user_id && !!jobId,
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => resumeApi.addResumesToJob(user!.user_id, jobId!, files),
    onSuccess: (data) => {
      if (data.errors && data.errors.length > 0) {
        toast.error(`Uploaded with some errors: ${data.errors[0]}`);
      } else {
        toast.success("Resumes added successfully");
      }
      setUploadedFiles([]);
      setIsUploadModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["job-candidates", jobId] });
      // Also invalidate job list counts if we go back
      queryClient.invalidateQueries({ queryKey: ["jobs"] }); 
    },
    onError: () => toast.error("Failed to upload resumes"),
  });

  // Change Phase Mutation
  const changePhaseMutation = useMutation({
    mutationFn: ({ resumeId, newPhase }: { resumeId: string; newPhase: string }) =>
      resumeApi.changeResumePhase(user!.user_id, resumeId, newPhase as any),
    onSuccess: () => {
      toast.success("Candidate phase updated");
      queryClient.invalidateQueries({ queryKey: ["job-candidates", jobId] });
      // Invalidate job counts if needed
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: () => toast.error("Failed to update phase"),
  });

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  });

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRunScreening = () => {
    navigate(`/screen-candidates?jobId=${jobId}`);
  };

  if (isJobLoading) {
    return (
        <div className="flex h-[80vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Job not found</h2>
          <Button onClick={() => navigate("/jobs")} className="mt-4">
            Back to Jobs
          </Button>
      </div>
    );
  }

  const totalPages = candidatesData?.total_pages || 1;

  return (
    <>
      <div className="space-y-6 pb-20 min-h-[calc(100vh-200px)]">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <button 
                onClick={() => navigate("/jobs")}
                className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Jobs
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{job.job_role}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                job.status === 'active' 
                  ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                  : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
              }`}>
                {job.status}
              </span>
              <button
                onClick={() => {
                  setEditFormData({
                    job_role: job.job_role,
                    job_description: job.job_description,
                    status: job.status
                  });
                  setIsEditModalOpen(true);
                }}
                className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                title="Edit Job"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <p className="text-muted-foreground max-w-2xl truncate">
               {job.job_description}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2 bg-background hover:bg-muted"
                onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload className="w-4 h-4" />
              Add Candidates
            </Button>
            <Button
                variant="outline"
                className="gap-2 bg-background hover:bg-muted"
                onClick={() => navigate(`/screening-history?jobId=${jobId}`)}
            >
               <Clock className="w-4 h-4" />
               View Screening History
            </Button>
            <Button 
                className="gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                onClick={handleRunScreening}
            >
              <Zap className="w-4 h-4" />
              Run AI Screening
            </Button>
          </div>
        </div>

        {/* Filters & Actions Bar */}
        <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search candidates..." 
                className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-2 w-full md:w-auto">
             <div className="relative">
                <select 
                  className="h-9 px-3 py-1 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none pr-8 hover:bg-muted/50 transition-colors"
                  value={phaseFilter || ""}
                  onChange={(e) => setPhaseFilter(e.target.value || undefined)}
                >
                  <option value="">All Phases</option>
                  {Object.keys(PHASE_STYLES).map((phase) => (
                    <option key={phase} value={phase}>{formatPhase(phase)}</option>
                  ))}
                </select>
                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
             </div>
           </div>
        </div>

        {/* Candidates List */}
        <div className="bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm relative min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border/50">
                <tr>
                   <th className="px-6 py-4 font-medium w-[30%]">Candidate Name</th>
                   <th className="px-6 py-4 font-medium w-[20%]">Date Added</th>
                   <th className="px-6 py-4 font-medium w-[20%]">Current Phase</th>
                   <th className="px-6 py-4 font-medium w-[20%]">Match Score</th>
                   <th className="px-6 py-4 font-medium text-right w-[10%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isCandidatesLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-5 w-40 bg-muted rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-28 bg-muted rounded-full"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-12 bg-muted rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-8 w-8 bg-muted rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : candidatesData?.results?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No candidates yet</h3>
                            <p className="text-muted-foreground text-sm mt-1 mb-6 max-w-sm">
                                Start by adding resumes to this job opening. You can upload multiple files at once.
                            </p>
                            <Button onClick={() => setIsUploadModalOpen(true)}>
                                <Upload className="w-4 h-4 mr-2" />
                                Add Resumes
                            </Button>
                        </div>
                      </td>
                    </tr>
                ) : (
                  candidatesData?.results
                    ?.map((candidate: Resume) => {
                      const style = PHASE_STYLES[candidate.phase] || PHASE_STYLES.position_applied;
                      const Icon = style.icon;
                      
                      // Mocking score/status visualization logic
                      // Assuming embedding distance or similar might exist in future or using placeholder logic
                      const isScreened = candidate.phase !== 'position_applied';
                      
                      return (
                      <tr key={candidate._id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => {/* Navigate to detailed candidate view if implemented */}}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase border border-primary/20">
                                  {candidate.name.substring(0,2)}
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">{candidate.name}</div>
                                <div className="text-xs text-muted-foreground">ID: {candidate._id.slice(-6)}</div>
                              </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(candidate.created_at).toLocaleDateString()}
                          </div>
                        </td>
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-background ${style.bg} ${style.text} ${style.border} focus:ring-${style.text.split('-')[1]}-500`}>
                                  <Icon className="w-3 h-3" />
                                  {formatPhase(candidate.phase)}
                                  <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-[200px]">
                                {Object.entries(PHASE_STYLES).map(([phaseKey, phaseStyle]) => (
                                  <DropdownMenuItem
                                    key={phaseKey}
                                    onClick={() => changePhaseMutation.mutate({ resumeId: candidate._id, newPhase: phaseKey })}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <div className={`w-2 h-2 rounded-full ${phaseStyle.text.replace('text-', 'bg-')}`} />
                                    <span>{formatPhase(phaseKey)}</span>
                                    {candidate.phase === phaseKey && (
                                      <CheckCircle className="w-3 h-3 ml-auto text-primary" />
                                    )}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </td>
                        <td className="px-6 py-4">
                           {isScreened ? (
                             <div className="w-full max-w-[100px]">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="font-bold text-foreground">78%</span>
                                    <span className="text-muted-foreground">Match</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: '78%' }}></div>
                                </div>
                             </div>
                           ) : (
                             <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                                 <Clock className="w-3 h-3" /> Pending Screen
                             </span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background border border-transparent hover:border-border text-muted-foreground">
                               <FileText className="w-4 h-4" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500 hover:border-red-200">
                               <Trash2 className="w-4 h-4" />
                             </Button>
                          </div>
                        </td>
                      </tr>
                    )})
                )}
              </tbody>
            </table>
          </div>
          
           {/* Pagination Controls */}
           {totalPages > 1 && (
            <div className="border-t border-border/50 p-4 flex items-center justify-between bg-card">
                <span className="text-sm text-muted-foreground pl-2">
                    Showing page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
           )}
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg p-6 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h2 className="text-xl font-bold">Add Candidates</h2>
                    <p className="text-sm text-muted-foreground">Upload resumes to add to pipeline</p>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => setIsUploadModalOpen(false)}>
                   <X className="w-5 h-5" />
                 </Button>
              </div>

              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                 <input {...getInputProps()} />
                 <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors">
                     <Upload className="w-6 h-6" />
                 </div>
                 <p className="text-sm font-medium text-foreground">Click or drag resumes here</p>
                 <p className="text-xs text-muted-foreground mt-2">Support PDF, DOCX (Max 10MB)</p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                   {uploadedFiles.map((file, idx) => (
                     <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm border border-border/50">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <span className="truncate">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={() => removeFile(idx)}>
                          <X className="w-3 h-3" />
                        </Button>
                     </div>
                   ))}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border/50">
                 <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                 <Button 
                    onClick={() => uploadMutation.mutate(uploadedFiles)}
                    disabled={uploadedFiles.length === 0 || uploadMutation.isPending}
                    className="bg-primary text-primary-foreground min-w-[120px]"
                 >
                    {uploadMutation.isPending ? "Uploading..." : `Upload ${uploadedFiles.length > 0 ? uploadedFiles.length : ''} Files`}
                 </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Job Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl w-full max-w-xl p-6 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Job Opening</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update job details</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!user?.user_id || !jobId) return;

                try {
                  await dashboardApi.updateJob(
                    user.user_id,
                    jobId,
                    editFormData.job_role,
                    editFormData.job_description,
                    editFormData.status
                  );
                  toast.success('Job updated successfully');
                  setIsEditModalOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["job", jobId] });
                  queryClient.invalidateQueries({ queryKey: ["jobs"] });
                } catch (error) {
                  toast.error('Failed to update job');
                  console.error(error);
                }
              }} className="space-y-5">

                {/* Job Role Field */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Job Role
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.job_role}
                    onChange={(e) => setEditFormData({ ...editFormData, job_role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    required
                    value={editFormData.job_description}
                    onChange={(e) => setEditFormData({ ...editFormData, job_description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all h-28 resize-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Job requirements, responsibilities, tech stack..."
                  />
                </div>

                {/* Status Selector */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, status: 'active' })}
                      className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all border cursor-pointer ${editFormData.status === 'active'
                        ? 'bg-green-50 dark:bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750'
                        }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span className={editFormData.status === 'active' ? 'text-green-500' : 'text-gray-400'}>●</span>
                        Active
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, status: 'inactive' })}
                      className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all border cursor-pointer ${editFormData.status === 'inactive'
                        ? 'bg-gray-100 dark:bg-gray-500/10 border-gray-500 text-gray-700 dark:text-gray-400'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750'
                        }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span className={editFormData.status === 'inactive' ? 'text-gray-500' : 'text-gray-400'}>○</span>
                        Inactive
                      </span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-primary text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </Button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default JobDetailsPage;
