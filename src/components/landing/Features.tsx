import { motion } from "framer-motion";
import { BrainCircuit, Search, Users, FileText, Zap, Award } from "lucide-react";
import { AnimatedCard } from "@/components/ui/card";
import { staggerContainer, staggerItem } from "@/lib/animations";

const features = [
  {
    icon: <BrainCircuit className="w-6 h-6 text-blue-500" />,
    title: "AI-Powered Matching",
    description: "Our advanced algorithms analyze resumes against job descriptions to find the perfect semantic match, going beyond simple keyword searching."
  },
  {
    icon: <Search className="w-6 h-6 text-purple-500" />,
    title: "Smart Screening",
    description: "Automatically filter and rank candidates based on qualifications, experience, and custom criteria you define."
  },
  {
    icon: <FileText className="w-6 h-6 text-pink-500" />,
    title: "Question Generation",
    description: "Generate tailored interview questions based on each candidate's specific resume gaps and strengths."
  },
  {
    icon: <Users className="w-6 h-6 text-indigo-500" />,
    title: "Unbiased Hiring",
    description: "Remove unconscious bias by focusing on skills and potential rather than demographic information."
  },
  {
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    title: "Instant Processing",
    description: "Process thousands of resumes in seconds. Save countless hours of manual review time."
  },
  {
    icon: <Award className="w-6 h-6 text-green-500" />,
    title: "Top Talent Ranking",
    description: "Get a prioritized list of your top candidates with detailed fit scores and justifications."
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Powerful Features for <span className="gradient-text">Modern Hiring</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to streamline your recruitment process and make better hiring decisions.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={staggerItem}>
              <AnimatedCard className="h-full p-8 border-transparent hover:border-primary/20 transition-colors bg-background/50 backdrop-blur-sm">
                <div className="mb-6 p-3 rounded-2xl bg-background shadow-sm w-fit border border-border/50">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </AnimatedCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
