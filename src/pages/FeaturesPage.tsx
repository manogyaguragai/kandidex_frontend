import { motion } from "framer-motion";
import { 
  Bot, 
  Brain, 
  CheckCircle2, 
  Code,
  Globe, 
  Laptop,
  Layers, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  Target, 
  Upload, 
  UserCheck, 
  Users, 
  Zap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Animations
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 z-10">
        <div className="container px-4 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>Next-Generation Hiring Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground">
              The Future of Hiring <br className="hidden md:block" />
              <span className="text-primary">Is Here</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your recruitment process with AI-powered insights, automated workflows, and unbiased candidate ranking.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Workflow Section - "How It Works" */}
      <section className="relative py-24 z-10 bg-secondary/5">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Kandidex Works</h2>
            <p className="text-muted-foreground text-lg">Streamlined process from upload to hire</p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="group"
                >
                  <div className="bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg relative h-full">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    
                    <div className="mt-6 text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        {step.icon}
                      </div>
                      <h3 className="text-xl font-bold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Deep Dive Features */}
      <section className="py-24 z-10 relative">
        <div className="container px-4 mx-auto space-y-32">
          {/* Feature 1: AI Analysis */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeIn}
              className="space-y-6"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Brain className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold">Smart Screening & Ranking</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Stop manually reviewing hundreds of resumes. Our AI analyzes every application against your specific job description, ranking candidates based on semantic relevance, skills, and experience.
              </p>
              <ul className="space-y-3">
                {[
                  "Semantic skills matching beyond keywords",
                  "Experience quality evaluation",
                  "Instant top 10 shortlist generation"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
              <div className="relative bg-background/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                 {/* Mock UI for Ranking */}
                 <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600" />
                        <div className="flex-1">
                          <div className="h-4 w-32 bg-white/20 rounded animate-pulse mb-2" />
                          <div className="h-3 w-20 bg-white/10 rounded" />
                        </div>
                        <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm font-bold">
                          {99 - i * 4}% Match
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Question Generation */}
          <div className="grid md:grid-cols-2 gap-16 items-center md:flex-row-reverse">
            <div className="order-2 md:order-1 relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full" />
              <div className="relative bg-background/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <h4 className="font-semibold text-purple-200 mb-2 flex items-center gap-2">
                       <Code className="w-4 h-4" /> Technical Question
                    </h4>
                    <p className="text-sm text-muted-foreground">"Based on your experience with distributed systems, how would you handle a network partition in a high-availability cluster?"</p>
                  </div>
                  <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
                    <h4 className="font-semibold text-pink-200 mb-2 flex items-center gap-2">
                       <Users className="w-4 h-4" /> Soft Skill Probe
                    </h4>
                    <p className="text-sm text-muted-foreground">"Tell me about a time you had to mentor a junior developer who was struggling with a complex codebase."</p>
                  </div>
                </div>
              </div>
            </div>
            
            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeIn}
              className="space-y-6 order-1 md:order-2"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold">Automated Interview Generator</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Save hours of prep time. Kandidex generates tailored interview questions uniquely crafted for each candidate based on their resume gaps, strengths, and your specific job requirements.
              </p>
              <ul className="space-y-3">
                {[
                  "Technical deep-dive questions",
                  "Soft skills & cultural fit assessment",
                  "Resume-specific probing questions"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 z-10 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground">A complete toolkit for the modern recruiter.</p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {otherFeatures.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="bg-background border border-border/50 p-6 rounded-2xl hover:border-primary/50 transition-colors hover:shadow-lg group"
              >
                <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center text-foreground mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="container px-4 mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Hiring?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join thousands of companies using Kandidex to find better talent, faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button size="lg" className="rounded-full h-12 px-8 text-lg shadow-glow hover:shadow-glow-lg transition-all" asChild>
                <Link to="/register">Get Started Free</Link>
             </Button>
             <Button variant="outline" size="lg" className="rounded-full h-12 px-8 text-lg" asChild>
                <Link to="/contact">Contact Sales</Link>
             </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

const workflowSteps = [
  {
    icon: <Upload className="w-8 h-8" />,
    title: "Upload Resumes",
    description: "Drag & drop PDF files or ZIP archives. We handle bulk processing instantly."
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "AI Ranking",
    description: "Our algorithms analyze and rank candidates based on your specific job criteria."
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "Generate Questions",
    description: "Get personalized interview questions tailored to each candidate's profile."
  },
  {
    icon: <UserCheck className="w-8 h-8" />,
    title: "Select Candidates",
    description: "Make data-driven hiring decisions with confidence and speed."
  }
];

const otherFeatures = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Unbiased Hiring",
    description: "Focus purely on skills and experience, removing unconscious bias from the process."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Fast Processing",
    description: "Process thousands of resumes in minutes, not days. Save valuable time."
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "AI Assistant",
    description: "24/7 intelligent support to help you manage your hiring pipeline."
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: "Integration Ready",
    description: "Seamlessly integrates with your existing ATS and HR tools."
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Multi-Language",
    description: "Support for resumes in multiple languages with auto-translation."
  },
  {
    icon: <Laptop className="w-6 h-6" />,
    title: "Remote First",
    description: "Tools designed specifically for hiring remote and distributed teams."
  }
];
