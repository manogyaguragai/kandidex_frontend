import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, Sliders, MessageSquare, CheckCircle } from "lucide-react";

const DemoPage = () => {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30">
        
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background" />
         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 pt-24 pb-20">
        
        {/* Header */}
        <div className="container mx-auto px-4 text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 font-medium text-sm border border-blue-500/20 mb-6 inline-block">
               Interactive Tour
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
              See Kandidex in Action
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Watch how our AI transforms recruitment from hours to minutes.
            </p>
          </motion.div>
        </div>

        {/* Demo Steps */}
        <div className="container mx-auto px-4 space-y-32">
          
          {/* Step 1: Upload */}
          <DemoSection 
            number="01"
            title="Smart Resume Parsing"
            description="Drag and drop bulk resumes. Our AI instantly parses, formats, and standardizes every application into a unified candidate profile."
            icon={<Upload className="w-6 h-6" />}
            align="left"
            color="blue"
          >
             {/* Mock Video/Animation Container */}
             <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900/50 border border-white/10 shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
                
                {/* Simulated UI Animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <motion.div 
                     initial={{ scale: 0.9, opacity: 0 }}
                     whileInView={{ scale: 1, opacity: 1 }}
                     transition={{ duration: 0.5, delay: 0.2 }}
                     className="w-3/4 h-3/4 bg-background/80 backdrop-blur-md rounded-lg border border-white/10 p-6 relative overflow-hidden"
                   >
                      <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-4">
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
                         <p className="text-xs text-muted-foreground">PDF, DOCX supported</p>
                      </div>
                      
                      {/* Floating File */}
                      <motion.div 
                        initial={{ x: -100, y: 100, opacity: 0 }}
                        whileInView={{ x: 50, y: -50, opacity: 1 }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                        className="absolute bottom-10 left-10 w-16 h-20 bg-white rounded flex items-center justify-center shadow-lg"
                      >
                         <span className="text-[10px] font-bold text-black">CV</span>
                      </motion.div>
                   </motion.div>
                </div>
             </div>
          </DemoSection>

          {/* Step 2: Ranking */}
          <DemoSection 
            number="02"
            title="AI-Powered Ranking"
            description="Our engine analyzes skills, experience, and semantic context to rank candidates against your specific job description. No more keyword stuffing."
            icon={<Sliders className="w-6 h-6" />}
            align="right"
            color="purple"
          >
             <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900/50 border border-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
                
                <div className="absolute inset-0 p-8">
                   <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                         <motion.div
                           key={i}
                           initial={{ x: -50, opacity: 0 }}
                           whileInView={{ x: 0, opacity: 1 }}
                           transition={{ delay: i * 0.2 }}
                           className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                         >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 shrink-0" />
                            <div className="flex-1 min-w-0">
                               <div className="h-2 w-24 bg-white/20 rounded mb-2" />
                               <div className="h-1.5 w-16 bg-white/10 rounded" />
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${100 - i * 15}%` }}
                                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                    className={`h-full ${i === 1 ? 'bg-green-500' : i === 2 ? 'bg-blue-500' : 'bg-purple-500'}`} 
                                  />
                               </div>
                               <span className="text-xs font-bold font-mono">{100 - i * 15}%</span>
                            </div>
                         </motion.div>
                      ))}
                   </div>
                </div>
             </div>
          </DemoSection>

          {/* Step 3: Questions */}
          <DemoSection 
            number="03"
            title="Custom Interview Generator"
            description="Generate unique interview questions based on each candidate's specific background, gaps, and the role's requirements."
            icon={<MessageSquare className="w-6 h-6" />}
            align="left"
            color="pink"
          >
             <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900/50 border border-white/10 shadow-2xl">
                 <div className="absolute inset-4 bg-background/90 rounded-lg p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       AI Generating questions...
                    </div>
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
                    >
                       <h4 className="text-blue-200 text-sm font-semibold mb-2">Technical Deep Dive</h4>
                       <p className="text-sm text-muted-foreground typewriter">
                          "I see you used Redux in your last project. How would you handle state management in a more scalable way using Context API or Zustand for this new role?"
                       </p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                      className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20"
                    >
                       <h4 className="text-purple-200 text-sm font-semibold mb-2">Experience Gap</h4>
                       <p className="text-sm text-muted-foreground">
                          "There is a 6-month gap in 2024. Can you elaborate on the projects or upskilling you undertook during this period?"
                       </p>
                    </motion.div>
                 </div>
             </div>
          </DemoSection>

        </div>

        {/* CTA Section */}
        <div className="mt-32 container mx-auto px-4">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-white/10 p-12 text-center"
           >
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black)]" />
              <div className="relative z-10 max-w-2xl mx-auto">
                 <h2 className="text-3xl font-bold mb-4">Ready to start hiring smarter?</h2>
                 <p className="text-muted-foreground mb-8">Join the thousands of recruiters who have switched to Kandidex.</p>
                 <Button size="xl" className="rounded-full px-8 text-lg h-14 bg-white text-black hover:bg-white/90" asChild>
                    <Link to="/login">
                       Start Using Kandidex Now
                    </Link>
                 </Button>
                 <p className="mt-4 text-xs text-muted-foreground">No credit card required for trial.</p>
              </div>
           </motion.div>
        </div>

      </div>
    </div>
  );
};

const DemoSection = ({ number, title, description, icon, align, children, color }: any) => {
   return (
      <div className={`grid md:grid-cols-2 gap-12 items-center ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
         <motion.div 
            initial={{ opacity: 0, x: align === 'left' ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className={`${align === 'right' ? 'md:order-2' : ''}`}
         >
            <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 flex items-center justify-center text-${color}-500 mb-6 border border-${color}-500/20`}>
               {icon}
            </div>
            <div className="text-4xl font-bold text-white/5 mb-4 font-mono">{number}</div>
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
               {description}
            </p>
            <ul className="space-y-3">
               {[1, 2, 3].map((i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                     <CheckCircle className={`w-5 h-5 text-${color}-500`} />
                     <span>Feature benefit point {i}</span>
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
