import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, Sliders, MessageSquare, CheckCircle, BarChart3, Users, Sparkles } from "lucide-react";

// SEO-optimized feature data for each step
const demoSteps = [
   {
      number: "01",
      title: "Smart Resume Parsing",
      description: "Upload hundreds of resumes at once. Our AI instantly extracts, formats, and standardizes every application into a unified candidate profile — ready for intelligent screening.",
      icon: Upload,
      color: "blue",
      features: [
         "Bulk upload with PDF, DOCX & ZIP support",
         "AI-powered format standardization",
         "Instant candidate profile creation"
      ]
   },
   {
      number: "02",
      title: "AI-Powered Ranking",
      description: "Our engine analyzes skills, experience, and semantic context to rank candidates against your job requirements. No more keyword stuffing — find genuinely qualified talent faster.",
      icon: Sliders,
      color: "purple",
      features: [
         "Semantic skill matching beyond keywords",
         "Experience-weighted scoring algorithm",
         "Bias-free candidate evaluation"
      ]
   },
   {
      number: "03",
      title: "Custom Interview Generator",
      description: "Generate unique, role-specific interview questions tailored to each candidate's background, experience gaps, and the position requirements — saving hours of preparation time.",
      icon: MessageSquare,
      color: "pink",
      features: [
         "Gap-focused behavioral questions",
         "Role-specific technical assessments",
         "Personalized questions per candidate"
      ]
   }
];

const DemoPage = () => {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30">
        
        {/* Background Gradients - Enhanced for both modes */}
      <div className="fixed inset-0 pointer-events-none z-0">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent dark:from-blue-900/20 dark:via-background dark:to-background" />
           <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-[120px]" />
           <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 pt-24 pb-20">
        
           {/* Header - Fixed for light/dark mode visibility */}
        <div className="container mx-auto px-4 text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
                 <span className="px-4 py-2 rounded-full bg-blue-500/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium text-sm border border-blue-500/20 mb-6 inline-block">
                    Interactive Product Tour
            </span>
                 <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-700 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white">
              See Kandidex in Action
            </h1>
                 <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    The <span className="text-foreground font-semibold">complete end-to-end hiring platform</span> with AI-powered screening, intelligent ranking, and built-in analytics. Transform your recruitment from hours to minutes.
            </p>
          </motion.div>
        </div>

        {/* Demo Steps */}
        <div className="container mx-auto px-4 space-y-32">
          
          {/* Step 1: Upload */}
          <DemoSection 
                 step={demoSteps[0]}
                 align="left"
          >
                 {/* Mock Upload Animation */}
                 <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10 shadow-2xl group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10" />
                
                {/* Simulated UI Animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <motion.div 
                     initial={{ scale: 0.9, opacity: 0 }}
                     whileInView={{ scale: 1, opacity: 1 }}
                     transition={{ duration: 0.5, delay: 0.2 }}
                          className="w-3/4 h-3/4 bg-white/90 dark:bg-background/80 backdrop-blur-md rounded-lg border border-slate-200 dark:border-white/10 p-6 relative overflow-hidden shadow-xl"
                   >
                          <div className="flex items-center gap-4 border-b border-slate-200/80 dark:border-white/5 pb-4 mb-4">
                         <div className="w-3 h-3 rounded-full bg-red-500" />
                         <div className="w-3 h-3 rounded-full bg-yellow-500" />
                         <div className="w-3 h-3 rounded-full bg-green-500" />
                         <div className="text-xs text-muted-foreground ml-2">Drag & Drop Zone</div>
                      </div>
                      <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
                         <motion.div
                           animate={{ y: [0, -10, 0] }}
                           transition={{ duration: 2, repeat: Infinity }}
                         >
                            <Upload className="w-12 h-12 text-primary/50 mb-4" />
                         </motion.div>
                         <p className="text-sm text-foreground font-medium">Drop resumes here</p>
                             <p className="text-xs text-muted-foreground">PDF, DOCX, ZIP supported</p>
                      </div>
                      
                      {/* Floating File */}
                      <motion.div 
                        initial={{ x: -100, y: 100, opacity: 0 }}
                        whileInView={{ x: 50, y: -50, opacity: 1 }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                             className="absolute bottom-10 left-10 w-16 h-20 bg-white dark:bg-slate-800 rounded flex items-center justify-center shadow-lg border border-slate-200 dark:border-slate-700"
                      >
                             <span className="text-[10px] font-bold text-foreground">CV</span>
                      </motion.div>
                   </motion.div>
                </div>
             </div>
          </DemoSection>

          {/* Step 2: Ranking */}
          <DemoSection 
                 step={demoSteps[1]}
                 align="right"
          >
                 <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10" />
                
                <div className="absolute inset-0 p-8">
                   <div className="space-y-3">
                          {[
                             { name: "Sarah Chen", role: "Senior Developer", score: 95, color: "bg-green-500" },
                             { name: "James Wilson", role: "Full Stack Engineer", score: 87, color: "bg-blue-500" },
                             { name: "Maria Garcia", role: "Backend Developer", score: 78, color: "bg-purple-500" },
                             { name: "Alex Kim", role: "Software Engineer", score: 65, color: "bg-pink-500" }
                          ].map((candidate, i) => (
                         <motion.div
                           key={i}
                           initial={{ x: -50, opacity: 0 }}
                           whileInView={{ x: 0, opacity: 1 }}
                           transition={{ delay: i * 0.2 }}
                            className="flex items-center gap-4 p-3 rounded-lg bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 transition-colors shadow-sm"
                         >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                               {candidate.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="text-sm font-medium text-foreground">{candidate.name}</div>
                               <div className="text-xs text-muted-foreground">{candidate.role}</div>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="w-24 h-2 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                     whileInView={{ width: `${candidate.score}%` }}
                                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                     className={`h-full ${candidate.color}`} 
                                  />
                               </div>
                               <span className="text-xs font-bold font-mono text-foreground">{candidate.score}%</span>
                            </div>
                         </motion.div>
                      ))}
                   </div>
                </div>
             </div>
          </DemoSection>

          {/* Step 3: Questions */}
          <DemoSection 
                 step={demoSteps[2]}
                 align="left"
          >
                 <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10 shadow-2xl">
                    <div className="absolute inset-4 bg-white/95 dark:bg-background/90 rounded-lg p-6 flex flex-col gap-4 shadow-inner">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          AI Generating personalized questions...
                    </div>
                    
                    <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                          className="p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20"
                    >
                          <h4 className="text-blue-700 dark:text-blue-200 text-sm font-semibold mb-2 flex items-center gap-2">
                             <Sparkles className="w-4 h-4" />
                             Technical Deep Dive
                          </h4>
                          <p className="text-sm text-slate-700 dark:text-muted-foreground">
                             "I see you used Redux in your last project. How would you handle state management in a scalable way using Context API or Zustand for this role?"
                       </p>
                    </motion.div>

                    <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.2 }}
                          className="p-4 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20"
                    >
                          <h4 className="text-purple-700 dark:text-purple-200 text-sm font-semibold mb-2 flex items-center gap-2">
                             <Users className="w-4 h-4" />
                             Experience Gap Analysis
                          </h4>
                          <p className="text-sm text-slate-700 dark:text-muted-foreground">
                             "There's a 6-month gap in 2024. What projects or upskilling did you undertake during this period?"
                       </p>
                    </motion.div>
                 </div>
             </div>
          </DemoSection>

        </div>

           {/* CTA Section - Enhanced with analytics mention */}
        <div className="mt-32 container mx-auto px-4">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
                 className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600/90 to-purple-700/90 dark:from-blue-900/60 dark:to-purple-900/60 border border-white/20 dark:border-white/10 p-12 text-center"
           >
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black)]" />
              <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Transform Your Hiring?</h2>
                    <p className="text-white/80 mb-6 text-lg">
                       Join forward-thinking companies using Kandidex to streamline their entire recruitment pipeline — from resume screening to offer letters.
                    </p>

                    {/* Feature highlights */}
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                       <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-white">End-to-End Pipeline</span>
                       </div>
                       <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                          <BarChart3 className="w-4 h-4 text-blue-300" />
                          <span className="text-sm text-white">Built-in Analytics</span>
                       </div>
                       <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                          <Sparkles className="w-4 h-4 text-yellow-300" />
                          <span className="text-sm text-white">AI-Powered Insights</span>
                       </div>
                    </div>

                    <Button size="xl" className="rounded-full px-8 text-lg h-14 bg-white text-slate-900 hover:bg-white/90 shadow-xl" asChild>
                    <Link to="/login">
                          Start Using Kandidex Free
                    </Link>
                 </Button>
                    <p className="mt-4 text-sm text-white/60">No credit card required • Get started in 2 minutes</p>
              </div>
           </motion.div>
        </div>

      </div>
    </div>
  );
};

