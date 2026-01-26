
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "../ui/slider";
import { Sparkles, Loader2, Brain, Users, Code } from "lucide-react";
import { GenerateQuestionsRequest } from "@/api/screening";

interface GenerateQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: Omit<GenerateQuestionsRequest, 'screening_run_id' | 'resume_id'>) => void;
  candidateName: string;
  isGenerating: boolean;
}

export const GenerateQuestionsModal = ({
  isOpen,
  onClose,
  onGenerate,
  candidateName,
  isGenerating
}: GenerateQuestionsModalProps) => {
  const [numQuestions, setNumQuestions] = useState(5);
  const [softSkillsFlag, setSoftSkillsFlag] = useState(true);
  const [hardSkillsFlag, setHardSkillsFlag] = useState(true);
  const [includeCoding, setIncludeCoding] = useState(false);
  const [softSkillsFocus, setSoftSkillsFocus] = useState("");
  const [hardSkillsFocus, setHardSkillsFocus] = useState("");

  const handleGenerate = () => {
    onGenerate({
      num_questions: numQuestions,
      soft_skills_flag: softSkillsFlag,
      hard_skills_flag: hardSkillsFlag,
      include_coding: includeCoding,
      soft_skills_focus: softSkillsFocus,
      hard_skills_focus: hardSkillsFocus
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] glass-card border-white/20 dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Generate Interview Questions
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Configure AI parameters to generate tailored interview questions for <span className="font-semibold text-foreground">{candidateName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Number of Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="num-questions" className="text-sm font-medium">
                Number of Questions: <span className="text-primary font-bold text-lg ml-1">{numQuestions}</span>
              </Label>
            </div>
            <Slider
              id="num-questions"
              min={1}
              max={15}
              step={1}
              value={[numQuestions]}
              onValueChange={(vals: number[]) => setNumQuestions(vals[0])}
              className="py-2"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Soft Skills Section */}
            <div className={`space-y-4 p-4 rounded-xl border transition-all duration-200 ${softSkillsFlag ? 'bg-blue-500/5 border-blue-500/20' : 'bg-muted/20 border-transparent opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${softSkillsFlag ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-muted text-muted-foreground'}`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <Label htmlFor="soft-skills" className="font-semibold cursor-pointer">Soft Skills</Label>
                </div>
                <Switch
                  id="soft-skills"
                  checked={softSkillsFlag}
                  onCheckedChange={setSoftSkillsFlag}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
              
              {softSkillsFlag && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="soft-focus" className="text-xs text-muted-foreground">Focus Areas (Optional)</Label>
                  <Input
                    id="soft-focus"
                    placeholder="e.g. Leadership, Conflict Resolution"
                    value={softSkillsFocus}
                    onChange={(e) => setSoftSkillsFocus(e.target.value)}
                    className="bg-background/50 border-blue-200/50 dark:border-blue-800/50 focus-visible:ring-blue-500/30"
                  />
                </div>
              )}
            </div>

            {/* Hard Skills Section */}
            <div className={`space-y-4 p-4 rounded-xl border transition-all duration-200 ${hardSkillsFlag ? 'bg-purple-500/5 border-purple-500/20' : 'bg-muted/20 border-transparent opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${hardSkillsFlag ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-muted text-muted-foreground'}`}>
                    <Brain className="w-4 h-4" />
                  </div>
                  <Label htmlFor="hard-skills" className="font-semibold cursor-pointer">Hard Skills</Label>
                </div>
                <Switch
                  id="hard-skills"
                  checked={hardSkillsFlag}
                  onCheckedChange={setHardSkillsFlag}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              {hardSkillsFlag && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label htmlFor="hard-focus" className="text-xs text-muted-foreground">Focus Areas (Optional)</Label>
                    <Input
                      id="hard-focus"
                      placeholder="e.g. React, System Design"
                      value={hardSkillsFocus}
                      onChange={(e) => setHardSkillsFocus(e.target.value)}
                      className="bg-background/50 border-purple-200/50 dark:border-purple-800/50 focus-visible:ring-purple-500/30"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-purple-200/20">
                    <div className="flex items-center gap-2">
                      <Code className="w-3.5 h-3.5 text-muted-foreground" />
                      <Label htmlFor="coding" className="text-sm font-normal text-muted-foreground cursor-pointer">Include Coding Problems</Label>
                    </div>
                    <Switch
                      id="coding"
                      checked={includeCoding}
                      onCheckedChange={setIncludeCoding}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || (!softSkillsFlag && !hardSkillsFlag)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20 w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Questions
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