interface DemoSectionProps {
   step: typeof demoSteps[0];
   align: "left" | "right";
   children: React.ReactNode;
}

const DemoSection = ({ step, align, children }: DemoSectionProps) => {
   const IconComponent = step.icon;
   const colorClasses = {
      blue: {
         bg: "bg-blue-500/10 dark:bg-blue-500/10",
         text: "text-blue-600 dark:text-blue-500",
         border: "border-blue-500/20",
         check: "text-blue-500"
      },
      purple: {
         bg: "bg-purple-500/10 dark:bg-purple-500/10",
         text: "text-purple-600 dark:text-purple-500",
         border: "border-purple-500/20",
         check: "text-purple-500"
      },
      pink: {
         bg: "bg-pink-500/10 dark:bg-pink-500/10",
         text: "text-pink-600 dark:text-pink-500",
         border: "border-pink-500/20",
         check: "text-pink-500"
      }
   };

   const colors = colorClasses[step.color as keyof typeof colorClasses];

   return (
      <div className={`grid md:grid-cols-2 gap-12 items-center ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
         <motion.div 
            initial={{ opacity: 0, x: align === 'left' ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className={`${align === 'right' ? 'md:order-2' : ''}`}
         >
            <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center ${colors.text} mb-6 border ${colors.border}`}>
               <IconComponent className="w-6 h-6" />
            </div>
            <div className="text-4xl font-bold text-slate-200 dark:text-white/5 mb-4 font-mono">{step.number}</div>
            <h2 className="text-3xl font-bold mb-4 text-foreground">{step.title}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
               {step.description}
            </p>
            <ul className="space-y-3">
               {step.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                     <CheckCircle className={`w-5 h-5 ${colors.check}`} />
                     <span className="text-foreground">{feature}</span>
                  </li>
               ))}
            </ul>
         </motion.div>
         
         <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: align === 'left' ? 10 : -10 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8 }}
            className={`perspective-1000 ${align === 'right' ? 'md:order-1' : ''}`}
         >
             {children}
         </motion.div>
      </div>
   );
}

export default DemoPage;
